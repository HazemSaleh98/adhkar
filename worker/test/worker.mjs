import assert from 'node:assert';
import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { handle, runCron, validate, endpointOk } from '../src/index.js';
// Real SQLite running the real schema.sql, behind a D1-shaped adapter (D1 is SQLite; this is not Cloudflare itself).
const sq = new DatabaseSync(':memory:'); sq.exec(fs.readFileSync(new URL('../schema.sql', import.meta.url), 'utf8'));
const DB = { prepare(sql) { const st = sq.prepare(sql); return { a: [], bind(...a) { this.a = a; return this; },
  async run() { const r = st.run(...this.a); return { meta: { changes: r.changes } }; },
  async first() { return st.get(...this.a) || null; }, async all() { return { results: st.all(...this.a) }; } }; } };
const O = 'https://hazemsaleh98.github.io';
const env = { DB, VAPID_PUBLIC: 'k', ALLOW_ORIGIN: O, MAX_SUBS: '3' };
const P = 'B' + 'a'.repeat(86), A = 'b'.repeat(22);
const sub = (n = 'x') => ({ endpoint: 'https://web.push.apple.com/' + n, keys: { p256dh: P, auth: A } });
const post = (p, b, o = O, ct = 'application/json') => handle(new Request('https://w.test' + p, { method: 'POST', headers: { Origin: o, 'content-type': ct }, body: typeof b === 'string' ? b : JSON.stringify(b) }), env);
const ck = async (r, st) => { assert.equal(r.status, st, 'expected ' + st + ' got ' + r.status + ' ' + await r.clone().text()); return r.json(); };

// subscribe: random id + secret, nothing named stored
const a = await ck(await post('/subscribe', { subscription: sub('a'), settings: { interval: 1, from: '00:00', to: '23:59' } }), 200);
assert(a.id.length >= 20 && a.token.length >= 40);
const cols = sq.prepare('PRAGMA table_info(subs)').all().map((c) => c.name);
assert(!cols.includes('name')); console.log('PASS subscribe returns random id+secret; table has no name column');
const row = sq.prepare('SELECT * FROM subs').get(); assert.notEqual(row.token_hash, a.token);
console.log('PASS secret stored only as hash');
// protections
await ck(await post('/subscribe', { subscription: sub('a') }), 409);
await ck(await post('/subscribe', { subscription: sub('b') }, 'https://evil.example'), 403);
await ck(await handle(new Request('https://w.test/subscribe', { method: 'POST', body: '{}' }), env), 403);
await ck(await post('/subscribe', { subscription: sub('c') }, O, 'text/plain'), 415);
await ck(await post('/subscribe', 'x'.repeat(5000)), 400);
await ck(await post('/subscribe', '{bad'), 400);
await ck(await post('/subscribe', { subscription: { endpoint: 'https://evil.example/x', keys: { p256dh: P, auth: A } } }), 400);
await ck(await post('/subscribe', { subscription: { endpoint: 'http://web.push.apple.com/x', keys: { p256dh: P, auth: A } } }), 400);
await ck(await post('/subscribe', { subscription: { endpoint: 'https://web.push.apple.com.evil.example/x', keys: { p256dh: P, auth: A } } }), 400);
assert.equal(validate({ subscription: sub(), settings: { interval: -5 } }), 'bad interval');
assert.equal(validate({ subscription: sub(), settings: { tz: 'Nope/Zone' } }), 'bad tz');
assert.equal(validate({ subscription: sub(), settings: { fixed: ['25:00'] } }), 'bad time');
assert.equal(validate({ subscription: { endpoint: sub().endpoint, keys: { p256dh: 'x', auth: A } } }), 'bad keys');
assert(endpointOk('https://fcm.googleapis.com/fcm/send/abc') && !endpointOk('https://localhost/x'));
console.log('PASS origin check, content-type, size cap, bad json, endpoint allowlist (incl. lookalike host), field validation');
// update needs the secret; stranger can't update or delete
await ck(await post('/subscribe', { id: a.id, token: 'wrong'.repeat(9), subscription: sub('a'), settings: { interval: 5 } }), 404);
await ck(await post('/unsubscribe', { id: a.id, token: 'wrong'.repeat(9) }), 200).then((r) => assert.equal(r.deleted, false));
assert.equal(sq.prepare('SELECT COUNT(*) n FROM subs').get().n, 1);
await ck(await post('/subscribe', { id: a.id, token: a.token, subscription: sub('a'), settings: { interval: 5 } }), 200);
assert.equal(sq.prepare('SELECT interval FROM subs').get().interval, 5);
console.log('PASS update works only with the secret; wrong secret cannot update or delete');
// capacity cap
await ck(await post('/subscribe', { subscription: sub('b') }), 200); await ck(await post('/subscribe', { subscription: sub('c') }), 200);
await ck(await post('/subscribe', { subscription: sub('d') }), 503);
console.log('PASS capacity cap (MAX_SUBS)');
// cron: generic payload, cadence, cleanup
sq.exec('DELETE FROM subs'); const t = Date.UTC(2026, 10, 26, 10, 0);
const s1 = await ck(await post('/subscribe', { subscription: sub('p'), settings: { interval: 1, from: '00:00', to: '23:59' } }), 200);
const calls = [];
assert.equal(await runCron(env, t, async (s, p) => { calls.push(p); return 201; }), 1);
assert.deepEqual(Object.keys(calls[0]).sort(), ['body', 'tag', 'title']); assert.ok(['داوم على ذكر الله','لا تفتر عن ذكر الله','أكثر من ذكر الله','اذكر الله كثيرًا','حان موعد أذكارك'].includes(calls[0].title));
assert.equal(await runCron(env, t + 30000, async () => 201), 0);
assert.equal(await runCron(env, t + 60000, async () => 201), 1);
console.log('PASS cron: generic payload (title أذكار + dhikr), cadence');
assert.equal(await runCron(env, t + 120000, async () => 410), 0);
assert.equal(sq.prepare('SELECT COUNT(*) n FROM subs').get().n, 0); console.log('PASS 410 removes subscription');
const s2 = await ck(await post('/subscribe', { subscription: sub('q'), settings: { interval: 1, from: '00:00', to: '23:59' } }), 200);
for (let i = 0; i < 10; i++) await runCron(env, t + i * 120000, async () => 500);
await runCron(env, t + 20 * 120000, async () => 500);
assert.equal(sq.prepare('SELECT COUNT(*) n FROM subs').get().n, 0); console.log('PASS repeated failures remove subscription');
await ck(await post('/subscribe', { subscription: sub('r'), settings: { interval: 0 } }), 200);
await runCron(env, Date.now() + 31 * 864e5, async () => 201);
assert.equal(sq.prepare('SELECT COUNT(*) n FROM subs').get().n, 0); console.log('PASS 30 days without a successful push removes subscription');
const s3 = await ck(await post('/subscribe', { subscription: sub('u') }), 200);
const d = await ck(await post('/unsubscribe', { id: s3.id, token: s3.token }), 200); assert.equal(d.deleted, true);
assert.equal(sq.prepare('SELECT COUNT(*) n FROM subs').get().n, 0); console.log('PASS unsubscribe with secret deletes the row');
// no logging
const src = fs.readFileSync(new URL('../src/index.js', import.meta.url), 'utf8') + fs.readFileSync(new URL('../src/webpush.js', import.meta.url), 'utf8');
assert(!/console\./.test(src)); console.log('PASS no console logging in worker code');
