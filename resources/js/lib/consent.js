/*
 * Cookie consent. Strictly necessary cookies (session, XSRF, remember-me and
 * this consent cookie) are always on. "functional" covers game preferences
 * stored in localStorage (eb_prefs). See resources/legal/cookies.md.
 */
const COOKIE = 'eb_cookie_consent';
const PREFS = 'eb_prefs';

export function getConsent() {
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]*)`));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}

export function setConsent({ functional }) {
  const value = encodeURIComponent(JSON.stringify({ necessary: true, functional: !!functional, at: new Date().toISOString() }));
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${COOKIE}=${value}; Max-Age=${60 * 60 * 24 * 365}; Path=/; SameSite=Lax${secure}`;
  if (!functional) {
    try {
      localStorage.removeItem(PREFS);
    } catch {
      /* storage unavailable */
    }
  }
  window.dispatchEvent(new CustomEvent('consent-changed'));
}

export function getPrefs() {
  if (!getConsent()?.functional) return {};
  try {
    return JSON.parse(localStorage.getItem(PREFS) || '{}');
  } catch {
    return {};
  }
}

export function setPref(key, value) {
  if (!getConsent()?.functional) return false;
  try {
    localStorage.setItem(PREFS, JSON.stringify({ ...getPrefs(), [key]: value }));
    return true;
  } catch {
    return false;
  }
}

export function openCookieSettings() {
  window.dispatchEvent(new CustomEvent('open-cookie-settings'));
}
