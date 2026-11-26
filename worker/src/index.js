import { sendPush, b64u } from './webpush.js';
import { isDue } from './schedule.js';
// Generic texts only: the server knows nothing about the user.
const PHRASES = ['سبحان الله وبحمده، سبحان الله العظيم', 'أستغفر الله وأتوب إليه', 'لا حول ولا قوة إلا بالله', 'اللهم صلِّ وسلِّم على نبينا محمد', 'سبحان الله', 'الحمد لله', 'لا إله إلا الله', 'الله أكبر'];
const HOSTS = [/^web\.push\.apple\.com$/, /^[a-z0-9.-]+\.push\.apple\.com$/, /^fcm\.googleapis\.com$/, /^updates\.push\.services\.mozilla\.com$/, /^[a-z0-9.-]+\.notify\.windows\.com$/];
const MAX_BODY = 2048;
const enc = new TextEncoder();
const hdr = (env) => ({ 'Access-Control-Allow-Origin': env.ALLOW_ORIGIN, 'Access-Control-Allow-Headers': 'content-type', 'Access-Control-Allow-Methods': 'POST,GET,OPTIONS', Vary: 'Origin', 'Cache-Control': 'no-store' });
const json = (env, o, st = 200) => new Response(JSON.stringify(o), { status: st, headers: { 'content-type': 'application/json', ...hdr(env) } });
const okTime = (s) => typeof s === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
const sha = async (s) => b64u.enc(await crypto.subtle.digest('SHA-256', enc.encode(s)));
const rnd = (n) => b64u.enc(crypto.getRandomValues(new Uint8Array(n)));
const idOk = (s) => typeof s === 'string' && /^[A-Za-z0-9_-]{20,64}$/.test(s);
export function endpointOk(u) {
  try { const x = new URL(u); return x.protocol === 'https:' && !x.username && u.length <= 600 && HOSTS.some((r) => r.test(x.hostname)); } catch { return false; }
}
export function validate(b) {
  const s = b && b.subscription, k = s && s.keys;
  if (!s || typeof s.endpoint !== 'string' || !endpointOk(s.endpoint)) return 'bad endpoint';
  if (!k || typeof k.p256dh !== 'string' || typeof k.auth !== 'string' || !/^[A-Za-z0-9_-]{80,100}$/.test(k.p256dh) || !/^[A-Za-z0-9_-]{16,32}$/.test(k.auth)) return 'bad keys';
  const st = b.settings || {};
  if (st.tz) { try { new Intl.DateTimeFormat('en', { timeZone: st.tz }); } catch { return 'bad tz'; } }
  if (st.interval != null && !(Number.isInteger(st.interval) && st.interval >= 0 && st.interval <= 1440)) return 'bad interval';
  const ft = st.fixed == null ? [] : st.fixed;
  if (!Array.isArray(ft) || ft.length > 12) return 'bad fixed';
  for (const t of [st.from, st.to, ...ft]) if (t != null && !okTime(t)) return 'bad time';
  return null;
}
async function readJson(req) {
  const text = await req.text();
  if (text.length > MAX_BODY) return null;
  try { return JSON.parse(text); } catch { return null; }
}
export async function handle(req, env, now = Date.now()) {
  const u = new URL(req.url);
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: hdr(env) });
  if (u.pathname === '/vapid-public' && req.method === 'GET') return json(env, { key: env.VAPID_PUBLIC });
  if (req.method !== 'POST' || (u.pathname !== '/subscribe' && u.pathname !== '/unsubscribe')) return json(env, { error: 'not found' }, 404);
  // Browsers always send Origin on cross-site POSTs. Anything else is refused.
  if (req.headers.get('Origin') !== env.ALLOW_ORIGIN) return json(env, { error: 'forbidden' }, 403);
  if (!(req.headers.get('content-type') || '').startsWith('application/json')) return json(env, { error: 'bad type' }, 415);
  const b = await readJson(req);
  if (!b || typeof b !== 'object') return json(env, { error: 'bad json' }, 400);
  if (u.pathname === '/unsubscribe') {
    if (!idOk(b.id) || typeof b.token !== 'string' || b.token.length > 100) return json(env, { error: 'bad' }, 400);
    const r = await env.DB.prepare('DELETE FROM subs WHERE id=? AND token_hash=?').bind(b.id, await sha(b.token)).run();
    return json(env, { ok: true, deleted: !!(r && r.meta && r.meta.changes) });
  }
  const err = validate(b); if (err) return json(env, { error: err }, 400);
  const s = b.subscription, st = b.settings || {}, vals = [st.tz || 'Africa/Cairo', st.interval || 0, st.from || null, st.to || null, JSON.stringify(st.fixed || [])];
  if (b.id != null) { // update an existing subscription (needs its secret)
    if (!idOk(b.id) || typeof b.token !== 'string') return json(env, { error: 'bad' }, 400);
    const r = await env.DB.prepare('UPDATE subs SET endpoint=?,p256dh=?,auth=?,tz=?,interval=?,win_from=?,win_to=?,fixed=?,fail=0 WHERE id=? AND token_hash=?')
      .bind(s.endpoint, s.keys.p256dh, s.keys.auth, ...vals, b.id, await sha(b.token)).run();
    if (!(r && r.meta && r.meta.changes)) return json(env, { error: 'unknown subscription' }, 404);
    return json(env, { ok: true });
  }
  const dup = await env.DB.prepare('SELECT id FROM subs WHERE endpoint=?').bind(s.endpoint).first();
  if (dup) return json(env, { error: 'already subscribed' }, 409);
  const cnt = await env.DB.prepare('SELECT COUNT(*) AS n FROM subs').first();
  if (cnt && cnt.n >= (+env.MAX_SUBS || 100)) return json(env, { error: 'full' }, 503);
  const id = rnd(16), token = rnd(32);
  await env.DB.prepare('INSERT INTO subs (id,token_hash,endpoint,p256dh,auth,tz,interval,win_from,win_to,fixed,last_ok_ms,created_ms) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)')
    .bind(id, await sha(token), s.endpoint, s.keys.p256dh, s.keys.auth, ...vals, now, now).run();
  return json(env, { ok: true, id, token });
}
const MAX_FAIL = 10, STALE_MS = 30 * 864e5;
// Free plan allows 10 ms CPU per run (~3 ms per push): cap pushes per run, the rest stay due and go next minute.
const MAX_PER_RUN = 2;
export async function runCron(env, now = Date.now(), send = sendPush) {
  const { results } = await env.DB.prepare('SELECT * FROM subs').all();
  let sent = 0, attempts = 0;
  for (const r of results) {
    if (r.fail >= MAX_FAIL || now - r.last_ok_ms > STALE_MS) { await env.DB.prepare('DELETE FROM subs WHERE id=?').bind(r.id).run(); continue; }
    const s = { tz: r.tz, interval: r.interval, from: r.win_from, to: r.win_to, fixed: JSON.parse(r.fixed || '[]'), last_sent_ms: r.last_sent_ms };
    const d = isDue(s, now); if (!d.due) continue;
    if (attempts >= MAX_PER_RUN) break;
    attempts++;
    let st = 0;
    try { st = await send({ endpoint: r.endpoint, p256dh: r.p256dh, auth: r.auth }, { title: d.kind === 'fixed' ? 'حان موعد أذكارك' : 'اذكر الله', body: PHRASES[Math.floor(now / 60000) % PHRASES.length], tag: 'adhkar-' + d.kind }, env); } catch { st = 0; }
    if (st === 404 || st === 410) await env.DB.prepare('DELETE FROM subs WHERE id=?').bind(r.id).run();
    else if (st >= 200 && st < 300) { sent++; await env.DB.prepare('UPDATE subs SET last_sent_ms=?,last_ok_ms=?,fail=0 WHERE id=?').bind(now, now, r.id).run(); }
    else await env.DB.prepare('UPDATE subs SET fail=fail+1,last_sent_ms=? WHERE id=?').bind(now, r.id).run();
  }
  return sent;
}
export default { fetch: (req, env) => handle(req, env), scheduled: (e, env, ctx) => ctx.waitUntil(runCron(env)) };
