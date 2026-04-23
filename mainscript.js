// Smooth-scroll polyfill for browsers without scrollTo options support
function smoothScrollTo(top) {
  if ('scrollBehavior' in document.documentElement.style) {
    window.scrollTo({ top: top, behavior: 'smooth' });
  } else {
    window.scrollTo(0, top);
  }
}

// ─── Featured carousel ────────────────────────────────────────────────────────
(function () {
  var slides   = Array.prototype.slice.call(document.querySelectorAll('.feat-slide'));
  var dots     = Array.prototype.slice.call(document.querySelectorAll('.feat-dot'));
  var slidesEl = document.querySelector('.feat-slides');
  if (!slides.length) return;

  var current  = 0;
  var timer    = null;
  var INTERVAL = 5500;

  function goTo(idx) {
    slides[current].classList.remove('active');
    if (dots[current]) dots[current].classList.remove('active');
    current = (idx + slides.length) % slides.length;
    slides[current].classList.add('active');
    if (dots[current]) dots[current].classList.add('active');
  }

  function startAuto() {
    clearInterval(timer);
    timer = setInterval(function () { goTo(current + 1); }, INTERVAL);
  }

  var nextBtn = document.getElementById('feat-next');
  var prevBtn = document.getElementById('feat-prev');
  if (nextBtn) nextBtn.addEventListener('click', function () { goTo(current + 1); startAuto(); });
  if (prevBtn) prevBtn.addEventListener('click', function () { goTo(current - 1); startAuto(); });

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () { goTo(i); startAuto(); });
  });

  // Touch swipe
  var touchX = 0;
  if (slidesEl) {
    slidesEl.addEventListener('touchstart', function (e) {
      touchX = e.touches[0].clientX;
    }, { passive: true });
    slidesEl.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 45) {
        dx < 0 ? goTo(current + 1) : goTo(current - 1);
        startAuto();
      }
    }, { passive: true });
  }

  startAuto();
})();

// ─── Mobile nav toggle ────────────────────────────────────────────────────────
var navToggle = document.getElementById('nav-toggle');
var navLinks  = document.getElementById('nav-links');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', function () {
    navLinks.classList.toggle('open');
  });
  // Close nav when a link is tapped on mobile
  navLinks.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') navLinks.classList.remove('open');
  });
}

// ─── Timeline scroll-jack ─────────────────────────────────────────────────────
(function () {
  var section = document.getElementById('timeline');
  if (!section) return;

  var items  = Array.prototype.slice.call(section.querySelectorAll('.tl-item'));
  var panel  = document.getElementById('tl-panel-inner');
  var fill   = document.getElementById('tl-fill');
  var lineBg = section.querySelector('.tl-line-bg');
  var hint   = section.querySelector('.tl-hint');
  var n      = items.length;
  if (!n || !panel) return;

  function isMobile() { return window.innerWidth <= 600; }
  function scrollPerEvent() { return window.innerHeight * 0.55; }

  var current   = -1;
  var fadeTimer = null;
  var rafPending = false;

  function setFill(idx) {
    var pct = 100 / n;
    fill.style.width = (idx * pct) + '%';
  }

  function setPanel(idx) {
    var item    = items[idx];
    var content = item.querySelector('.tl-content');
    var yearEl  = item.querySelector('.tl-year');
    if (!content || !yearEl) return;
    var year = yearEl.textContent || yearEl.innerText;

    panel.classList.remove('show');
    clearTimeout(fadeTimer);
    fadeTimer = setTimeout(function () {
      panel.innerHTML = '<div class="tl-event-badge">' + year + '</div>' + content.innerHTML;
      panel.classList.add('show');
    }, 180);
  }

  function activate(idx) {
    if (idx === current) return;
    current = idx;
    items.forEach(function (el, i) {
      el.classList[i === idx ? 'add' : 'remove']('active');
    });
    setFill(idx);
    setPanel(idx);
  }

  // ── Desktop: dot click smooth-scrolls to event position
  // ── Mobile:  dot click directly activates
  items.forEach(function (item, i) {
    item.addEventListener('click', function () {
      if (isMobile()) {
        activate(i);
      } else {
        var total  = section.offsetHeight - window.innerHeight;
        var target = section.offsetTop + (i / n) * total;
        smoothScrollTo(target);
      }
    });
  });

  function setupDesktop() {
    var pct = 100 / n;
    section.style.height = (window.innerHeight + n * scrollPerEvent()) + 'px';
    lineBg.style.left  = (pct / 2) + '%';
    lineBg.style.right = (pct / 2) + '%';
    lineBg.style.width = '';
    fill.style.left    = (pct / 2) + '%';
    fill.style.right   = '';
  }

  function setupMobile() {
    section.style.height = '';
    // On a scrollable overflow container, right:0 only covers visible width.
    // Use the track's scrollWidth to span all dots.
    var track = section.querySelector('.tl-track');
    var w = track ? track.scrollWidth : 0;
    lineBg.style.left  = '0';
    lineBg.style.right = '';
    lineBg.style.width = w ? (w + 'px') : '100%';
    fill.style.left    = '0';
    fill.style.right   = '';
  }

  function updateDesktop() {
    var rect     = section.getBoundingClientRect();
    var scrolled = Math.max(0, -rect.top);
    var total    = section.offsetHeight - window.innerHeight;
    var progress = total > 0 ? Math.min(1, scrolled / total) : 0;
    activate(Math.min(n - 1, Math.floor(progress * n)));
    if (hint) hint.style.opacity = current > 0 ? '0' : '';
  }

  function onScroll() {
    if (isMobile() || rafPending) return;
    rafPending = true;
    requestAnimationFrame(function () {
      updateDesktop();
      rafPending = false;
    });
  }

  // Init
  if (isMobile()) {
    setupMobile();
    activate(0);
  } else {
    setupDesktop();
    updateDesktop();
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  window.addEventListener('resize', function () {
    rafPending = false;
    if (isMobile()) {
      setupMobile();
      if (current < 0) activate(0);
    } else {
      setupDesktop();
      updateDesktop();
    }
  });
})();

// ─── WaveformPlayer / WaveformBar ────────────────────────────────────────────
if (typeof WaveformPlayer !== 'undefined') {
  WaveformPlayer.init();
}
if (typeof WaveformBar !== 'undefined') {
  WaveformBar.init();
}
