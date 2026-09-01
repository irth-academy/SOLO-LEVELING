// تحديد العناصر الأساسية
const systemModal = document.querySelector('.system-modal:not(.welcome-modal):not(.status-modal)');
const welcomeModal = document.getElementById('welcomeModal');
const statusModal = document.getElementById('statusModal');

const submitBtn = document.querySelector('.system-btn');
const nameInput = document.querySelector('.system-input');
const nameDisplay = document.getElementById('playerNameDisplay');

// عناصر الـ Landing Page
const enterBtn = document.getElementById('enterSystemBtn');
const systemOverlay = document.getElementById('systemOverlay');
const landingPage = document.getElementById('landingPage');

// تفعيل زر الدخول من الصفحة الرئيسية
if (enterBtn) {
    enterBtn.addEventListener('click', () => {
        if (landingPage) landingPage.classList.add('hidden');
        document.body.classList.add('system-mode');
        if (systemOverlay) {
            systemOverlay.classList.remove('hidden');
            systemOverlay.style.display = 'flex';
        }
    });
}

function openSystemCard() {
    const overlay = document.getElementById('systemOverlay');
    if (overlay) {
        overlay.classList.remove('hidden');
    }
}

// دالة أنيميشن الأشرطة
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

if (submitBtn) {
    submitBtn.addEventListener('click', (e) => {
        e.preventDefault();

        const playerName = nameInput.value.trim() || 'PLAYER';
        if (nameDisplay) nameDisplay.textContent = playerName.toUpperCase();
        
        const statusPlayerName = document.getElementById('statusPlayerName');
        if (statusPlayerName) statusPlayerName.textContent = playerName.toUpperCase();

        // الخطوة 1: انكماش واختفاء العناصر الداخلية أولاً (مثل النصوص والإنput والزر)
        const innerBox = systemModal.querySelector('.inner-content-box') || systemModal.firstElementChild;
        
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
            const cinematicAnim = systemModal.animate([
                { opacity: 1, transform: 'scale(1) rotate(0deg)', filter: 'blur(0px)' },
                { opacity: 0, transform: 'scale(1.4) rotate(8deg)', filter: 'blur(12px)' }
            ], {
                duration: 700,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                fill: 'forwards'
            });

            // الخطوة 3: الانتقال للنافذة التالية بعد طيران الكارد بالكامل
            cinematicAnim.onfinish = () => {
                systemModal.style.display = 'none';
                
                // إعادة تعيين المحتوى الداخلي لحالته الأصلية لو احتجت فتحه لاحقاً
                innerBox.style.opacity = '1';
                innerBox.style.transform = 'scale(1)';
                innerBox.style.filter = 'blur(0px)';

                welcomeModal.style.display = 'flex';
                welcomeModal.classList.add('active');

                setTimeout(() => {
                    welcomeModal.classList.add('closing');

                    setTimeout(() => {
                        welcomeModal.style.display = 'none';
                        welcomeModal.classList.remove('active', 'closing');

                        statusModal.style.display = 'flex';
                        statusModal.classList.add('active');
                        animateStatusBars();
                    }, 600);
                }, 2000);
            };
        };
    });
}