/**
 * Render a counter label for a non-negative integer.
 * @param {number} n
 * @returns {string} "Count: <n>"
 * @throws {TypeError} when n is not a non-negative integer
 */
export function render(n) {
  if (typeof n !== 'number' || !Number.isInteger(n) || n < 0) {
    // Fixed message: converting `n` to a string could itself throw (e.g. a
    // Symbol.toPrimitive hook), which would mask the required TypeError.
    throw new TypeError('render expects a non-negative integer');
  }
  return `Count: ${n}`;
}
