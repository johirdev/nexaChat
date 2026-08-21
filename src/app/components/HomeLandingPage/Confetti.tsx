"use client";

import { useEffect, useRef } from "react";

const COLORS = [
  "#2de0c4",
  "#47bdf3",
  "#7750f5",
  "#9678ff",
  "#f6c445",
  "#ff7c9b",
  "#f5fbff",
];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  spin: number;
  angle: number;
  life: number;
  decay: number;
}

const GRAVITY = 0.13;
const DRAG = 0.987;

function burst(width: number, height: number): Particle[] {
  const particles: Particle[] = [];

  // Two cannons firing inward from the lower corners, plus a pop from the
  // middle — the shape reads as a celebration rather than falling snow.
  const cannons: { x: number; y: number; aim: number; count: number }[] = [
    { x: width * 0.08, y: height * 0.92, aim: -Math.PI / 3.1, count: 46 },
    { x: width * 0.92, y: height * 0.92, aim: -Math.PI + Math.PI / 3.1, count: 46 },
    { x: width * 0.5, y: height * 0.44, aim: -Math.PI / 2, count: 54 },
  ];

  for (const cannon of cannons) {
    for (let i = 0; i < cannon.count; i += 1) {
      const spread = (Math.random() - 0.5) * 0.92;
      const speed = 6.5 + Math.random() * 8.5;
      const angle = cannon.aim + spread;

      particles.push({
        x: cannon.x,
        y: cannon.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 5 + Math.random() * 6,
        color: COLORS[(Math.random() * COLORS.length) | 0],
        spin: (Math.random() - 0.5) * 0.32,
        angle: Math.random() * Math.PI,
        life: 1,
        decay: 0.006 + Math.random() * 0.007,
      });
    }
  }

  return particles;
}

/**
 * A confetti burst on a canvas. Re-fires whenever `fireKey` changes, so the
 * parent triggers it by bumping a counter rather than reaching for a ref.
 *
 * Skipped entirely for readers who ask for reduced motion — a screenful of
 * flying objects is precisely what that preference is about.
 */
export default function Confetti({ fireKey }: { fireKey: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (fireKey === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const parent = canvas.parentElement;
    const width = parent?.clientWidth ?? canvas.clientWidth;
    const height = parent?.clientHeight ?? canvas.clientHeight;
    if (width === 0 || height === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    context.scale(dpr, dpr);

    let particles = burst(width, height);
    let frame = 0;

    const tick = () => {
      context.clearRect(0, 0, width, height);

      particles = particles.filter((p) => p.life > 0 && p.y < height + 40);

      for (const p of particles) {
        p.vy += GRAVITY;
        p.vx *= DRAG;
        p.vy *= DRAG;
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.spin;
        p.life -= p.decay;

        context.save();
        context.translate(p.x, p.y);
        context.rotate(p.angle);
        context.globalAlpha = Math.max(p.life, 0);
        context.fillStyle = p.color;
        // Flat rectangles that thin out as they spin read as paper.
        context.fillRect(
          -p.size / 2,
          -p.size / 4,
          p.size,
          p.size * 0.5 * Math.abs(Math.cos(p.angle)),
        );
        context.restore();
      }

      if (particles.length > 0) {
        frame = window.requestAnimationFrame(tick);
      } else {
        context.clearRect(0, 0, width, height);
      }
    };

    frame = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frame);
      context.clearRect(0, 0, width, height);
    };
  }, [fireKey]);

  return <canvas ref={canvasRef} className="ln-confetti" aria-hidden="true" />;
}
