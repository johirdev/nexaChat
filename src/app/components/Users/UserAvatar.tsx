"use client";


const GRADIENTS: readonly [string, string][] = [
  ["#2de0c4", "#1d9bf0"],
  ["#7750f5", "#c86dd7"],
  ["#f5a524", "#f76b1c"],
  ["#37d67a", "#0aa06e"],
  ["#ff7c9b", "#e0396c"],
  ["#47bdf3", "#4b6ef5"],
  ["#a78bfa", "#6d4cef"],
  ["#f6c445", "#e08e0b"],
];

function hash(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) {
    h = (h * 31 + value.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

interface UserAvatarProps {
  id: string;
  name: string;
  /** Renders the presence dot. Presence is not in the API yet — off by default. */
  showPresence?: boolean;
  /** Makes the crown a profile trigger when the avatar belongs to the signed-in user. */
  onPresenceClick?: () => void;
}

export default function UserAvatar({
  id,
  name,
  showPresence = false,
  onPresenceClick,
}: UserAvatarProps) {
  const [from, to] = GRADIENTS[hash(id) % GRADIENTS.length];

  return (
    <span
      className={`ul-avatar${onPresenceClick ? " is-clickable" : ""}`}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
      aria-hidden={onPresenceClick ? undefined : true}
      role={onPresenceClick ? "button" : undefined}
      tabIndex={onPresenceClick ? 0 : undefined}
      onClick={onPresenceClick}
      onKeyDown={
        onPresenceClick
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onPresenceClick();
              }
            }
          : undefined
      }
    >
      {initialsOf(name)}
      {showPresence && (
        <button
          type="button"
          className={`ul-avatar-crown${onPresenceClick ? " is-clickable" : ""}`}
          onClick={(event) => {
            event.stopPropagation();
            onPresenceClick?.();
          }}
          aria-label={onPresenceClick ? "Open my profile" : undefined}
          tabIndex={onPresenceClick ? 0 : -1}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M3 8L7 11L12 5L17 11L21 8L19 17H5L3 8Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <path
              d="M6 19H18"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </span>
  );
}
