/* ═══════════════════════════════════════════════════════════════
   ORDRPE FX — Gamification, animation & micro-interaction system
   Shared between index.html and instock.html
═══════════════════════════════════════════════════════════════ */
(function () {
  const FX = window.FX = window.FX || {};
  const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isPhone = () => window.matchMedia('(max-width: 768px)').matches;

  /* ── Storage helpers ─────────────────────────────────────── */
  function ls(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (_) { return d; } }
  function lss(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} }

  FX.ls = ls; FX.lss = lss;

  /* Modals: instant close / clean open (avoids stuck opacity + keeps fixed overlays reliable) */
  function fxModalClose(bg) {
    if (!bg) return;
    bg.classList.remove('is-closing', 'open');
    bg.style.removeProperty('opacity');
    document.body.style.overflow = '';
  }
  function fxModalOpenPrep(bg) {
    if (!bg) return;
    bg.classList.remove('is-closing');
    bg.style.removeProperty('opacity');
  }

  /* ── Haptic feedback (light vibrations on phone) ─────────── */
  FX.haptic = function (type) {
    if (!('vibrate' in navigator)) return;
    if (type === 'success') navigator.vibrate([14, 36, 14]);
    else if (type === 'error') navigator.vibrate([40, 30, 40]);
    else navigator.vibrate(12);
  };

  /* ── Confetti burst (used everywhere) ────────────────────── */
  FX.confetti = function (originEl, opts) {
    if (reduceMotion()) return;
    opts = opts || {};
    const count = opts.count || 32;
    const colors = opts.colors || ['#c8a97a', '#d4af7a', '#f0e3d0', '#11100e', '#25d366', '#fff'];
    let cx, cy;
    if (originEl && originEl.getBoundingClientRect) {
      const r = originEl.getBoundingClientRect();
      cx = r.left + r.width / 2; cy = r.top + r.height / 2;
    } else if (originEl && originEl.x != null) {
      cx = originEl.x; cy = originEl.y;
    } else {
      cx = window.innerWidth / 2; cy = window.innerHeight / 3;
    }
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('div');
      dot.className = 'fx-confetti-dot';
      const c = colors[Math.floor(Math.random() * colors.length)];
      const size = 5 + Math.random() * 7;
      dot.style.background = c;
      dot.style.width = size + 'px';
      dot.style.height = size * (0.7 + Math.random() * 0.6) + 'px';
      dot.style.left = cx + 'px';
      dot.style.top = cy + 'px';
      const angle = Math.random() * Math.PI * 2;
      const dist = 90 + Math.random() * (opts.spread || 240);
      const dx = Math.cos(angle) * dist + (Math.random() - 0.5) * 60;
      const dy = Math.sin(angle) * dist - 80 - Math.random() * 80; // bias up
      dot.style.setProperty('--fx-dx', dx + 'px');
      dot.style.setProperty('--fx-dy', dy + 'px');
      dot.style.animation = `fxConfetti ${900 + Math.random() * 700}ms cubic-bezier(0.22,0.61,0.36,1) forwards`;
      document.body.appendChild(dot);
      setTimeout(() => dot.remove(), 1700);
    }
  };

  /* ── Scroll progress bar ─────────────────────────────────── */
  FX.initScrollProgress = function () {
    if (document.querySelector('.fx-scroll-progress')) return;
    const bar = document.createElement('div');
    bar.className = 'fx-scroll-progress';
    document.body.appendChild(bar);
    const update = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      if (max <= 0) return;
      const pct = Math.min(100, Math.max(0, (window.scrollY / max) * 100));
      bar.style.width = pct + '%';
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  };

  /* ── Live order ticker ───────────────────────────────────── */
  const NAMES = ['Sara', 'Ayesha', 'Hira', 'Maryam', 'Fatima', 'Zara', 'Aiman', 'Mahnoor', 'Iqra', 'Hadia', 'Ali', 'Hamza', 'Bilal', 'Saad', 'Usman', 'Anum', 'Rabia', 'Sana', 'Komal', 'Mehak'];
  const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Peshawar', 'Multan', 'Faisalabad', 'Hyderabad', 'Quetta', 'Sialkot'];
  const ITEMS = [
    'Fenty Gloss Bomb', 'Sol de Janeiro Mist Set', 'Huda Beauty Palette',
    'MK Jet Set Tote', 'Tory Burch Ballet Flats', 'Sephora 7-Fragrance Set',
    'Tommy Hilfiger Slides', 'e.l.f. Mascara', 'Ardell Lashes',
    'Alo Yoga Sneakers', 'ONE/SIZE Setting Spray', 'KISS Press-Ons'
  ];
  const TIME_AGO = ['just now', '2 min ago', '5 min ago', '8 min ago', '12 min ago', '15 min ago', '23 min ago', '34 min ago'];

  FX.startOrderTicker = function () {
    if (document.querySelector('.fx-order-ticker')) return;
    const el = document.createElement('div');
    el.className = 'fx-order-ticker';
    el.innerHTML = `
      <button class="ticker-close" aria-label="Close">×</button>
      <span class="ticker-pulse"></span>
      <div>
        <div class="ticker-line"><span class="ticker-name"></span><span class="ticker-rest"></span></div>
        <div class="ticker-time"></div>
      </div>`;
    document.body.appendChild(el);
    let dismissed = false;
    el.querySelector('.ticker-close').addEventListener('click', () => {
      dismissed = true; el.classList.remove('show');
    });
    function pick() {
      const n = NAMES[Math.floor(Math.random() * NAMES.length)];
      const c = CITIES[Math.floor(Math.random() * CITIES.length)];
      const it = ITEMS[Math.floor(Math.random() * ITEMS.length)];
      const t = TIME_AGO[Math.floor(Math.random() * TIME_AGO.length)];
      el.querySelector('.ticker-name').textContent = n;
      el.querySelector('.ticker-rest').textContent = ` from ${c} ordered ${it}`;
      el.querySelector('.ticker-time').textContent = t;
    }
    function show() {
      if (dismissed) return;
      pick();
      el.classList.add('show');
      setTimeout(() => el.classList.remove('show'), 5400);
    }
    setTimeout(show, 6500);
    setInterval(show, 24000);
  };

  /* ── Counter-up on scroll ────────────────────────────────── */
  FX.initCounters = function () {
    const els = document.querySelectorAll('.fx-counter');
    if (!els.length || !('IntersectionObserver' in window)) {
      els.forEach(el => { el.textContent = el.dataset.target || el.textContent; });
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        if (el.dataset.counted) return;
        el.dataset.counted = '1';
        const target = parseInt(el.dataset.target || el.textContent.replace(/\D/g, ''), 10) || 0;
        const dur = 1400; const start = performance.now();
        function tick(now) {
          const t = Math.min(1, (now - start) / dur);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = Math.round(target * eased).toLocaleString();
          if (t < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        io.unobserve(el);
      });
    }, { threshold: 0.4 });
    els.forEach(el => io.observe(el));
  };

  /* ── Magnetic button (cursor follow on desktop only) ─────── */
  FX.makeMagnetic = function (sel) {
    if (isPhone() || reduceMotion()) return;
    document.querySelectorAll(sel).forEach(el => {
      el.classList.add('fx-magnetic');
      const r = 90; // pull radius
      el.addEventListener('mousemove', (e) => {
        const b = el.getBoundingClientRect();
        const x = e.clientX - (b.left + b.width / 2);
        const y = e.clientY - (b.top + b.height / 2);
        const d = Math.sqrt(x * x + y * y);
        if (d < r * 1.5) {
          el.style.transform = `translate(${x * 0.22}px, ${y * 0.22}px)`;
        }
      });
      el.addEventListener('mouseleave', () => { el.style.transform = 'translate(0,0)'; });
    });
  };

  /* ── 3D tilt (cards) ─────────────────────────────────────── */
  FX.tilt = function (sel, opts) {
    if (isPhone() || reduceMotion()) return;
    const max = (opts && opts.max) || 6;
    document.querySelectorAll(sel).forEach(el => {
      if (el.dataset.tilted) return;
      el.dataset.tilted = '1';
      el.classList.add('fx-tilt');
      el.addEventListener('mousemove', (e) => {
        const b = el.getBoundingClientRect();
        const x = (e.clientX - b.left) / b.width - 0.5;
        const y = (e.clientY - b.top) / b.height - 0.5;
        el.style.transform = `perspective(900px) rotateY(${x * max}deg) rotateX(${-y * max}deg) translateY(-3px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  };

  /* ── Typewriter rotating text ────────────────────────────── */
  FX.typewriter = function (el, phrases, opts) {
    if (!el || !phrases || !phrases.length) return;
    if (reduceMotion()) { el.textContent = phrases[0]; return; }
    opts = opts || {};
    const typeMs = opts.typeMs || 70;
    const eraseMs = opts.eraseMs || 38;
    const holdMs = opts.holdMs || 1700;
    const initialDelay = opts.initialDelay || 0;
    el.classList.add('fx-typewriter');
    let pi = 0, ci = 0, erasing = false;
    if (el.textContent === phrases[0]) {
      ci = phrases[0].length; erasing = true;
    }
    function step() {
      const phrase = phrases[pi];
      if (!erasing) {
        ci++;
        el.textContent = phrase.slice(0, ci);
        if (ci >= phrase.length) { erasing = true; setTimeout(step, holdMs); return; }
        setTimeout(step, typeMs + Math.random() * 24);
      } else {
        ci--;
        el.textContent = phrase.slice(0, ci);
        if (ci <= 0) { erasing = false; pi = (pi + 1) % phrases.length; setTimeout(step, 280); return; }
        setTimeout(step, eraseMs);
      }
    }
    setTimeout(() => {
      if (erasing && ci === phrases[0].length) setTimeout(step, holdMs);
      else step();
    }, initialDelay);
  };

  /* ── Spin-to-Win wheel (locked, 1× per 7 days, gated by WhatsApp) ── */
  const SPIN_PRIZES = [
    { label: '5% OFF',    code: 'SPIN5',   sub: 'Use on next order' },
    { label: 'FREE GIFT', code: 'GIFT01',  sub: 'Mystery sample with order' },
    { label: '10% OFF',   code: 'SPIN10',  sub: 'Use on next order' },
    { label: 'TRY AGAIN', code: null,      sub: 'Better luck next time' },
    { label: '15% OFF',   code: 'SPIN15',  sub: 'Use on next order' },
    { label: 'FREE SHIP', code: 'FREESHIP', sub: 'On your next order' }
  ];
  FX.canSpin = function () {
    const last = ls('fx_spin_last', 0);
    return Date.now() - last > 7 * 24 * 60 * 60 * 1000;
  };
  FX.openSpin = function () {
    let bg = document.getElementById('fxSpinBg');
    if (!bg) {
      bg = document.createElement('div');
      bg.id = 'fxSpinBg'; bg.className = 'fx-spin-bg';
      bg.innerHTML = `
        <div class="fx-spin-box" onclick="event.stopPropagation()">
          <button class="fx-spin-close" onclick="FX.closeSpin()">×</button>
          <div class="fx-spin-eye">Spin to Win</div>
          <div class="fx-spin-title">Your <em>luck</em> awaits.</div>
          <div class="fx-spin-sub">One spin. One prize. Locked behind your WhatsApp number.</div>
          <div class="fx-wheel-wrap">
            <div class="fx-wheel-pointer"></div>
            <div class="fx-wheel" id="fxWheel"></div>
            <div class="fx-wheel-hub">SPIN</div>
          </div>
          <input class="fx-spin-input" id="fxSpinPhone" type="tel" placeholder="Your WhatsApp number (e.g. 03XX XXXXXXX)" maxlength="15">
          <button class="fx-spin-btn" id="fxSpinGo" onclick="FX.doSpin()">Spin Now</button>
          <div class="fx-spin-result" id="fxSpinResult"></div>
        </div>`;
      bg.addEventListener('click', () => FX.closeSpin());
      document.body.appendChild(bg);
      // Position labels
      const wheel = bg.querySelector('#fxWheel');
      const seg = 360 / SPIN_PRIZES.length;
      SPIN_PRIZES.forEach((p, i) => {
        const lab = document.createElement('div');
        const dark = i === 2 || i === 5;
        lab.className = 'fx-wheel-label' + (dark ? ' dark-text' : '');
        lab.textContent = p.label;
        const angle = i * seg + seg / 2 - 90;
        lab.style.transform = `rotate(${angle}deg) translate(86px) rotate(90deg)`;
        wheel.appendChild(lab);
      });
    }
    fxModalOpenPrep(bg);
    bg.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  FX.closeSpin = function () { fxModalClose(document.getElementById('fxSpinBg')); };
  FX.doSpin = function () {
    const phoneEl = document.getElementById('fxSpinPhone');
    const phone = (phoneEl.value || '').replace(/\D/g, '');
    if (phone.length < 10) {
      phoneEl.style.borderColor = '#ff4458';
      phoneEl.placeholder = 'Please enter a valid number';
      FX.haptic('error');
      return;
    }
    const btn = document.getElementById('fxSpinGo');
    btn.disabled = true; btn.textContent = 'Spinning…';
    const wheel = document.getElementById('fxWheel');
    const idx = Math.floor(Math.random() * SPIN_PRIZES.length);
    const seg = 360 / SPIN_PRIZES.length;
    const target = 360 * 6 + (360 - (idx * seg + seg / 2));
    wheel.style.transform = `rotate(${target}deg)`;
    setTimeout(() => {
      const prize = SPIN_PRIZES[idx];
      const out = document.getElementById('fxSpinResult');
      out.innerHTML = prize.code
        ? `<div class="fx-spin-result-prize">You won ${prize.label}!</div>
           <div style="font-size:13px;color:rgba(247,245,239,0.8);margin-bottom:6px">${prize.sub}</div>
           <div class="fx-spin-code" onclick="FX.copyCode(this,'${prize.code}')">CODE: ${prize.code} • tap to copy</div>`
        : `<div class="fx-spin-result-prize">${prize.label}</div>
           <div style="font-size:13px;color:rgba(247,245,239,0.8)">${prize.sub}</div>`;
      out.classList.add('show');
      lss('fx_spin_last', Date.now());
      lss('fx_spin_prize', { idx, ts: Date.now(), code: prize.code });
      FX.confetti(out);
      FX.haptic('success');
      btn.style.display = 'none';
    }, 5300);
  };
  FX.copyCode = function (el, code) {
    navigator.clipboard?.writeText(code).then(() => {
      const orig = el.textContent;
      el.textContent = '✓ Copied!';
      setTimeout(() => { el.textContent = orig; }, 1500);
    });
  };

  /* ── Mystery box (daily) ─────────────────────────────────── */
  const MYSTERY_PRIZES = [
    { emoji: '🎁', title: 'Free Gift', prize: 'A surprise sample with your next order over PKR 5,000.' },
    { emoji: '🎀', title: '5% OFF', prize: 'Code: BOX5 — apply at checkout.' },
    { emoji: '✨', title: '10% OFF', prize: 'Code: BOX10 — apply at checkout.' },
    { emoji: '💎', title: 'Free Delivery', prize: 'Code: BOXSHIP — free express delivery.' },
    { emoji: '🌹', title: 'Priority Service', prize: 'Your next order ships first — code: VIP1.' }
  ];
  FX.openMysteryBox = function () {
    const today = new Date().toISOString().slice(0, 10);
    const last = ls('fx_box_last', '');
    const stored = ls('fx_box_today', null);
    let prize;
    if (last === today && stored) {
      prize = stored;
    } else {
      prize = MYSTERY_PRIZES[Math.floor(Math.random() * MYSTERY_PRIZES.length)];
      lss('fx_box_last', today);
      lss('fx_box_today', prize);
    }
    let bg = document.getElementById('fxMysteryBg');
    if (!bg) {
      bg = document.createElement('div');
      bg.id = 'fxMysteryBg'; bg.className = 'fx-mystery-bg';
      bg.innerHTML = `<div class="fx-reveal-box" onclick="event.stopPropagation()">
        <button class="fx-spin-close" onclick="FX.closeMysteryBox()">×</button>
        <div class="fx-reveal-emoji" id="fxRevealEmoji"></div>
        <div class="fx-reveal-title" id="fxRevealTitle"></div>
        <div class="fx-reveal-prize" id="fxRevealPrize"></div>
        <button class="fx-quiz-result-cta" onclick="FX.closeMysteryBox()">Awesome!</button>
      </div>`;
      bg.addEventListener('click', () => FX.closeMysteryBox());
      document.body.appendChild(bg);
    }
    document.getElementById('fxRevealEmoji').textContent = prize.emoji;
    document.getElementById('fxRevealTitle').innerHTML = `Today: <em>${prize.title}</em>`;
    document.getElementById('fxRevealPrize').textContent = prize.prize;
    fxModalOpenPrep(bg);
    bg.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => FX.confetti(bg.querySelector('.fx-reveal-emoji')), 220);
    FX.haptic('success');
  };
  FX.closeMysteryBox = function () { fxModalClose(document.getElementById('fxMysteryBg')); };

  /* ── Streak meter ────────────────────────────────────────── */
  FX.trackStreak = function () {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const data = ls('fx_streak', { last: '', count: 0 });
    if (data.last === today) { /* same day, nothing */ }
    else if (data.last === yesterday) { data.count++; data.last = today; }
    else { data.count = 1; data.last = today; }
    lss('fx_streak', data);
    if (data.count < 2) return; // only show when streak is real
    let pill = document.querySelector('.fx-streak-pill');
    if (!pill) {
      pill = document.createElement('div');
      pill.className = 'fx-streak-pill';
      document.body.appendChild(pill);
    }
    pill.innerHTML = `<span class="flame">🔥</span> ${data.count}-day streak`;
    setTimeout(() => pill.classList.add('show'), 1400);
    setTimeout(() => pill.classList.remove('show'), 8000);
    if (data.count === 3 || data.count === 7 || data.count === 14) {
      // unlock something
      const reward = data.count === 3 ? '5% OFF (STREAK5)' : data.count === 7 ? '10% OFF (STREAK10)' : '15% OFF (STREAK15)';
      setTimeout(() => FX.toast(`🔥 ${data.count}-day streak unlocked: ${reward}`), 2400);
    }
  };

  /* ── Tier system ─────────────────────────────────────────── */
  FX.tierFor = function (lifetimePkr) {
    if (lifetimePkr >= 100000) return { id: 'platinum', label: 'Platinum' };
    if (lifetimePkr >= 50000)  return { id: 'gold',     label: 'Gold' };
    if (lifetimePkr >= 20000)  return { id: 'silver',   label: 'Silver' };
    return { id: 'bronze', label: 'Bronze' };
  };
  FX.applyTierBadge = function () {
    const total = (window.cart || []).reduce((s, c) => s + c.p.pkr * c.qty, 0);
    const lifetime = ls('fx_lifetime', 0) + total;
    const tier = FX.tierFor(lifetime);
    document.querySelectorAll('.fx-tier-slot').forEach(slot => {
      const last = slot.dataset.tier || '';
      slot.innerHTML = `<span class="fx-tier-badge tier-${tier.id}">${tier.label}</span>`;
      if (last && last !== tier.id) {
        slot.querySelector('.fx-tier-badge').classList.add('upgraded');
        FX.toast(`✦ Tier upgraded to ${tier.label}!`);
        FX.confetti(slot);
      }
      slot.dataset.tier = tier.id;
    });
  };

  /* ── Tiny toast helper ───────────────────────────────────── */
  FX.toast = function (msg, ms) {
    let t = document.getElementById('fxToast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'fxToast';
      t.style.cssText = 'position:fixed;left:50%;top:24px;transform:translate(-50%,-22px);background:#11100e;color:#f7f5ef;padding:11px 18px;border-radius:100px;font:700 12.5px/1.2 "DM Sans",sans-serif;letter-spacing:0.4px;z-index:9990;opacity:0;transition:transform .4s cubic-bezier(.22,1,.36,1),opacity .35s;box-shadow:0 14px 32px rgba(0,0,0,0.32);max-width:88vw;text-align:center';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    requestAnimationFrame(() => { t.style.transform = 'translate(-50%,0)'; t.style.opacity = '1'; });
    clearTimeout(t._h);
    t._h = setTimeout(() => { t.style.transform = 'translate(-50%,-22px)'; t.style.opacity = '0'; }, ms || 3400);
  };

  /* ── Scratch card (canvas-based) ─────────────────────────── */
  const SCRATCH_PRIZES = [
    { amt: '5% OFF', code: 'SCRATCH5', sub: 'On your current cart' },
    { amt: '8% OFF', code: 'SCRATCH8', sub: 'On your current cart' },
    { amt: 'Free Gift', code: 'SCRATCHGIFT', sub: 'Surprise sample added' },
    { amt: '10% OFF', code: 'SCRATCH10', sub: 'On your current cart' }
  ];
  FX.showScratchCard = function () {
    if (ls('fx_scratch_used', false)) return;
    const prize = SCRATCH_PRIZES[Math.floor(Math.random() * SCRATCH_PRIZES.length)];
    let bg = document.getElementById('fxScratchBg');
    if (!bg) {
      bg = document.createElement('div');
      bg.id = 'fxScratchBg'; bg.className = 'fx-scratch-bg';
      bg.innerHTML = `<div class="fx-scratch-box" onclick="event.stopPropagation()">
        <button class="fx-spin-close" onclick="FX.closeScratch()">×</button>
        <div class="fx-scratch-eye">Scratch & Win</div>
        <div class="fx-scratch-title">A little gift for adding to cart.</div>
        <div class="fx-scratch-sub">Scratch the gold below to reveal your prize.</div>
        <div class="fx-scratch-area" id="fxScratchArea">
          <div class="fx-scratch-prize-layer">
            <div class="scratch-prize-amt" id="fxScratchAmt"></div>
            <div class="scratch-prize-sub" id="fxScratchSub"></div>
          </div>
          <canvas class="fx-scratch-canvas" id="fxScratchCanvas"></canvas>
        </div>
        <div class="fx-scratch-tip">Drag your finger or mouse over the gold layer.</div>
      </div>`;
      bg.addEventListener('click', () => FX.closeScratch());
      document.body.appendChild(bg);
    }
    document.getElementById('fxScratchAmt').textContent = prize.amt;
    document.getElementById('fxScratchSub').textContent = (prize.code ? prize.code + ' • ' : '') + prize.sub;
    fxModalOpenPrep(bg);
    bg.classList.add('open');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => initScratchCanvas(prize));
  };
  FX.closeScratch = function () { fxModalClose(document.getElementById('fxScratchBg')); };
  function initScratchCanvas(prize) {
    const canvas = document.getElementById('fxScratchCanvas');
    const area = document.getElementById('fxScratchArea');
    if (!canvas || !area) return;
    const dpr = window.devicePixelRatio || 1;
    const r = area.getBoundingClientRect();
    canvas.width = r.width * dpr; canvas.height = r.height * dpr;
    canvas.style.width = r.width + 'px'; canvas.style.height = r.height + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    const grad = ctx.createLinearGradient(0, 0, r.width, r.height);
    grad.addColorStop(0, '#c8a97a'); grad.addColorStop(0.5, '#e6cba0'); grad.addColorStop(1, '#a8895a');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, r.width, r.height);
    ctx.fillStyle = 'rgba(17,16,14,0.36)';
    ctx.font = '600 14px "DM Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SCRATCH HERE', r.width / 2, r.height / 2 + 5);
    ctx.globalCompositeOperation = 'destination-out';
    let drawing = false;
    let revealed = 0;
    let revealedFired = false;
    const trackReveal = () => {
      try {
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let cleared = 0; const total = data.length / 4;
        for (let i = 3; i < data.length; i += 4 * 40) {
          if (data[i] === 0) cleared++;
        }
        revealed = cleared / (total / 40);
        if (revealed > 0.45 && !revealedFired) {
          revealedFired = true;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          FX.confetti(area);
          FX.haptic('success');
          lss('fx_scratch_used', true);
          lss('fx_scratch_prize', prize);
        }
      } catch (_) {}
    };
    const pos = (e) => {
      const t = e.touches ? e.touches[0] : e;
      const b = canvas.getBoundingClientRect();
      return { x: t.clientX - b.left, y: t.clientY - b.top };
    };
    const draw = (p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 24, 0, Math.PI * 2);
      ctx.fill();
    };
    const start = (e) => { drawing = true; draw(pos(e)); e.preventDefault(); };
    const move = (e) => { if (!drawing) return; draw(pos(e)); trackReveal(); e.preventDefault(); };
    const end = () => { drawing = false; };
    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
    canvas.addEventListener('touchstart', start, { passive: false });
    canvas.addEventListener('touchmove', move, { passive: false });
    canvas.addEventListener('touchend', end);
  }

  /* ── Style quiz ──────────────────────────────────────────── */
  const QUIZ = [
    {
      q: "What's your vibe today?",
      opts: [
        { e: '✨', t: 'Glam',     v: 'glam' },
        { e: '🌿', t: 'Natural',  v: 'natural' },
        { e: '🌹', t: 'Romantic', v: 'romantic' },
        { e: '🖤', t: 'Edgy',     v: 'edgy' }
      ]
    },
    {
      q: "Pick an occasion.",
      opts: [
        { e: '💼', t: 'Office',     v: 'office' },
        { e: '🌙', t: 'Date Night', v: 'datenight' },
        { e: '☀️', t: 'Brunch',     v: 'brunch' },
        { e: '🎉', t: 'Wedding',    v: 'wedding' }
      ]
    },
    {
      q: "What's your budget?",
      opts: [
        { e: '🥉', t: 'Under PKR 5K',  v: 'lo' },
        { e: '🥈', t: 'PKR 5K – 15K',  v: 'mid' },
        { e: '🥇', t: 'PKR 15K – 50K', v: 'hi' },
        { e: '💎', t: 'Sky\'s the limit', v: 'lux' }
      ]
    },
    {
      q: "Top of your wish list?",
      opts: [
        { e: '💄', t: 'Makeup',    v: 'makeup' },
        { e: '🌸', t: 'Fragrance', v: 'fragrance' },
        { e: '👜', t: 'Bags',      v: 'bags' },
        { e: '👠', t: 'Shoes',     v: 'shoes' }
      ]
    }
  ];
  FX.openQuiz = function () {
    let bg = document.getElementById('fxQuizBg');
    if (!bg) {
      bg = document.createElement('div');
      bg.id = 'fxQuizBg'; bg.className = 'fx-quiz-bg';
      bg.innerHTML = `<div class="fx-quiz-box">
        <button class="fx-quiz-close" type="button" aria-label="Close quiz">×</button>
        <div class="fx-quiz-progress"><div class="fx-quiz-progress-fill" id="fxQuizFill"></div></div>
        <div id="fxQuizSteps"></div>
      </div>`;
      // Backdrop click closes — but only if click is directly on bg (not bubbled from box)
      bg.addEventListener('click', (e) => {
        if (e.target === bg) FX.closeQuiz();
      });
      const closeBtn = bg.querySelector('.fx-quiz-close');
      closeBtn.addEventListener('click', (e) => { e.stopPropagation(); FX.closeQuiz(); });
      document.body.appendChild(bg);
      const box = bg.querySelector('.fx-quiz-box');
      const steps = bg.querySelector('#fxQuizSteps');
      QUIZ.forEach((s, i) => {
        const div = document.createElement('div');
        div.className = 'fx-quiz-step' + (i === 0 ? ' active' : '');
        div.dataset.step = i;
        div.innerHTML = `
          <div class="fx-quiz-eye">Question ${i + 1} of ${QUIZ.length}</div>
          <div class="fx-quiz-q">${s.q}</div>
          <div class="fx-quiz-options">
            ${s.opts.map(o => `<button type="button" class="fx-quiz-opt" data-v="${o.v}">
              <span class="fx-quiz-opt-emoji">${o.e}</span>${o.t}
            </button>`).join('')}
          </div>`;
        steps.appendChild(div);
      });
      const result = document.createElement('div');
      result.className = 'fx-quiz-result';
      result.id = 'fxQuizResult';
      steps.appendChild(result);
      // Delegate option clicks on the box itself — bg-level was getting blocked
      box.addEventListener('click', (e) => {
        const opt = e.target.closest('.fx-quiz-opt');
        if (!opt) return;
        e.stopPropagation();
        const step = opt.closest('.fx-quiz-step');
        if (!step) return;
        const idx = parseInt(step.dataset.step, 10);
        bg._answers = bg._answers || [];
        bg._answers[idx] = opt.dataset.v;
        step.classList.remove('active');
        const nextIdx = idx + 1;
        const fill = document.getElementById('fxQuizFill');
        fill.style.width = ((nextIdx) / QUIZ.length * 100) + '%';
        FX.haptic();
        if (nextIdx >= QUIZ.length) {
          finishQuiz(bg._answers);
        } else if (steps.children[nextIdx]) {
          steps.children[nextIdx].classList.add('active');
        }
      });
    }
    bg._answers = [];
    Array.from(bg.querySelectorAll('.fx-quiz-step')).forEach((s, i) => {
      s.classList.toggle('active', i === 0);
    });
    const resultEl = document.getElementById('fxQuizResult');
    if (resultEl) resultEl.classList.remove('active');
    const fillEl = document.getElementById('fxQuizFill');
    if (fillEl) fillEl.style.width = '0%';
    fxModalOpenPrep(bg);
    bg.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  FX.closeQuiz = function () { fxModalClose(document.getElementById('fxQuizBg')); };
  function finishQuiz(answers) {
    const result = document.getElementById('fxQuizResult');
    const cat = answers[3] || 'all';
    const url = `instock.html?cat=${cat}`;
    const styleMap = {
      glam: 'Glamorous', natural: 'Effortless', romantic: 'Romantic', edgy: 'Bold'
    };
    const stylish = styleMap[answers[0]] || 'Stylish';
    result.innerHTML = `
      <div class="fx-quiz-eye">Your Edit</div>
      <div class="fx-quiz-q" style="margin-bottom:6px;">You're a <em>${stylish}</em> shopper.</div>
      <div style="font-size:13px;color:#5b5349;line-height:1.5;margin-bottom:14px">
        Based on your answers, we've curated a ${cat} edit just for you.
      </div>
      <a href="${url}" class="fx-quiz-result-cta" data-no-transition="false">See My Edit →</a>
      <div style="font-size:11px;color:#8a7f72;margin-top:10px">Bonus: use code <strong>QUIZ7</strong> for 7% off your first edit.</div>`;
    result.classList.add('active');
    FX.confetti(result);
    FX.haptic('success');
    lss('fx_quiz_done', { answers, ts: Date.now() });
  }

  /* ── Triple-tap logo easter egg ──────────────────────────── */
  FX.bindTripleTap = function (sel) {
    const el = document.querySelector(sel);
    if (!el) return;
    let count = 0; let timer = null;
    el.addEventListener('click', (e) => {
      count++;
      clearTimeout(timer);
      timer = setTimeout(() => { count = 0; }, 600);
      if (count >= 3) {
        e.preventDefault();
        count = 0;
        if (ls('fx_triple_used', false)) {
          FX.toast('You already unlocked this Easter egg ✦');
          return;
        }
        lss('fx_triple_used', true);
        FX.toast('🎁 Easter egg unlocked: 5% off → code TAP5');
        FX.confetti(el, { count: 50, spread: 320 });
        FX.haptic('success');
      }
    });
  };

  /* ── Stay-on-category 60s reward ─────────────────────────── */
  FX.startDwellReward = function (catKey) {
    if (ls('fx_dwell_' + catKey, false)) return;
    const start = Date.now();
    const check = () => {
      if (document.hidden) return;
      if (Date.now() - start > 60000) {
        lss('fx_dwell_' + catKey, true);
        FX.toast(`✦ Browsed ${catKey} for a minute → 5% off code DWELL5`);
        FX.haptic();
        clearInterval(t);
      }
    };
    const t = setInterval(check, 5000);
  };

  /* ── Cart unlock progress (free delivery threshold) ──────── */
  const FREE_SHIP_AT = 5000;
  FX.renderUnlockBar = function () {
    const subtotal = (window.cart || []).reduce((s, c) => s + c.p.pkr * c.qty, 0);
    const remaining = Math.max(0, FREE_SHIP_AT - subtotal);
    const pct = Math.min(100, (subtotal / FREE_SHIP_AT) * 100);
    let bar = document.getElementById('fxUnlockBar');
    const foot = document.getElementById('cartFoot');
    if (!foot) return;
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'fxUnlockBar'; bar.className = 'fx-unlock-bar';
      bar.innerHTML = `
        <div class="fx-unlock-text"><span id="fxUnlockMsg"></span><strong id="fxUnlockAmt"></strong></div>
        <div class="fx-unlock-track"><div class="fx-unlock-fill" id="fxUnlockFill"></div></div>`;
      foot.insertBefore(bar, foot.firstChild);
    }
    bar.classList.toggle('unlocked', remaining === 0);
    document.getElementById('fxUnlockMsg').textContent = remaining === 0
      ? 'You\'ve unlocked free delivery!'
      : 'Free delivery in';
    document.getElementById('fxUnlockAmt').textContent = remaining === 0
      ? '✓ FREE SHIPPING'
      : 'PKR ' + remaining.toLocaleString();
    document.getElementById('fxUnlockFill').style.width = pct + '%';
    // Confetti + toast when crossing the threshold (only once per session crossing)
    const wasUnlocked = bar.dataset.unlocked === '1';
    if (remaining === 0 && !wasUnlocked) {
      bar.dataset.unlocked = '1';
      try { FX.confetti(bar, { count: 44 }); } catch (_) {}
      try { FX.haptic('success'); } catch (_) {}
      try { FX.toast('🎉 Free delivery unlocked!'); } catch (_) {}
    } else if (remaining > 0) {
      bar.dataset.unlocked = '0';
    }
  };

  /* ── "X people viewing" simulator ────────────────────────── */
  FX.attachViewingPills = function () {
    const cards = document.querySelectorAll('.pc');
    cards.forEach((card, idx) => {
      if (card.querySelector('.fx-viewing')) return;
      // Show on a deterministic ~30% of cards
      if ((idx * 7 + 11) % 10 > 3) return;
      const wrap = card.querySelector('.pc-img-wrap');
      if (!wrap) return;
      const pill = document.createElement('div');
      pill.className = 'fx-viewing';
      const n = 3 + ((idx * 13) % 12);
      pill.innerHTML = `<span class="viewing-dot"></span> ${n} viewing`;
      wrap.appendChild(pill);
      setTimeout(() => pill.classList.add('show'), 700 + (idx % 8) * 90);
    });
  };

  /* ── Wishlist hearts ─────────────────────────────────────── */
  FX.attachHearts = function () {
    const cards = document.querySelectorAll('.pc');
    const wishlist = new Set(ls('fx_wishlist', []));
    cards.forEach((card) => {
      if (card.querySelector('.fx-heart')) return;
      const wrap = card.querySelector('.pc-img-wrap');
      if (!wrap) return;
      const name = (card.querySelector('.pc-name') || {}).textContent || '';
      const heart = document.createElement('button');
      heart.type = 'button'; heart.className = 'fx-heart';
      heart.setAttribute('aria-label', 'Add to wishlist');
      heart.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.6-4.6-9.6-9.6C1 7.4 4.4 4 8.2 4c1.6 0 3 .7 3.8 2 .8-1.3 2.2-2 3.8-2 3.8 0 7.2 3.4 5.8 7.4-2 5-9.6 9.6-9.6 9.6z"/></svg>`;
      if (wishlist.has(name)) heart.classList.add('liked');
      heart.addEventListener('click', (e) => {
        e.stopPropagation(); e.preventDefault();
        const liked = heart.classList.toggle('liked');
        if (liked) {
          wishlist.add(name);
          FX.confetti(heart, { count: 14, colors: ['#ff4458', '#ffafbd', '#fff', '#c8a97a'], spread: 120 });
          FX.haptic('success');
        } else {
          wishlist.delete(name);
        }
        lss('fx_wishlist', Array.from(wishlist));
      });
      wrap.appendChild(heart);
    });
  };

  /* ── Quick-add (+) on cards ──────────────────────────────── */
  FX.attachQuickAdd = function (addCb) {
    const cards = document.querySelectorAll('.pc');
    cards.forEach((card, i) => {
      if (card.querySelector('.fx-quick-add')) return;
      const wrap = card.querySelector('.pc-img-wrap');
      if (!wrap) return;
      const btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'fx-quick-add';
      btn.setAttribute('aria-label', 'Quick add to cart');
      btn.innerHTML = '+';
      btn.addEventListener('click', (e) => {
        e.stopPropagation(); e.preventDefault();
        // Pass null btnEl to addCb so the host's addToCart doesn't overwrite our + symbol
        if (typeof addCb === 'function') addCb(i, null);
        btn.classList.add('added');
        btn.innerHTML = '✓';
        FX.haptic('success');
        // Lock the icon so any external mutation can't replace it during the success window
        const lock = setInterval(() => {
          if (btn.innerHTML !== '✓') btn.innerHTML = '✓';
        }, 80);
        setTimeout(() => {
          clearInterval(lock);
          btn.classList.remove('added'); btn.innerHTML = '+';
        }, 1400);
      });
      wrap.appendChild(btn);
    });
  };

  /* ── Surprise me FAB (random product navigator) ──────────── */
  /* Pick a random product card on instock.html, scroll to it, highlight it */
  FX.surpriseLocal = function () {
    const grid = document.getElementById('grid');
    if (!grid) return false;
    const cards = Array.from(grid.querySelectorAll('.pc')).filter(c => c.offsetParent !== null);
    if (!cards.length) return false;
    const card = cards[Math.floor(Math.random() * cards.length)];
    const titleEl = card.querySelector('.pc-name, .pc-title, h3, h4');
    const name = titleEl ? titleEl.textContent.trim() : 'this pick';
    // Scroll into view (centered)
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // Highlight with glow
    card.classList.add('fx-surprise-glow');
    try { FX.confetti(card, { count: 36 }); } catch (_) {}
    try { FX.haptic('success'); } catch (_) {}
    setTimeout(() => card.classList.remove('fx-surprise-glow'), 2600);
    FX.toast('✨ Surprise! ' + (name.length > 38 ? name.slice(0, 36) + '…' : name));
    return true;
  };

  FX.attachSurprise = function (cats) {
    if (document.querySelector('.fx-surprise')) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'fx-surprise';
    btn.setAttribute('aria-label', 'Surprise me with a random pick');
    btn.innerHTML = '<span class="surprise-emoji">✨</span> Surprise me';
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      try { FX.confetti(btn); } catch (_) {}
      try { FX.haptic('success'); } catch (_) {}
      // If we're on instock with a populated grid, do local surprise (no nav)
      const onInstock = /instock\.html?$/i.test(location.pathname) || document.getElementById('grid');
      if (onInstock && FX.surpriseLocal()) return;
      // Otherwise navigate to instock with a random category and a flag for landing surprise
      const list = (cats && cats.length) ? cats : ['makeup','fragrance','shoes','bags','intimates'];
      const c = list[Math.floor(Math.random() * list.length)];
      try { lss('fx_surprise_pending', 1); } catch (_) {}
      const target = `instock.html?cat=${encodeURIComponent(c)}&surprise=1`;
      setTimeout(() => {
        try { window.location.assign(target); } catch (_) { window.location.href = target; }
      }, 300);
    });
    document.body.appendChild(btn);
  };

  /* Run pending surprise on instock landing (after products render) */
  FX.runPendingSurprise = function () {
    const url = new URL(location.href);
    const flag = url.searchParams.get('surprise');
    const pending = ls('fx_surprise_pending', 0);
    if (!flag && !pending) return;
    lss('fx_surprise_pending', 0);
    let tries = 0;
    const tryRun = () => {
      tries++;
      if (FX.surpriseLocal()) return;
      if (tries < 20) setTimeout(tryRun, 200);
    };
    setTimeout(tryRun, 400);
  };

  /* ── Order success modal ─────────────────────────────────── */
  FX.showOrderSuccess = function (msg) {
    let bg = document.getElementById('fxSuccessBg');
    if (!bg) {
      bg = document.createElement('div');
      bg.id = 'fxSuccessBg'; bg.className = 'fx-success-bg';
      bg.innerHTML = `<div class="fx-success-box" onclick="event.stopPropagation()">
        <div class="fx-check-circle">
          <svg class="fx-check-svg" width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>
        </div>
        <div class="fx-success-title" id="fxSuccessTitle">Order sent!</div>
        <div class="fx-success-sub" id="fxSuccessSub"></div>
        <button class="fx-quiz-result-cta" onclick="FX.closeSuccess()">Continue Shopping</button>
      </div>`;
      bg.addEventListener('click', () => FX.closeSuccess());
      document.body.appendChild(bg);
    }
    document.getElementById('fxSuccessSub').textContent = msg || 'We\'ve received your order on WhatsApp. We\'ll confirm shortly.';
    fxModalOpenPrep(bg);
    bg.classList.add('open');
    setTimeout(() => FX.confetti(bg.querySelector('.fx-check-circle'), { count: 50, spread: 360 }), 250);
    FX.haptic('success');
  };
  FX.closeSuccess = function () { fxModalClose(document.getElementById('fxSuccessBg')); };

  /* ── Liquid blob layer (hero parallax bg) ────────────────── */
  FX.injectBlobs = function (parentSel) {
    const parent = document.querySelector(parentSel);
    if (!parent || parent.querySelector('.fx-blob-layer')) return;
    const layer = document.createElement('div');
    layer.className = 'fx-blob-layer';
    layer.innerHTML = '<div class="fx-blob b1"></div><div class="fx-blob b2"></div><div class="fx-blob b3"></div>';
    parent.style.position = parent.style.position || 'relative';
    parent.insertBefore(layer, parent.firstChild);
  };

  /* ── Theme toggle morph hook ─────────────────────────────── */
  FX.bindThemeMorph = function () {
    ['navTheme', 'navThemeMob'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('click', () => {
        el.classList.add('fx-morphing');
        FX.haptic();
        setTimeout(() => el.classList.remove('fx-morphing'), 700);
      });
    });
  };

  /* ── Init shared FX on every page ────────────────────────── */
  FX.initShared = function () {
    FX.initScrollProgress();
    FX.startOrderTicker();
    FX.trackStreak();
    FX.bindTripleTap('.logo');
    FX.bindThemeMorph();
    if (FX.canSpin() && !ls('fx_spin_dismissed_today', false)) {
      const today = new Date().toISOString().slice(0, 10);
      if (ls('fx_spin_offered', '') !== today) {
        lss('fx_spin_offered', today);
        setTimeout(() => {
          if (!document.querySelector('.fx-spin-bg.open')) {
            FX.openSpin();
          }
        }, 32000);
      }
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    FX.initShared();
    FX.initCounters();
  });
})();
