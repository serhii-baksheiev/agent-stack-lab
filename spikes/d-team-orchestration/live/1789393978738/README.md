# counter (lab feature d-live-1789393978738)

Renders a counter label. Laboratory-only; no production meaning.

```js
import { render } from './counter.mjs';
render(3); // "Count: 3"
render(-1); // throws TypeError (also for non-integers and non-numbers)
```
Test: `node --test "spikes/d-team-orchestration/live/1789393978738/**/*.test.mjs"`
