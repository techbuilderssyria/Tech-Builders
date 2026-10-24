(function () {
  'use strict';

  const config = window.TECH_BUILDERS_CONFIG || { email: '', whatsapp: '', phone: '', socials: {} };
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const normaliseUrl = (value) => {
    if (!value || typeof value !== 'string') return '';
    const trimmed = value.trim();
    if (!/^https?:\/\//i.test(trimmed)) return '';
    try { return new URL(trimmed).href; } catch { return ''; }
  };
  const safeEmail = (value) => {
    if (!value || typeof value !== 'string') return '';
    const trimmed = value.trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) ? trimmed : '';
  };

  // Footer year
  const currentYear = $('#currentYear');
  if (currentYear) currentYear.textContent = new Date().getFullYear();

  // Sticky navigation and mobile menu
  const siteHeader = $('.site-header');
  const menuToggle = $('#menuToggle');
  const mainNav = $('#mainNav');
  const closeMenu = () => {
    if (!menuToggle || !mainNav) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'فتح القائمة');
    mainNav.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  };
  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!isOpen));
      menuToggle.setAttribute('aria-label', isOpen ? 'فتح القائمة' : 'إغلاق القائمة');
      mainNav.classList.toggle('is-open', !isOpen);
    });
    $$('#mainNav a').forEach((link) => link.addEventListener('click', closeMenu));
    document.addEventListener('click', (event) => {
      if (mainNav.classList.contains('is-open') && !mainNav.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
    });
    window.addEventListener('resize', () => { if (window.innerWidth > 850) closeMenu(); });
  }

  const backToTop = $('#backToTop');
  const handleScroll = () => {
    const y = window.scrollY || document.documentElement.scrollTop;
    if (siteHeader) siteHeader.classList.toggle('is-scrolled', y > 10);
    if (backToTop) backToTop.classList.toggle('visible', y > 650);
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
  if (backToTop) backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Gentle reveal-on-scroll animation (with a no-JS fallback in CSS/observer setup).
  const revealItems = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -25px 0px' });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  // Contact details and social accounts are configured in config.js.
  const email = safeEmail(config.email);
  const emailContact = $('#emailContact');
  const emailLabel = $('#emailLabel');
  if (emailContact && email) {
    emailContact.href = `mailto:${email}`;
    if (emailLabel) emailLabel.textContent = email;
  } else if (emailContact) {
    emailContact.addEventListener('click', (event) => {
      event.preventDefault();
      const status = $('#formStatus');
      if (status) {
        status.hidden = false;
        status.className = 'form-status error';
        status.textContent = 'لم تتم إضافة بريد الشركة بعد. أضف البريد الحقيقي في ملف config.js.';
        $('#contactForm')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  const whatsapp = (typeof config.whatsapp === 'string' ? config.whatsapp : '').replace(/\D/g, '');
  const whatsappContact = $('#whatsappContact');
  const whatsappLabel = $('#whatsappLabel');
  if (whatsappContact && whatsapp.length >= 8) {
    whatsappContact.href = `https://wa.me/${whatsapp}`;
    whatsappContact.target = '_blank';
    whatsappContact.rel = 'noopener noreferrer';
    if (whatsappLabel) whatsappLabel.textContent = `+${whatsapp}`;
  } else if (whatsappContact) {
    whatsappContact.addEventListener('click', (event) => {
      event.preventDefault();
      const status = $('#formStatus');
      if (status) {
        status.hidden = false;
        status.className = 'form-status error';
        status.textContent = 'لم تتم إضافة رقم واتساب الشركة بعد. أضف الرقم مع رمز الدولة في ملف config.js.';
        $('#contactForm')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  let configuredSocialCount = 0;
  $$('.social-link').forEach((link) => {
    const key = link.dataset.social;
    const url = normaliseUrl(config.socials && config.socials[key]);
    if (url) {
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.title = `حسابنا على ${link.getAttribute('aria-label') || key}`;
      configuredSocialCount += 1;
    } else {
      link.hidden = true;
    }
  });
  const socialHint = $('#socialHint');
  if (socialHint && configuredSocialCount > 0) socialHint.hidden = true;

  // Service cards can pre-select the relevant service in the contact form.
  $$('[data-service]').forEach((link) => {
    link.addEventListener('click', () => {
      const select = $('#projectType');
      if (!select) return;
      const service = link.dataset.service;
      const options = Array.from(select.options);
      const found = options.find((option) => option.value === service || option.textContent.trim() === service);
      if (found) select.value = found.value || found.textContent.trim();
    });
  });

  // Contact request builder. This static site does not send to a server.
  const contactForm = $('#contactForm');
  const formStatus = $('#formStatus');
  const requestPreview = $('#requestPreview');
  const requestText = $('#requestText');
  const copyRequest = $('#copyRequest');
  const sendEmailFallback = $('#sendEmailFallback');
  const contactFields = ['fullName', 'phone', 'projectType', 'message'];

  function showFormStatus(message, type) {
    if (!formStatus) return;
    formStatus.hidden = false;
    formStatus.className = `form-status ${type}`;
    formStatus.textContent = message;
  }
  function collectRequest() {
    const read = (id) => (($(`#${id}`)?.value || '').trim());
    const budget = read('budget') || 'غير محددة';
    return [
      'طلب تواصل جديد — بناة التقنية | Tech Builders',
      '----------------------------------------',
      `الاسم: ${read('fullName')}`,
      `رقم الجوال: ${read('phone')}`,
      `الخدمة المطلوبة: ${read('projectType')}`,
      `الميزانية التقريبية: ${budget}`,
      '',
      'تفاصيل الفكرة:',
      read('message'),
      '',
      `تاريخ تجهيز الطلب: ${new Date().toLocaleString('ar')}`
    ].join('\n');
  }
  function validateContactForm() {
    let firstInvalid = null;
    contactFields.forEach((id) => {
      const field = $(`#${id}`);
      if (!field) return;
      field.classList.remove('field-error');
      const value = (field.value || '').trim();
      let valid = value.length > 0;
      if (id === 'email' && value) valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      if (!valid) {
        field.classList.add('field-error');
        if (!firstInvalid) firstInvalid = field;
      }
    });
    if (firstInvalid) {
      firstInvalid.focus();
      showFormStatus('راجع الحقول المطلوبة. تأكد من كتابة بريد إلكتروني صحيح.', 'error');
      return false;
    }
    return true;
  }
  contactFields.forEach((id) => {
    const field = $(`#${id}`);
    field?.addEventListener('input', () => field.classList.remove('field-error'));
    field?.addEventListener('change', () => field.classList.remove('field-error'));
  });

if (contactForm) {
    contactForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!validateContactForm()) return;
      const request = collectRequest();

      const botToken = config.telegramBotToken;
      const chatId = config.telegramChatId;

      if (!botToken || !chatId || botToken.includes('أضف_') || chatId.includes('أضف_')) {
        showFormStatus('يرجى ضبط "telegramBotToken" و "telegramChatId" بشكل صحيح في ملف config.js لتفعيل الإرسال المباشر إلى تليجرام.', 'error');
        return;
      }

      const submitButton = contactForm.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.innerHTML;
      submitButton.disabled = true;
      submitButton.innerHTML = 'جارٍ إرسال الطلب إلى التليجرام...';

      try {
        const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: request
          })
        });

        const data = await res.json();
        if (data.ok) {
          showFormStatus('تم إرسال تفاصيل العميل إلى قناة التليجرام بنجاح! يمكنك التواصل معه مباشرة من الرسالة الواردة في القناة.', 'success');
          contactForm.reset();
          if (requestPreview) requestPreview.hidden = true;
        } else {
          throw new Error(data.description || 'فشل الإرسال إلى تليجرام');
        }
      } catch (error) {
        showFormStatus(`حدث خطأ أثناء الإرسال إلى تليجرام: ${error.message}`, 'error');
      } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
      }
    });
  }

  if (copyRequest) {
    copyRequest.addEventListener('click', async () => {
      const textToCopy = requestText?.value || '';
      if (!textToCopy) return;
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(textToCopy);
        } else if (requestText) {
          requestText.focus();
          requestText.select();
          const copied = document.execCommand('copy');
          if (!copied) throw new Error('copy-not-supported');
        }
        copyRequest.textContent = 'تم النسخ ✓';
        window.setTimeout(() => { copyRequest.textContent = 'نسخ الرسالة'; }, 2200);
      } catch {
        if (requestText) { requestText.focus(); requestText.select(); }
        showFormStatus('حدّد النص في مربع «ملخص رسالتك» وانسخه يدوياً.', 'error');
      }
    });
  }
  if (sendEmailFallback) {
    sendEmailFallback.addEventListener('click', () => {
      showFormStatus('سيفتح تطبيق البريد على جهازك. اضغط إرسال من تطبيق البريد لإتمام التواصل.', 'success');
    });
  }

  // FAQ: keep one answer open at a time for a compact reading experience.
  $$('.faq-item').forEach((item) => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;
      $$('.faq-item').forEach((other) => { if (other !== item) other.open = false; });
    });
  });

  // Interactive sample assistant: scripted demo responses, not a live AI integration.
  const demoMessages = $('#demoMessages');
  const demoChatForm = $('#demoChatForm');
  const demoChatInput = $('#demoChatInput');
  const quickReplyButtons = $$('[data-demo-question]');
  const demoAnswers = {
    booking: 'نقدر نبني تدفق حجز يجمع نوع الخدمة والوقت المناسب وبيانات العميل، مع ربطه بالتقويم أو نظام الحجز إذا كان ذلك متاحاً. التفاصيل تتحدد حسب آلية عملك.',
    cost: 'التكلفة تعتمد على الخصائص والتصميم والتكاملات المطلوبة. اكتب لنا فكرتك في نموذج التواصل وسنرتّب المتطلبات قبل اقتراح نطاق مناسب.',
    human: 'أكيد! انتقل إلى قسم «تواصل معنا» واكتب ملخصاً عن مشروعك. هذه الدردشة توضيحية، لذلك لا تحوّل الرسائل إلى فريق بشري فعلياً.',
    services: 'خدماتنا تشمل مواقع ومنصات الويب، تطبيقات الجوال، مساعدين بالذكاء الاصطناعي لخدمة العملاء والحجز، وأتمتة وربط الأنظمة.',
    website: 'نستطيع تطوير موقع تعريفي أو متجر إلكتروني أو منصة مخصّصة حسب أهدافك والجمهور الذي تريد الوصول إليه.',
    greeting: 'أهلاً وسهلاً! 😊 أنا مساعد تجريبي يشرح أفكار خدمات بناة التقنية. كيف أقدر أساعدك؟',
    fallback: 'وصلت فكرتك بشكل تجريبي. أفضل خطوة هي مشاركة التفاصيل في نموذج التواصل حتى نحدد الحل المناسب. ملاحظة: هذه الدردشة لا تستخدم نموذج ذكاء اصطناعي فعلياً.'
  };
  function classifyDemoQuestion(text) {
    const q = text.toLowerCase();
    if (/حجز|موعد|مواعيد|تقويم|booking/.test(q)) return 'booking';
    if (/سعر|تكلف|ميزاني|كم|السعر|التكلفة|cost/.test(q)) return 'cost';
    if (/تواصل|شخص|موظف|فريق|بشري|واتساب|إنسان/.test(q)) return 'human';
    if (/خدم|ماذا تقدم|شو بتقدم|شو الخدمات|خدماتكم/.test(q)) return 'services';
    if (/موقع|متجر|ويب|website/.test(q)) return 'website';
    if (/مرحبا|أهلا|اهلا|سلام|السلام/.test(q)) return 'greeting';
    return 'fallback';
  }
  function appendDemoMessage(container, text, kind) {
    if (!container) return;
    const message = document.createElement('div');
    message.className = `message ${kind === 'user' ? 'message-user' : 'message-bot'}`;
    message.textContent = text;
    container.appendChild(message);
    container.scrollTop = container.scrollHeight;
  }
  function replyToDemoQuestion(question, container = demoMessages) {
    const value = (question || '').trim();
    if (!value) return;
    appendDemoMessage(container, value, 'user');
    const key = classifyDemoQuestion(value);
    window.setTimeout(() => appendDemoMessage(container, demoAnswers[key] || demoAnswers.fallback, 'bot'), 260);
  }
  if (demoChatForm && demoChatInput) {
    demoChatForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const value = demoChatInput.value.trim();
      if (!value) return;
      replyToDemoQuestion(value, demoMessages);
      demoChatInput.value = '';
    });
  }
  quickReplyButtons.forEach((button) => button.addEventListener('click', () => {
    const key = button.dataset.demoQuestion;
    const questions = { booking: 'كيف يعمل حجز المواعيد؟', cost: 'كيف أعرف التكلفة؟', human: 'أريد التواصل مع الفريق' };
    replyToDemoQuestion(questions[key] || key, demoMessages);
  }));

  // Floating assistant panel
  const floatingChatButton = $('#floatingChatButton');
  const floatingChatPanel = $('#floatingChatPanel');
  const closeFloatingChat = $('#closeFloatingChat');
  const floatingChatBody = $('#floatingChatBody');
  const floatingChatForm = $('#floatingChatForm');
  const floatingChatInput = $('#floatingChatInput');
  function setFloatingChat(open) {
    if (!floatingChatPanel || !floatingChatButton) return;
    floatingChatPanel.hidden = !open;
    floatingChatButton.setAttribute('aria-expanded', String(open));
    if (open) floatingChatInput?.focus();
  }
  floatingChatButton?.addEventListener('click', () => setFloatingChat(floatingChatPanel?.hidden));
  closeFloatingChat?.addEventListener('click', () => setFloatingChat(false));
  $$('[data-floating-answer]').forEach((button) => {
    button.addEventListener('click', () => {
      const key = button.dataset.floatingAnswer;
      if (key === 'contact') {
        appendDemoMessage(floatingChatBody, 'أريد التواصل مع الفريق', 'user');
        appendDemoMessage(floatingChatBody, 'تفضل إلى نموذج التواصل في أسفل الصفحة، واكتب التفاصيل التي تريد مشاركتها. لا يتم إرسال رسائل هذه الدردشة التجريبية إلى فريق فعلي.', 'bot');
        window.setTimeout(() => { $('#contact')?.scrollIntoView({ behavior: 'smooth' }); }, 450);
      } else {
        appendDemoMessage(floatingChatBody, 'ما الخدمات التي تقدمونها؟', 'user');
        appendDemoMessage(floatingChatBody, demoAnswers.services, 'bot');
      }
    });
  });
  if (floatingChatForm && floatingChatInput) {
    floatingChatForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const value = floatingChatInput.value.trim();
      if (!value) return;
      appendDemoMessage(floatingChatBody, value, 'user');
      appendDemoMessage(floatingChatBody, demoAnswers[classifyDemoQuestion(value)] || demoAnswers.fallback, 'bot');
      floatingChatInput.value = '';
    });
  }
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') setFloatingChat(false); });
})();
