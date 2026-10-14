export const coins = (n) => Number(n ?? 0).toLocaleString('en-US');

export function money(minor, currency = 'EUR') {
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency }).format((minor ?? 0) / 100);
}

export function date(iso, opts = { day: 'numeric', month: 'short', year: 'numeric' }) {
  if (!iso) return '';
  return new Intl.DateTimeFormat('en-GB', opts).format(new Date(iso));
}

export function dateTime(iso) {
  return date(iso, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function duration(seconds) {
  const s = Math.max(0, Math.round(seconds));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60 ? `${s % 60}s` : ''}`.trim();
  const h = Math.floor(m / 60);
  if (h < 48) return `${h}h ${m % 60 ? `${m % 60}m` : ''}`.trim();
  return `${Math.floor(h / 24)}d ${h % 24}h`;
}
