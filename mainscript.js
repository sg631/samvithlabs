// Featured carousel
(function () {
  const slides  = Array.from(document.querySelectorAll('.feat-slide'));
  const dots    = Array.from(document.querySelectorAll('.feat-dot'));
  const slidesEl = document.querySelector('.feat-slides');
  if (!slides.length) return;

  let current = 0;
  let timer   = null;
  const INTERVAL = 5500;

  function goTo(idx) {
    slides[current].classList.remove('active');
    dots[current]?.classList.remove('active');
    current = (idx + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current]?.classList.add('active');
  }

  function startAuto() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), INTERVAL);
  }

  document.getElementById('feat-next')?.addEventListener('click', () => { goTo(current + 1); startAuto(); });
  document.getElementById('feat-prev')?.addEventListener('click', () => { goTo(current - 1); startAuto(); });
  dots.forEach((dot, i) => dot.addEventListener('click', () => { goTo(i); startAuto(); }));

  // Touch swipe
  let touchX = 0;
  slidesEl?.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
  slidesEl?.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 45) { dx < 0 ? goTo(current + 1) : goTo(current - 1); startAuto(); }
  }, { passive: true });

  startAuto();
})();

// Mobile nav toggle
document.getElementById('nav-toggle').addEventListener('click', () => {
  document.getElementById('nav-links').classList.toggle('open');
});

// Timeline scroll-jack
(function () {
  const section = document.getElementById('timeline');
  if (!section) return;

  const items  = Array.from(section.querySelectorAll('.tl-item'));
  const panel  = document.getElementById('tl-panel-inner');
  const fill   = document.getElementById('tl-fill');
  const lineBg = section.querySelector('.tl-line-bg');
  const hint   = section.querySelector('.tl-hint');
  const n      = items.length;
  if (!n || !panel) return;

  const isMobile = () => window.innerWidth <= 600;
  const SCROLL_PER_EVENT = () => window.innerHeight * 0.55;

  let current   = -1;
  let fadeTimer = null;

  function setFill(idx) {
    const pct = 100 / n;
    fill.style.width = `${idx * pct}%`;
  }

  function setPanel(idx) {
    const item    = items[idx];
    const content = item.querySelector('.tl-content');
    const year    = item.querySelector('.tl-year').textContent;
    if (!content) return;

    panel.classList.remove('show');
    clearTimeout(fadeTimer);
    fadeTimer = setTimeout(() => {
      panel.innerHTML = `<div class="tl-event-badge">${year}</div>` + content.innerHTML;
      panel.classList.add('show');
    }, 180);
  }

  function activate(idx) {
    if (idx === current) return;
    current = idx;
    items.forEach((el, i) => el.classList.toggle('active', i === idx));
    setFill(idx);
    setPanel(idx);
  }

  // Click dot/item — mobile taps directly, desktop smooth-scrolls
  items.forEach((item, i) => {
    item.addEventListener('click', () => {
      if (isMobile()) {
        activate(i);
      } else {
        const total  = section.offsetHeight - window.innerHeight;
        const target = section.offsetTop + (i / n) * total;
        window.scrollTo({ top: target, behavior: 'smooth' });
      }
    });
  });

  function setupDesktop() {
    const pct = 100 / n;
    section.style.height = `${window.innerHeight + n * SCROLL_PER_EVENT()}px`;
    lineBg.style.left  = `${pct / 2}%`;
    lineBg.style.right = `${pct / 2}%`;
    fill.style.left    = `${pct / 2}%`;
  }

  function updateDesktop() {
    const rect     = section.getBoundingClientRect();
    const scrolled = Math.max(0, -rect.top);
    const total    = section.offsetHeight - window.innerHeight;
    const progress = total > 0 ? Math.min(1, scrolled / total) : 0;
    activate(Math.min(n - 1, Math.floor(progress * n)));
    if (hint) hint.style.opacity = current > 0 ? '0' : '';
  }

  function initMobile() {
    section.style.height = '';
    // Line spans full track on mobile
    lineBg.style.left  = '0';
    lineBg.style.right = '0';
    fill.style.left    = '0';
    activate(0);
  }

  if (isMobile()) {
    initMobile();
  } else {
    setupDesktop();
    updateDesktop();
  }

  window.addEventListener('scroll', () => { if (!isMobile()) updateDesktop(); }, { passive: true });

  window.addEventListener('resize', () => {
    if (isMobile()) { initMobile(); }
    else { setupDesktop(); updateDesktop(); }
  });
})();
