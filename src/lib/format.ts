import {
  format,
  formatDistanceToNowStrict,
  isSameDay,
  isThisYear,
  isToday,
  isYesterday,
} from "date-fns";

function toDate(value: string | number | Date | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Compact stamp for the conversation list: "now", "4m", "3h", "Tue", "12 Aug". */
export function formatListTimestamp(value: string | undefined | null): string {
  const date = toDate(value);
  if (!date) return "";

  const seconds = (Date.now() - date.getTime()) / 1000;
  if (seconds < 60) return "now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (isToday(date)) return `${Math.floor(seconds / 3600)}h`;
  if (isYesterday(date)) return "Yesterday";
  if (seconds < 7 * 86400) return format(date, "EEE");
  return format(date, isThisYear(date) ? "d MMM" : "d MMM yy");
}

/** Clock time under a bubble. */
export function formatMessageTime(value: string): string {
  const date = toDate(value);
  return date ? format(date, "h:mm a") : "";
}

/** Divider label between days of messages. */
export function formatDayDivider(value: string): string {
  const date = toDate(value);
  if (!date) return "";
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, isThisYear(date) ? "EEEE, d MMMM" : "d MMMM yyyy");
}

/** Full stamp for tooltips and the group info panel. */
export function formatFullTimestamp(value: string | undefined | null): string {
  const date = toDate(value);
  return date ? format(date, "d MMM yyyy, h:mm a") : "";
}

export function formatRelative(value: string | undefined | null): string {
  const date = toDate(value);
  if (!date) return "";
  return `${formatDistanceToNowStrict(date)} ago`;
}

export function isSameDayAs(a: string, b: string): boolean {
  const left = toDate(a);
  const right = toDate(b);
  return Boolean(left && right && isSameDay(left, right));
}
