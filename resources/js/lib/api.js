function xsrfToken() {
  const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : '';
}

/** Small JSON client for the game endpoints (same-origin, CSRF-protected). */
export async function api(url, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(url, {
      method,
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-XSRF-TOKEN': xsrfToken(),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    return { ok: false, status: 0, data: { message: 'Connection lost. Check your internet and try again.' } };
  }

  if (res.status === 401 || res.status === 419) {
    window.location.reload();
    return { ok: false, status: res.status, data: {} };
  }

  let data = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }
  if (!res.ok && !data.message) {
    data.message = res.status === 429 ? 'Whoa, slow down a little!' : 'Something went wrong. Please try again.';
  }
  if (res.status === 422 && data.errors && !data.pet) {
    data.message = Object.values(data.errors)[0]?.[0] ?? data.message;
  }

  return { ok: res.ok, status: res.status, data };
}
