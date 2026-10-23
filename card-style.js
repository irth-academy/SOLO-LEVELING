// ========================================================
// Solo Leveling System - Interactive Card & Transition Controller
// ========================================================

// تحديد العناصر الأساسية للمودال
const systemModal = document.querySelector('.system-modal:not(.welcome-modal):not(.status-modal)');
const welcomeModal = document.getElementById('welcomeModal');
const statusModal = document.getElementById('statusModal');

const submitBtn = (systemModal ? systemModal.querySelector('.system-btn') : null) || document.querySelector('.input-container .system-btn');
const nameInput = (systemModal ? systemModal.querySelector('.system-input') : null) || document.querySelector('.system-input');
const nameDisplay = document.getElementById('playerNameDisplay');

// عناصر الـ Landing Page
const enterBtn = document.getElementById('enterSystemBtn');
const systemOverlay = document.getElementById('systemOverlay');
const landingPage = document.getElementById('landingPage');

// متغير للتحكم في حالة الانتقال ومنع التكرار
let isTransitioning = false;

// ========================================================
// Single-Page Dynamic Transition: Vertical Slit / Squash Collapse
// ========================================================
function triggerSystemTransition() {
    if (isTransitioning) return;
    isTransitioning = true;

    const landing = document.getElementById('landingPage');
    const overlay = document.getElementById('systemOverlay');
    const modal = document.querySelector('.system-modal:not(.welcome-modal):not(.status-modal)');

    if (!landing) {
        // Fallback في حال عدم وجود حاوية landingPage
        document.body.classList.add('system-mode');
        if (overlay) {
            overlay.classList.remove('hidden');
            overlay.style.display = 'flex';
        }
        if (modal) {
            modal.classList.add('active');
        }
        isTransitioning = false;
        return;
    }

    // 1. تثبيت الهيدر في مكانه المرئي الحالي لمنع أي قفزة أثناء تحويل الحاوية
    const header = landing.querySelector('.system-header');
    if (header) {
        const rect = header.getBoundingClientRect();
        const currentScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
        const currentScrollX = window.scrollX || window.pageXOffset || document.documentElement.scrollLeft;
        header.style.position = 'absolute';
        header.style.top = `${rect.top + currentScrollY}px`;
        header.style.left = `${rect.left + currentScrollX}px`;
        header.style.transform = 'none';
        header.style.width = `${rect.width}px`;
    }

    // 2. حساب المركز الرأسي لشاشة المستخدم للانهيار الرأسي نحو المنتصف
    const currentScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
    const centerY = currentScrollY + (window.innerHeight / 2);

    // ضبط نقطة التحول لتكون في منتصف الشاشة رأسياً (Vertical midline of viewport)
    landing.style.transformOrigin = `50% ${centerY}px`;
    document.body.style.overflow = 'hidden';

    // تشغيل مؤثر الصوت الخاص بالانهيار الرأسي (Dimensional Slit Collapse SFX)
    if (window.SoundEngine) {
        window.SoundEngine.playSlitCollapse();
    }

    // ثوابت التوقيت: 750ms لانكماش الحواف، متبوعة بوقفة صارمة 1.8 ثانية على شاشة سوداء تماماً
    const COLLAPSE_DURATION = 750; // 0.75s لانكماش الحواف العلوية والسفلية رأسياً
    const BLACK_SCREEN_PAUSE = 1800; // 1.8s (وقفة صارمة وواضحة على الشاشة السوداء بالكامل)

    // 3. بدء أنيميشن الانكماش الرأسي (Top & bottom edges collapse towards each other)
    landing.classList.add('collapsing-slit');

    // 4. فور اكتمال حركة الانكماش (750ms)
    setTimeout(() => {
        // إخفاء المحتوى القديم بالكامل والدخول فوراً في حالة الشاشة السوداء المصمتة
        landing.classList.add('hidden');
        landing.classList.remove('collapsing-slit', 'collapsing-black-hole');
        landing.style.transformOrigin = '';

        // استعادة تنسيق الهيدر الطبيعي
        if (header) {
            header.style.position = '';
            header.style.top = '';
            header.style.left = '';
            header.style.transform = '';
            header.style.width = '';
        }

        // 5. وقفة صارمة وهادئة لمدة 1.8 ثانية على الشاشة السوداء بالكامل
        setTimeout(() => {
            document.body.classList.add('system-mode');
            document.body.style.overflow = '';

            // إظهار حاوية كروت النظام
            if (overlay) {
                overlay.classList.remove('hidden');
                overlay.style.display = 'flex';
            }

            // فحص وجود اسم لاعب محفوظ مسبقاً لتخطي شاشة الإدخال تلقائياً
            const savedPlayerName = (typeof window.hasSavedPlayerName === 'function' ? window.hasSavedPlayerName() : null)
                || localStorage.getItem('SOLO_LEVELING_PLAYER_NAME');

            if (savedPlayerName) {
                // تخطي شاشة الاسم وإظهار نافذة الحالة statusModal فوراً
                if (modal) {
                    modal.classList.remove('active', 'closing');
                    modal.style.display = 'none';
                }
                if (welcomeModal) {
                    welcomeModal.classList.remove('active', 'closing');
                    welcomeModal.style.display = 'none';
                }
                if (statusModal) {
                    statusModal.classList.remove('closing');
                    statusModal.classList.add('active');
                    statusModal.style.display = 'flex';

                    // تشغيل صوت فتح الكارد الليزري الهولوجرامي الأنمي
                    if (window.SoundEngine) {
                        window.SoundEngine.playCardOpen();
                    }

                    animateStatusBars();
                    if (typeof updateStatusUI === 'function') {
                        updateStatusUI();
                    }
                }
            } else {
                // تشغيل صوت فتح الكارد الأنمي
                if (window.SoundEngine) {
                    window.SoundEngine.playCardOpen();
                }

                // تشغيل أنيميشن الفتح الأصلي الخاص بكارد إدخال الاسم (modalScale)
                if (modal) {
                    modal.classList.remove('closing');
                    modal.classList.add('active');
                    modal.style.display = 'flex';

                    // تركيز حقل الإدخال تلقائياً
                    const input = modal.querySelector('.system-input');
                    if (input) input.focus();
                }
            }

            isTransitioning = false;
        }, BLACK_SCREEN_PAUSE); // مدة الوقفة الصارمة على الشاشة السوداء (1.8s)

    }, COLLAPSE_DURATION);
}

// دالة فتح كارد النظام عالمياً لربطها بجميع الأزرار
function openSystemCard() {
    triggerSystemTransition();
}
window.openSystemCard = openSystemCard;

// تفعيل زر الدخول الرئيسي من الهيدر
if (enterBtn) {
    enterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        triggerSystemTransition();
    });
}

// دالة أنيميشن أشرطة الـ HP/MP
function animateStatusBars() {
    const bars = document.querySelectorAll('.bar-fill');

    bars.forEach(bar => {
        bar.style.width = '0%';
    });

    setTimeout(() => {
        bars.forEach(bar => {
            const targetWidth = bar.getAttribute('data-width') || '100%';
            bar.style.width = targetWidth;
        });
    }, 200);
}

// إمكانية الضغط على زر Enter داخل حقل الاسم للتأكيد
if (nameInput && submitBtn) {
    nameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            submitBtn.click();
        }
    });
}

// تفاعل زر OK داخل كارد النظام
if (submitBtn) {
    submitBtn.addEventListener('click', (e) => {
        e.preventDefault();

        if (window.SoundEngine) {
            window.SoundEngine.playClick();
        }

        const playerName = (nameInput ? nameInput.value.trim() : '') || 'PLAYER';
        if (nameDisplay) nameDisplay.textContent = playerName.toUpperCase();

        const statusPlayerName = document.getElementById('statusPlayerName');
        if (statusPlayerName) statusPlayerName.textContent = playerName.toUpperCase();

        // تحديث وتخزين اسم اللاعب في كائن اللعبة ومحرك LocalStorage
        localStorage.setItem('SOLO_LEVELING_PLAYER_NAME', playerName);
        if (typeof player !== 'undefined') {
            player.name = playerName;
            if (typeof saveGameData === 'function') saveGameData();
            if (typeof updateStatusUI === 'function') updateStatusUI();
        }

        // الخطوة 1: انكماش واختفاء العناصر الداخلية أولاً
        const targetModal = systemModal || document.querySelector('.system-modal');
        const innerBox = targetModal ? (targetModal.querySelector('.inner-content-box') || targetModal.firstElementChild) : null;

        if (!innerBox) return;

        const innerAnim = innerBox.animate([
            { opacity: 1, transform: 'scale(1)', filter: 'blur(0px)' },
            { opacity: 0, transform: 'scale(0.9)', filter: 'blur(8px)' }
        ], {
            duration: 350,
            easing: 'ease-out',
            fill: 'forwards'
        });

        // الخطوة 2: بمجرد انتهاء اختفاء المحتوى الداخلي، يبدأ أنيميشن الكارد الخارجي
        innerAnim.onfinish = () => {
            const cinematicAnim = targetModal.animate([
                { opacity: 1, transform: 'scale(1) rotate(0deg)', filter: 'blur(0px)' },
                { opacity: 0, transform: 'scale(1.4) rotate(8deg)', filter: 'blur(12px)' }
            ], {
                duration: 700,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                fill: 'forwards'
            });

            // الخطوة 3: الانتقال للنافذة التالية بعد طيران الكارد بالكامل
            cinematicAnim.onfinish = () => {
                targetModal.style.display = 'none';
                targetModal.classList.remove('active');

                // إعادة تعيين المحتوى الداخلي لحالته الأصلية
                innerBox.style.opacity = '1';
                innerBox.style.transform = 'scale(1)';
                innerBox.style.filter = 'blur(0px)';

                if (welcomeModal) {
                    welcomeModal.style.display = 'flex';
                    welcomeModal.classList.add('active');

                    if (window.SoundEngine) {
                        window.SoundEngine.playCardOpen();
                    }

                    setTimeout(() => {
                        welcomeModal.classList.add('closing');

                        setTimeout(() => {
                            welcomeModal.style.display = 'none';
                            welcomeModal.classList.remove('active', 'closing');

                            if (statusModal) {
                                statusModal.style.display = 'flex';
                                statusModal.classList.add('active');
                                if (window.SoundEngine) {
                                    window.SoundEngine.playCardOpen();
                                }
                                animateStatusBars();
                            }
                        }, 600);
                    }, 2000);
                }
            };
        };
    });
}

// ========================================================
// Close Status Window & Return to Main Interactive Domain
// ========================================================
function closeStatusModal() {
    const statusModal = document.getElementById('statusModal');
    const overlay = document.getElementById('systemOverlay');
    const landing = document.getElementById('landingPage');

    // تشغيل مؤثر الصوت الأنمي لإغلاق الكارد (Heavy Mechanical Iron Thud & Dark Vacuum)
    if (window.SoundEngine) {
        window.SoundEngine.playCardClose();
    }

    if (statusModal) {
        statusModal.classList.add('closing');
    }

    setTimeout(() => {
        if (statusModal) {
            statusModal.classList.remove('active', 'closing');
            statusModal.style.display = 'none';
        }
        if (overlay) {
            overlay.classList.add('hidden');
            overlay.style.display = 'none';
        }

        // إزالة نظام system-mode من body واستعادة التمرير الطبيعي
        document.body.classList.remove('system-mode');
        document.body.style.overflow = '';

        // استعادة صفحة البداية الرئيسية بالكامل
        if (landing) {
            landing.classList.remove('hidden', 'collapsing-slit', 'collapsing-black-hole');
            landing.style.display = 'block';
            landing.style.opacity = '1';
            landing.style.transform = 'none';
            landing.style.filter = 'none';

            const header = landing.querySelector('.system-header');
            if (header) {
                header.style.position = '';
                header.style.top = '';
                header.style.left = '';
                header.style.transform = '';
                header.style.width = '';
            }
        }

        // تحديث واجهة المستخدم بالبيانات المحدثة
        if (typeof updateStatusUI === 'function') {
            updateStatusUI();
        }

        isTransitioning = false;
    }, 480); // متوافق مع توقيت حركة modalCloseReverse
}
window.closeStatusModal = closeStatusModal;

// اختصار زر Escape لإغلاق المودال أو منطقة العقاب
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const statusModal = document.getElementById('statusModal');
        const penaltyOverlay = document.getElementById('penaltyOverlay');
        if (penaltyOverlay && !penaltyOverlay.classList.contains('hidden')) {
            if (typeof window.closePenaltyZone === 'function') {
                window.closePenaltyZone();
            }
        } else if (statusModal && statusModal.classList.contains('active')) {
            closeStatusModal();
        }
    }
});
