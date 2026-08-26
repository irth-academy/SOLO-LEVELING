const systemModal = document.querySelector('.system-modal:not(.welcome-modal):not(.status-modal)');
const welcomeModal = document.getElementById('welcomeModal');
const statusModal = document.getElementById('statusModal');

const submitBtn = document.querySelector('.system-btn');
const nameInput = document.querySelector('.system-input');
const nameDisplay = document.getElementById('playerNameDisplay');

submitBtn.addEventListener('click', (e) => {
    e.preventDefault();

    const playerName = nameInput.value.trim() || 'PLAYER';
    nameDisplay.textContent = playerName.toUpperCase();

    // 1. إغلاق النافذة الأولى بالأنيميشن العكسي
    systemModal.classList.add('closing');

    setTimeout(() => {
        systemModal.style.display = 'none';
        systemModal.classList.remove('closing');

        // 2. إظهار نافذة الترحيب مباشرة
        welcomeModal.style.display = 'flex';
        welcomeModal.classList.add('active');

        // 3. الانتظار ثانيتين ثم بدء الإغلاق العكسي
        setTimeout(() => {
            welcomeModal.classList.add('closing');

            // 4. الانتقال المباشر لنافذة الـ Status فور انتهاء الانكماش
            setTimeout(() => {
                welcomeModal.style.display = 'none';
                welcomeModal.classList.remove('active', 'closing');

                statusModal.style.display = 'flex';
                statusModal.classList.add('active');
            }, 600); // طابقنا زمن أنيميشن modalCloseReverse

        }, 2000);

    }, 600);
});

// دالة أنيميشن الأشرطة
function animateStatusBars() {
    const bars = document.querySelectorAll('.bar-fill');

    // صفر العرض
    bars.forEach(bar => {
        bar.style.width = '0%';
    });

    // شغل الامتلاء بعد فتح النافذة بـ 200ms
    setTimeout(() => {
        bars.forEach(bar => {
            const targetWidth = bar.getAttribute('data-width') || '100%';
            bar.style.width = targetWidth;
        });
    }, 200);
}

// كود زر الضغط والتتابع
submitBtn.addEventListener('click', (e) => {
    e.preventDefault();

    const playerName = nameInput.value.trim() || 'PLAYER';
    if (nameDisplay) nameDisplay.textContent = playerName.toUpperCase();

    // 1. إغلاق النافذة الأولى
    systemModal.classList.add('closing');

    setTimeout(() => {
        systemModal.style.display = 'none';
        systemModal.classList.remove('closing');

        // 2. إظهار الترحيب
        welcomeModal.style.display = 'flex';
        welcomeModal.classList.add('active');

        setTimeout(() => {
            welcomeModal.classList.add('closing');

            setTimeout(() => {
                welcomeModal.style.display = 'none';
                welcomeModal.classList.remove('active', 'closing');

                // 3. إظهار نافذة الـ Status لوحدها وتشغيل الأشرطة
                statusModal.style.display = 'flex';
                statusModal.classList.add('active');

                // استدعاء أنيميشن الأشرطة هنا
                animateStatusBars();

            }, 600);
        }, 2000);
    }, 600);
});


submitBtn.addEventListener('click', (e) => {
    e.preventDefault();

    const playerName = nameInput.value.trim() || 'PLAYER';

    // تحديث الاسم في نافذة الترحيب (إن وجد)
    if (nameDisplay) {
        nameDisplay.textContent = playerName.toUpperCase();
    }

    // تحديث الاسم في نافذة الـ Status الجديدة
    const statusPlayerName = document.getElementById('statusPlayerName');
    if (statusPlayerName) {
        statusPlayerName.textContent = playerName.toUpperCase();
    }

    // باقي كود التتابع والأنيميشن كما هو...
});