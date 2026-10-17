// functions/i18n/strings.js
// 服务端 i18n 字典 + t() 函数；与 public/js/i18n.js 保持同步

export const STRINGS = {
    'zh-CN': {
        'site.name': '皮皮鲁工具大全',
        'site.subtitle': '一个多功能网络工具平台 不断更新中',
        'site.tagline': '网址导航',
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
        'home.add.button': '公开投稿',
        'home.sidebar.category_nav': '分类导航',
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
    },
    'en-US': {
        'site.name': 'Pipilu Tools',
        'site.subtitle': 'A multi-functional network tool platform, constantly updated',
        'site.tagline': 'Navigation',
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
        'home.add.button': 'Submit Site',
        'home.sidebar.category_nav': 'Categories',
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
    },
};

export function t(key, lang, vars) {
    const dict = STRINGS[lang] || STRINGS['zh-CN'];
    const fallback = STRINGS['zh-CN'] || {};
    let text = (dict && dict[key] !== undefined) ? dict[key] : (fallback[key] !== undefined ? fallback[key] : key);
    if (vars) {
        for (const k of Object.keys(vars)) {
            text = text.replace(new RegExp('\\{' + k + '\\}', 'g'), vars[k]);
        }
    }
    return text;
}
