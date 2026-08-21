"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Stickers are emoji, deliberately.
 *
 * They travel as ordinary text, so a sticker sent from here renders on the
 * other person's screen with no upload endpoint, no CDN and no attachment
 * format — the only kind of "sticker" this API can actually deliver.
 */
const CATEGORIES: { id: string; label: string; stickers: string[] }[] = [
  {
    id: "reactions",
    label: "Reactions",
    stickers: [
      "😀", "😄", "😁", "😂", "🤣", "😊", "😉", "😍",
      "😘", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🥳",
      "😏", "😴", "🤔", "🤯", "😱", "😭", "😤", "🙃",
    ],
  },
  {
    id: "love",
    label: "Love",
    stickers: [
      "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍",
      "💖", "💗", "💓", "💞", "💕", "💘", "💝", "💟",
    ],
  },
  {
    id: "hands",
    label: "Hands",
    stickers: [
      "👍", "👎", "👌", "✌️", "🤞", "🤙", "🤝", "👏",
      "🙌", "🙏", "💪", "✋", "👋", "🫶", "👊", "🤟",
    ],
  },
  {
    id: "celebrate",
    label: "Celebrate",
    stickers: [
      "🎉", "🎊", "🥂", "🍾", "🎂", "🎁", "🏆", "🥇",
      "⭐", "🌟", "✨", "💫", "🔥", "⚡", "💯", "🚀",
    ],
  },
  {
    id: "animals",
    label: "Animals",
    stickers: [
      "🐶", "🐱", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁",
      "🐮", "🐷", "🐸", "🐵", "🐔", "🦄", "🐢", "🦋",
    ],
  },
  {
    id: "things",
    label: "Things",
    stickers: [
      "☕", "🍕", "🍔", "🍟", "🍩", "🍪", "🌮", "🍜",
      "⚽", "🏀", "🎮", "🎧", "📷", "💻", "📱", "✈️",
      "🌍", "☀️", "🌙", "☔", "🌈", "❄️", "🎯", "📌",
    ],
  },
];

interface StickerPickerProps {
  onPick: (sticker: string) => void;
  onClose: () => void;
}

export default function StickerPicker({ onPick, onClose }: StickerPickerProps) {
  const [activeId, setActiveId] = useState(CATEGORIES[0].id);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Escape closes it, and so does a click anywhere outside the panel.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    };

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (panelRef.current && !panelRef.current.contains(target)) {
        // The toggle button handles its own close; ignore it here.
        if ((target as HTMLElement).closest?.("[data-sticker-toggle]")) return;
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [onClose]);

  const active = CATEGORIES.find((c) => c.id === activeId) ?? CATEGORIES[0];

  return (
    <div className="cw-stickers" ref={panelRef} role="dialog" aria-label="Stickers">
      <div className="cw-sticker-tabs" role="tablist" aria-label="Sticker categories">
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            type="button"
            role="tab"
            aria-selected={category.id === activeId}
            className={`cw-sticker-tab${category.id === activeId ? " is-active" : ""}`}
            onClick={() => setActiveId(category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="cw-sticker-grid">
        {active.stickers.map((sticker) => (
          <button
            key={sticker}
            type="button"
            className="cw-sticker"
            onClick={() => onPick(sticker)}
            aria-label={`Send ${sticker}`}
          >
            {sticker}
          </button>
        ))}
      </div>

      <p className="cw-sticker-note">
        Stickers send as text, so they arrive everywhere.
      </p>
    </div>
  );
}
