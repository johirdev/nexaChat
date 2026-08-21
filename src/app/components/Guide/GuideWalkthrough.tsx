"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Lightbulb, RotateCcw } from "lucide-react";
import "./guide.css";

export interface GuideStep {
  /** Short label for the rail. */
  title: string;
  /** One line under the label, desktop only. */
  hint: string;
  kicker: string;
  heading: string;
  body: string;
  notices: { title: string; text: string }[];
  image: string;
  alt: string;
}

interface GuideWalkthroughProps {
  steps: GuideStep[];
}

/**
 * The step-through. One screenshot and one explanation at a time, driven by the
 * rail on the left, the buttons underneath, or the arrow keys.
 */
export default function GuideWalkthrough({ steps }: GuideWalkthroughProps) {
  const [index, setIndex] = useState(0);
  const stepsRef = useRef<HTMLUListElement | null>(null);

  const total = steps.length;
  const step = steps[index];
  const isFirst = index === 0;
  const isLast = index === total - 1;

  const goTo = useCallback(
    (next: number) => setIndex(Math.min(Math.max(next, 0), total - 1)),
    [total],
  );

  // Arrow keys move through the guide, unless the reader is typing somewhere.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
      ) {
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        setIndex((current) => Math.min(current + 1, total - 1));
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        setIndex((current) => Math.max(current - 1, 0));
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [total]);

  // On narrow screens the rail is a horizontal strip — keep the active chip visible.
  useEffect(() => {
    const active = stepsRef.current?.querySelector<HTMLElement>(".gd-step.is-active");
    active?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [index]);

  return (
    <section className="gd-walk" id="walkthrough">
      <div className="ln-wrap gd-walk-inner">
        {/* ------------------------------------------------------ rail */}
        <div className="gd-rail ">
          <div className="gd-progress ">
            <p className="gd-progress-top">
              <span>Your progress</span>
              <b>
                {index + 1}/{total}
              </b>
            </p>
            <div
              className="gd-progress-bar"
              role="progressbar"
              aria-valuenow={index + 1}
              aria-valuemin={1}
              aria-valuemax={total}
              aria-label="Guide progress"
            >
              <div
                className="gd-progress-fill"
                style={{ width: `${((index + 1) / total) * 100}%` }}
              />
            </div>
          </div>

          <ul className="gd-steps" ref={stepsRef}>
            {steps.map((item, i) => (
              <li key={item.title}>
                <button
                  type="button"
                  className={`gd-step${i === index ? " is-active" : ""}${
                    i < index ? " is-done" : ""
                  }`}
                  onClick={() => goTo(i)}
                  aria-current={i === index ? "step" : undefined}
                >
                  <span className="gd-step-num">{i + 1}</span>
                  <span className="gd-step-body">
                    <span className="gd-step-title">{item.title}</span>
                    <span className="gd-step-hint">{item.hint}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* ----------------------------------------------------- stage */}
        <div className="gd-stage">
          {/* Keyed so React swaps the node and the entrance animation replays. */}
          <div className="gd-shot" key={`shot-${index}`}>
            <Image
              src={step.image}
              alt={step.alt}
              width={900}
              height={600}
              unoptimized
              priority={index === 0}
            />
          </div>

          <div className="gd-copy" key={`copy-${index}`}>
            <span className="gd-kicker">{step.kicker}</span>
            <h2>{step.heading}</h2>
            <p>{step.body}</p>

            <ul className="gd-notice">
              {step.notices.map((notice) => (
                <li key={notice.title}>
                  <Lightbulb size={16} aria-hidden="true" />
                  <span>
                    <b>{notice.title}</b> — {notice.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="gd-controls">
            <span className="gd-counter" aria-live="polite">
              Step {index + 1} of {total} · {step.title}
            </span>

            <div className="gd-controls-btns">
              {isLast ? (
                <button
                  type="button"
                  className="ln-btn ln-btn-outline"
                  onClick={() => goTo(0)}
                >
                  <RotateCcw size={15} /> Start over
                </button>
              ) : (
                <button
                  type="button"
                  className="ln-btn ln-btn-outline"
                  onClick={() => goTo(index - 1)}
                  disabled={isFirst}
                >
                  <ArrowLeft size={15} /> Previous
                </button>
              )}

              <button
                type="button"
                className="ln-btn ln-btn-primary"
                onClick={() => goTo(index + 1)}
                disabled={isLast}
              >
                Next step <ArrowRight size={15} />
              </button>
            </div>
          </div>

          <p className="gd-hint">
            Tip: use <kbd>←</kbd> and <kbd>→</kbd> to move through the guide.
          </p>
        </div>
      </div>
    </section>
  );
}
