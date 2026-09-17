/** Converts a duration in seconds to an mm:ss display value. */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.max(0, seconds % 60);
  return `${minutes}:${remainder.toString().padStart(2, '0')}`;
}
