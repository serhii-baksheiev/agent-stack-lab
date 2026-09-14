/**
 * Render a counter label for a non-negative integer.
 * @param {number} n
 * @returns {string} "Count: <n>"
 * @throws {TypeError} when n is not a non-negative integer
 */
export function render(n) {
  if (typeof n !== 'number' || !Number.isInteger(n) || n < 0) {
    throw new TypeError(`render expects a non-negative integer, received ${String(n)}`);
  }
  return `Count: ${n}`;
}
