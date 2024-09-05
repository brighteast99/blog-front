export function progress(start: number, end: number, current: number): number {
  if (end < start) return 0

  if (start === end) return 1
  return Math.max(0, Math.min(1, (current - start) / (end - start)))
}
