// public/js/i18n.js
// 客户端 i18n 运行时：读 cookie lang，data-i18n 标记的 DOM 元素自动换语言
// 必须在 home-ui.js / home-cards.js / home-search.js 之前加载
(function () {
  'use strict';

  const STRINGS = {
    'zh-CN': {
      'site.name': '皮皮鲁工具大全',
      'site.subtitle': '一个多功能网络工具平台 不断更新中',
      'home.search.placeholder': '搜索书签...',
      'home.search.engine.local': '站内',
      'home.search.engine.google': 'Google',
      'home.search.engine.baidu': 'Baidu',
      'home.search.engine.github': 'Github',
      'home.category.all': '全部',
      'home.bookmark.no_desc': '暂无描述',
      'home.bookmark.copy': '复制',
      'home.bookmark.copied': '已复制!',
      'home.empty.title': '暂无书签',
      'home.empty.subtitle': '该分类下还没有添加任何书签。',
      'home.section.all_count': '全部收藏 · {count} 个书签',
      'home.section.category_count': '{category} · {count} 个书签',
      'home.add.button': '公开投稿',
      'home.sidebar.category_nav': '分类导航',
      'home.sidebar.all': '全部',
      'feedback.title': '意见反馈',
      'feedback.subtitle': '登录 GitHub 账号后留言，你可以在 GitHub Discussions 中查看所有反馈。',
      'feedback.close': '关闭',
      'modal.add.title': '添加新书签',
      'modal.add.name': '名称',
      'modal.add.url': '网址',
      'modal.add.logo': 'Logo (可选)',
      'modal.add.desc': '描述 (可选)',
      'modal.add.category': '分类',
      'modal.add.cancel': '取消',
      'modal.add.submit': '提交',
      'modal.add.loading': '加载中...',
      'footer.text_default': '曾梦想仗剑走天涯',
      'lang.toggle_to_zh': 'Switch to Chinese',
      'lang.toggle_to_en': '切换语言',
    },
    'en-US': {
      'site.name': 'Pipilu Tools',
      'site.subtitle': 'A multi-functional network tool platform, constantly updated',
      'home.search.placeholder': 'Search bookmarks...',
      'home.search.engine.local': 'Local',
      'home.search.engine.google': 'Google',
      'home.search.engine.baidu': 'Baidu',
      'home.search.engine.github': 'Github',
      'home.category.all': 'All',
      'home.bookmark.no_desc': 'No description',
      'home.bookmark.copy': 'Copy',
      'home.bookmark.copied': 'Copied!',
      'home.empty.title': 'No bookmarks',
      'home.empty.subtitle': 'No bookmarks have been added to this category yet.',
      'home.section.all_count': 'All Bookmarks · {count}',
      'home.section.category_count': '{category} · {count}',
      'home.add.button': 'Submit Site',
      'home.sidebar.category_nav': 'Categories',
      'home.sidebar.all': 'All',
      'feedback.title': 'Feedback',
      'feedback.subtitle': 'Sign in with GitHub to leave feedback. View all in GitHub Discussions.',
      'feedback.close': 'Close',
      'modal.add.title': 'Add New Bookmark',
      'modal.add.name': 'Name',
      'modal.add.url': 'URL',
      'modal.add.logo': 'Logo (Optional)',
      'modal.add.desc': 'Description (Optional)',
      'modal.add.category': 'Category',
      'modal.add.cancel': 'Cancel',
      'modal.add.submit': 'Submit',
      'modal.add.loading': 'Loading...',
      'footer.text_default': '曾梦想仗剑走天涯',
      'lang.toggle_to_zh': 'Switch to Chinese',
      'lang.toggle_to_en': '切换语言',
    },
  };

  function getCookie(name) {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? match[1] : '';
  }

  function getLang() {
    const raw = getCookie('lang');
    return raw === 'en' ? 'en-US' : 'zh-CN';
  }

  function interpolate(text, vars) {
    if (!vars) return text;
    return text.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? String(vars[k]) : `{${k}}`));
  }

  function t(key, vars) {
    const lang = getLang();
    const dict = STRINGS[lang] || STRINGS['zh-CN'];
    const fallback = STRINGS['zh-CN'] || {};
    const raw = (dict && dict[key] !== undefined) ? dict[key] : (fallback[key] !== undefined ? fallback[key] : key);
    return interpolate(raw, vars);
  }

  function applyAll() {
    const lang = getLang();
    const html = document.documentElement;
    html.setAttribute('lang', lang === 'en-US' ? 'en' : 'zh-CN');
    html.setAttribute('data-lang', lang === 'en-US' ? 'en' : 'zh-CN');

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (key) el.textContent = t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key) el.setAttribute('placeholder', t(key));
    });
    document.querySelectorAll('[data-i18n-title]').forEach((el) => {
      const key = el.getAttribute('data-i18n-title');
      if (key) el.setAttribute('title', t(key));
    });
    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      const key = el.getAttribute('data-i18n-aria');
      if (key) el.setAttribute('aria-label', t(key));
    });
    document.querySelectorAll('[data-i18n-html]').forEach((el) => {
      const key = el.getAttribute('data-i18n-html');
      if (key) el.innerHTML = t(key);
    });
  }

  // Expose to other scripts
  window.t = t;
  window.I18N = { t, getLang, STRINGS, applyAll };

  // Apply as soon as possible to avoid flash
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyAll);
  } else {
    applyAll();
  }
})();
