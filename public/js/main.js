// 动态注入 Umami 统计脚本
(function() {
  if (typeof window !== 'undefined' && !document.querySelector('script[data-website-id="b4343cba-7a8b-4868-aabe-0b2d526c2bc7"]')) {
    var script = document.createElement('script');
    script.defer = true;
    script.src = 'https://cloud.umami.is/script.js';
    script.setAttribute('data-website-id', 'b4343cba-7a8b-4868-aabe-0b2d526c2bc7');
    document.head.appendChild(script);
  }
})();
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    const Home = window.IoriHome = window.IoriHome || {};

    Home.initCommonUi?.();

    if (typeof Home.createCardController === 'function') {
      Home.cardController = Home.createCardController();
      Home.cardController.init();
    }

    Home.initSubmission?.();
    Home.initSearch?.();
    Home.initCategoryNavigation?.();

    requestAnimationFrame(() => {
      document.body.classList.add('app-ready');
    });
  });
})();
