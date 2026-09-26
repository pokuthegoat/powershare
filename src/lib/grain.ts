/**
 * Film grain over the whole background, ported from GameStock (src/lib/scene/grain.ts there), where it is a
 * postprocessing effect. Here it is a small standalone canvas laid over the scene, with the same behaviour:
 *  - sized in CSS pixels (one grain = one CSS pixel), so it reads the same on a 1x screen and a 2x one;
 *  - triangular noise (two uniform draws), so it clusters round zero like real film;
 *  - re-rolled every frame, like projected film.
 *
 * GameStock's version nudges the shade of the picture underneath. That can't be done to a picture we don't render
 * ourselves, so it is drawn as a transparent overlay instead: dark specks where the noise is negative, light ones where
 * it is positive. On the white page only the dark specks show, over the blob and beige both kinds do.
 */

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = `
precision highp float;
uniform float uAmount;
uniform float uCell;
uniform float uSeed;

float grainHash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21) + uSeed);
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  vec2 cell = floor(gl_FragCoord.xy / uCell);
  float n = grainHash(cell) + grainHash(cell + 17.13) - 1.0;
  float a = abs(n) * uAmount;
  vec3 c = n > 0.0 ? vec3(1.0) : vec3(0.0);
  gl_FragColor = vec4(c * a, a); // premultiplied
}`;

export type Grain = {
  /** Match the canvas to its host's current size. */
  resize: () => void;
  /** Draw one frame of grain (a fresh roll of the noise each time). */
  render: () => void;
  dispose: () => void;
};

/** Adds a full-size grain canvas on top of `host`. Returns null when WebGL isn't available (no grain, nothing breaks). */
export function createGrain(host: HTMLElement, { amount = 0.09 }: { amount?: number } = {}): Grain | null {
  const canvas = document.createElement("canvas");
  canvas.className = "grain";
  const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false });
  if (!gl) return null;

  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const program = gl.createProgram()!;
  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);

  // One triangle that covers the whole screen.
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uAmount = gl.getUniformLocation(program, "uAmount");
  const uCell = gl.getUniformLocation(program, "uCell");
  const uSeed = gl.getUniformLocation(program, "uSeed");
  gl.uniform1f(uAmount, amount);

  host.appendChild(canvas);

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.max(1, Math.round(host.clientWidth * ratio));
    const h = Math.max(1, Math.round(host.clientHeight * ratio));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, w, h);
    gl.uniform1f(uCell, Math.max(1, ratio)); // one grain = one CSS pixel
  };

  const render = () => {
    gl.uniform1f(uSeed, Math.random() * 100);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const dispose = () => {
    gl.deleteBuffer(buffer);
    gl.deleteProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    canvas.remove();
  };

  resize();
  return { resize, render, dispose };
}
