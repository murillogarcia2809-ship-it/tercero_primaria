/* Missió Galàxia Numèrica — descomposició de números (DM, UM, C, D, U) i números en lletres */
(function () {
  'use strict';
  const { U, sfx, say, stopSay, story, modal, confetti, floatMsg, keypad, choices, quiz, store, starsFor } = Eloi;
  const { numCat, comprovaText, DICCIONARI } = NombresCa;

  const PLAYER = 'Eloi';
  const SAVE = 'galaxia';
  const app = document.getElementById('app');

  // ---------- Dades ----------
  const COLS = [
    { k: 'DM', v: 10000, nom: 'desenes de miler', color: '#b388ff' },
    { k: 'UM', v: 1000, nom: 'unitats de miler', color: '#ff6b9d' },
    { k: 'C', v: 100, nom: 'centenes', color: '#4fc3f7' },
    { k: 'D', v: 10, nom: 'desenes', color: '#69f0ae' },
    { k: 'U', v: 1, nom: 'unitats', color: '#ffd740' },
  ];
  const dig = (n, v) => Math.floor(n / v) % 10;
  const chip = (c, txt) => `<span class="chip" style="--c:${c.color}">${txt}</span>`;

  const BIT = '🤖';
  const ZERO = `<svg viewBox="0 0 120 150" xmlns="http://www.w3.org/2000/svg" aria-label="Capità Zero">
    <ellipse cx="60" cy="92" rx="42" ry="52" fill="none" stroke="#8e24aa" stroke-width="24"/>
    <ellipse cx="60" cy="92" rx="42" ry="52" fill="none" stroke="#e1bee7" stroke-width="4" stroke-dasharray="3 16"/>
    <path d="M12 44 Q60 -10 108 44 Z" fill="#1d1d1d"/><rect x="6" y="40" width="108" height="9" rx="4" fill="#1d1d1d"/>
    <circle cx="60" cy="25" r="7" fill="#fff"/><rect x="56" y="29" width="8" height="5" fill="#fff"/>
    <circle cx="47" cy="82" r="9" fill="#fff"/><circle cx="49" cy="84" r="4.5" fill="#111"/>
    <circle cx="73" cy="82" r="9" fill="#fff"/><circle cx="71" cy="84" r="4.5" fill="#111"/>
    <path d="M35 66 L56 74 M85 66 L64 74" stroke="#111" stroke-width="5" stroke-linecap="round"/>
    <path d="M44 110 Q60 122 76 110" fill="none" stroke="#111" stroke-width="5" stroke-linecap="round"/>
  </svg>`;

  // ---------- Fons d'estrelles ----------
  (function stars() {
    const c = document.getElementById('stars'), g = c.getContext('2d');
    let W, H, S = [];
    function resize() {
      W = c.width = innerWidth; H = c.height = innerHeight;
      S = Array.from({ length: Math.min(220, Math.floor((W * H) / 5000)) }, () => ({
        x: Math.random() * W, y: Math.random() * H, z: Math.random() * 1.5 + 0.3, t: Math.random() * 6,
      }));
    }
    addEventListener('resize', resize);
    resize();
    (function frame() {
      g.clearRect(0, 0, W, H);
      g.fillStyle = '#fff';
      for (const s of S) {
        s.y += s.z * 0.25; s.t += 0.03;
        if (s.y > H) { s.y = 0; s.x = Math.random() * W; }
        g.globalAlpha = 0.45 + 0.55 * Math.abs(Math.sin(s.t));
        g.fillRect(s.x, s.y, s.z * 1.5, s.z * 1.5);
      }
      requestAnimationFrame(frame);
    })();
  })();

  // ---------- Generadors de números ----------
  function genNum(dg) {
    const d = [U.rand(1, 9)];
    for (let i = 1; i < dg; i++) d.push(U.rand(0, 9));
    if (Math.random() < 0.45) d[U.rand(1, dg - 1)] = 0; // els zeros són els més traïdors!
    return +d.join('');
  }
  // Números "semblants" per fer opcions incorrectes creïbles
  function nearby(n) {
    const s = String(n).split('').map(Number);
    const out = new Set();
    let tries = 0;
    while (out.size < 6 && tries++ < 100) {
      const d = s.slice();
      const r = Math.random();
      if (r < 0.35) { const i = U.rand(0, d.length - 1), j = U.rand(0, d.length - 1); [d[i], d[j]] = [d[j], d[i]]; }
      else if (r < 0.6) { const i = U.rand(0, d.length - 1); d[i] = (d[i] + U.pick([1, 2, 8, 9])) % 10; }
      else if (r < 0.8) { if (d.length < 5) d.splice(U.rand(1, d.length), 0, 0); else d.splice(U.rand(1, d.length - 1), 1); }
      else if (d.length > 3) d.splice(U.rand(1, d.length - 1), 1);
      if (d[0] === 0) continue;
      const m = +d.join('');
      if (m !== n && m >= 100 && m < 100000) out.add(m);
    }
    return [...out];
  }
  const valText = (n) => COLS.filter((c) => dig(n, c.v) > 0).map((c) => U.fmt(dig(n, c.v) * c.v)).join(' + ');
  function unitChips(n, shuffle) {
    let p = COLS.filter((c) => dig(n, c.v) > 0).map((c) => chip(c, `${dig(n, c.v)} ${c.k}`));
    if (shuffle) p = U.shuffle(p);
    return p.join(' + ');
  }
  function valChips(n, shuffle) {
    let p = COLS.filter((c) => dig(n, c.v) > 0).map((c) => chip(c, U.fmt(dig(n, c.v) * c.v)));
    if (shuffle) p = U.shuffle(p);
    return p.join(' + ');
  }
  const colsOf = (n) => COLS.slice(5 - String(n).length);

  // ---------- Planetes ----------
  const DIG = [3, 4, 4, 5, 5, 5];
  const ex = 34072;
  const PLANETS = [
    {
      id: 'abac', name: 'Planeta Àbac', emoji: '🧮', c1: '#ffb199', c2: '#ff0844', skill: 'Descompondre',
      intro: [
        { who: BIT, name: 'Bit', text: 'Benvingut al <b>Planeta Àbac</b>! Aquí cada xifra viu a la seva casa. 🏠' },
        { who: BIT, name: 'Bit', text: `Les cases són: ${chip(COLS[4], 'U')} unitats, ${chip(COLS[3], 'D')} desenes, ${chip(COLS[2], 'C')} centenes, ${chip(COLS[1], 'UM')} unitats de miler i ${chip(COLS[0], 'DM')} desenes de miler.` },
        { who: BIT, name: 'Bit', text: `Mira: <b>${U.fmt(ex)}</b> = ${unitChips(ex)} i 0 C.<br>És a dir: ${valChips(ex)}. Cada xifra al seu lloc!` },
      ],
      gen: (i) => ({ type: i < 4 ? 'descompon' : 'triaDesc', n: genNum(DIG[i]) }),
    },
    {
      id: 'blocs', name: 'Planeta Blocs', emoji: '🧱', c1: '#f6d365', c2: '#fda085', skill: 'Compondre',
      intro: [
        { who: BIT, name: 'Bit', text: 'Oh, no! Al <b>Planeta Blocs</b> el Capità Zero ha desmuntat tots els números! 🧱' },
        { who: BIT, name: 'Bit', text: `Hem de tornar-los a muntar. Si tens ${unitChips(4038)}, el número és <b>4.038</b>.` },
        { who: BIT, name: 'Bit', text: 'Compte amb el truc del pirata: si una casa no apareix, hi has de posar un <b>0</b>! Aquí no hi havia centenes, per això és 4.<b>0</b>38.' },
      ],
      gen: (i) => ({ type: 'compon', n: genNum(DIG[i]), mode: i % 2 ? 'valors' : 'unitats', shuffle: i >= 3 }),
    },
    {
      id: 'paraules', name: 'Planeta Paraules', emoji: '📜', c1: '#a1ffce', c2: '#11998e', skill: 'Escriure en lletres',
      intro: [
        { who: BIT, name: 'Bit', text: 'Al <b>Planeta Paraules</b> els números s\'escriuen amb lletres, com als llibres antics. 📜' },
        { who: BIT, name: 'Bit', text: '<b>2.345</b> s\'escriu: <i>dos mil tres-cents quaranta-cinc</i>.' },
        { who: BIT, name: 'Bit', text: 'Trucs: les desenes i unitats van amb guionet: <i>quaranta-cinc</i>. Del 21 al 29 porten <b>-i-</b>: <i>vint-i-tres</i>. I les centenes també: <i>tres-cents</i>. Si dubtes, toca el llibre 📖!' },
      ],
      gen: (i) => ({ type: 'escriu', n: genNum([3, 4, 5, 3, 4, 4][i]), mode: i < 3 ? 'fitxes' : 'teclat' }),
    },
    {
      id: 'eco', name: 'Planeta Eco', emoji: '🔊', c1: '#89f7fe', c2: '#2f80ed', skill: 'Llegir números',
      intro: [
        { who: BIT, name: 'Bit', text: 'Al <b>Planeta Eco</b> els números parlen! 🔊 Però el Capità Zero els ha esborrat les xifres.' },
        { who: BIT, name: 'Bit', text: 'Llegeix (o escolta) el número en lletres i escriu-lo amb xifres. Recorda: on no hi ha res, hi va un <b>0</b>!' },
      ],
      gen: (i) => ({ type: 'llegeix', n: genNum(DIG[i]) }),
    },
    {
      id: 'tresor', name: 'Planeta Tresor', emoji: '💎', c1: '#fbc2eb', c2: '#a855f7', skill: 'Valor de les xifres',
      intro: [
        { who: BIT, name: 'Bit', text: 'El <b>Planeta Tresor</b> amaga xifres molt valuoses. 💎' },
        { who: BIT, name: 'Bit', text: `Un 7 no sempre val 7! A <b>7.000</b> val ${chip(COLS[1], 'set mil')} i a <b>70</b> val ${chip(COLS[3], 'setanta')}. Depèn de la casa on viu!` },
      ],
      gen: (i) => genValor(['valorXifra', 'quinaXifra', 'quinNumero'][i % 3], DIG[i]),
    },
  ];
  const BOSS = { id: 'zero', name: 'Nau del Capità Zero', emoji: '🏴‍☠️', c1: '#434343', c2: '#000', skill: 'Batalla final' };

  function genValor(type, dg) {
    for (;;) {
      const n = genNum(dg), s = String(n);
      if (type === 'valorXifra') {
        const cand = colsOf(n).filter((c) => { const d = dig(n, c.v); return d > 0 && s.split('').filter((x) => +x === d).length === 1; });
        if (cand.length) return { type, n, col: U.pick(cand) };
      } else return { type, n, col: U.pick(colsOf(n)) };
    }
  }
  function bossQuestion() {
    const t = U.pick(['descompon', 'triaDesc', 'compon', 'escriu', 'llegeix', 'valorXifra', 'quinaXifra', 'quinNumero']);
    const dg = U.pick([4, 5, 5]);
    if (t === 'valorXifra' || t === 'quinaXifra' || t === 'quinNumero') return genValor(t, dg);
    if (t === 'compon') return { type: t, n: genNum(dg), mode: U.pick(['unitats', 'valors']), shuffle: true };
    if (t === 'escriu') return { type: t, n: genNum(dg), mode: 'fitxes' };
    return { type: t, n: genNum(dg) };
  }

  // ---------- Textos d'instruccions ----------
  function instr(q) {
    switch (q.type) {
      case 'descompon': return 'Descompon el número! Posa a cada casa la seva xifra amb les fletxes ▲▼.';
      case 'triaDesc': return 'Quina és la descomposició correcta d\'aquest número?';
      case 'compon': return q.mode === 'unitats' ? 'Quin número formen aquestes peces? Escriu-lo amb el teclat.' : 'Ajunta les peces i escriu el número que formen.';
      case 'escriu': return q.mode === 'fitxes' ? 'Com s\'escriu aquest número en lletres? Toca les paraules en ordre.' : 'Ara escriu-lo tu en lletres! Si dubtes, mira el diccionari 📖.';
      case 'llegeix': return 'Llegeix o escolta el número 🔊 i escriu-lo amb xifres.';
      case 'valorXifra': return 'Quant val la xifra groga?';
      case 'quinaXifra': return `Quina xifra hi ha a les <b>${q.col.nom} (${q.col.k})</b>?`;
      case 'quinNumero': return 'Quin número és?';
    }
    return '';
  }
  function hint(q) {
    switch (q.type) {
      case 'descompon': return 'Gairebé! Les caselles vermelles no són correctes. Torna-ho a provar 💪';
      case 'compon': return 'Gairebé! Recorda: si falta una casa, hi va un <b>0</b>. Torna-ho a provar 💪';
      case 'llegeix': return 'Gairebé! Fixa\'t bé en els milers i en els zeros. Torna-ho a provar 💪';
      case 'escriu': return 'Gairebé! Comprova l\'ordre: primer els milers, després les centenes i al final les desenes i unitats.';
      default: return 'Ui, aquesta no és! Torna-ho a provar 💪';
    }
  }

  // ---------- Pantalles de preguntes ----------
  const RENDER = {
    descompon(q, ctx) {
      const vals = [0, 0, 0, 0, 0];
      let locked = false;
      const el = U.h(`<div style="display:flex;flex-direction:column;align-items:center;gap:14px;width:100%">
        <div class="big-num">${U.fmt(q.n)}</div>
        <div class="cols">${COLS.map((c) => `<div class="col" style="--c:${c.color}"><div class="col-k">${c.k}</div>
          <button class="up" aria-label="més">▲</button><div class="col-d">0</div><button class="dn" aria-label="menys">▼</button>
          <div class="col-tube"></div></div>`).join('')}</div>
        <div class="dec-line"></div></div>`);
      const colEls = [...el.querySelectorAll('.col')];
      const line = el.querySelector('.dec-line');
      function upd(changed) {
        colEls.forEach((ce, i) => {
          ce.querySelector('.col-d').textContent = vals[i];
          if (changed === undefined || changed === i) ce.querySelector('.col-tube').innerHTML = '<i></i>'.repeat(vals[i]);
        });
        const first = vals.findIndex((v) => v > 0);
        if (first < 0) { line.innerHTML = ''; return; }
        const sum = COLS.reduce((a, c, i) => a + vals[i] * c.v, 0);
        line.innerHTML = COLS.slice(first).map((c, i) => chip(c, `${vals[first + i]} ${c.k}`)).join(' + ') +
          `<br>= ${valText(sum)} = <b>${U.fmt(sum)}</b>`;
      }
      colEls.forEach((ce, i) => {
        const change = (d) => {
          if (locked) return;
          sfx.tick();
          vals[i] = (vals[i] + d + 10) % 10;
          colEls.forEach((x) => x.classList.remove('wrong'));
          upd(i);
        };
        ce.querySelector('.up').onclick = () => change(1);
        ce.querySelector('.dn').onclick = () => change(-1);
        ce.querySelector('.col-tube').onclick = () => change(1);
      });
      ctx.area.appendChild(el);
      upd();
      return {
        check: () => (vals.every((v) => v === 0) ? null : COLS.every((c, i) => vals[i] === dig(q.n, c.v))),
        bad() {
          colEls.forEach((ce, i) => {
            const ok = vals[i] === dig(q.n, COLS[i].v);
            ce.classList.toggle('wrong', !ok);
            if (!ok) U.shake(ce);
          });
        },
        good() { locked = true; colEls.forEach((ce) => ce.classList.add('right')); },
        reveal() {
          locked = true;
          COLS.forEach((c, i) => { vals[i] = dig(q.n, c.v); });
          upd();
          colEls.forEach((ce) => { ce.classList.remove('wrong'); ce.classList.add('right'); });
        },
      };
    },

    triaDesc(q, ctx) {
      ctx.area.appendChild(U.h(`<div class="big-num">${U.fmt(q.n)}</div>`));
      const opts = U.shuffle([q.n, ...U.shuffle(nearby(q.n)).slice(0, 3)]).map((m) => ({ html: valText(m), ok: m === q.n }));
      return choices(ctx, opts);
    },

    compon(q, ctx) {
      ctx.area.appendChild(U.h(`<div class="expr">${q.mode === 'unitats' ? unitChips(q.n, q.shuffle) : valChips(q.n, q.shuffle)} = ?</div>`));
      const kp = keypad(ctx.area);
      return {
        check: () => (kp.value === null ? null : kp.value === q.n),
        bad: () => U.shake(kp.el.querySelector('.kp-display')),
        good: () => kp.lock(true),
        reveal() { kp.set(q.n); kp.lock(true); },
      };
    },

    escriu(q, ctx) {
      const text = numCat(q.n);
      ctx.area.appendChild(U.h(`<div class="big-num">${U.fmt(q.n)}</div>`));
      const showSolution = () => {
        ctx.area.appendChild(U.h(`<div class="solution">${text}</div>`));
        say(text);
      };
      if (q.mode === 'teclat') {
        const inp = U.h('<input class="txt-input" type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="Escriu aquí el número en lletres…">');
        ctx.area.appendChild(inp);
        setTimeout(() => inp.focus(), 300);
        let note = null;
        return {
          check() {
            if (!inp.value.trim()) return null;
            const r = comprovaText(inp.value, q.n);
            if (r === 'guions') note = `Molt bé! Només et falten els guionets: <b>${text}</b>`;
            return r !== 'no';
          },
          bad: () => U.shake(inp),
          good() {
            inp.disabled = true; inp.classList.add('right');
            if (note) ctx.area.appendChild(U.h(`<div class="note">${note}</div>`));
            say(text);
          },
          reveal() { inp.disabled = true; showSolution(); },
        };
      }
      // Fitxes de paraules
      const ans = text.split(' ');
      const pool = [];
      for (const m of U.shuffle(nearby(q.n))) {
        for (const t of numCat(m).split(' ')) if (!ans.includes(t) && !pool.includes(t)) pool.push(t);
      }
      const words = U.shuffle(ans.concat(U.shuffle(pool).slice(0, ans.length >= 4 ? 3 : 2)));
      const answer = U.h('<div class="tiles-answer"></div>');
      const bank = U.h('<div class="tiles-bank"></div>');
      let locked = false;
      words.forEach((w) => {
        const t = U.h(`<button class="wtile" data-w="${w}">${w}</button>`);
        t.onclick = () => {
          if (locked) return;
          sfx.tick();
          (t.parentNode === bank ? answer : bank).appendChild(t);
        };
        bank.appendChild(t);
      });
      ctx.area.appendChild(answer);
      ctx.area.appendChild(bank);
      return {
        check() {
          const got = [...answer.children].map((e) => e.dataset.w);
          return got.length ? got.join(' ') === text : null;
        },
        bad: () => U.shake(answer),
        good() { locked = true; answer.style.background = '#b9f6ca'; say(text); },
        reveal() { locked = true; showSolution(); },
      };
    },

    llegeix(q, ctx) {
      const text = numCat(q.n);
      const card = U.h(`<div class="card" style="display:flex;align-items:center;gap:14px"><div class="text-num">${text}</div><button class="icon-btn" title="Escolta">🔊</button></div>`);
      card.querySelector('button').onclick = () => say(text);
      ctx.area.appendChild(card);
      const kp = keypad(ctx.area);
      return {
        afterInstr: () => say(text),
        check: () => (kp.value === null ? null : kp.value === q.n),
        bad: () => U.shake(kp.el.querySelector('.kp-display')),
        good: () => kp.lock(true),
        reveal() { kp.set(q.n); kp.lock(true); },
      };
    },

    valorXifra(q, ctx) {
      const s = String(q.n), pos = colsOf(q.n).indexOf(q.col), d = dig(q.n, q.col.v);
      let html = '';
      for (let i = 0; i < s.length; i++) {
        if (i > 0 && (s.length - i) % 3 === 0) html += '.';
        html += i === pos ? `<span class="hl">${s[i]}</span>` : s[i];
      }
      ctx.area.appendChild(U.h(`<div class="big-num">${html}</div>`));
      const others = U.shuffle(COLS.filter((c) => c !== q.col)).slice(0, 3);
      const opts = U.shuffle([q.col, ...others]).map((c) => ({ html: `${U.fmt(d * c.v)} <small style="opacity:.7">(${d} ${c.k})</small>`, ok: c === q.col }));
      return choices(ctx, opts);
    },

    quinaXifra(q, ctx) {
      ctx.area.appendChild(U.h(`<div class="big-num">${U.fmt(q.n)}</div>`));
      const d = dig(q.n, q.col.v);
      const set = [...new Set(String(q.n).split('').map(Number))].filter((x) => x !== d);
      while (set.length < 3) { const r = U.rand(0, 9); if (r !== d && !set.includes(r)) set.push(r); }
      const opts = U.shuffle([d, ...U.shuffle(set).slice(0, 3)]).map((x) => ({ html: `<span style="font-size:2.4rem">${x}</span>`, ok: x === d }));
      return choices(ctx, opts, { cls: 'digits' });
    },

    quinNumero(q, ctx) {
      const cs = colsOf(q.n);
      const parts = cs.map((c) => chip(c, `${dig(q.n, c.v)} ${c.k}`));
      const last = parts.pop();
      ctx.area.appendChild(U.h(`<div class="expr">${parts.join(', ')} i ${last}</div>`));
      const opts = U.shuffle([q.n, ...U.shuffle(nearby(q.n)).slice(0, 3)]).map((m) => ({ html: U.fmt(m), ok: m === q.n }));
      return choices(ctx, opts);
    },
  };

  // ---------- Progrés ----------
  const prog = () => store.get(SAVE, { stars: {}, intro: false, seen: {} });
  const saveProg = (p) => store.set(SAVE, p);
  const unlocked = (i, p) => i === 0 || (p.stars[(i < PLANETS.length ? PLANETS[i - 1] : PLANETS[PLANETS.length - 1]).id] || 0) > 0;
  const totalStars = (p) => Object.values(p.stars).reduce((a, b) => a + b, 0);

  // ---------- Pantalla d'inici ----------
  function splash() {
    Eloi.setBack(null);
    app.innerHTML = `<div class="splash">
      <div class="hero">🚀</div>
      <h1>Missió<br>Galàxia Numèrica</h1>
      <p class="sub">El Capità Zero ha robat els números. Només tu els pots salvar!</p>
      <button class="btn big" id="go">JUGAR ▶</button></div>`;
    app.querySelector('#go').onclick = async () => {
      Eloi.unlockAudio();
      sfx.whoosh();
      const p = prog();
      if (!p.intro) { await introStory(); p.intro = true; saveProg(p); }
      showMap();
    };
  }

  function introStory() {
    return story([
      { who: BIT, name: 'Bit', text: `Hola, Capità <b>${PLAYER}</b>! Sóc en <b>Bit</b>, el robot de la teva nau espacial. 🚀` },
      { who: BIT, name: 'Bit', text: 'Tenim un problema GRAN: el malvat <b>Capità Zero</b> ha robat els números de la galàxia! Sense números, les naus es perden i els planetes s\'apaguen.' },
      { who: ZERO, name: 'Capità Zero', text: 'Ha, ha, ha! Ara tots els números són meus! Ningú no sabrà descompondre\'ls ni escriure\'ls mai més! 🏴‍☠️' },
      { who: BIT, name: 'Bit', text: 'Hem de visitar 5 planetes i guanyar els seus <b>cristalls</b> 💎. Amb tots els cristalls, el nostre làser podrà vèncer el Capità Zero!' },
      { who: BIT, name: 'Bit', text: 'A cada planeta hi ha 6 reptes. Si t\'equivoques, tranquil: tens dos intents i jo t\'ajudaré. Endavant, Capità!', btn: 'A l\'espai! 🚀' },
    ]);
  }

  // ---------- Mapa ----------
  function showMap() {
    stopSay();
    Eloi.setBack(splash);
    const p = prog();
    const all = PLANETS.concat([BOSS]);
    const nextIdx = all.findIndex((pl, i) => unlocked(i, p) && !p.stars[pl.id]);
    app.innerHTML = `<div class="map">
      <h1>🌌 Mapa de la Galàxia</h1>
      <div class="crystals">Cristalls: ${PLANETS.map((pl) => (p.stars[pl.id] ? '💎' : '<span style="opacity:.3">💎</span>')).join(' ')} &nbsp; ⭐ ${totalStars(p)}</div>
      <div class="planets"></div>
      <div class="map-btns">
        <button class="btn blue" id="hist">📜 Història</button>
        ${p.stars.zero ? '<button class="btn" id="dipl">🏅 Diploma</button>' : ''}
      </div></div>`;
    const box = app.querySelector('.planets');
    all.forEach((pl, i) => {
      const open = unlocked(i, p), st = p.stars[pl.id] || 0;
      const el = U.h(`<button class="planet ${open ? '' : 'locked'} ${i === nextIdx ? 'next' : ''}" style="--c1:${pl.c1};--c2:${pl.c2}">
        ${i === nextIdx ? '<span class="ship">🚀</span>' : ''}
        <div class="orb">${pl.emoji}</div>
        <div class="pname">${pl.name}</div><div class="pskill">${pl.skill}</div>
        <div class="mini-stars">${[0, 1, 2].map((k) => `<span class="${k < st ? 'on' : ''}">⭐</span>`).join('')}</div></button>`);
      el.onclick = () => {
        if (!open) { sfx.bad(); floatMsg('🔒 Primer el planeta anterior!'); return; }
        sfx.whoosh();
        if (pl === BOSS) playBoss(); else playPlanet(pl);
      };
      box.appendChild(el);
    });
    app.querySelector('#hist').onclick = () => introStory();
    const d = app.querySelector('#dipl');
    if (d) d.onclick = showDiploma;
    if (nextIdx === -1 && !p.stars.zero) floatMsg('🏆');
  }

  // ---------- Joc d'un planeta ----------
  const PRAISE = ['Molt bé!', 'Genial!', 'Fantàstic!', 'Ets un crac!', 'Perfecte!', 'Increïble!', 'Bravo!', 'Molt ben fet!'];
  const EMO = ['🎉', '⭐', '🚀', '💥', '🌟', '👏', '🤩'];

  function playScreen(title, extraHead = '') {
    app.innerHTML = `<div class="play">
      ${extraHead}
      <div class="play-head"><div class="ptitle">${title}</div><div class="dots"></div></div>
      <div class="guide"><div class="gchar">${BIT}</div><div class="gbubble"></div>
        <div class="gbtns"><button class="icon-btn small" id="rep" title="Torna-ho a dir">🔊</button><button class="icon-btn small" id="dic" title="Diccionari de números">📖</button><button class="icon-btn small" id="help" title="Explicació">❓</button></div></div>
      <div class="area"></div>
      <div class="foot"><button class="btn green" id="chk">Comprova ✔</button></div></div>`;
    const bubble = app.querySelector('.gbubble');
    let current = '';
    const setGuide = (html, speak = true) => {
      current = html;
      bubble.innerHTML = html;
      bubble.classList.remove('pop'); void bubble.offsetWidth; bubble.classList.add('pop');
      return speak ? say(html) : Promise.resolve();
    };
    app.querySelector('#rep').onclick = () => say(current);
    app.querySelector('#dic').onclick = showDictionary;
    return { area: app.querySelector('.area'), button: app.querySelector('#chk'), dots: app.querySelector('.dots'), setGuide, help: app.querySelector('#help') };
  }

  function makeRender(S) {
    return (q, ctx) => {
      const R = RENDER[q.type](q, ctx);
      const sp = S.setGuide(instr(q));
      if (R.afterInstr) sp.then(R.afterInstr);
      return R;
    };
  }

  async function playPlanet(pl) {
    Eloi.setBack(showMap);
    const p = prog();
    if (!p.seen[pl.id]) { await story(pl.intro); p.seen[pl.id] = true; saveProg(p); }
    const S = playScreen(`${pl.emoji} ${pl.name}`);
    S.help.onclick = () => story(pl.intro);
    const N = 6;
    S.dots.innerHTML = '<span></span>'.repeat(N);
    const dots = [...S.dots.children];
    const res = await quiz({
      area: S.area, button: S.button,
      questions: Array.from({ length: N }, (_, i) => pl.gen(i)),
      render: makeRender(S),
      progress: (i) => dots.forEach((d, k) => d.classList.toggle('cur', k === i)),
      onCorrect: (q, { attempts }) => {
        sfx.ok();
        const w = U.pick(PRAISE);
        floatMsg(`${w} ${U.pick(EMO)}`);
        S.setGuide(`${w} ${attempts ? '' : 'A la primera! '}${U.pick(EMO)}`, !['escriu'].includes(q.type));
      },
      onWrong: (q, { giveUp }) => {
        sfx.bad();
        S.setGuide(giveUp ? 'No passa res! Mira la solució i fixa-t\'hi bé. 👀' : hint(q));
      },
      after: (r, i) => { dots[i].textContent = r.ok ? '💎' : '✔'; },
    });
    const stars = starsFor(res.mistakes, N);
    const p2 = prog();
    const first = !p2.stars[pl.id];
    p2.stars[pl.id] = Math.max(p2.stars[pl.id] || 0, stars);
    saveProg(p2);
    sfx.win(); confetti();
    const idx = PLANETS.indexOf(pl);
    const nextName = idx < PLANETS.length - 1 ? PLANETS[idx + 1].name : BOSS.name;
    say(`Has aconseguit el cristall del ${pl.name}!`);
    const v = await modal({
      icon: '💎', title: 'Cristall aconseguit!', stars,
      html: `<p>Has superat el <b>${pl.name}</b>${res.mistakes ? ` amb ${res.mistakes} ${res.mistakes === 1 ? 'error' : 'errors'}` : ' sense cap error'}!</p>${first ? `<p>Nou destí desbloquejat: <b>${nextName}</b> 🚀</p>` : ''}`,
      buttons: [{ label: '🔁 Repetir', value: 'again', cls: 'blue' }, { label: 'Mapa 🌌', value: 'map' }],
    });
    if (v === 'again') playPlanet(pl); else showMap();
  }

  // ---------- Batalla final ----------
  async function playBoss() {
    Eloi.setBack(showMap);
    await story([
      { who: ZERO, name: 'Capità Zero', text: `Ha, ha, ha! Així que tu ets el Capità <b>${PLAYER}</b>... No podràs amb mi! Tots els números són MEUS!` },
      { who: BIT, name: 'Bit', text: 'Cada resposta correcta dispara el nostre làser 💥. Si t\'equivoques, perdem un escut 🛡️. Tenim 3 escuts i només un intent per pregunta. Concentra\'t!', btn: 'A la batalla! ⚔️' },
    ]);
    const HPMAX = 8;
    let hp = HPMAX, shields = 3;
    const head = `<div class="boss-bar">
      <div class="boss-side"><div class="who" id="me">🚀</div><div><b>${PLAYER}</b><div class="shields">${'<span>🛡️</span>'.repeat(3)}</div></div></div>
      <div class="boss-side"><div style="text-align:right"><b>Capità Zero</b><div class="hp"><i style="width:100%"></i></div></div><div class="who" id="him">${ZERO}</div></div></div>`;
    const S = playScreen('⚔️ Batalla final', head);
    S.help.classList.add('hidden');
    S.dots.remove();
    const bar = app.querySelector('.boss-bar'), me = app.querySelector('#me'), him = app.querySelector('#him');
    const hpBar = app.querySelector('.hp i'), sh = [...app.querySelectorAll('.shields span')];
    const beam = (cls) => { const b = U.h(`<div class="beam ${cls}"></div>`); bar.appendChild(b); setTimeout(() => b.remove(), 400); };
    const hit = (el) => { el.classList.remove('hit'); void el.offsetWidth; el.classList.add('hit'); };
    await quiz({
      area: S.area, button: S.button, maxAttempts: 1, autoNextMs: 1200,
      questions: Array.from({ length: 40 }, bossQuestion),
      render: makeRender(S),
      onCorrect: () => {
        sfx.laser(); beam('me');
        setTimeout(() => { sfx.boom(); hit(him); hp--; hpBar.style.width = (hp / HPMAX) * 100 + '%'; }, 320);
        const w = U.pick(['Tocat!', 'Impacte directe!', 'Pam!', 'Boom!', 'Genial!']);
        floatMsg(`${w} 💥`);
        S.setGuide(w + ' 💥');
      },
      onWrong: () => {
        sfx.laser(); beam('him');
        setTimeout(() => { sfx.boom(); hit(me); shields--; sh.forEach((s, i) => s.classList.toggle('off', i >= shields)); }, 320);
        S.setGuide(shields > 1 ? 'Ens han tocat! Mira la solució i seguim lluitant! 🛡️' : 'Ens han tocat! 🛡️');
      },
      after: async () => { await U.sleep(350); if (hp <= 0 || shields <= 0) return 'stop'; },
    });
    if (hp <= 0) {
      sfx.win(); confetti(200);
      await story([
        { who: ZERO, name: 'Capità Zero', text: 'Noooo! Els meus zeros! Com pot ser que un Capità tan jove sàpiga tant de números?! 😵' },
        { who: BIT, name: 'Bit', text: `Ho has aconseguit, Capità <b>${PLAYER}</b>! Els números tornen a brillar a tota la galàxia! ✨` },
        { who: BIT, name: 'Bit', text: 'Com a recompensa, la Federació Galàctica t\'ha preparat un diploma especial. 🏅', btn: 'Veure el diploma 🏅' },
      ]);
      const p = prog();
      p.stars.zero = Math.max(p.stars.zero || 0, shields);
      saveProg(p);
      showDiploma();
    } else {
      say('El Capità Zero s\'ha escapat! Torna-ho a provar, tu pots!');
      const v = await modal({
        icon: '🏴‍☠️', title: 'El Capità Zero s\'ha escapat!',
        html: '<p>No passa res, els millors capitans també fallen. Torna-ho a provar, tu pots! 💪</p>',
        buttons: [{ label: '⚔️ Tornar a lluitar', value: 'again', cls: 'green' }, { label: 'Mapa 🌌', value: 'map' }],
      });
      if (v === 'again') playBoss(); else showMap();
    }
  }

  // ---------- Diploma ----------
  function showDiploma() {
    Eloi.setBack(showMap);
    const p = prog();
    const avui = new Date().toLocaleDateString('ca-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    app.innerHTML = `<div class="diploma">
      <div style="font-size:4rem">🏅</div>
      <h1>DIPLOMA</h1>
      <p style="font-size:1.3rem">La Federació Galàctica atorga el títol de</p>
      <p style="font-size:1.8rem;font-weight:700">Capità dels Números</p>
      <p>a</p><div class="name">${PLAYER}</div>
      <p style="font-size:1.15rem">per haver derrotat el Capità Zero i salvat la Galàxia Numèrica,<br>dominant les DM, UM, C, D i U.</p>
      <p style="font-size:1.6rem">⭐ ${totalStars(p)} estrelles &nbsp; 💎 5 cristalls</p>
      <p>${avui}</p>
      <div class="no-print" style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:16px">
        <button class="btn blue" id="print">🖨️ Imprimir</button><button class="btn" id="map">Mapa 🌌</button></div></div>`;
    app.querySelector('#print').onclick = () => window.print();
    app.querySelector('#map').onclick = showMap;
  }

  // ---------- Diccionari ----------
  function showDictionary() {
    sfx.click();
    modal({
      icon: '📖', title: 'Diccionari de números',
      html: `<div class="dict">${DICCIONARI.map(([n, t]) => `<div><b>${U.fmt(n)}</b> ${t}</div>`).join('')}</div>`,
      buttons: [{ label: 'Tancar', value: 'ok' }],
    });
  }

  Eloi.topbar();
  splash();
})();
