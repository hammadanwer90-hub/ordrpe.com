(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var hero = document.querySelector('.hero');
  var heroLayer = document.querySelector('.hero-scroll-layer');
  var orbs = {
    a: document.querySelector('.ambient-orb--a'),
    b: document.querySelector('.ambient-orb--b'),
    c: document.querySelector('.ambient-orb--c')
  };
  var scrollEls = Array.prototype.slice.call(document.querySelectorAll('[data-scroll]'));
  var ticking = false;

  if (hero && !heroLayer) {
    heroLayer = document.createElement('div');
    heroLayer.className = 'hero-scroll-layer';
    while (hero.firstChild) {
      if (hero.firstChild.classList && hero.firstChild.classList.contains('hero-scroll')) break;
      heroLayer.appendChild(hero.firstChild);
    }
    hero.insertBefore(heroLayer, hero.firstChild);
  }

  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  function progressInView(rect, viewport) {
    var center = rect.top + rect.height * 0.5;
    var start = viewport * 0.88;
    var end = viewport * 0.12;
    return clamp((start - center) / (start - end), 0, 1);
  }

  function update() {
    ticking = false;
    var scrollY = window.scrollY || window.pageYOffset;
    var vh = window.innerHeight;

    document.documentElement.style.setProperty('--scroll-y', scrollY);

    if (hero) {
      var heroP = clamp(scrollY / (hero.offsetHeight * 0.85), 0, 1);
      document.documentElement.style.setProperty('--hero-p', heroP);
    }

    if (orbs.a) document.documentElement.style.setProperty('--orb-a-y', scrollY * 0.14);
    if (orbs.b) document.documentElement.style.setProperty('--orb-b-y', scrollY * -0.09);
    if (orbs.c) document.documentElement.style.setProperty('--orb-c-y', scrollY * 0.06);

    scrollEls.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.bottom < -80 || rect.top > vh + 80) return;
      var p = progressInView(rect, vh);
      el.style.setProperty('--scroll-progress', p);
    });
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
})();
