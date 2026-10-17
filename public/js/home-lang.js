(function () {
  'use strict';

  const btn = document.getElementById('langToggleBtn');
  if (!btn) return;

  function getCookie(name) {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? match[1] : '';
  }

  function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; path=/; expires=${expires}; SameSite=Lax`;
  }

  function syncLabel() {
    const current = getCookie('lang') === 'en' ? 'en' : 'zh';
    btn.setAttribute('data-lang', current);
    btn.setAttribute(
      'title',
      current === 'en' ? 'Switch to Chinese' : 'Switch to English'
    );
    const label = btn.querySelector('[data-lang-label]');
    if (label) {
      label.textContent = current === 'en' ? 'EN' : '中';
    }
  }

  btn.addEventListener('click', function () {
    const current = getCookie('lang') === 'en' ? 'en' : 'zh';
    const next = current === 'en' ? 'zh' : 'en';
    setCookie('lang', next, 365);
    // 强制重新加载以触发 SSR 重新渲染
    location.reload();
  });

  syncLabel();
})();
