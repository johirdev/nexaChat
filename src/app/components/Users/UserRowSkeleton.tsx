"use client";

/**
 * Mirrors the exact geometry of `UserRow` — same avatar size, same two lines, same
 * padding — so swapping real rows in causes no layout shift. Line widths vary by
 * index to read as a list of names rather than a stack of identical bars.
 */

const NAME_WIDTHS = ["70%", "52%", "63%", "45%", "58%", "74%", "49%", "66%"];
const PHONE_WIDTHS = ["44%", "38%", "50%", "34%", "42%", "46%", "36%", "40%"];

export default function UserRowSkeleton({ index = 0 }: { index?: number }) {
  return (
    <li className="ul-skel-row" aria-hidden="true">
      <span className="ul-skel ul-skel-avatar" />
      <span className="ul-skel-lines">
        <span
          className="ul-skel ul-skel-name"
          style={
            { "--w": NAME_WIDTHS[index % NAME_WIDTHS.length] } as React.CSSProperties
          }
        />
        <span
          className="ul-skel ul-skel-phone"
          style={
            {
              "--w2": PHONE_WIDTHS[index % PHONE_WIDTHS.length],
            } as React.CSSProperties
          }
        />
      </span>
    </li>
  );
}

export function UserListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ul className="ul-list" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <UserRowSkeleton key={i} index={i} />
      ))}
    </ul>
  );
}
