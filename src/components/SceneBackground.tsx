"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * The site's background: a slow field of glass "cores" (cubes, octahedra, hex prisms and flat chips) drifting in deep
 * navy, each with glowing edges. The camera glides down through the field as the page scrolls, so the picture keeps
 * moving with the page. The mouse has no effect on it.
 *
 * With `prefers-reduced-motion` (or no WebGL) it renders one still frame, or just the CSS gradient on .scene-bg.
 * `dim` (used behind the sign-in pages) veils the scene with CSS and lets it run at half brightness.
 */

const BG = "#020828";
const FOV = 40;
const COUNT = 64;
/** How far down (world units) the camera travels over the whole page. */
const TRAVEL = 20;
const Y_MAX = 7;
const Y_MIN = -(TRAVEL + 9);

/** A small seeded generator, so the field looks the same on every load. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Core = {
  group: THREE.Group;
  spin: THREE.Vector3;
  drift: number;
  bobPhase: number;
  baseY: number;
};

function buildScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BG);
  scene.fog = new THREE.Fog(BG, 12, 30);

  scene.add(new THREE.AmbientLight(0x4a6cff, 0.7));
  const key = new THREE.DirectionalLight(0x2450e6, 4);
  key.position.set(-6, 8, 6);
  scene.add(key);
  const rim = new THREE.PointLight(0x6be3ff, 60, 40, 1.6);
  rim.position.set(6, -2, 2);
  scene.add(rim);

  const geometries: THREE.BufferGeometry[] = [
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.OctahedronGeometry(0.75),
    new THREE.CylinderGeometry(0.6, 0.6, 0.9, 6),
    new THREE.BoxGeometry(1.5, 0.14, 1.5),
  ];
  const edgeGeometries = geometries.map((g) => new THREE.EdgesGeometry(g));
  const palette = [0x1d4ed8, 0x0d1b5a, 0x15329a, 0x2a6df4];
  const edgeColors = [0xaad4f6, 0x60a5fa, 0x7ee7ff];
  const bodyMats = palette.map(
    (c) =>
      new THREE.MeshStandardMaterial({
        color: c,
        roughness: 0.25,
        metalness: 0.55,
        transparent: true,
        opacity: 0.32,
        depthWrite: false,
      }),
  );
  const edgeMats = edgeColors.map((c) => new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: 0.6 }));

  const rand = mulberry32(20240926);
  const cores: Core[] = [];
  for (let i = 0; i < COUNT; i++) {
    const shape = Math.floor(rand() * geometries.length);
    const group = new THREE.Group();
    group.add(new THREE.Mesh(geometries[shape], bodyMats[Math.floor(rand() * bodyMats.length)]));
    group.add(new THREE.LineSegments(edgeGeometries[shape], edgeMats[Math.floor(rand() * edgeMats.length)]));

    const scale = 0.55 + rand() * 1.5;
    group.scale.setScalar(scale);
    const baseY = Y_MIN + rand() * (Y_MAX - Y_MIN);
    group.position.set((rand() - 0.5) * 24, baseY, -1 - rand() * 12);
    group.rotation.set(rand() * Math.PI, rand() * Math.PI, rand() * Math.PI);
    scene.add(group);
    cores.push({
      group,
      spin: new THREE.Vector3((rand() - 0.5) * 0.35, (rand() - 0.5) * 0.35, (rand() - 0.5) * 0.2),
      drift: 0.05 + rand() * 0.12,
      bobPhase: rand() * Math.PI * 2,
      baseY,
    });
  }

  const dispose = () => {
    geometries.forEach((g) => g.dispose());
    edgeGeometries.forEach((g) => g.dispose());
    bodyMats.forEach((m) => m.dispose());
    edgeMats.forEach((m) => m.dispose());
  };

  return { scene, cores, rim, dispose };
}

export function SceneBackground({ dim = false }: { dim?: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    } catch {
      return; // No WebGL: the CSS gradient on .scene-bg stays as the whole background.
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    host.prepend(renderer.domElement);

    const { scene, cores, rim, dispose } = buildScene();
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
    camera.position.set(0, 0, 8);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const w = renderer.domElement.clientWidth || host.clientWidth;
      const h = renderer.domElement.clientHeight || host.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    let last = performance.now();
    const delta = () => {
      const now = performance.now();
      const dt = (now - last) / 1000;
      last = now;
      return dt;
    };
    let elapsed = 0;
    // The scroll position is eased toward its target so the glide is soft even on a stepped mouse wheel.
    let scrollEased = window.scrollY;

    const draw = (dt: number) => {
      elapsed += dt;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      // Lenis already glides the page (see smooth-scroll.ts), so this only softens the steps of a plain scroll.
      scrollEased += (window.scrollY - scrollEased) * Math.min(1, dt * 12);
      const progress = Math.min(1, Math.max(0, scrollEased / max));

      camera.position.y = -progress * TRAVEL;
      rim.position.set(6 * Math.cos(elapsed * 0.15 + progress * 4), camera.position.y - 2, 2);

      for (const c of cores) {
        c.group.rotation.x += c.spin.x * dt;
        c.group.rotation.y += c.spin.y * dt;
        c.group.rotation.z += c.spin.z * dt;
        c.group.position.y = c.baseY + Math.sin(elapsed * c.drift * 3 + c.bobPhase) * 0.6;
      }
      renderer.render(scene, camera);
    };

    let frame = 0;
    const loop = () => {
      draw(Math.min(delta(), 0.05));
      frame = requestAnimationFrame(loop);
    };
    const onVisibility = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      if (!document.hidden) {
        delta();
        frame = requestAnimationFrame(loop);
      }
    };

    resize();
    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) draw(0);
    });
    ro.observe(renderer.domElement);

    const onScroll = () => draw(0);
    if (reduced) {
      draw(0);
      window.addEventListener("scroll", onScroll, { passive: true });
    } else {
      document.addEventListener("visibilitychange", onVisibility);
      frame = requestAnimationFrame(loop);
    }
    host.dataset.ready = "";

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("scroll", onScroll);
      dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={hostRef} className={`scene-bg${dim ? " is-dim" : ""}`} aria-hidden="true" />;
}
