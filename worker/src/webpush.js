// Web Push (RFC 8291 aes128gcm + RFC 8292 VAPID) using only WebCrypto.
const enc = new TextEncoder();
export const b64u = {
  enc: (b) => { b = new Uint8Array(b); let s = ''; for (const c of b) s += String.fromCharCode(c); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); },
  dec: (s) => { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; const r = atob(s); const o = new Uint8Array(r.length); for (let i = 0; i < r.length; i++) o[i] = r.charCodeAt(i); return o; },
};
const cat = (...a) => { const n = a.reduce((t, x) => t + x.length, 0); const o = new Uint8Array(n); let p = 0; for (const x of a) { o.set(x, p); p += x.length; } return o; };
async function hkdf(salt, ikm, info, len) {
  const k = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info }, k, len * 8));
}
function jwkFromRaw(pub, priv) {
  return { kty: 'EC', crv: 'P-256', x: b64u.enc(pub.slice(1, 33)), y: b64u.enc(pub.slice(33, 65)), ...(priv ? { d: b64u.enc(priv) } : {}), ext: true };
}
// opts.asKey / opts.salt are only for test vectors.
export async function encryptPayload(plaintext, uaPublicB64, authB64, opts = {}) {
  const uaPub = b64u.dec(uaPublicB64), auth = b64u.dec(authB64);
  if (uaPub.length !== 65 || uaPub[0] !== 4) throw new Error('bad ua public key');
  const uaKey = await crypto.subtle.importKey('jwk', jwkFromRaw(uaPub), { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  let asPriv, asPubRaw;
  if (opts.asKey) { asPriv = await crypto.subtle.importKey('jwk', jwkFromRaw(b64u.dec(opts.asKey.pub), b64u.dec(opts.asKey.priv)), { name: 'ECDH', namedCurve: 'P-256' }, false, ['deriveBits']); asPubRaw = b64u.dec(opts.asKey.pub); }
  else { const kp = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']); asPriv = kp.privateKey; asPubRaw = new Uint8Array(await crypto.subtle.exportKey('raw', kp.publicKey)); }
  const ecdh = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: uaKey }, asPriv, 256));
  const salt = opts.salt ? b64u.dec(opts.salt) : crypto.getRandomValues(new Uint8Array(16));
  const ikm = await hkdf(auth, ecdh, cat(enc.encode('WebPush: info\0'), uaPub, asPubRaw), 32);
  const cek = await hkdf(salt, ikm, enc.encode('Content-Encoding: aes128gcm\0'), 16);
  const nonce = await hkdf(salt, ikm, enc.encode('Content-Encoding: nonce\0'), 12);
  const data = cat(typeof plaintext === 'string' ? enc.encode(plaintext) : plaintext, new Uint8Array([2]));
  const key = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt']);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, key, data));
  const rs = new Uint8Array([0, 0, 16, 0]);
  return cat(salt, rs, new Uint8Array([asPubRaw.length]), asPubRaw, ct);
}
export async function vapidHeaders(endpoint, subject, pubB64, privB64, now = Date.now()) {
  const aud = new URL(endpoint).origin;
  const h = b64u.enc(enc.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const p = b64u.enc(enc.encode(JSON.stringify({ aud, exp: Math.floor(now / 1000) + 12 * 3600, sub: subject })));
  const key = await crypto.subtle.importKey('jwk', jwkFromRaw(b64u.dec(pubB64), b64u.dec(privB64)), { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, enc.encode(h + '.' + p)));
  return { Authorization: `vapid t=${h}.${p}.${b64u.enc(sig)}, k=${pubB64}` };
}
export async function sendPush(sub, payload, env, fetchFn = fetch) {
  const body = await encryptPayload(JSON.stringify(payload), sub.p256dh, sub.auth);
  const v = await vapidHeaders(sub.endpoint, env.VAPID_SUBJECT, env.VAPID_PUBLIC, env.VAPID_PRIVATE);
  const r = await fetchFn(sub.endpoint, { method: 'POST', headers: { ...v, 'Content-Encoding': 'aes128gcm', 'Content-Type': 'application/octet-stream', TTL: '3600', Urgency: 'normal' }, body });
  return r.status; // 201 ok; 404/410 = subscription gone
}
