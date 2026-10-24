// ==========================================
// 1. إعدادات بوت التليجرام (أدخل معلوماتك هنا)
// ==========================================
const TELEGRAM_BOT_TOKEN = "8776231969:AAHUyz17jdMu_8RGWJSG-BHS1hQWCTLyMBQ"; // مثال: "123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
const TELEGRAM_CHAT_ID = "-1004135625566";   // مثال: "@MyChannel" أو "123456789"

// التعامل مع نموذج التواصل وحفظ الطلبات إلى تليجرام
const telegramForm = document.getElementById('telegramForm');
const formStatus = document.getElementById('formStatus');
const submitBtn = document.getElementById('submitBtn');

telegramForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const service = document.getElementById('service').value;
    const message = document.getElementById('message').value;

    // تعطيل الزر أثناء الإرسال
    submitBtn.disabled = true;
    submitBtn.innerText = "جاري الإرسال...";
    formStatus.innerText = "";

    // نص الرسالة المنسق بالتليجرام
    const text = `🚀 **طلب جديد من موقع بناة التقنية**\n\n` +
                 `👤 **الاسم:** ${name}\n` +
                 `📞 **الهاتف:** ${phone}\n` +
                 `🛠️ **الخدمة:** ${service}\n` +
                 `📝 **التفاصيل:** ${message}`;

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: text,
                parse_mode: 'Markdown'
            })
        });

        const data = await response.json();

        if (data.ok) {
            formStatus.style.color = "#10B981";
            formStatus.innerText = "✅ تم إرسال طلبك بنجاح إلى فريقنا! سنتواصل معك قريباً.";
            telegramForm.reset();
        } else {
            throw new Error(data.description || 'فشل الإرسال');
        }
    } catch (error) {
        formStatus.style.color = "#EF4444";
        formStatus.innerText = "❌ حدث خطأ أثناء الإرسال. يرجى التأكد من إعدادات البوت والـ Chat ID.";
        console.error("Telegram API Error:", error);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i class="fa-paper-plane fas"></i> إرسال الطلب عبر التليجرام`;
    }
});

// ==========================================
// 2. محاكاة التفاعل مع المساعد الذكي (AI Demo)
// ==========================================
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const chatMessages = document.getElementById('chatMessages');

function addMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender);
    msgDiv.innerText = text;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function handleChat() {
    const text = chatInput.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    chatInput.value = '';

    setTimeout(() => {
        let reply = "شكراً لتواصلك معنا! يمكن لمساعد الذكاء الاصطناعي لدينا الإجابة عن استفساراتك وحجز موعد فوراً.";
        if (text.includes("موعد") || text.includes("حجز")) {
            reply = "بالتأكيد! ما هو اليوم والوقت المناسب لك لحجز الاستشارة البرمجية معنا؟";
        } else if (text.includes("سعر") || text.includes("تكلفة")) {
            reply = "تختلف التكلفة بحسب تفاصيل المشروع. يمكنك تعبئة نموذج الطلب بالأسفل ليصلك عرض سعر مخصص عبر التليجرام!";
        } else if (text.includes("تطبيق") || text.includes("موقع")) {
            reply = "نحن متخصصون في تطوير المواقع والتطبيقات بأحدث التقنيات وبأداء عالي جداً.";
        }
        addMessage(reply, 'bot');
    }, 800);
}

sendBtn.addEventListener('click', handleChat);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleChat();
});