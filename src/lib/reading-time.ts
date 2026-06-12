import readingTimeLib from "reading-time";

export function calculateReadingTime(htmlContent: string): number {
  // Strip HTML tags to get plain text
  const text = htmlContent.replace(/<[^>]*>/g, "");
  const result = readingTimeLib(text);
  return Math.ceil(result.minutes);
}
