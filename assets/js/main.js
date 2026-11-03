/* Дубицкий, промышленный альпинизм */

const CONFIG = {
  phone: '+375298664464',
  whatsapp: '375298664464',
  /**
   * Куда отправлять заявки. Пусто — форма предложит звонок или WhatsApp.
   * Подключите Formspree / Getform / свой обработчик и укажите URL.
   */
  formEndpoint: ''
};

document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('header');
  const burger = document.getElementById('burger');
  const menu = document.getElementById('menu');
  const nav = document.getElementById('nav');
  const fab = document.querySelector('.fab');
  const yearEl = document.getElementById('year');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Шапка и плавающая кнопка ---------- */
  const onScroll = () => {
    const y = window.scrollY;
    header?.classList.toggle('is-scrolled', y > 24);
    fab?.classList.toggle('is-visible', y > window.innerHeight * 0.7);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Меню ---------- */
  const closeMenu = () => {
    if (!menu?.classList.contains('is-open')) return;
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    burger?.setAttribute('aria-expanded', 'false');
    burger?.setAttribute('aria-label', 'Открыть меню');
    document.body.classList.remove('nav-locked');
  };

  const openMenu = () => {
    menu?.classList.add('is-open');
    menu?.setAttribute('aria-hidden', 'false');
    burger?.setAttribute('aria-expanded', 'true');
    burger?.setAttribute('aria-label', 'Закрыть меню');
    document.body.classList.add('nav-locked');
  };

  burger?.addEventListener('click', () => {
    menu?.classList.contains('is-open') ? closeMenu() : openMenu();
  });

  menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1120) closeMenu();
  });

  /* ---------- Плавный скролл с учётом шапки ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = (header?.offsetHeight || 0) + 16;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
      history.replaceState(null, '', id);
    });
  });

  /* ---------- Подсветка активного пункта меню ---------- */
  const navLinks = Array.from(nav?.querySelectorAll('a[href^="#"]') || []);
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((link) =>
            link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`)
          );
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    sections.forEach((section) => spy.observe(section));
  }

  /* ---------- Мягкий параллакс фотографий ---------- */
  const parallaxEls = Array.from(document.querySelectorAll('[data-parallax]'));
  if (parallaxEls.length && !reduceMotion) {
    let ticking = false;
    const update = () => {
      const vh = window.innerHeight;
      parallaxEls.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < -200 || rect.top > vh + 200) return;
        const progress = (rect.top + rect.height / 2 - vh / 2) / vh;
        const shift = progress * parseFloat(el.dataset.parallax || '0.05') * 120;
        el.style.transform = `translate3d(0, ${shift.toFixed(1)}px, 0) scale(1.02)`;
      });
      ticking = false;
    };
    const requestTick = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', requestTick, { passive: true });
    window.addEventListener('resize', requestTick);
  }

  /* ---------- Форма ---------- */
  const form = document.getElementById('leadForm');
  const success = document.getElementById('formSuccess');
  const successCall = document.getElementById('successCall');
  const successWa = document.getElementById('successWa');

  const setError = (input, message) => {
    const field = input.closest('.field');
    const errorEl = field?.querySelector('.field__error');
    field?.classList.toggle('is-invalid', Boolean(message));
    if (errorEl) errorEl.textContent = message || '';
  };

  const digits = (value) => value.replace(/\D/g, '');

  const validate = (input) => {
    const value = input.value.trim();
    if (input.name === 'name') return value.length < 2 ? 'Как к вам обращаться' : '';
    if (input.name === 'phone') return digits(value).length < 9 ? 'Проверьте номер' : '';
    return '';
  };

  form?.querySelectorAll('input[required]').forEach((input) => {
    input.addEventListener('blur', () => {
      if (input.value.trim()) setError(input, validate(input));
    });
    input.addEventListener('input', () => {
      if (input.closest('.field')?.classList.contains('is-invalid')) {
        setError(input, validate(input));
      }
    });
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameInput = form.querySelector('[name="name"]');
    const phoneInput = form.querySelector('[name="phone"]');
    let firstInvalid = null;

    [nameInput, phoneInput].forEach((input) => {
      const message = validate(input);
      setError(input, message);
      if (message && !firstInvalid) firstInvalid = input;
    });

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    const data = {
      name: nameInput.value.trim(),
      phone: phoneInput.value.trim(),
      work: form.querySelector('[name="work"]')?.value || 'не указано',
      message: form.querySelector('[name="message"]')?.value.trim() || '',
      page: window.location.href,
      date: new Date().toISOString()
    };

    const text = [
      'Заявка с сайта (промышленный альпинизм)',
      `Имя: ${data.name}`,
      `Телефон: ${data.phone}`,
      `Работы: ${data.work}`,
      data.message ? `Детали: ${data.message}` : ''
    ].filter(Boolean).join('\n');

    if (CONFIG.formEndpoint) {
      const button = form.querySelector('button[type="submit"]');
      const label = button?.textContent;
      if (button) { button.disabled = true; button.textContent = 'Отправляем…'; }
      try {
        await fetch(CONFIG.formEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(data)
        });
      } catch (err) {
        /* заявка всё равно доступна по телефону */
      }
      if (button) { button.disabled = false; button.textContent = label; }
    }

    if (successCall) successCall.href = `tel:${CONFIG.phone}`;
    if (successWa) successWa.href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;

    if (success) {
      success.hidden = false;
      success.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
    }

    form.querySelector('button[type="submit"]')?.setAttribute('hidden', 'hidden');
    form.querySelectorAll('input, select, textarea').forEach((el) => (el.disabled = true));
  });
});
