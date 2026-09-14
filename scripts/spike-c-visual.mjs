import assert from 'node:assert/strict';
import { readFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { root, json, sha } from './lab-evidence.mjs';

const fixture = path.join(root, 'fixtures/c-figma');
const output = path.join(root, 'spikes/c-figma/evidence/offline');
mkdirSync(output, { recursive: true });
const context = JSON.parse(readFileSync(path.join(fixture, 'design-context.json')));
const packagePath = path.join(root, '.lab-runs/c-tools/node_modules/playwright');
const packageMetadata = JSON.parse(readFileSync(path.join(packagePath, 'package.json')));
assert.equal(packageMetadata.version, '1.63.0', 'Pinned browser driver required');
const { chromium } = await import(pathToFileURL(path.join(packagePath, 'index.mjs')).href);
const result = { provenance: 'Synthetic local design only; no Figma retrieval or two-provider session executed.', designId: context.id, playwrightVersion: packageMetadata.version, platform: process.platform, startedAt: new Date().toISOString(), tests: [], screenshots: {}, networkRequests: [] };
let browser;
function check(name, fn, requirement) {
  try { fn(); result.tests.push({ name, requirement, passed: true }); }
  catch (error) { result.tests.push({ name, requirement, passed: false, error: error.message }); throw error; }
}
async function inspect(page) {
  return page.evaluate(() => {
    const measure = selector => { const el = document.querySelector(selector); const b = el.getBoundingClientRect(); const s = getComputedStyle(el); return { x: b.x, y: b.y, width: b.width, height: b.height, background: s.backgroundColor, color: s.color, borderRadius: s.borderRadius }; };
    return { card: measure('.card'), button: measure('button'), input: measure('input'), canvas: getComputedStyle(document.body).backgroundColor, label: document.querySelector('input').labels[0]?.textContent, statusRole: document.querySelector('.status').getAttribute('role'), horizontalOverflow: document.documentElement.scrollWidth > innerWidth };
  });
}
function validate(measurement, width) {
  const cardWidth = Math.min(400, width - 48);
  assert.deepEqual([measurement.card.x, measurement.card.y, measurement.card.width, measurement.card.height], [(width-cardWidth)/2, 72, cardWidth, 289]);
  assert.equal(measurement.card.borderRadius, '12px');
  assert.equal(measurement.canvas, 'rgb(244, 246, 250)');
  assert.equal(measurement.card.background, 'rgb(255, 255, 255)');
  assert.equal(measurement.card.color, 'rgb(22, 34, 56)');
  assert.equal(measurement.button.background, 'rgb(36, 87, 214)');
  assert.deepEqual([measurement.input.y, measurement.input.height, measurement.button.y, measurement.button.height], [203, 44, 263, 44]);
  assert.equal(measurement.horizontalOverflow, false);
}
try {
  browser = await chromium.launch({ headless: true });
  result.browserVersion = browser.version();
  for (const [name, width, height] of [['desktop', 640, 480], ['mobile', 390, 640]]) {
    const browserContext = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
    browserContext.setDefaultTimeout(10000);
    browserContext.setDefaultNavigationTimeout(10000);
    await browserContext.route(/https?:\/\//, route => { result.networkRequests.push(route.request().url()); return route.abort(); });
    const page = await browserContext.newPage();
    await page.goto(pathToFileURL(path.join(fixture, 'index.html')).href);
    const measurement = await inspect(page);
    check(`${name}: layout and color tokens`, () => validate(measurement, width), 'C-R1');
    check(`${name}: label and live status`, () => { assert.equal(measurement.label, 'Email'); assert.equal(measurement.statusRole, 'status'); }, 'C-R3');
    const actual = await page.screenshot({ path: path.join(output, `${name}-implementation.png`) });
    await page.goto(pathToFileURL(path.join(fixture, `reference-${name}.svg`)).href);
    const reference = await page.screenshot({ path: path.join(output, `${name}-reference.png`) });
    const left = (width - Math.min(400, width-48))/2;
    const samples = [[10,10], [left+16,90], [left+30,270], [left+30,240], [width-10,height-10]];
    const pixels = await page.evaluate(async ({ a, b, samples }) => {
      async function values(source) { const image = new Image(); image.src = `data:image/png;base64,${source}`; await image.decode(); const canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas'); canvas.width = image.width; canvas.height = image.height; const ctx = canvas.getContext('2d'); ctx.drawImage(image,0,0); return samples.map(([x,y]) => Array.from(ctx.getImageData(x,y,1,1).data)); }
      return { actual: await values(a), reference: await values(b) };
    }, { a: actual.toString('base64'), b: reference.toString('base64'), samples });
    check(`${name}: independent SVG solid-color samples`, () => assert.deepEqual(pixels.actual, pixels.reference), 'C-R1');
    result.screenshots[name] = { implementation: { file: `${name}-implementation.png`, sha256: sha(actual) }, reference: { file: `${name}-reference.png`, sha256: sha(reference) }, measurement, samples, pixels, limitation: 'Solid-color samples and DOM geometry are checked; typography and complete pixel equivalence require human review.' };
    await page.goto(pathToFileURL(path.join(fixture, 'index.html')).href);
    await page.getByRole('button', { name: 'Subscribe' }).click();
    const empty = await page.getByRole('status').textContent();
    await page.getByLabel('Email', { exact: true }).fill('invalid');
    await page.getByRole('button', { name: 'Subscribe' }).click();
    const invalid = await page.getByRole('status').textContent();
    check(`${name}: invalid submission rejected`, () => { assert.equal(empty, 'No messages yet.'); assert.equal(invalid, empty); }, 'C-R2');
    await page.getByLabel('Email', { exact: true }).fill('synthetic@example.test');
    await page.getByRole('button', { name: 'Subscribe' }).click();
    const confirmation = await page.getByRole('status').textContent();
    check(`${name}: valid subscription confirmation`, () => assert.equal(confirmation, 'Subscribed: synthetic@example.test'), 'C-R2');
    await page.addStyleTag({ content: 'button { background: #ff0000 !important; }' });
    const regression = await inspect(page);
    check(`${name}: deliberate token regression detected`, () => assert.throws(() => validate(regression, width), /255, 0, 0/), 'C-R1');
    await browserContext.close();
  }
  check('No external network requests', () => assert.deepEqual(result.networkRequests, []), 'C-R2');
  assert.equal(result.tests.length, 13, 'Both viewport scenarios must execute completely');
  result.status = 'passed';
} catch (error) { result.status = 'failed'; result.error = error.stack; process.exitCode = 1; }
finally { await browser?.close(); result.finishedAt = new Date().toISOString(); result.fixtureHashes = Object.fromEntries(['design-context.json','implementation-spec.md','index.html','style.css','app.js','reference-desktop.svg','reference-mobile.svg'].map(f => [f,sha(readFileSync(path.join(fixture,f)))])); json(path.join(output,'result.json'), result); }
console.log(JSON.stringify({ status: result.status, tests: result.tests.length, passed: result.tests.filter(t=>t.passed).length }));
