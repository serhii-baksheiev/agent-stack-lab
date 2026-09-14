export function render(n) { if (!Number.isInteger(n) || n < 0) throw new TypeError("count"); return `Count: ${n}`; }
