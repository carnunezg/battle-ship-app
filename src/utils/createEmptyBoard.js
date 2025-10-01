export function createEmptyBoard() {
  return Array(10)
    .fill(null)
    .map(() => Array(10).fill(null));
}
