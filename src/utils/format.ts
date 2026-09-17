/**
 * Converts a duration in seconds to an mm:ss display value.
 */
export function formatDuration(seconds: number): string {
  const minutes: number = Math.floor(seconds / 60);
  const remainder: number = Math.max(0, seconds % 60);
  return `${String(minutes)}:${String(remainder).padStart(2, '0')}`;
}
