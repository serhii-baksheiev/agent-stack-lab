export function subscribe(state, email) {
  if (typeof email !== 'string') throw new TypeError('Expected an email string');
  const address = email.trim().toLowerCase();
  const allowed = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address) && address.length <= 254;
  if (!allowed) throw new TypeError('Invalid synthetic email');
  for (const record of state) {
    if (record.email === address) return {state, subscription: record, created: false};
  }
  const subscription = {id: 'sub-' + (state.length + 1), email: address};
  return {state: state.concat(subscription), subscription, created: true};
}
