import Image from "next/image";
import "./brandLoader.css";

interface BrandLoaderProps {
  /** The one line that says what is happening. */
  message?: string;
  /** Optional second line for context, e.g. why a redirect is coming. */
  note?: string;
  /** `overlay` covers the page already on screen instead of replacing it. */
  variant?: "page" | "overlay";
}

/**
 * The branded waiting screen: the NexaChat mark inside two counter-rotating
 * rings in the logo's own colours.
 *
 * It is announced politely rather than assertively — a session check is not an
 * alert, and a screen reader should hear it once the label settles.
 */
export default function BrandLoader({
  message = "Just a moment…",
  note,
  variant = "page",
}: BrandLoaderProps) {
  return (
    <div
      className={`bl${variant === "overlay" ? " is-overlay" : ""}`}
      role="status"
      aria-live="polite"
    >
      <div className="bl-mark">
        <span className="bl-ring is-halo" aria-hidden="true" />
        <span className="bl-ring is-outer" aria-hidden="true" />
        <span className="bl-ring is-inner" aria-hidden="true" />
        <Image
          className="bl-logo"
          src="/nexaChat.png"
          alt=""
          width={58}
          height={58}
          priority
        />
      </div>

      <div className="bl-copy">
        <span className="bl-word">
          Nexa<em>Chat</em>
        </span>
        <p className="bl-msg">{message}</p>
        {note && <p className="bl-note">{note}</p>}
      </div>

      <span className="bl-bar" aria-hidden="true" />
    </div>
  );
}
