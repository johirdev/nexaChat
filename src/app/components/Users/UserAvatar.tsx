"use client";

/**
 * A deterministic avatar: the same person always gets the same colours, on every
 * device and every reload, without the API sending an image. The hash is over
 * the immutable `_id` rather than the name, so a rename never re-colours a face
 * the reader has already learned.
 */

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
}

export default function UserAvatar({
  id,
  name,
  showPresence = false,
}: UserAvatarProps) {
  const [from, to] = GRADIENTS[hash(id) % GRADIENTS.length];

  return (
    <span
      className="ul-avatar"
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
      aria-hidden="true"
    >
      {initialsOf(name)}
      {showPresence && <i className="ul-avatar-dot" />}
    </span>
  );
}
