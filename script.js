// ==========================================
// إعدادات بوت التليجرام
// ==========================================
const TELEGRAM_BOT_TOKEN = "8776231969:AAHUyz17jdMu_8RGWJSG-BHS1hQWCTLyMBQ"; 
const TELEGRAM_CHAT_ID = "-1004135625566";   

const telegramForm = document.getElementById('telegramForm');
const formStatus = document.getElementById('formStatus');
const submitBtn = document.getElementById('submitBtn');

telegramForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const service = document.getElementById('service').value;
    const message = document.getElementById('message').value;

    submitBtn.disabled = true;
    submitBtn.innerText = "جاري الإرسال...";
    formStatus.innerText = "";

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
        formStatus.innerText = "❌ حدث خطأ أثناء الإرسال. يرجى التأكد من إعدادات البوت.";
        console.error("Telegram API Error:", error);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> إرسال الطلب عبر التليجرام`;
    }
});