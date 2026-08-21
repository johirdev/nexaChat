"use client";

import { Fragment } from "react";

/**
 * Marks every occurrence of `query` inside `text`, case-insensitively, so a
 * person can see *why* a row matched. Falls back to plain text when the query is
 * empty or absent — which is also what happens on phone-only matches.
 */
export default function HighlightedText({
  text,
  query,
}: {
  text: string;
  query: string;
}) {
  const needle = query.trim();
  if (!needle) return <>{text}</>;

  const haystack = text.toLowerCase();
  const lowerNeedle = needle.toLowerCase();

  const parts: { value: string; hit: boolean }[] = [];
  let cursor = 0;

  for (;;) {
    const index = haystack.indexOf(lowerNeedle, cursor);
    if (index === -1) break;

    if (index > cursor) {
      parts.push({ value: text.slice(cursor, index), hit: false });
    }
    parts.push({
      value: text.slice(index, index + needle.length),
      hit: true,
    });
    cursor = index + needle.length;
  }

  if (parts.length === 0) return <>{text}</>;
  if (cursor < text.length) {
    parts.push({ value: text.slice(cursor), hit: false });
  }

  return (
    <>
      {parts.map((part, i) => (
        <Fragment key={`${i}-${part.value}`}>
          {part.hit ? <mark className="ul-mark">{part.value}</mark> : part.value}
        </Fragment>
      ))}
    </>
  );
}
