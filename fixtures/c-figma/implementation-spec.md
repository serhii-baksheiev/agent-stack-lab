# Synthetic subscription card

This artifact is authored locally for an offline handoff test. It contains no
retrieved Figma context, screenshots, components, tokens, or assets. The adjacent
JSON is the canonical synthetic input; the reference SVGs are manually drawn
acceptance references, independently of the implementation DOM.

Use a single white card on the pale canvas. At 640px the card starts at x=120;
at 390px it starts at x=24. Both start at y=72. Use 24px interior padding,
a 24px heading with 29px line height, 14px descriptive copy, and 44px controls.
The heading is “Project updates”; the description is “Get a monthly progress note.”
The email field is required. The action is “Subscribe”. On valid submission,
replace the reserved status text with “Subscribed: <email>”. Never send data.

| Task | Requirements | Code | Acceptance |
|---|---|---|---|
| C-T1 Implement card and responsive styles | C-R1 | index.html, style.css | desktop/mobile geometry, computed tokens, SVG color samples |
| C-T2 Implement local subscription | C-R2 | app.js | invalid submission has no confirmation; valid submission reports email; no HTTP requests |
| C-T3 Verify accessibility and visual result | C-R1, C-R3 | index.html, spike-c-visual.mjs | label association, status role, screenshots, deliberate color regression rejected |

## Continuation in another session/provider

1. Read design-context.json and this specification; confirm SYN-C-001 and C-R1–3.
2. Inspect implementation and git diff; select incomplete C-T1–3 using test evidence,
   not a private chat transcript or inferred task state.
3. Run `node scripts/spike-c-visual.mjs` from the lab root after the documented
   Playwright installation. Inspect both screenshot pairs and result.json.
4. Record the revision and any remaining requirement IDs in the board or PR.

This demonstrates portable continuation artifacts. It does not demonstrate that
Claude executed a session, Codex resumed it, or either harness retrieved Figma data.
