export function DateTimeBd(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);

  return date.toLocaleString("en-BD", {
    timeZone: "Asia/Dhaka",
    day: "2-digit",
    month: "short", // Example: Nov
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}
