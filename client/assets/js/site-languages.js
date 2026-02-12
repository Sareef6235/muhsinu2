/**
 * Global Multi-Language System
 * Features: Auto-injection, Instant Translation, Persistence, RTL Support
 */

const LanguageSystem = {
    // 1. Central Dictionary (Expand this as needed)
    dictionary: {
        en: {
            // Common
            home: "Home",
            services: "Services",
            gallery: "Gallery",
            about: "About Us",
            contact: "Contact",
            booking: "Book Tuition",
            // Sections (Examples based on site-footer.js)
            quick_links: "Quick Links",
            student_zone: "Student Zone",
            fee_payment: "Fee Payment",
            exam_results: "Exam Results",
            achievements: "Achievements",
            poster_builder: "Poster Builder",
            copyright: "All rights reserved.",
            // Home Page
            welcome_to: "Welcome to",
            mhmv_title: "MIFTHAHUL HUDA MADRASA",
            address_vengara: "Vengara S S Road",
            hero_cta_text: "A simple reminder that consistent effort and dedication in learning today pave the way for achievement and success in the future.",
            btn_receipt: "Receipt",
            btn_gallery: "View Gallery",
            btn_contact: "Contact Us",
            results_title: "Student Results",
            results_desc: "Verify student performance directly from our official examination database. Enter your Register Number below to view immediate results and standings.",
            programs_title: "Educational Programs",
            programs_desc: "Our Madrasa offers a range of structured educational programs designed to develop both religious and academic knowledge.",
            // Nav Specific
            photo_gallery: "Photo Gallery",
            video_gallery: "Video Gallery",
            posters_pro: "Posters & Achievements PRO",
            announcements: "Event Announcements",
            results: "Winners & Results",
            notices: "Notices & Circulars",
            receipts: "Approved Receipts",
            creations: "Creations",
            results_menu: "Results",
            results_new: "Exam Result (New)",
            results_old: "Exam Result (Old)",
            latest_updates: "Latest Updates",
            all_news: "All News",
            login: "Login",
            dashboard: "Dashboard",
            portal: "Portal",
            whatsapp_aria: "Contact us on WhatsApp",
            book_tuition_aria: "Book Tuition",
            news_no_updates: "No updates at the moment.",
            read_more: "Read Full Article",
            our_services: "Our Services",
            services_hero_text: "What We Offer at MIFTHAHUL HUDA MADRASA",
            ready_to_join: "Ready to Join Us?",
            enroll_now_desc: "Experience the best in value-based education. Book a consultation or tuition session today.",
            enroll_now_btn: "Enroll Now",
            about_us: "About Us",
            about_welcome: "Welcome to MIFTHAHUL HUDA MADRASA, where we believe in nurturing minds and inspiring futures. Located at Vengara S S Road, our institution is dedicated to empowering students through quality education and Islamic values.",
            vision_title: "Our Vision",
            vision_desc: "To be a beacon of excellence in education, fostering innovation, critical thinking, and character development. We envision a future where our students become global citizens who make meaningful contributions to society.",
            mission_title: "Our Mission",
            mission_desc: "We are committed to providing world-class education that combines academic rigor with holistic development. Our mission is to create an inclusive, supportive environment where every student can thrive intellectually, emotionally, and socially."
        },
        ml: {
            home: "ഹോം",
            services: "സേവനങ്ങൾ",
            gallery: "ഗാലറി",
            about: "ഞങ്ങളെക്കുറിച്ച്",
            contact: "ബന്ധപ്പെടുക",
            booking: "ട്യൂഷൻ ബുക്കിംഗ്",
            quick_links: "ദ്രുത ലിങ്കുകൾ",
            student_zone: "സ്റ്റുഡന്റ് സോൺ",
            fee_payment: "ഫീസ് പേയ്‌മെന്റ്",
            exam_results: "പരീക്ഷാ ഫലങ്ങൾ",
            achievements: "നേട്ടങ്ങൾ",
            poster_builder: "പോസ്റ്റർ ബിൽഡർ",
            copyright: "എല്ലാ അവകാശങ്ങളും നിക്ഷിപ്തം.",
            welcome_to: "സ്വാഗതം",
            mhmv_title: "മിഫ്താഹുൽ ഹുദ മദ്റസ",
            address_vengara: "വേങ്ങര എസ് എസ് റോഡ്",
            hero_cta_text: "ഇന്നത്തെ പഠനത്തിലെ സ്ഥിരമായ പരിശ്രമവും അർപ്പണബോധവും ഭാവിയിലെ നേട്ടങ്ങൾക്കും വിജയത്തിനും വഴിയൊരുക്കുന്നു.",
            btn_receipt: "രസീത്",
            btn_gallery: "ഗാലറി കാണുക",
            btn_contact: "ഞങ്ങളെ ബന്ധപ്പെടുക",
            results_title: "വിദ്യാർത്ഥി ഫലങ്ങൾ",
            results_desc: "ഞങ്ങളുടെ ഔദ്യോഗിക പരീക്ഷാ ഡാറ്റാബേസിൽ നിന്ന് വിദ്യാർത്ഥികളുടെ പ്രകടനം നേരിട്ട് പരിശോധിക്കുക. ഉടനടി ഫലങ്ങൾ കാണുന്നതിന് താഴെ നിങ്ങളുടെ രജിസ്റ്റർ നമ്പർ നൽകുക.",
            programs_title: "വിദ്യാഭ്യാസ പരിപാടികൾ",
            programs_desc: "മതപരവും അക്കാദമിക് അറിവും വികസിപ്പിക്കുന്നതിനായി രൂപകൽപ്പന ചെയ്ത ഘടനാപരമായ വിദ്യാഭ്യാസ പരിപാടികൾ ഞങ്ങളുടെ മദ്റസ വാഗ്ദാനം ചെയ്യുന്നു.",
            photo_gallery: "ഫോട്ടോ ഗാലറി",
            video_gallery: "വീഡിയോ ഗാലറി",
            posters_pro: "പോസ്റ്ററുകളും നേട്ടങ്ങളും",
            announcements: "ഇവന്റ് അറിയിപ്പുകൾ",
            results: "വിജയികളും ഫലങ്ങളും",
            notices: "അറിയിപ്പുകളും സർക്കുലറുകളും",
            receipts: "അംഗീകരിച്ച രസീതുകൾ",
            creations: "സൃഷ്ടികൾ",
            results_menu: "ഫലങ്ങൾ",
            results_new: "പരീക്ഷാ ഫലം (പുതിയത്)",
            results_old: "പരീക്ഷാ ഫലം (പഴയത്)",
            latest_updates: "പുതിയ അപ്‌ഡേറ്റുകൾ",
            all_news: "എല്ലാ വാർത്തകളും",
            login: "ലോഗിൻ",
            dashboard: "ഡാഷ്‌ബോർഡ്",
            portal: "പോർട്ടൽ",
            whatsapp_aria: "വാട്ട്‌സ്ആപ്പിൽ ഞങ്ങളെ ബന്ധപ്പെടുക",
            book_tuition_aria: "ട്യൂഷൻ ബുക്ക് ചെയ്യുക",
            news_no_updates: "നിലവിൽ വാർത്തകളൊന്നുമില്ല.",
            read_more: "കൂടുതൽ വായിക്കുക",
            our_services: "ഞങ്ങളുടെ സേവനങ്ങൾ",
            services_hero_text: "മിഫ്താഹുൽ ഹുദ മദ്റസയിൽ ഞങ്ങൾ വാഗ്ദാനം ചെയ്യുന്നത്",
            ready_to_join: "ഞങ്ങളോടൊപ്പം ചേരാൻ തയ്യാറാണോ?",
            enroll_now_desc: "മൂല്യാധിഷ്ഠിത വിദ്യാഭ്യാസത്തിലെ ഏറ്റവും മികച്ചത് അനുഭവിക്കുക. ഇന്ന് തന്നെ ഒരു കൺസൾട്ടേഷൻ അല്ലെങ്കിൽ ട്യൂഷൻ സെഷൻ ബുക്ക് ചെയ്യുക.",
            enroll_now_btn: "ഇപ്പോൾ എൻറോൾ ചെയ്യുക",
            about_us: "ഞങ്ങളെക്കുറിച്ച്",
            about_welcome: "മിഫ്താഹുൽ ഹുദ മദ്റസയിലേക്ക് സ്വാഗതം, അവിടെ ഞങ്ങൾ മനസ്സുകളെ വളർത്തുന്നതിലും ഭാവി പ്രചോദനം നൽകുന്നതിലും വിശ്വസിക്കുന്നു. വേങ്ങര എസ് എസ് റോഡിൽ സ്ഥിതി ചെയ്യുന്ന ഞങ്ങളുടെ സ്ഥാപനം ഗുണനിലവാരമുള്ള വിദ്യാഭ്യാസത്തിലൂടെയും ഇസ്ലാമിക മൂല്യങ്ങളിലൂടെയും വിദ്യാർത്ഥികളെ ശാക്തീകരിക്കുന്നതിനായി സമർപ്പിച്ചിരിക്കുന്നു.",
            vision_title: "ഞങ്ങളുടെ കാഴ്ചപ്പാട്",
            vision_desc: "വിദ്യാഭ്യാസത്തിൽ മികവിന്റെ വിളക്കുമാടമാകുക, നൂതനത്വം, വിമർശനാത്മക ചിന്ത, സ്വഭാവ വികസനം എന്നിവ പ്രോത്സാഹിപ്പിക്കുക. ഞങ്ങളുടെ വിദ്യാർത്ഥികൾ സമൂഹത്തിന് അർത്ഥവത്തായ സംഭാവനകൾ നൽകുന്ന ആഗോള പൗരന്മാരായി മാറുന്ന ഒരു ഭാവി ഞങ്ങൾ വിഭാവനം ചെയ്യുന്നു.",
            mission_title: "ഞങ്ങളുടെ ദൗത്യം",
            mission_desc: "അക്കാദമിക് കാർക്കശ്യവും സമഗ്രമായ വികസനവും സമന്വയിപ്പിക്കുന്ന ലോകോത്തര വിദ്യാഭ്യാസം നൽകാൻ ഞങ്ങൾ പ്രതിജ്ഞാബദ്ധരാണ്. എല്ലാ വിദ്യാർത്ഥികൾക്കും ബൗദ്ധികമായും വൈകാരികമായും സാമൂഹികമായും അഭിവൃദ്ധി പ്രാപിക്കാൻ കഴിയുന്ന ഉൾക്കൊള്ളുന്നതും പിന്തുണ നൽകുന്നതുമായ അന്തരീക്ഷം സൃഷ്ടിക്കുക എന്നതാണ് ഞങ്ങളുടെ ദൗത്യം."
        },
        ar: {
            home: "الرئيسية",
            services: "الخدمات",
            gallery: "المعرض",
            about: "عن المدرسة",
            contact: "اتصل بنا",
            booking: "حجز الدروس",
            quick_links: "روابط سريعة",
            student_zone: "منطقة الطلاب",
            fee_payment: "دفع الرسوم",
            exam_results: "نتائج الامتحانات",
            achievements: "الإنجازات",
            poster_builder: "مصمم البوسترات",
            copyright: "جميع الحقوق محفوظة.",
            welcome_to: "مرحباً بكم في",
            mhmv_title: "مدرسة مفتاح الهدى",
            address_vengara: "فينجارا، طريق إس إس",
            hero_cta_text: "تذكر دائماً أن الجهد المستمر والتفاني في التعلم اليوم يمهد الطريق للإنجاز والنجاح في المستقبل.",
            btn_receipt: "إيصال",
            btn_gallery: "عرض المعرض",
            btn_contact: "اتصل بنا",
            results_title: "نتائج الطلاب",
            results_desc: "تحقق من أداء الطلاب مباشرة من قاعدة بيانات الامتحانات الرسمية الخاصة بنا. أدخل رقم التسجيل الخاص بك أدناه لعرض النتائج الفورية.",
            programs_title: "البرامج التعليمية",
            programs_desc: "تقدم مدرسة مدراسا مجموعة من البرامج التعليمية المنظمة المصممة لتطوير المعرفة الدينية والأكاديمية على حد سواء.",
            photo_gallery: "معرض الصور",
            video_gallery: "معرض الفيديو",
            posters_pro: "البوسترات والإنجازات",
            announcements: "إعلانات الفعاليات",
            results: "الفائزون والنتائج",
            notices: "الإشعارات والتعميمات",
            receipts: "الإيصالات المعتمدة",
            creations: "الإبداعات",
            results_menu: "النتائج",
            results_new: "نتيجة الاختبار (جديد)",
            results_old: "نتيجة الاختبار (قديم)",
            latest_updates: "آخر التحديثات",
            all_news: "كل الأخبار",
            login: "تسجيل الدخول",
            dashboard: "لوحة التحكم",
            portal: "البوابة",
            whatsapp_aria: "اتصل بنا عبر الواتساب",
            book_tuition_aria: "حجز الدروس",
            news_no_updates: "لا توجد تحديثات في الوقت الحالي.",
            read_more: "قراءة المزيد",
            our_services: "خدماتنا",
            services_hero_text: "ما نقدمه في مدرسة مفتاح الهدى",
            ready_to_join: "هل أنت مستعد للانضمام إلينا؟",
            enroll_now_desc: "جرب الأفضل في التعليم القائم على القيم. احجز استشارة أو جلسة دروس اليوم.",
            enroll_now_btn: "سجل الآن",
            about_us: "نبذة عنا",
            about_welcome: "مرحباً بكم في مدرسة مفتاح الهدى، حيث نؤمن بتنمية العقول وإلهام المستقبل. تقع مؤسستنا في طريق فينجارا إس إس، وهي مكرسة لتمكين الطلاب من خلال التعليم الجيد والقيم الإسلامية.",
            vision_title: "رؤيتنا",
            vision_desc: "أن نكون مناراً للتميز في التعليم، ونعزز الابتكار والتفكير النقدي وتطوير الشخصية. نتصور مستقبلاً يصبح فيه طلابنا مواطنين عالميين يقدمون مساهمات ذات معنى للمجتمع.",
            mission_title: "مهمتنا",
            mission_desc: "نحن ملتزمون بتوفير تعليم عالمي المستوى يجمع بين الصرامة الأكاديمية والتنمية الشاملة. مهمتنا هي خلق بيئة شاملة وداعمة حيث يمكن لكل طالب أن يزدهر فكرياً وعاطفياً واجتماعياً."
        }
    },

    state: {
        lang: localStorage.getItem('site-lang') || document.documentElement.lang || 'en'
    },

    init() {
        const initLang = () => {
            // 1. Load saved language and set initial state
            const saved = localStorage.getItem('site-lang') || document.documentElement.lang || 'en';
            this.state.lang = saved;
            document.documentElement.lang = saved;

            // 2. Apply RTL settings
            this.updateRTL();

            // 3. Initial Translation and Switcher Injection
            this.applyTranslations();
            this.injectSwitchers();

            // 4. Watch for DOM changes to apply translations to new elements
            this.observeDOM();
        };

        if (window.Perf) {
            // Slight delay to allow main content to settle
            window.Perf.runIdle(initLang, 100);
        } else {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initLang);
            } else {
                initLang();
            }
        }
    },

    // Inject Switcher into sections
    injectSwitchers() {
        const targets = [
            'header#main-header .container',
            'footer#main-footer .container',
            'section'
        ];

        targets.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                if (el.querySelector('.site-lang-switcher')) return;

                const switcher = this.createSwitcherHTML(el.tagName.toLowerCase());
                if (el.tagName.toLowerCase() === 'header') {
                    // For header, append after nav links or logo
                    const nav = el.querySelector('.nav-links') || el.querySelector('.logo');
                    if (nav) nav.insertAdjacentElement('afterend', switcher);
                    else el.appendChild(switcher);
                } else {
                    el.style.position = 'relative'; // Ensure absolute positioning works for sections
                    el.appendChild(switcher);
                }
            });
        });
    },

    createSwitcherHTML(context) {
        const div = document.createElement('div');
        div.className = `site-lang-switcher in-${context}`;
        div.innerHTML = `
            <div class="lang-btn ${this.state.lang === 'en' ? 'active' : ''}" data-lang="en">EN</div>
            <div class="lang-btn ${this.state.lang === 'ml' ? 'active' : ''}" data-lang="ml">ML</div>
            <div class="lang-btn ${this.state.lang === 'ar' ? 'active' : ''}" data-lang="ar">AR</div>
        `;

        div.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchLanguage(e.target.dataset.lang);
            });
        });

        return div;
    },

    switchLanguage(lang) {
        if (lang === this.state.lang) return;

        // Apply visual feedback
        document.body.classList.add('lang-switching');

        setTimeout(() => {
            this.state.lang = lang;
            localStorage.setItem('site-lang', lang);
            document.documentElement.lang = lang;

            this.updateRTL();
            this.applyTranslations();
            this.updateSwitcherUI();

            document.body.classList.remove('lang-switching');

            // Dispatch event for other specific components
            window.dispatchEvent(new CustomEvent('siteLangChange', { detail: { lang } }));
        }, 300);
    },

    updateRTL() {
        const isRTL = this.state.lang === 'ar';
        document.body.dir = isRTL ? 'rtl' : 'ltr';
        document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    },

    applyTranslations() {
        const t = this.dictionary[this.state.lang] || this.dictionary.en;

        // Update all elements with data-t attribute
        document.querySelectorAll('[data-t]').forEach(el => {
            const key = el.dataset.t;
            if (t[key]) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = t[key];
                } else if (el.hasAttribute('aria-label') || key.includes('aria')) {
                    el.setAttribute('aria-label', t[key]);
                } else {
                    el.innerText = t[key];
                }
            }
        });
    },

    updateSwitcherUI() {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === this.state.lang);
        });
    },

    observeDOM() {
        if (!window.Perf || !window.Perf.debounce) return;

        // Debounce the observer to handle many changes at once and avoid recursion
        const debouncedTask = window.Perf.debounce(() => {
            // Temporarily disconnect to avoid loop during our own modifications
            this.stopObserver();
            this.injectSwitchers();
            this.applyTranslations();
            this.startObserver();
        }, 100);

        this.observer = new MutationObserver((mutations) => {
            let shouldUpdate = false;
            for (const mutation of mutations) {
                if (mutation.addedNodes.length) {
                    // Only update if the added nodes aren't our own switchers
                    const hasExternalNodes = Array.from(mutation.addedNodes).some(node =>
                        node.nodeType === 1 && !node.classList.contains('site-lang-switcher')
                    );
                    if (hasExternalNodes) {
                        shouldUpdate = true;
                        break;
                    }
                }
            }
            if (shouldUpdate) debouncedTask();
        });

        this.startObserver();
    },

    startObserver() {
        if (this.observer) {
            this.observer.observe(document.body, { childList: true, subtree: true });
        }
    },

    stopObserver() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
};

// Auto-init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => LanguageSystem.init());
} else {
    LanguageSystem.init();
}
