"use client";

import { useEffect, useState } from "react";

/**
 * Trails `value` by `delay` ms so a query only reaches the network once typing
 * settles. The first value passes through on mount, so the initial render is
 * never delayed.
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    if (value === debounced) return;

    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
    // `debounced` is deliberately omitted: including it would restart the timer
    // on every settle and stall rapid typing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, delay]);

  return debounced;
}

export default useDebouncedValue;
