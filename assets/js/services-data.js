export const services = [
    {
        id: "education",
        visible: true,
        templateId: "corporate",
        icon: "ph-bold ph-books",
        image: null,
        video: null,
        content: {
            en: {
                title: "Quality Education",
                shortDesc: "Comprehensive Islamic and academic guidance following the latest standards.",
                fullDesc: "At MIFTHAHUL HUDA MADRASA, we believe that education is the foundation of a purposeful life. Our curriculum is carefully balanced to provide deep religious understanding alongside modern academic competitiveness.",
                features: ["Expert Faculty", "Modern Curriculum", "Islamic & Academic Balance", "Exam-oriented Coaching"]
            },
            ml: {
                title: "ഗുണനിലവാരമുള്ള വിദ്യാഭ്യാസം",
                shortDesc: "ഏറ്റവും പുതിയ മാനദണ്ഡങ്ങൾ പാലിക്കുന്ന സമഗ്രമായ ഇസ്ലാമികവും അക്കാദമികവുമായ മാർഗ്ഗനിർദ്ദേശം.",
                fullDesc: "മിഫ്താഹുൽ ഹുദ മദ്റസയിൽ, വിദ്യാഭ്യാസം അർത്ഥവത്തായ ജീവിതത്തിന്റെ അടിത്തറയാണെന്ന് ഞങ്ങൾ വിശ്വസിക്കുന്നു. ആധുനിക അക്കാദമിക് മത്സരശേഷിയോടൊപ്പം ആഴത്തിലുള്ള മതപരമായ ധാരണ നൽകുന്നതിനായി ഞങ്ങളുടെ പാഠ്യപദ്ധതി ശ്രദ്ധാപൂർവ്വം സന്തുലിതമാക്കിയിരിക്കുന്നു.",
                features: ["വിദഗ്ദ്ധരായ അധ്യാപകർ", "ആധുനിക പാഠ്യപദ്ധതി", "ഇസ്ലാമിക & അക്കാദമിക് ബാലൻസ്", "പരീക്ഷാധിഷ്ഠിത പരിശീലനം"]
            },
            ar: {
                title: "تعليم ذو جودة",
                shortDesc: "توجيه إسلامي وأكاديمي شامل يتبع أحدث المعايير.",
                fullDesc: "في مدرسة مفتاح الهدى، نؤمن بأن التعليم هو أساس الحياة الهادفة. تم توازن منهجنا بعناية لتوفير فهم ديني عميق إلى جانب التنافسية الأكاديمية الحديثة.",
                features: ["هيئـة تدريس خبيرة", "منهج حديث", "توازن إسلامي وأكاديمي", "تدريب موجه للامتحانات"]
            }
        },
        dateCreated: new Date().toISOString()
    },
    {
        id: "mentoring",
        visible: true,
        templateId: "creative",
        icon: "ph-bold ph-users-three",
        image: null,
        video: null,
        content: {
            en: {
                title: "Personal Mentoring",
                shortDesc: "One-on-one sessions for students needing extra help in specific subjects.",
                fullDesc: "Every student learns differently. Our mentoring program ensures that no child is left behind, providing personalized care and attention to help each individual reach their maximum potential.",
                features: ["One-on-one Mentoring", "Weak Student Support", "Progress Tracking", "Parent Communication"]
            },
            ml: {
                title: "വ്യക്തിഗത ഉപദേശം",
                shortDesc: "നിശ്ചിത വിഷയങ്ങളിൽ കൂടുതൽ സഹായം ആവശ്യമുള്ള വിദ്യാർത്ഥികൾക്കായി ഓരോരുത്തർക്കും പ്രത്യേക സെഷനുകൾ.",
                fullDesc: "ഓരോ വിദ്യാർത്ഥിയും വ്യത്യസ്തമായാണ് പഠിക്കുന്നത്. ഓരോ വ്യക്തിയെയും അവരുടെ പരമാവധി കഴിവിൽ എത്തിക്കാൻ വ്യക്തിഗത പരിചരണവും ശ്രദ്ധയും നൽകിക്കൊണ്ട് ഒരു കുട്ടിയും പിന്നിലാകില്ലെന്ന് ഞങ്ങളുടെ മെന്ററിംഗ് പ്രോഗ്രാം ഉറപ്പാക്കുന്നു.",
                features: ["വ്യക്തിഗത മെന്ററിംഗ്", "ദുർബലരായ വിദ്യാർത്ഥികൾക്കുള്ള പിന്തുണ", "പുരോഗതി ട്രാക്കിംഗ്", "രക്ഷാകർതൃ ആശയവിനിമയം"]
            },
            ar: {
                title: "التوجيه الشخصي",
                shortDesc: "جلسات فردية للطلاب الذين يحتاجون إلى مساعدة إضافية في مواد معينة.",
                fullDesc: "كل طالب يتعلم بشكل مختلف. يضمن برنامج التوجيه لدينا عدم تخلف أي طفل عن الركب، حيث يوفر عناية واهتماماً شخصياً لمساعدة كل فرد على الوصول إلى أقصى إمكاناته.",
                features: ["توجيه فردي", "دعم الطلاب الضعاف", "تتبع التقدم", "التواصـل مع أولياء الأمور"]
            }
        },
        dateCreated: new Date().toISOString()
    },
    {
        id: "success",
        visible: true,
        templateId: "minimal",
        icon: "ph-bold ph-certificate",
        image: null,
        video: null,
        content: {
            en: {
                title: "Success Records",
                shortDesc: "Proven track record of students achieving top scores in examinations.",
                fullDesc: "Our results speak for themselves. With a consistent track record of high achievement in board examinations and competitions, our students emerge as leaders in their communities.",
                features: ["High Exam Results", "Consistent Performance", "Student Achievements", "Verified Records"]
            },
            ml: {
                title: "വിജയ റെക്കോർഡുകൾ",
                shortDesc: "പരീക്ഷകളിൽ ഉയർന്ന സ്കോർ നേടിയ വിദ്യാർത്ഥികളുടെ തെളിയിക്കപ്പെട്ട റെക്കോർഡ്.",
                fullDesc: "ഞങ്ങളുടെ ഫലങ്ങൾ തനിയെ സംസാരിക്കുന്നു. ബോർഡ് പരീക്ഷകളിലും മത്സരങ്ങളിലും ഉയർന്ന നേട്ടങ്ങളുടെ സ്ഥിരമായ ട്രാക്ക് റെക്കോർഡിനൊപ്പം, ഞങ്ങളുടെ വിദ്യാർത്ഥികൾ അവരുടെ കമ്മ്യൂണിറ്റികളിൽ നേതാക്കളായി ഉയർന്നുവരുന്നു.",
                features: ["ഉയർന്ന പരീക്ഷാ ഫലങ്ങൾ", "സ്ഥിരമായ പ്രകടനം", "വിദ്യാർത്ഥി നേട്ടങ്ങൾ", "പരിശോധിച്ച രേഖകൾ"]
            },
            ar: {
                title: "سجلات النجاح",
                shortDesc: "سجل حافل من الطلاب الذين حققوا أعلى الدرجات في الامتحانات.",
                fullDesc: "نتائجنا تتحدث عن نفسها. مع سجل حافل من الإنجازات العالية في امتحانات المجلس والمسابقات، يبرز طلابنا كقادة في مجتمعاتهم.",
                features: ["نتائج امتحانات عالية", "أداء ثابت", "إنجازات الطلاب", "سجلات موثقة"]
            }
        },
        dateCreated: new Date().toISOString()
    }
];

// Data format:
// { id, visible, templateId, icon, image, video, content: { en, ml, ar }, dateCreated }
// content: { title, shortDesc, fullDesc, features: [] }

