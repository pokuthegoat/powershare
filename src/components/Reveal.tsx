import { createElement, type ElementType, type ReactNode } from "react";

/**
 * A plain wrapper element. It used to fade its content in as it scrolled into view; that animation has been removed from
 * the whole site, so content is simply there. The component and its `reveal` class stay because the layout uses them as
 * wrappers (see `.faq > .reveal + .reveal` in globals.css). Extra props (id, aria-*, ...) pass through to the rendered tag.
 */
export function Reveal({
  children,
  as: Tag = "div",
  className = "",
  ...rest
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  [rest: string]: unknown;
}) {
  return createElement(Tag, { className: `reveal ${className}`, ...rest }, children);
}
