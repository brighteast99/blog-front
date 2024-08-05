export function progress(start: number, end: number, current: number): number {
  if (end < start) throw RangeError('end must be larger than or equal to start')

  if (start === end) return 1
  return Math.max(0, Math.min(1, (current - start) / (end - start)))
}
