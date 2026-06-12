(function () {
  if (!document.querySelector('.ambient')) {
    var wrap = document.createElement('div');
    wrap.className = 'ambient';
    wrap.setAttribute('aria-hidden', 'true');
    wrap.innerHTML =
      '<div class="ambient-orb ambient-orb--a"></div>' +
      '<div class="ambient-orb ambient-orb--b"></div>' +
      '<div class="ambient-orb ambient-orb--c"></div>';
    document.body.insertBefore(wrap, document.body.firstChild);
  }

  var nav = document.getElementById('mainNav') || document.querySelector('.site-nav') || document.querySelector('nav');
  if (nav) {
    nav.classList.add('scrolled');
    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.scrollY > 8);
    }, { passive: true });
  }

  if (!document.querySelector('script[src*="scroll-motion"]')) {
    var s = document.createElement('script');
    s.src = 'js/scroll-motion.js';
    s.defer = true;
    document.body.appendChild(s);
  }
})();
