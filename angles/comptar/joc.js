/* El Monstre Comptador — comptar de l'1 al 20 en anglès */
(function () {
  'use strict';
  const { U, sfx, say, stopSay, story, modal, confetti, floatMsg, choices, spell, quiz, store, starsFor } = Eloi;
  const PLAYER = 'Eloi';
  const SAVE = 'monstre';
  const app = document.getElementById('app');

  const W = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
    'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
  const en = (t) => say(t, 'en');
  const FOODS = [
    { e: '🍪', en: 'cookies' }, { e: '🍎', en: 'apples' }, { e: '🍩', en: 'donuts' },
    { e: '🍓', en: 'strawberries' }, { e: '🧁', en: 'cupcakes' }, { e: '🍌', en: 'bananas' },
  ];
  const THINGS = ['🍪', '⭐', '🐞', '🎈', '🍓', '🐟', '🚗', '⚽', '🌸', '🦆', '🍄', '🐸'];

  // Monstre dibuixat en SVG (la boca s'obre amb la classe "open")
  const MONSTER = `<svg class="monster" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <path d="M45 62 L30 14 L72 44 Z" fill="#7cb342"/><path d="M155 62 L170 14 L128 44 Z" fill="#7cb342"/>
    <ellipse cx="65" cy="186" rx="24" ry="11" fill="#689f38"/><ellipse cx="135" cy="186" rx="24" ry="11" fill="#689f38"/>
    <ellipse cx="100" cy="112" rx="82" ry="74" fill="#8bc34a"/>
    <ellipse cx="100" cy="140" rx="52" ry="38" fill="#aed581"/>
    <circle cx="40" cy="105" r="6" fill="#7cb342"/><circle cx="160" cy="95" r="8" fill="#7cb342"/><circle cx="150" cy="130" r="5" fill="#7cb342"/>
    <circle cx="100" cy="70" r="30" fill="#fff" stroke="#689f38" stroke-width="3"/>
    <circle class="pupil" cx="100" cy="75" r="13" fill="#222"/><circle cx="105" cy="69" r="4.5" fill="#fff"/>
    <g class="mouth-closed"><path d="M62 124 Q100 158 138 124" stroke="#33691e" stroke-width="7" fill="none" stroke-linecap="round"/></g>
    <g class="mouth-open"><ellipse cx="100" cy="134" rx="40" ry="32" fill="#4a1c1c"/>
      <path d="M66 116 L76 130 L86 115 L96 130 L106 115 L116 130 L126 115 L134 122 L66 122 Z" fill="#fff"/>
      <ellipse cx="100" cy="153" rx="19" ry="9" fill="#e57373"/></g>
  </svg>`;
  function anim(m, cls, ms = 500) {
    if (!m) return;
    m.classList.remove(cls); void m.getBoundingClientRect(); m.classList.add(cls);
    setTimeout(() => m.classList.remove(cls), ms);
  }
  function chomp(m) { if (!m) return; m.classList.add('open'); setTimeout(() => m.classList.remove('open'), 260); }

  const LEVELS = [
    { id: 'learn', e: '📚', n: 'Aprèn', d: 'Escolta els números de l\'1 al 20', play: playLearn },
    { id: 'listen', e: '👂', n: 'Escolta i toca', d: 'Escolta el número i toca\'l', play: playListen },
    { id: 'count', e: '🔢', n: 'Compta', d: 'Compta les coses i tria el número', play: playCount },
    { id: 'feed', e: '🍪', n: 'Dona-li menjar', d: 'Dona al monstre el que et demana', play: playFeed },
    { id: 'bubbles', e: '🫧', n: 'Bombolles', d: 'Explota les bombolles en ordre', play: playBubbles },
    { id: 'spell', e: '✍️', n: 'Lletreja', d: 'Escriu els números en anglès', play: playSpell },
  ];
  const PRAISE = ['Yummy!', 'Great!', 'Well done!', 'Awesome!', 'Super!', 'Yes!', 'Fantastic!'];

  const prog = () => store.get(SAVE, { intro: false, lv: {} });
  const saveProg = (p) => store.set(SAVE, p);

  // ---------- Inici ----------
  function splash() {
    Eloi.setBack(null);
    app.innerHTML = `<div class="splash">
      <div style="animation:bob 2.4s infinite">${MONSTER}</div>
      <h1>El Monstre Comptador</h1>
      <p class="sub">En Nyam té molta gana… i només entén l'anglès!</p>
      <button class="btn big" id="go">JUGAR ▶</button></div>`;
    app.querySelector('#go').onclick = async () => {
      Eloi.unlockAudio();
      sfx.chomp();
      const p = prog();
      if (!p.intro) { await intro(); p.intro = true; saveProg(p); }
      showLevels();
    };
  }
  function intro() {
    return story([
      { who: MONSTER, name: 'Nyam', text: '<b>Hello!</b> Nyam, nyam! 😋', say: 'Hello! I am Nyam!', lang: 'en' },
      { who: MONSTER, name: 'Nyam', text: `Hola, <b>${PLAYER}</b>! Sóc en <b>Nyam</b>, el monstre més golafre del món. M'encanten les galetes 🍪!` },
      { who: MONSTER, name: 'Nyam', text: 'Però tinc un problema: només entenc els números en <b>anglès</b>! M\'ajudes a comptar de <b>one</b> fins a <b>twenty</b>?' },
      { who: MONSTER, name: 'Nyam', text: 'Hi ha 6 reptes. Cada vegada que encertis, em menjaré una galeta. <b>Let\'s count!</b>', btn: 'Let\'s count! 🍪' },
    ]);
  }

  // ---------- Llista de nivells ----------
  function showLevels() {
    stopSay();
    Eloi.setBack(splash);
    const p = prog();
    const total = LEVELS.reduce((a, l) => a + (p.lv[l.id] || 0), 0);
    const nextIdx = LEVELS.findIndex((l) => !p.lv[l.id]);
    app.innerHTML = `<div class="wrap">
      <div style="animation:bob 2.4s infinite">${MONSTER}</div>
      <h1>El Monstre Comptador</h1>
      <div class="belly">Panxa d'en Nyam: ${'🍪'.repeat(Math.min(total, 18))}${total ? '' : ' (buida! 😢)'} ⭐ ${total}</div>
      <div class="levels"></div>
      <div style="margin-top:26px"><button class="btn blue" id="hist">👾 Història</button></div></div>`;
    const box = app.querySelector('.levels');
    LEVELS.forEach((l, i) => {
      const open = i === 0 || p.lv[LEVELS[i - 1].id];
      const st = p.lv[l.id] || 0;
      const el = U.h(`<button class="lvl ${open ? '' : 'locked'} ${i === nextIdx ? 'next' : ''}">
        <div class="le">${open ? l.e : '🔒'}</div><div class="ln">${i + 1}. ${l.n}</div><div class="ld">${l.d}</div>
        <div class="mini-stars">${[0, 1, 2].map((k) => `<span class="${k < st ? 'on' : ''}">⭐</span>`).join('')}</div></button>`);
      el.onclick = () => {
        if (!open) { sfx.bad(); floatMsg('🔒 Primer el repte anterior!'); return; }
        sfx.click();
        l.play(l);
      };
      box.appendChild(el);
    });
    app.querySelector('#hist').onclick = intro;
    const m = app.querySelector('.wrap .monster');
    m.onclick = () => { chomp(m); sfx.chomp(); en('Nyam nyam!'); };
  }

  async function finish(l, stars, extraHtml = '') {
    const p = prog();
    p.lv[l.id] = Math.max(p.lv[l.id] || 0, stars);
    saveProg(p);
    sfx.win(); confetti();
    const all = LEVELS.every((x) => p.lv[x.id]);
    const last = LEVELS.indexOf(l) === LEVELS.length - 1;
    en(U.pick(PRAISE));
    const v = await modal({
      icon: '🍪', title: 'Repte superat!', stars,
      html: extraHtml + (all && last ? `<p>Ja saps comptar fins a <b>twenty</b> en anglès! En Nyam està tan content que fa la panxa ballar! 🕺</p>` : ''),
      buttons: [{ label: '🔁 Repetir', value: 'again', cls: 'blue' }, { label: 'Continua ▶', value: 'ok' }],
    });
    if (v === 'again') l.play(l); else showLevels();
  }

  function playScreen(l, n) {
    Eloi.setBack(showLevels);
    app.innerHTML = `<div class="play">
      <div class="play-head"><span>${l.e} ${l.n}</span><div class="dots">${'<span></span>'.repeat(n || 0)}</div></div>
      <div class="guide"><div class="gchar">${MONSTER}</div><div class="gbubble"></div><button class="icon-btn small" id="rep">🔊</button></div>
      <div class="area"></div>
      <div class="foot"><button class="btn green" id="chk">Comprova ✔</button></div></div>`;
    const bubble = app.querySelector('.gbubble');
    let cur = '';
    const setGuide = (html, speak = true) => {
      cur = html;
      bubble.innerHTML = html;
      bubble.classList.remove('pop'); void bubble.offsetWidth; bubble.classList.add('pop');
      return speak ? say(html, 'ca') : Promise.resolve();
    };
    app.querySelector('#rep').onclick = () => say(cur, 'ca');
    return {
      area: app.querySelector('.area'), button: app.querySelector('#chk'), setGuide,
      dots: [...app.querySelectorAll('.dots span')], monster: app.querySelector('.guide .monster'),
    };
  }

  async function runQuiz(S, questions, render, opts = {}) {
    const res = await quiz({
      area: S.area, button: S.button, questions, render,
      progress: (i) => S.dots.forEach((d, k) => d.classList.toggle('cur', k === i)),
      onCorrect: (q) => {
        sfx.ok(); chomp(S.monster); anim(S.monster, 'happy'); setTimeout(sfx.chomp, 150);
        const w = U.pick(PRAISE);
        floatMsg(`${w} 🍪`);
        S.setGuide(`<b>${w}</b> ${q} = <b>${W[q]}</b>`, false);
        en(W[q]);
      },
      onWrong: (q, { giveUp }) => {
        sfx.bad(); anim(S.monster, 'sad');
        if (giveUp) { S.setGuide(`No passa res! Era <b>${q}</b> = <b>${W[q]}</b>. 👀`, false); en(W[q]); }
        else S.setGuide('<b>Oops!</b> Torna-ho a provar! 💪');
      },
      after: (r, i) => { if (S.dots[i]) S.dots[i].textContent = r.ok ? '🍪' : '✔'; },
      ...opts,
    });
    return starsFor(res.mistakes, questions.length);
  }
  // n números diferents de l'1 al 20, de més petits a més grans si cal
  const someNums = (n, sorted) => { const a = U.shuffle(Array.from({ length: 20 }, (_, i) => i + 1)).slice(0, n); return sorted ? a.sort((x, y) => x - y) : a; };
  const dotsOf = (n) => '●'.repeat(n);

  // ---------- 1. Aprèn ----------
  function playLearn(l) {
    const S = playScreen(l, 0);
    S.setGuide('Toca cada número per escoltar com es diu en anglès. També pots prémer <b>Compta amb mi</b>!');
    const seen = new Set();
    const tools = U.h('<div><button class="btn blue" id="all">▶ Compta amb mi</button></div>');
    const grid = U.h('<div class="nums"></div>');
    const cards = [];
    let counting = false;
    const mark = (i) => {
      cards[i].classList.add('seen'); seen.add(i);
      if (seen.size === 20 && S.button.disabled) { S.button.disabled = false; floatMsg('Molt bé! 👏'); }
    };
    for (let i = 1; i <= 20; i++) {
      const c = U.h(`<button class="ncard"><div class="n">${i}</div><div class="w">${W[i]}</div><div class="d">${dotsOf(i)}</div></button>`);
      c.onclick = () => { if (counting) return; sfx.pop(); en(W[i]); mark(i); chomp(S.monster); };
      cards[i] = c;
      grid.appendChild(c);
    }
    tools.querySelector('#all').onclick = async (e) => {
      if (counting) return;
      counting = true; e.target.disabled = true;
      for (let i = 1; i <= 20 && app.contains(grid); i++) {
        cards[i].classList.add('pop'); mark(i); chomp(S.monster);
        await en(W[i]);
        await U.sleep(120);
        cards[i].classList.remove('pop');
      }
      counting = false; e.target.disabled = false;
    };
    S.area.appendChild(tools);
    S.area.appendChild(grid);
    S.button.textContent = 'Fet! ✔';
    S.button.disabled = true;
    S.button.onclick = () => { stopSay(); finish(l, 3); };
  }

  // ---------- 2. Escolta i toca ----------
  async function playListen(l) {
    const qs = someNums(8);
    const S = playScreen(l, qs.length);
    const stars = await runQuiz(S, qs, (q, ctx) => {
      S.setGuide('Escolta el número i toca\'l!').then(() => en(W[q]));
      const b = U.h('<button class="listen-btn" title="Escolta">🔊</button>');
      b.onclick = () => en(W[q]);
      ctx.area.appendChild(b);
      const others = U.shuffle(Array.from({ length: 20 }, (_, i) => i + 1).filter((x) => x !== q)).slice(0, 5);
      return choices(ctx, U.shuffle([q, ...others]).map((x) => ({ html: String(x), ok: x === q })), { cls: 'nums6' });
    });
    finish(l, stars);
  }

  // ---------- 3. Compta ----------
  async function playCount(l) {
    const qs = someNums(8, true);
    const S = playScreen(l, qs.length);
    const stars = await runQuiz(S, qs, (q, ctx) => {
      S.setGuide('Quantes coses hi ha? Compta-les i tria el número en anglès.');
      const t = U.pick(THINGS);
      const box = U.h('<div class="objects"></div>');
      for (let i = 0; i < q; i++) box.appendChild(U.h(`<span style="animation-delay:${i * 40}ms">${t}</span>`));
      ctx.area.appendChild(box);
      const near = [q - 2, q - 1, q + 1, q + 2, q + 10, q - 10].filter((x) => x >= 1 && x <= 20);
      const opts = U.shuffle([q, ...U.shuffle(near).slice(0, 3)]).map((x) => ({ html: W[x], ok: x === q }));
      return choices(ctx, opts);
    });
    finish(l, stars);
  }

  // ---------- 4. Dona-li menjar ----------
  async function playFeed(l) {
    const qs = [U.rand(3, 6), U.rand(7, 10), U.rand(11, 13), U.rand(14, 16), U.rand(17, 18), U.rand(19, 20)];
    const S = playScreen(l, qs.length);
    S.monster.parentNode.innerHTML = '<div style="font-size:3.4rem">🍽️</div>';
    S.monster = null;
    let big = null;
    const stars = await runQuiz(S, qs, (q, ctx) => {
      const food = U.pick(FOODS);
      const sentence = `I want ${W[q]} ${food.en}!`;
      S.setGuide('En Nyam té gana! Dona-li <b>exactament</b> el que demana i després prem <b>Comprova</b>.').then(() => en(sentence));
      const want = U.h(`<div class="want">"I want <b>${W[q]}</b> ${food.en}!" <button class="icon-btn small" style="background:#eee">🔊</button></div>`);
      want.querySelector('button').onclick = () => en(sentence);
      const row = U.h(`<div class="feed"><div>${MONSTER}</div>
        <div class="jar"><button class="food-btn">${food.e}</button>
          <div class="counter"><span class="cnum">0</span><small></small></div>
          <button class="btn blue" style="font-size:1.1rem">↩️ Torna a 0</button></div></div>`);
      big = row.querySelector('.monster');
      const fb = row.querySelector('.food-btn'), cnum = row.querySelector('.cnum'), cw = row.querySelector('small');
      let count = 0, locked = false;
      const upd = () => { cnum.textContent = count; cw.textContent = count ? W[count] || '' : ''; };
      fb.onclick = () => {
        if (locked || count >= 25) return;
        count++; upd();
        const a = fb.getBoundingClientRect(), b = big.getBoundingClientRect();
        const f = U.h(`<span class="flying">${food.e}</span>`);
        f.style.left = a.left + a.width / 2 - 24 + 'px';
        f.style.top = a.top + a.height / 2 - 24 + 'px';
        document.body.appendChild(f);
        big.classList.add('open');
        requestAnimationFrame(() => {
          f.style.transform = `translate(${b.left + b.width / 2 - (a.left + a.width / 2)}px, ${b.top + b.height * 0.65 - (a.top + a.height / 2)}px) scale(.5)`;
          f.style.opacity = '0.2';
        });
        setTimeout(() => { f.remove(); big.classList.remove('open'); sfx.chomp(); }, 450);
        if (W[count]) en(W[count]);
      };
      row.querySelector('.btn').onclick = () => { if (locked) return; sfx.click(); count = 0; upd(); };
      ctx.area.appendChild(want);
      ctx.area.appendChild(row);
      return {
        check: () => (count === 0 ? null : count === q),
        bad() {
          anim(big, 'sad');
          floatMsg(count > q ? 'Massa! 🤢' : 'Encara tinc gana! 😋');
          count = 0; upd();
        },
        good() { locked = true; anim(big, 'happy'); },
        reveal() { locked = true; ctx.area.appendChild(U.h(`<div class="want">${W[q]} = <b>${q}</b></div>`)); },
      };
    }, { incompleteMsg: 'Dona-li menjar primer! 🍪' });
    finish(l, stars);
  }

  // ---------- 5. Bombolles ----------
  function playBubbles(l) {
    const S = playScreen(l, 0);
    S.button.style.visibility = 'hidden';
    S.setGuide('Explota les bombolles en ordre: <b>one, two, three…</b> fins a <b>twenty</b>!');
    const counted = U.h('<div class="counted"></div>');
    const pond = U.h('<div class="pond"></div>');
    S.area.appendChild(counted);
    S.area.appendChild(pond);
    const cols = pond.clientWidth < 560 ? 4 : 5, rows = Math.ceil(20 / cols);
    const cells = U.shuffle(Array.from({ length: cols * rows }, (_, i) => i)).slice(0, 20);
    let next = 1, mistakes = 0, wrongRow = 0;
    const bubbles = [];
    const t0 = Date.now();
    for (let n = 1; n <= 20; n++) {
      const cell = cells[n - 1], c = cell % cols, r = Math.floor(cell / cols);
      const b = U.h(`<button class="bubble">${W[n]}</button>`);
      b.style.left = `calc(${(c / cols) * 100}% + ${U.rand(0, 8)}px)`;
      b.style.top = `calc(${(r / rows) * 100}% + ${U.rand(0, 10)}px)`;
      b.style.setProperty('--t', `${U.rand(18, 32) / 10}s`);
      b.style.setProperty('--dx', `${U.rand(-12, 12)}px`);
      b.style.setProperty('--dy', `${U.rand(-14, 14)}px`);
      b.onclick = () => {
        if (n === next) {
          sfx.pop(); en(W[n]);
          b.classList.add('popped');
          bubbles.forEach((x) => x.classList.remove('hint'));
          counted.textContent += (n > 1 ? ', ' : '') + W[n];
          next++; wrongRow = 0;
          if (S.monster && n % 5 === 0) { chomp(S.monster); anim(S.monster, 'happy'); }
          if (next > 20) {
            const secs = Math.round((Date.now() - t0) / 1000);
            setTimeout(() => finish(l, starsFor(mistakes, 20), `<p>Temps: <b>${secs}</b> segons · Errors: <b>${mistakes}</b></p>`), 700);
          }
        } else {
          sfx.bad(); U.shake(b); mistakes++; wrongRow++;
          if (wrongRow >= 2) bubbles[next - 1].classList.add('hint');
        }
      };
      bubbles.push(b);
      pond.appendChild(b);
    }
  }

  // ---------- 6. Lletreja ----------
  async function playSpell(l) {
    const qs = someNums(6, true);
    const S = playScreen(l, qs.length);
    const stars = await runQuiz(S, qs, (q, ctx) => {
      S.setGuide('Escriu el número en anglès amb les lletres. Toca 🔊 per escoltar-lo!').then(() => en(W[q]));
      const top = U.h(`<div style="display:flex;align-items:center;gap:18px"><div class="bignum">${q}</div><button class="icon-btn" style="background:#fff">🔊</button></div>`);
      top.querySelector('button').onclick = () => en(W[q]);
      ctx.area.appendChild(top);
      return spell(ctx, W[q], { extra: 2 });
    });
    finish(l, stars);
  }

  Eloi.topbar();
  splash();
})();
