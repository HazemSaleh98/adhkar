import assert from 'node:assert';
import { encryptPayload, vapidHeaders, b64u } from '../src/webpush.js';
import { isDue } from '../src/schedule.js';
const ua = { pub: 'BCVxsr7N_eNgVRqvHtD0zTZsEc6-VV-JvLexhqUzORcxaOzi6-AYWXvTBHm4bjyPjs7Vd8pZGH6SRpkNtoIAiw4', priv: 'q1dXpw3UpT5VOmu_cf_v6ih07Aems3njxI-JWgLcM94' };
const as = { pub: 'BP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A8', priv: 'yfWPiYE-n46HLnH0KqZOF1fJJU3MYrct3AELtAQ-oRw' };
const pt = 'When I grow up, I want to be a watermelon';
const out = await encryptPayload(pt, ua.pub, 'BTBZMqHH6r4Tts7J_aSIgg', { asKey: as, salt: 'DGv6ra1nlYgDCS1FRnbzlw' });
const expectHeader = 'DGv6ra1nlYgDCS1FRnbzlwAAEABBBP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A8';
const expectCt = '8pfeW0KbunFT06SuDKoJH9Ql87S1QUrdirN6GcG7sFz1y1sqLgVi1VhjVkHsUoEsbI_0LpXMuGvnzQ';
const exp = new Uint8Array([...b64u.dec(expectHeader), ...b64u.dec(expectCt)]);
assert.equal(Buffer.from(out).toString('hex'), Buffer.from(exp).toString('hex'));
console.log('PASS RFC 8291 Appendix A vector: byte-identical ciphertext');
// random-key round trip vs independent decrypt with ua private
const ua2 = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
const raw = new Uint8Array(await crypto.subtle.exportKey('raw', ua2.publicKey));
const auth = crypto.getRandomValues(new Uint8Array(16));
const msg = JSON.stringify({ title: 'يا حازم', body: 'سبحان الله وبحمده' });
const e = await encryptPayload(msg, b64u.enc(raw), b64u.enc(auth));
assert(e.length < 4096);
console.log('PASS random-key encrypt, size', e.length);
// VAPID signature verifies
const kp = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
const jwk = await crypto.subtle.exportKey('jwk', kp.privateKey);
const pubRaw = new Uint8Array(await crypto.subtle.exportKey('raw', kp.publicKey));
const h = await vapidHeaders('https://web.push.apple.com/abc', 'https://example.org', b64u.enc(pubRaw), jwk.d);
const m = /t=([^.]+)\.([^.]+)\.([^,]+), k=(.+)/.exec(h.Authorization);
assert(await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, kp.publicKey, b64u.dec(m[3]), new TextEncoder().encode(m[1] + '.' + m[2])));
const claims = JSON.parse(new TextDecoder().decode(b64u.dec(m[2])));
assert.equal(claims.aud, 'https://web.push.apple.com'); assert.equal(b64u.dec(m[3]).length, 64);
console.log('PASS VAPID ES256 JWT verifies, aud/sub/exp ok, raw 64-byte signature');
// schedule logic (Cairo UTC+2 in Nov)
const t = Date.UTC(2026, 10, 26, 7, 0); // 09:00 Cairo
const s = { tz: 'Africa/Cairo', interval: 30, from: '08:00', to: '22:00', fixed: ['05:30'], last_sent_ms: t - 31 * 60000 };
assert(isDue(s, t).due); assert(!isDue({ ...s, last_sent_ms: t - 10 * 60000 }, t).due);
assert(!isDue(s, Date.UTC(2026, 10, 26, 22, 0)).due); // midnight Cairo, outside window
assert.equal(isDue(s, Date.UTC(2026, 10, 26, 3, 30)).kind, 'fixed');
console.log('PASS schedule: window, interval, fixed time, timezone');
