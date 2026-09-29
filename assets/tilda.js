(function () {
  var d = document, b = d.body, rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  b.classList.remove('js-off');
  if (d.querySelector('.hero__logo, .hero__mark')) b.classList.add('has-hero-logo');
  requestAnimationFrame(function () { requestAnimationFrame(function () { b.classList.add('is-ready'); }); });

  // шапка
  var hdr = d.getElementById('hdr');
  var onScroll = function () { hdr && hdr.classList.toggle('is-scrolled', scrollY > 30); };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // появление один раз
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  d.querySelectorAll('[data-reveal]').forEach(function (el) { io.observe(el); });

  // заявление проявляется словами по ходу прокрутки
  d.querySelectorAll('[data-words]').forEach(function (p) {
    var words = p.textContent.trim().split(/\s+/);
    p.innerHTML = words.map(function (w) { return '<span class="w">' + w + '</span>'; }).join(' ');
    var spans = p.querySelectorAll('.w');
    if (rm) { spans.forEach(function (s) { s.classList.add('on'); }); return; }
    var live = false, tick = function () {
      var r = p.getBoundingClientRect(), vh = innerHeight;
      var prog = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
      var n = Math.round(prog * spans.length);
      spans.forEach(function (s, i) { s.classList.toggle('on', i < n); });
      if (live) requestAnimationFrame(tick);
    };
    new IntersectionObserver(function (es) { live = es[0].isIntersecting; if (live) tick(); }).observe(p);
  });

  // подбор услуги → готовое сообщение
  d.querySelectorAll('[data-picker]').forEach(function (f) {
    var out = f.querySelector('[data-out]'), send = f.querySelector('[data-send]');
    var build = function () {
      var parts = [];
      f.querySelectorAll('input:checked').forEach(function (i) { parts.push(i.value); });
      var msg = (f.dataset.greet || 'Здравствуйте! Хочу записаться') + ': ' + parts.join(', ') + '.';
      out.textContent = msg;
      if (send) send.href = f.dataset.tg ? ('https://t.me/' + f.dataset.tg) : ('https://wa.me/' + f.dataset.wa + '?text=' + encodeURIComponent(msg));
    };
    f.addEventListener('change', build); build();
  });

  // вопросы
  d.querySelectorAll('.qa__q').forEach(function (q) {
    q.addEventListener('click', function () {
      var qa = q.parentElement, open = !qa.classList.contains('is-open');
      qa.classList.toggle('is-open', open); q.setAttribute('aria-expanded', open);
    });
  });

  // огромное название в подвале: подогнать по ширине
  var fit = function () { d.querySelectorAll('.ftr__word').forEach(function (w) { w.style.fontSize = ''; var r = w.clientWidth / w.scrollWidth; if (r < 1) w.style.fontSize = (parseFloat(getComputedStyle(w).fontSize) * r * 0.97) + 'px'; }); };
  fit(); addEventListener('resize', fit); if (d.fonts && d.fonts.ready) d.fonts.ready.then(fit);

  // липкая панель на телефоне: после первого экрана; прячется, пока на экране видна кнопка с заливкой из текста страницы
  // (цены, подбор, финал), чтобы заливка на экране была одна.
  var bar = d.getElementById('mbar'), hero = d.querySelector('.hero');
  if (bar && hero) {
    var past = false, near = [];
    var sync = function () {
      var on = past && !near.length; bar.classList.toggle('is-on', on); bar.setAttribute('aria-hidden', !on); b.classList.toggle('mbar-on', past); b.classList.toggle('cta-near', near.length > 0);
      var a = bar.querySelector('a'); if (a) a.tabIndex = on ? 0 : -1;
    };
    new IntersectionObserver(function (es) { past = !es[0].isIntersecting; sync(); }, { threshold: 0.05 }).observe(hero);
    var own = new IntersectionObserver(function (es) {
      es.forEach(function (e) { var i = near.indexOf(e.target); if (e.isIntersecting && i < 0) near.push(e.target); if (!e.isIntersecting && i > -1) near.splice(i, 1); });
      sync();
    }, { threshold: 0 });
    d.querySelectorAll('main .btn--primary').forEach(function (el) { own.observe(el); });
  }
})();
