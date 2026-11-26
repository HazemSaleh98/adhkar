// Pure scheduling logic: is a subscription due at `nowMs`?
export function localParts(nowMs, tz) {
  const f = new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour12: false, hour: '2-digit', minute: '2-digit', year: 'numeric', month: '2-digit', day: '2-digit' });
  const o = {}; for (const p of f.formatToParts(new Date(nowMs))) o[p.type] = p.value;
  return { day: `${o.year}-${o.month}-${o.day}`, min: (+o.hour % 24) * 60 + +o.minute };
}
const toMin = (s) => { const [h, m] = String(s).split(':').map(Number); return h * 60 + (m || 0); };
// s: {tz, interval (min, >=1), from:'HH:MM', to:'HH:MM', fixed:['HH:MM',...], last_sent_ms}
export function isDue(s, nowMs) {
  const { day, min } = localParts(nowMs, s.tz || 'Africa/Cairo');
  const fixed = (s.fixed || []).map(toMin);
  if (fixed.includes(min)) return { due: true, kind: 'fixed' };
  if (s.interval > 0) {
    const a = toMin(s.from || '00:00'), b = toMin(s.to || '23:59');
    const inWin = a <= b ? min >= a && min <= b : min >= a || min <= b;
    if (inWin && (!s.last_sent_ms || nowMs - s.last_sent_ms >= (s.interval * 60000 - 20000))) return { due: true, kind: 'interval' };
  }
  return { due: false };
}
