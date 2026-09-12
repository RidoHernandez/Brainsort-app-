export function interpolateNumber(start: number, end: number) {
  return (t: number) => start + (end - start) * t;
}
