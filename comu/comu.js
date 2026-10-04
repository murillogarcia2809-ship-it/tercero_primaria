/* Eines comunes per als jocs de l'Eloi.
   Exposa l'objecte global `Eloi` amb: U (utilitats), sfx (sons), say (veu),
   story (diàlegs), modal, confetti, floatMsg, keypad, choices, spell, quiz, store, topbar. */
(function () {
  'use strict';

  // ---------- Utilitats ----------
  const U = {
    rand: (a, b) => a + Math.floor(Math.random() * (b - a + 1)),
    pick: (a) => a[Math.floor(Math.random() * a.length)],
    shuffle(a) {
      a = a.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },
    sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
    // Separador de milers amb punt, també per a números de 4 xifres (4.382)
    fmt: (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    h(html) {
      const t = document.createElement('template');
      t.innerHTML = html.trim();
      return t.content.firstElementChild;
    },
    stripTags: (s) => String(s).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
    shake(el) {
      if (!el) return;
      el.classList.remove('shake');
      void el.offsetWidth;
      el.classList.add('shake');
    },
  };

  // ---------- Progrés (localStorage) ----------
  const KEY = 'eloi-3r-v1';
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
  }
  function save(d) {
    try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { /* sense emmagatzematge */ }
  }
  const store = {
    get(k, def) { const d = load(); return k in d ? d[k] : def; },
    set(k, v) { const d = load(); d[k] = v; save(d); },
  };

  let soundOn = store.get('so', true);
  let voiceOn = store.get('veu', true);

  // ---------- Sons (sintetitzats, sense fitxers) ----------
  let ctx = null, master = null;
  function ac() {
    if (!ctx) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      ctx = new C();
      master = ctx.createGain();
      master.gain.value = 0.6;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(f, dur, type = 'sine', vol = 0.2, delay = 0, f2 = null) {
    if (!soundOn) return;
    const c = ac(); if (!c) return;
    const t = c.currentTime + delay;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(dur, vol = 0.2, delay = 0) {
    if (!soundOn) return;
    const c = ac(); if (!c) return;
    const b = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const s = c.createBufferSource(), g = c.createGain();
    s.buffer = b; g.gain.value = vol;
    s.connect(g); g.connect(master);
    s.start(c.currentTime + delay);
  }
  const sfx = {
    click: () => tone(660, 0.06, 'square', 0.05),
    tick: () => tone(1000, 0.04, 'square', 0.04),
    ok: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, 'triangle', 0.22, i * 0.08)),
    bad: () => { tone(220, 0.2, 'sawtooth', 0.09); tone(160, 0.3, 'sawtooth', 0.09, 0.15); },
    pop: () => tone(450, 0.12, 'sine', 0.3, 0, 1300),
    laser: () => tone(1500, 0.3, 'square', 0.07, 0, 140),
    boom: () => { noise(0.7, 0.35); tone(140, 0.6, 'sine', 0.35, 0, 35); },
    chomp: () => { noise(0.07, 0.3); noise(0.07, 0.3, 0.13); tone(180, 0.08, 'square', 0.08, 0.13); },
    star: () => [880, 1175, 1568].forEach((f, i) => tone(f, 0.25, 'sine', 0.18, i * 0.09)),
    whoosh: () => { noise(0.5, 0.12); tone(180, 0.5, 'sine', 0.12, 0, 900); },
    coin: () => { tone(988, 0.08, 'square', 0.08); tone(1319, 0.3, 'square', 0.08, 0.08); },
    win() {
      const m = [523, 523, 523, 659, 784, 659, 784, 1047];
      const d = [0, 0.13, 0.26, 0.4, 0.62, 0.84, 0.96, 1.14];
      m.forEach((f, i) => tone(f, i === 7 ? 0.6 : 0.24, 'triangle', 0.22, d[i]));
    },
  };

  // ---------- Veu (síntesi de parla del navegador) ----------
  const synth = window.speechSynthesis || null;
  let voices = [];
  function loadVoices() { if (synth) voices = synth.getVoices() || []; }
  if (synth) { loadVoices(); synth.onvoiceschanged = loadVoices; }
  function score(v) {
    const n = v.name.toLowerCase();
    let s = 0;
    if (/natural|neural|online|enhanced|premium/.test(n)) s += 3;
    if (/google/.test(n)) s += 2;
    return s;
  }
  function findVoice(prefs) {
    for (const p of prefs) {
      const list = voices.filter((v) => v.lang.replace('_', '-').toLowerCase().startsWith(p));
      if (list.length) return list.sort((a, b) => score(b) - score(a))[0];
    }
    return null;
  }
  function voiceFor(lang) {
    // Si el dispositiu no té veu catalana, fem servir la castellana com a recurs.
    if (lang === 'ca') return findVoice(['ca']) || findVoice(['es-es', 'es']);
    if (lang === 'en') return findVoice(['en-gb', 'en-us', 'en']);
    return findVoice([lang]);
  }
  function say(text, lang = 'ca', rate) {
    return new Promise((res) => {
      if (!voiceOn || !synth || !text) { res(); return; }
      try {
        synth.cancel();
        const u = new SpeechSynthesisUtterance(U.stripTags(text).replace(/[🔊📖▶✔]/gu, ''));
        const v = voiceFor(lang);
        if (v) { u.voice = v; u.lang = v.lang; } else u.lang = lang === 'ca' ? 'ca-ES' : lang === 'en' ? 'en-GB' : lang;
        u.rate = rate || (lang === 'en' ? 0.85 : 0.98);
        u.pitch = 1.05;
        let done = false;
        const fin = () => { if (!done) { done = true; res(); } };
        u.onend = fin; u.onerror = fin;
        setTimeout(fin, 1500 + text.length * 110);
        synth.speak(u);
      } catch (e) { res(); }
    });
  }
  function stopSay() { try { if (synth) synth.cancel(); } catch (e) { /* res */ } }

  // ---------- Barra superior ----------
  let backFn = null;
  function topbar({ home = '../../index.html' } = {}) {
    const bar = U.h(`<div class="topbar no-print">
      <div><a class="icon-btn tb-home" href="${home}" title="Inici">🏠</a><button class="icon-btn tb-back hidden" title="Enrere">⬅️</button></div>
      <div><button class="icon-btn tb-so" title="Sons"></button><button class="icon-btn tb-veu" title="Veu"></button></div>
    </div>`);
    const so = bar.querySelector('.tb-so'), veu = bar.querySelector('.tb-veu'), back = bar.querySelector('.tb-back');
    const upd = () => { so.textContent = soundOn ? '🔊' : '🔇'; veu.textContent = voiceOn ? '🗣️' : '🤐'; };
    so.onclick = () => { soundOn = !soundOn; store.set('so', soundOn); upd(); sfx.click(); };
    veu.onclick = () => { voiceOn = !voiceOn; store.set('veu', voiceOn); if (!voiceOn) stopSay(); upd(); };
    back.onclick = () => { sfx.click(); stopSay(); if (backFn) backFn(); };
    upd();
    document.body.appendChild(bar);
    return bar;
  }
  function setBack(fn) {
    backFn = fn;
    const b = document.querySelector('.tb-back');
    if (b) b.classList.toggle('hidden', !fn);
  }

  // ---------- Història (diàlegs amb personatges) ----------
  // lines: [{who: '🤖' o HTML, name: 'Bit', text: 'HTML', lang: 'ca', btn: 'Som-hi!'}]
  function story(lines) {
    return new Promise((res) => {
      const ov = U.h(`<div class="story"><div class="story-box">
        <div class="story-char"></div>
        <div class="story-bubble"><div class="story-name"></div><div class="story-text"></div>
          <div class="story-actions"><button class="icon-btn small story-say" title="Escolta">🔊</button><button class="btn story-next"></button></div>
        </div></div></div>`);
      document.body.appendChild(ov);
      const ch = ov.querySelector('.story-char'), nm = ov.querySelector('.story-name'),
        tx = ov.querySelector('.story-text'), next = ov.querySelector('.story-next'),
        bubble = ov.querySelector('.story-bubble');
      let i = 0;
      const show = () => {
        const l = lines[i];
        ch.innerHTML = l.who;
        nm.textContent = l.name || '';
        tx.innerHTML = l.text;
        next.textContent = i === lines.length - 1 ? (l.btn || 'Som-hi! 🚀') : 'Següent ▶';
        bubble.classList.remove('pop'); void bubble.offsetWidth; bubble.classList.add('pop');
        say(l.say || l.text, l.lang || 'ca');
      };
      next.onclick = () => {
        sfx.click(); i++;
        if (i >= lines.length) { stopSay(); ov.remove(); res(); } else show();
      };
      ov.querySelector('.story-say').onclick = () => say(lines[i].say || lines[i].text, lines[i].lang || 'ca');
      show();
    });
  }

  // ---------- Finestra modal ----------
  // buttons: [{label, value, cls}]; stars: null o 0..3
  function modal({ icon = '', title = '', html = '', stars = null, buttons = [{ label: 'D\'acord', value: 'ok' }] }) {
    return new Promise((res) => {
      const bg = U.h(`<div class="modal-bg"><div class="modal">
        <div class="modal-icon">${icon}</div><h2>${title}</h2>
        ${stars === null ? '' : '<div class="stars"><span>⭐</span><span>⭐</span><span>⭐</span></div>'}
        <div class="modal-html">${html}</div><div class="modal-btns"></div></div></div>`);
      const btns = bg.querySelector('.modal-btns');
      buttons.forEach((b) => {
        const el = U.h(`<button class="btn ${b.cls || ''}">${b.label}</button>`);
        el.onclick = () => { sfx.click(); stopSay(); bg.remove(); res(b.value); };
        btns.appendChild(el);
      });
      document.body.appendChild(bg);
      if (stars !== null) {
        bg.querySelectorAll('.stars span').forEach((s, i) => {
          if (i < stars) setTimeout(() => { s.classList.add('on'); sfx.star(); }, 400 + i * 450);
        });
      }
    });
  }

  // ---------- Efectes ----------
  function confetti(n = 120) {
    const colors = ['#ffd23f', '#ff5a5f', '#2ecc71', '#4fc3f7', '#b388ff', '#ff9f43', '#ff6b9d'];
    for (let i = 0; i < n; i++) {
      const c = document.createElement('div');
      c.className = 'confetti';
      c.style.left = Math.random() * 100 + 'vw';
      c.style.background = U.pick(colors);
      c.style.animationDuration = 2 + Math.random() * 2.5 + 's';
      c.style.animationDelay = Math.random() * 0.6 + 's';
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 6000);
    }
  }
  function floatMsg(text, color) {
    const m = U.h(`<div class="float-msg">${text}</div>`);
    if (color) m.style.color = color;
    document.body.appendChild(m);
    setTimeout(() => m.remove(), 1400);
  }

  // ---------- Teclat numèric ----------
  let activeKeypad = null;
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const b = document.querySelector('[data-enter]');
      if (b && !b.disabled && b.offsetParent && getComputedStyle(b).visibility !== 'hidden') { e.preventDefault(); b.click(); }
      return;
    }
    if (!activeKeypad || !activeKeypad.el.isConnected) return;
    if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
    if (/^[0-9]$/.test(e.key)) activeKeypad.press(e.key);
    else if (e.key === 'Backspace') activeKeypad.press('del');
  });
  function keypad(container, { max = 5 } = {}) {
    let val = '', locked = false;
    const el = U.h(`<div class="kp"><div class="kp-display"><span class="kp-val"></span><span class="kp-cursor"></span></div>
      <div class="keypad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => `<button data-k="${d}">${d}</button>`).join('')}
      <button data-k="clr" class="kp-clr">✖</button><button data-k="0">0</button><button data-k="del" class="kp-del">⌫</button></div></div>`);
    const disp = el.querySelector('.kp-val');
    const upd = () => { disp.textContent = val ? U.fmt(val) : ''; };
    const api = {
      el,
      get value() { return val === '' ? null : parseInt(val, 10); },
      set(v) { val = String(v); upd(); },
      lock(ok) { locked = true; el.querySelector('.kp-cursor').remove(); if (ok) el.querySelector('.kp-display').classList.add('right'); },
      press(k) {
        if (locked) return;
        sfx.click();
        if (k === 'del') val = val.slice(0, -1);
        else if (k === 'clr') val = '';
        else if (val.length < max && !(val === '' && k === '0')) val += k;
        upd();
      },
    };
    el.querySelectorAll('.keypad button').forEach((b) => { b.onclick = () => api.press(b.dataset.k); });
    container.appendChild(el);
    activeKeypad = api;
    return api;
  }

  // ---------- Opcions tipus test ----------
  // opts: [{html, ok}] → objecte "renderer" per a quiz() (auto: es comprova en tocar)
  function choices(ctx, opts, { cls = '', parent } = {}) {
    const wrap = U.h(`<div class="choices ${cls}"></div>`);
    let picked = -1;
    opts.forEach((op, i) => {
      const b = U.h(`<button class="choice">${op.html}</button>`);
      b.onclick = () => { if (b.disabled) return; picked = i; if (op.onPick) op.onPick(); ctx.submit(); };
      op.el = b;
      wrap.appendChild(b);
    });
    (parent || ctx.area).appendChild(wrap);
    const all = () => opts.forEach((o) => { o.el.disabled = true; });
    return {
      auto: true,
      check: () => (picked < 0 ? null : !!opts[picked].ok),
      bad: () => { const b = opts[picked].el; b.classList.add('wrong'); b.disabled = true; U.shake(b); picked = -1; },
      good: () => { opts[picked].el.classList.add('right'); all(); },
      reveal: () => { all(); opts.forEach((o) => { if (o.ok) o.el.classList.add('right'); }); },
    };
  }

  // ---------- Lletreja una paraula amb lletres desordenades ----------
  function spell(ctx, word, { extra = 2, parent } = {}) {
    const chars = [...word.toLowerCase()];
    const isL = (c) => /[a-z]/.test(c);
    const letters = chars.filter(isL);
    const abc = 'abcdefghijklmnoprstuvwy';
    const bankL = U.shuffle(letters.concat(Array.from({ length: extra }, () => U.pick(abc))));
    const el = U.h('<div class="spell"><div class="spell-slots"></div><div class="spell-bank"></div></div>');
    const slotsEl = el.querySelector('.spell-slots'), bankEl = el.querySelector('.spell-bank');
    const slots = chars.map((c) => {
      const s = U.h(`<div class="slot ${isL(c) ? '' : 'fixed'}">${isL(c) ? '' : (c === ' ' ? '&nbsp;' : c)}</div>`);
      slotsEl.appendChild(s);
      return { el: s, want: c, fixed: !isL(c), tile: null };
    });
    let locked = false;
    const tiles = bankL.map((c) => {
      const t = { c, el: U.h(`<button class="letter">${c}</button>`) };
      t.el.onclick = () => {
        if (locked || t.el.classList.contains('used')) return;
        const s = slots.find((x) => !x.fixed && !x.tile);
        if (!s) return;
        sfx.tick();
        s.tile = t; s.el.textContent = c; t.el.classList.add('used');
        if (slots.every((x) => x.fixed || x.tile)) setTimeout(() => ctx.submit(), 250);
      };
      bankEl.appendChild(t.el);
      return t;
    });
    slots.forEach((s) => {
      s.el.onclick = () => {
        if (locked || s.fixed || !s.tile) return;
        s.tile.el.classList.remove('used'); s.tile = null; s.el.textContent = '';
      };
    });
    (parent || ctx.area).appendChild(el);
    const clear = () => slots.forEach((s) => { if (s.tile) { s.tile.el.classList.remove('used'); s.tile = null; s.el.textContent = ''; } });
    return {
      auto: true,
      check() {
        if (!slots.every((x) => x.fixed || x.tile)) return null;
        return slots.every((x) => x.fixed || x.tile.c === x.want);
      },
      bad() { U.shake(slotsEl); setTimeout(clear, 450); },
      good() { locked = true; slots.forEach((s) => s.el.classList.add('right')); },
      reveal() {
        locked = true;
        slots.forEach((s) => { if (!s.fixed) { s.el.textContent = s.want; s.el.classList.add('right'); } });
        tiles.forEach((t) => t.el.classList.add('used'));
      },
    };
  }

  // ---------- Motor de preguntes ----------
  /* o = { area, button, questions, render(q, ctx) → {check, reveal, bad, good, auto},
           onCorrect(q, info), onWrong(q, info), progress(i, n), after(result, i) → 'stop',
           maxAttempts (2), autoNextMs (1300) }
     Cada pregunta: 2 intents; després es mostra la solució i cal prémer "Entesos". */
  function ask(o, q, idx) {
    return new Promise((resolve) => {
      o.area.innerHTML = '';
      const btn = o.button;
      let attempts = 0, state = 'ask';
      const ctx = { area: o.area, q, idx, submit: () => handle() };
      const R = o.render(q, ctx);
      btn.setAttribute('data-enter', '');
      btn.style.visibility = R.auto ? 'hidden' : 'visible';
      btn.textContent = o.checkLabel || 'Comprova ✔';
      btn.disabled = false;
      btn.onclick = () => {
        if (state === 'next') { sfx.click(); stopSay(); state = 'done'; resolve({ mistakes: attempts, ok: false }); }
        else handle();
      };
      async function handle() {
        if (state !== 'ask') return;
        const res = R.check();
        if (res === null || res === undefined) { sfx.tick(); floatMsg(o.incompleteMsg || 'Encara no has acabat! 😉'); return; }
        if (res) {
          state = 'busy';
          btn.style.visibility = 'hidden';
          if (R.good) R.good();
          if (o.onCorrect) o.onCorrect(q, { attempts, R });
          await U.sleep(o.autoNextMs || 1400);
          state = 'done';
          resolve({ mistakes: attempts, ok: attempts === 0 });
        } else {
          attempts++;
          const giveUp = attempts >= (o.maxAttempts || 2);
          if (giveUp) state = 'busy';
          if (R.bad && !giveUp) R.bad();
          if (o.onWrong) o.onWrong(q, { attempts, giveUp, R });
          if (giveUp) {
            if (R.reveal) R.reveal();
            await U.sleep(500);
            state = 'next';
            btn.style.visibility = 'visible';
            btn.textContent = 'Entesos ▶';
          }
        }
      }
    });
  }
  async function quiz(o) {
    let mistakes = 0, firstOk = 0;
    for (let i = 0; i < o.questions.length; i++) {
      if (o.progress) o.progress(i, o.questions.length);
      const r = await ask(o, o.questions[i], i);
      mistakes += r.mistakes;
      if (r.ok) firstOk++;
      if (o.after && (await o.after(r, i)) === 'stop') break;
    }
    if (o.button) o.button.removeAttribute('data-enter');
    return { mistakes, firstOk };
  }
  // Estrelles segons errors
  const starsFor = (mistakes, n) => (mistakes <= Math.max(1, n * 0.15) ? 3 : mistakes <= Math.max(3, n * 0.4) ? 2 : 1);

  window.Eloi = { U, store, sfx, say, stopSay, topbar, setBack, story, modal, confetti, floatMsg, keypad, choices, spell, quiz, starsFor, unlockAudio: ac };
})();
