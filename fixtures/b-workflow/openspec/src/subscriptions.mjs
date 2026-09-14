/** Pure local subscription transition. State is supplied and retained by its caller. */
export function subscribe(state, email) {
  if (typeof email !== 'string') throw new TypeError('Email must be a string');
  const normalized = email.trim().toLowerCase();
  if (normalized.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new TypeError('Email does not satisfy the lab format');
  }
  const existing = state.find(record => record.email === normalized);
  if (existing) return { state, subscription: existing, created: false };
  const subscription = { id: `sub-${state.length + 1}`, email: normalized };
  return { state: [...state, subscription], subscription, created: true };
}
