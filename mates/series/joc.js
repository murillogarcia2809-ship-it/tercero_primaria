/* Els Salts de la Granota Rita — completar sèries sumant i restant.
   Cada sèrie és un camí de nenúfars; la regla és el salt que fa la Rita (+2, −5, +100…).
   A cada nivell la Rita guanya un barret nou per a la col·lecció. */
(function () {
  'use strict';
  const { U, sfx, say, keypad, choices, store } = Eloi;

  const BARRETS = [
    { e: '🧢', nom: 'La gorra esportiva', txt: 'Per saltar més de pressa.' },
    { e: '🎀', nom: 'El llaç de festa', txt: 'Per anar a les festes de l\'estany.' },
    { e: '🥽', nom: 'Les ulleres de bus', txt: 'Per bussejar al fons de l\'estany.' },
    { e: '🎩', nom: 'El barret de mag', txt: 'D\'aquí en surten conills… i mosques!' },
    { e: '👒', nom: 'La pamela d\'estiu', txt: 'Per prendre el sol al nenúfar.' },
    { e: '🎓', nom: 'El birret de sàvia', txt: 'Per a les granotes més llestes.' },
    { e: '⛑️', nom: 'El casc de rescat', txt: 'Per als salts gegants.' },
    { e: '👑', nom: 'La corona de l\'estany', txt: 'La Rita és la reina de les sèries!' },
  ];
  // La Rita porta l'últim barret que ha guanyat
  function rita() {
    const lv = (store.get('series', {}) || {}).lv || {};
    let hat = '';
    LEVELS.forEach((l, i) => { if (lv[l.id]) hat = BARRETS[i].e; });
    return `<span class="rita">🐸${hat ? `<span class="hat">${hat}</span>` : ''}</span>`;
  }
  const RITA = '<span class="rita">🐸</span>';
  const COCO = '🐊';

  const fmtR = (s) => (s > 0 ? '+' + s : '−' + Math.abs(s));
  const nomR = (s) => (s > 0 ? `sumar ${s}` : `restar ${Math.abs(s)}`);

  // ---------- Generadors ----------
  // Sèrie de len números amb salt step, entre 0 i 999. lo/hi: on pot començar
  function serie(step, lo, hi, len) {
    let start;
    if (step > 0) start = U.rand(lo, Math.min(hi, 999 - step * (len - 1)));
    else start = U.rand(Math.max(lo, -step * (len - 1)), hi);
    return Array.from({ length: len }, (_, i) => start + i * step);
  }
  function falta(step, lo, hi, o = {}) {
    const len = o.len || 5;
    const s = serie(step, lo, hi, len);
    const pos = o.end ? len - 1 : U.rand(1, len - 1);
    return { type: 'falta', s, step, holes: [pos], showRule: !!o.rule, input: o.input || 'tria' };
  }
  const regla = (step, lo, hi) => ({ type: 'regla', s: serie(step, lo, hi, 5), step, holes: [] });
  function forats(step, lo, hi) {
    const s = serie(step, lo, hi, 6);
    const a = U.rand(1, 3);
    return { type: 'forats', s, step, holes: [a, U.rand(a + 1, 5)], showRule: false };
  }
  const mult = (step, max) => Math.abs(step) * U.rand(0, max);

  const LEVELS = [
    {
      id: 'petits', e: '🪷', n: 'Salts petits', d: 'Sumem 1 i 2',
      intro: [
        { who: RITA, name: 'Rita', text: 'Una <b>sèrie</b> és una fila de números que segueixen una <b>regla</b>. Jo salto de nenúfar en nenúfar seguint la regla!' },
        { who: RITA, name: 'Rita', text: 'Mira: 2, 4, 6, 8… Cada vegada salto <b>+2</b>. Per saber el següent, suma 2 a l\'últim: 8 + 2 = <b>10</b>!' },
      ],
      gen: (i) => falta(i % 2 ? 2 : 1, 0, 20, { end: i < 3, rule: true, input: i < 6 ? 'tria' : 'teclat' }),
    },
    {
      id: 'deu', e: '🔟', n: 'Salts de 5 i de 10', d: 'Comptem de 5 en 5 i de 10 en 10',
      intro: [
        { who: RITA, name: 'Rita', text: 'Ara salts més llargs! De 10 en 10: 10, 20, 30, 40… Només canvia la xifra de les <b>desenes</b>!' },
        { who: RITA, name: 'Rita', text: 'I també funciona si no comencem pel zero: 13, 23, 33, 43… Les unitats es queden quietes. 😎' },
      ],
      gen: (i) => {
        const step = i % 2 ? 5 : 10;
        const lo = i < 4 ? mult(step, 4) : U.rand(1, 40);
        return falta(step, lo, lo, { end: i < 2, rule: true, input: i < 5 ? 'tria' : 'teclat' });
      },
    },
    {
      id: 'enrere', e: '⬅️', n: 'Cap enrere', d: 'Restem 1 i 2',
      intro: [
        { who: RITA, name: 'Rita', text: 'Sorpresa! També sé saltar <b>cap enrere</b>. Quan la regla és de <b>restar</b>, els números es fan cada vegada més petits.' },
        { who: RITA, name: 'Rita', text: 'Mira: 20, 18, 16, 14… La regla és <b>−2</b>. El següent és 14 − 2 = <b>12</b>.' },
      ],
      gen: (i) => falta(i % 2 ? -2 : -1, 12, 40, { end: i < 3, rule: true, input: i < 6 ? 'tria' : 'teclat' }),
    },
    {
      id: 'enrere10', e: '⏪', n: 'Enrere de 5 i de 10', d: 'Restem 5 i 10',
      intro: [{ who: RITA, name: 'Rita', text: 'Ara cap enrere amb salts grans: 90, 80, 70… o 50, 45, 40… Compte, que l\'estany s\'acaba al zero!' }],
      gen: (i) => {
        const step = i % 2 ? -5 : -10;
        const a = Math.abs(step), hi = i < 4 ? a * U.rand(Math.ceil(40 / a), 100 / a) : U.rand(50, 99);
        return falta(step, hi, hi, { end: i < 2, rule: true, input: i < 5 ? 'tria' : 'teclat' });
      },
    },
    {
      id: 'tres', e: '🎯', n: 'Salts de 3 i de 4', d: 'Ara la regla s\'amaga!',
      intro: [
        { who: RITA, name: 'Rita', text: 'Als salts de 3 i de 4 cal estar molt atent. A vegades <b>amagaré la regla</b>, i l\'hauràs de descobrir tu!' },
        { who: RITA, name: 'Rita', text: 'El truc del detectiu: mira <b>dos números seguits</b> i pensa quant he saltat. De 7 a 10 he saltat <b>+3</b>!' },
      ],
      gen: (i) => {
        const step = i % 2 ? 4 : 3;
        if (i === 3 || i === 6) return regla(step, 0, 25);
        return falta(step, 0, 25, { rule: i < 3, input: i < 5 ? 'tria' : 'teclat' });
      },
    },
    {
      id: 'regla', e: '🔍', n: 'Descobreix la regla', d: 'Suma o resta? Quant?',
      intro: [{ who: RITA, name: 'Rita', text: 'Primer pregunta\'t: els números <b>pugen</b> o <b>baixen</b>? Si pugen, la regla és de sumar (+). Si baixen, és de restar (−). Després mira quant!' }],
      gen: (i) => {
        const step = U.pick([2, 3, 4, 5, 10, -2, -3, -4, -5, -10]);
        return i % 2 === 0 ? regla(step, 0, 60) : falta(step, 0, 60, { input: i < 5 ? 'tria' : 'teclat' });
      },
    },
    {
      id: 'gegants', e: '🚀', n: 'Salts gegants', d: 'Sumem i restem 20, 50 i 100',
      intro: [
        { who: RITA, name: 'Rita', text: 'He menjat una mosca supersònica i ara faig <b>salts gegants</b>! 🚀' },
        { who: RITA, name: 'Rita', text: 'De 100 en 100 només canvia la xifra de les <b>centenes</b>: 245, 345, 445… I de 20 en 20, les desenes salten de 2 en 2: 130, 150, 170…' },
      ],
      gen: (i) => {
        const step = [100, -100, 20, 50, -20, 100, -50, 20][i];
        return falta(step, 100, 600, { rule: i < 4, input: i < 3 ? 'tria' : 'teclat' });
      },
    },
    {
      id: 'forats', e: '🕳️', n: 'Dos forats', d: 'Falten dos nenúfars!',
      intro: [{ who: RITA, name: 'Rita', text: 'El cocodril s\'ha menjat <b>dos nenúfars</b>! Primer descobreix la regla i després omple els dos forats, d\'un en un.' }],
      gen: (i) => forats(U.pick(i < 4 ? [2, 5, 10, -2, -5, -10] : [3, 4, 20, -3, -4, 100]), 0, i < 4 ? 60 : 300),
    },
  ];
  LEVELS.forEach((l, i) => { l.premi = BARRETS[i]; l.N = 8; });

  function genBoss() {
    const step = U.pick([2, 3, 4, 5, 10, 20, 100, -2, -3, -5, -10, -100]);
    const big = Math.abs(step) >= 20;
    if (Math.random() < 0.25) return regla(step, big ? 100 : 0, big ? 500 : 60);
    return falta(step, big ? 100 : 0, big ? 500 : 60, { input: U.pick(['tria', 'teclat']) });
  }

  // ---------- Textos ----------
  function instr(q) {
    switch (q.type) {
      case 'falta': return q.showRule ? `La regla és <b>${fmtR(q.step)}</b>. Quin número va al nenúfar buit?` : 'Quin número va al nenúfar buit? Descobreix la regla!';
      case 'regla': return 'Quina és la regla d\'aquesta sèrie?';
      case 'forats': return 'Falten dos nenúfars! Omple primer el forat que brilla.';
    }
    return '';
  }
  function hint(q) {
    if (q.type === 'regla') return 'Pista: els números pugen o baixen? Mira quant canvia d\'un número al següent.';
    const p = q.holes[0];
    const prev = q.s[p - 1];
    if (q.showRule) return `Pista: el número d'abans és <b>${prev}</b>. Has de ${nomR(q.step)}: ${prev} ${q.step > 0 ? '+' : '−'} ${Math.abs(q.step)} = ?`;
    return `Pista: mira dos nenúfars seguits, com <b>${q.s[p === 1 ? 2 : 0]}</b> i <b>${q.s[p === 1 ? 3 : 1]}</b>. Quant ha saltat la Rita?`;
  }

  // ---------- L'estany ----------
  function estany(q, ctx) {
    const big = q.s.some((v) => v >= 100);
    const el = U.h(`<div class="pond ${big ? 'big' : ''}">${q.s.map((v, i) => `<div class="pad ${q.holes.includes(i) ? 'gap' : ''}" data-i="${i}">
      ${i ? `<i class="rl ${q.showRule ? '' : 'hid'}">${fmtR(q.step)}</i>` : ''}<span>${q.holes.includes(i) ? '?' : v}</span></div>`).join('')}
      <div class="frog">${rita()}</div></div>`);
    ctx.area.appendChild(el);
    const pads = [...el.querySelectorAll('.pad')], frog = el.querySelector('.frog');
    const place = (i) => {
      const p = pads[i];
      frog.style.left = p.offsetLeft + p.offsetWidth / 2 + 'px';
      frog.style.top = p.offsetTop + 'px';
    };
    requestAnimationFrame(() => place(0));
    addEventListener('resize', () => place(0), { once: true });
    const api = {
      el, pads,
      fill(i, ok = true) { const p = pads[i]; p.querySelector('span').textContent = q.s[i]; p.classList.remove('gap', 'cur'); p.classList.add(ok ? 'ok' : 'shown'); },
      showRules() { el.querySelectorAll('.rl').forEach((r) => r.classList.remove('hid')); },
      async hop() {
        for (let i = 1; i < pads.length; i++) {
          frog.classList.remove('jump'); void frog.offsetWidth; frog.classList.add('jump');
          place(i);
          Eloi.sfx.pop();
          await U.sleep(330);
        }
      },
    };
    return api;
  }

  const RENDER = {
    falta(q, ctx) {
      const E = estany(q, ctx);
      const h = q.holes[0], want = q.s[h];
      const fi = () => { E.fill(h); E.showRules(); E.hop(); };
      if (q.input === 'teclat') {
        const kp = keypad(ctx.area, { max: 3 });
        return {
          check: () => (kp.value === null ? null : kp.value === want),
          bad: () => U.shake(kp.el.querySelector('.kp-display')),
          good: () => { kp.lock(true); fi(); },
          reveal() { kp.set(want); kp.lock(true); E.fill(h, false); E.showRules(); },
        };
      }
      const st = Math.abs(q.step);
      const mal = [want + 1, want - 1, want + st, want - st, q.s[h - 1] - q.step, want + 10].filter((v, i, a) => v >= 0 && v !== want && a.indexOf(v) === i);
      const R = choices(ctx, U.shuffle([want, ...U.shuffle(mal).slice(0, 3)]).map((v) => ({ html: v, ok: v === want })), { cls: 'nums' });
      const good = R.good, rev = R.reveal;
      R.good = () => { good(); fi(); };
      R.reveal = () => { rev(); E.fill(h, false); E.showRules(); };
      return R;
    },

    regla(q, ctx) {
      const E = estany(q, ctx);
      const s = q.step, a = Math.abs(s);
      const cands = [-s, s + (s > 0 ? 1 : -1), a > 1 ? s - (s > 0 ? 1 : -1) : s * 2, s * 2, -s - (s > 0 ? 1 : -1)]
        .filter((v, i, arr) => v !== 0 && v !== s && arr.indexOf(v) === i);
      const R = choices(ctx, U.shuffle([s, ...U.shuffle(cands).slice(0, 3)]).map((v) => ({ html: fmtR(v), ok: v === s })), { cls: 'nums' });
      const good = R.good, rev = R.reveal;
      R.good = () => { good(); E.showRules(); E.hop(); };
      R.reveal = () => { rev(); E.showRules(); };
      return R;
    },

    // Dos forats que s'omplen d'un en un, amb tres opcions cada vegada
    forats(q, ctx, G) {
      const E = estany(q, ctx);
      const opts = U.h('<div class="choices nums"></div>');
      ctx.area.appendChild(opts);
      let k = 0, errors = 0;
      function show() {
        const h = q.holes[k], want = q.s[h];
        E.pads.forEach((p, i) => p.classList.toggle('cur', i === h));
        const st = Math.abs(q.step);
        const mal = U.shuffle([want + 1, want - 1, want + st, want - st, want + 2].filter((v, i, a) => v >= 0 && v !== want && a.indexOf(v) === i)).slice(0, 2);
        opts.innerHTML = '';
        U.shuffle([want, ...mal]).forEach((v) => {
          const b = U.h(`<button class="choice">${v}</button>`);
          b.onclick = async () => {
            if (b.disabled) return;
            if (v !== want) {
              errors++; sfx.bad();
              b.classList.add('wrong'); b.disabled = true; U.shake(b);
              if (errors >= 2) E.showRules();
              G.setGuide(`Pista: la regla és <b>${fmtR(q.step)}</b>. Mira el nenúfar d'abans i ${nomR(q.step)}.`);
              return;
            }
            sfx.tick();
            opts.querySelectorAll('.choice').forEach((x) => { x.disabled = true; });
            b.classList.add('right');
            E.fill(h);
            say(String(want));
            k++;
            await U.sleep(600);
            if (k < q.holes.length) show();
            else { opts.innerHTML = ''; E.showRules(); E.hop(); ctx.submit(); }
          };
          opts.appendChild(b);
        });
      }
      show();
      return { auto: true, extraMistakes: () => errors, check: () => (k >= q.holes.length ? true : null), good() {} };
    },
  };

  Eloi.missio({
    save: 'series',
    splash: { hero: '🐸', title: 'Els Salts de<br>la Granota Rita', sub: 'Completa les sèries de nenúfars, guanya barrets i escapa del cocodril!' },
    guide: { who: rita, name: 'Rita' },
    intro: [
      { who: RITA, name: 'Rita', text: 'Hola, <b>{nom}</b>! Sóc la <b>Rita</b>, la granota més saltarina de l\'estany! 🐸' },
      { who: RITA, name: 'Rita', text: 'Per creuar l\'estany salto de nenúfar en nenúfar, però sempre seguint una <b>regla</b>: sumar o restar el mateix número.' },
      { who: COCO, name: 'Cocodril Dentut', text: 'Nyam, nyam… M\'he menjat uns quants nenúfars! A veure com passes ara, granoteta! 🐊' },
      { who: RITA, name: 'Rita', text: 'Ajuda\'m a endevinar quins números falten! A cada nivell guanyaré un <b>barret nou</b>. M\'encanten els barrets! 🎩', btn: 'Som-hi! 🐸' },
    ],
    mapTitle: '🪷 L\'estany de la Rita',
    album: { title: 'Els barrets de la Rita', empty: '❔', icon: '🎩' },
    levels: LEVELS,
    boss: {
      id: 'final', e: '🐊', n: 'Escapa del cocodril!', d: 'Totes les sèries barrejades',
      intro: [
        { who: COCO, name: 'Cocodril Dentut', text: 'Ara sí que t\'atraparé, granoteta! Nyam! 🐊' },
        { who: RITA, name: 'Rita', text: 'Cada resposta correcta és un salt lluny del cocodril i el deixa més cansat 💦. Si t\'equivoques, perds un cor ❤️. Tens 3 cors i un sol intent!', btn: 'Salta! 🐸' },
      ],
      gen: genBoss, hp: 10, lives: 3, me: '🐸', him: COCO, himName: 'Cocodril',
      hits: ['Boing! Lluny! 🐸', 'Quin salt! 💦', 'No m\'atrapes! 🐸', 'Saltiró! 💨'],
      misses: ['Ai! Gairebé m\'atrapa! Mira la solució. 😬', 'Nyam! Compte, que mossego! 🐊'],
      win: [
        { who: COCO, name: 'Cocodril Dentut', text: 'Uf, uf… Estic rebentat! Aquesta granota salta massa bé. Me\'n vaig a fer la migdiada… 😴🐊' },
        { who: RITA, name: 'Rita', text: 'Ho hem aconseguit, <b>{nom}</b>! Ets {el rei|la reina} de les sèries! I mira quina col·lecció de barrets! 🧢🎀🥽🎩👒🎓⛑️👑' },
        { who: RITA, name: 'Rita', text: 'T\'has guanyat un <b>joc de regal</b> i el teu <b>diploma</b>! 🎁🏅', btn: 'Vull el premi! 🎁' },
      ],
    },
    render: RENDER, instr, hint,
    sayGood: (q) => `La regla és ${fmtR(q.step)}`,
    final: { titol: '{Campió|Campiona} de les Sèries', motiu: 'per haver completat sèries sumant i restant, i haver ajudat la Granota Rita a escapar del Cocodril Dentut.', emoji: '🐸', signa: 'Rita la Granota 🐸' },
  });
})();
