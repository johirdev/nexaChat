"use client";

import { useEffect, useState, type ElementType, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  /** Stagger within a group, in milliseconds. */
  delay?: number;
  /** Render as something other than a div — e.g. "li", "article", "section". */
  as?: ElementType;
  className?: string;
}

/**
 * Fades and lifts its children the first time they scroll into view, then stops
 * observing. The motion itself is a CSS transition on `.ln-reveal`, so a reader
 * with reduced motion enabled simply sees the content — no JS branch needed.
 */
export default function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
}: RevealProps) {
  const [node, setNode] = useState<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!node || isVisible) return;

    // No capability check: IntersectionObserver is baseline everywhere this app
    // runs. With scripting off entirely, landing.css un-hides `.ln-reveal`
    // through `@media (scripting: none)`, so the content is never lost.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [node, isVisible]);

  return (
    <Tag
      ref={setNode}
      className={`ln-reveal${isVisible ? " is-in" : ""}${className ? ` ${className}` : ""}`}
      style={delay ? ({ "--ln-delay": `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}
