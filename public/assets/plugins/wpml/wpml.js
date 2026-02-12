/**
 * WPML PLUGIN
 * Multi-language support (Arabic, Malayalam, English)
 */

window.WPML = {
    version: '1.0.0',
    currentLang: 'en',
    translations: {
        'en': { 'welcome': 'Welcome', 'services': 'Services' },
        'ar': { 'welcome': 'أهلاً بك', 'services': 'خدمات' },
        'ml': { 'welcome': 'സ്വാഗതം', 'services': 'സേവനങ്ങൾ' }
    },

    init() {
        console.log('🌐 WPML initialized');
        this.renderSwitcher();
    },

    setLanguage(lang) {
        this.currentLang = lang;
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        console.log('Language switched to:', lang);
        // Here we would create a translation event
        window.location.reload();
    },

    translate(key) {
        return this.translations[this.currentLang][key] || key;
    },

    renderSwitcher() {
        // Mock rendering language switcher
    }
};

export default window.WPML;
