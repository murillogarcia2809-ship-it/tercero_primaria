/* El Detectiu Lupa i els Números Perduts — els nombres cardinals (i la diferència amb els ordinals).
   Cada nivell és un cas: llegir, veïns, comparar, ordenar, recta numèrica, parells i senars,
   números grans, endevinalles i ordinals. A cada cas es guanya una pista per a la col·lecció. */
(function () {
  'use strict';
  const { U, sfx, say, keypad, choices } = Eloi;
  const { numCat, erradesText } = NombresCa;

  const LUPA = '<span class="lupa">🐶<span class="lupa-g">🔍</span></span>';
  const RATA = '🐀';

  const PISTES = [
    { e: '🔑', nom: 'La clau rovellada', txt: 'Obre la porta del soterrani.' },
    { e: '👣', nom: 'Les petjades de rata', txt: 'Petites, petites… i amb cua!' },
    { e: '🧀', nom: 'El formatge mossegat', txt: 'Encara hi ha les marques de les dents.' },
    { e: '🗺️', nom: 'El mapa del tresor', txt: 'Amb una X ben grossa.' },
    { e: '🔦', nom: 'La llanterna', txt: 'Per buscar als racons foscos.' },
    { e: '🧦', nom: 'El mitjó desaparellat', txt: 'On és l\'altre mitjó?' },
    { e: '🧰', nom: 'La caixa forta', txt: 'Només s\'obre amb el número correcte.' },
    { e: '📜', nom: 'La carta misteriosa', txt: 'Està escrita amb endevinalles.' },
    { e: '🏅', nom: 'La insígnia daurada', txt: 'La del millor detectiu de la ciutat!' },
  ];

  // ---------- Utilitats ----------
  const uniq = (arr, ok) => arr.filter((v, i, a) => a.indexOf(v) === i && ok(v));
  const ORD = ['primer', 'segon', 'tercer', 'quart', 'cinquè', 'sisè'];
  const ORD_AB = ['1r', '2n', '3r', '4t', '5è', '6è'];
  const ANIMALS = [
    { e: '🐢', n: 'la tortuga' }, { e: '🐇', n: 'el conill' }, { e: '🐌', n: 'el cargol' },
    { e: '🦔', n: 'l\'eriçó' }, { e: '🐿️', n: 'l\'esquirol' }, { e: '🦆', n: 'l\'ànec' }, { e: '🐷', n: 'el porquet' },
  ];
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  function wrapChoices(R, onGood, onReveal) {
    const g = R.good, r = R.reveal;
    R.good = () => { g(); onGood && onGood(); };
    R.reveal = () => { r(); (onReveal || onGood) && (onReveal || onGood)(); };
    return R;
  }
  function kpR(ctx, want, max, after) {
    const kp = keypad(ctx.area, { max });
    return {
      check: () => (kp.value === null ? null : kp.value === want),
      bad: () => U.shake(kp.el.querySelector('.kp-display')),
      good: () => { kp.lock(true); after && after(); },
      reveal() { kp.set(want); kp.lock(true); after && after(); },
    };
  }
  // Números semblants per a opcions
  function semblants(n) {
    const s = String(n), r = s.split('').reverse().join('');
    return uniq([n + 1, n - 1, n + 10, n - 10, +r, n + 100, n - 100], (v) => v > 0 && v !== n && String(v).length === s.length);
  }

  // ---------- Generadors ----------
  const no0 = (a, b) => { let v; do v = U.rand(a, b); while (v % 10 === 0 && Math.random() < 0.6); return v; };
  function genVeins(i, hard) {
    let n = no0(hard ? 100 : 20, hard ? 999 : 99);
    if (i % 3 === 2) n = U.rand(1, 9) * 100 + (Math.random() < 0.5 ? 99 : 0) // 299 → 300, 400 → 399
    return { type: 'veins', n, dir: n % 100 === 0 ? 'abans' : n % 100 === 99 ? 'despres' : U.pick(['abans', 'despres']), input: i < 4 ? 'tria' : 'teclat' };
  }
  function genCompara(i) {
    const dg = i < 3 ? 2 : i < 6 ? 3 : 4;
    const a = U.rand(10 ** (dg - 1), 10 ** dg - 1);
    let b;
    const r = Math.random();
    if (i === 5 || (i > 5 && r < 0.15)) b = a;                       // iguals
    else if (r < 0.5) { const s = String(a).split(''); const k = U.rand(1, dg - 1); s[k] = String((+s[k] + U.rand(1, 9)) % 10); b = +s.join(''); }
    else if (r < 0.7 && dg > 2) b = U.rand(10 ** (dg - 2), 10 ** (dg - 1) - 1); // menys xifres
    else b = U.rand(10 ** (dg - 1), 10 ** dg - 1);
    return Math.random() < 0.5 ? { type: 'compara', a, b } : { type: 'compara', a: b, b: a };
  }
  function genOrdena(i) {
    const dg = i < 3 ? 2 : 3;
    const s = new Set();
    const base = U.rand(1, 9) * (dg === 2 ? 10 : 100);
    while (s.size < 4) s.add(i % 2 ? U.rand(10 ** (dg - 1), 10 ** dg - 1) : base + U.rand(0, dg === 2 ? 9 : 99));
    return { type: 'ordena', nums: [...s], asc: i < 5 || i % 2 === 0 };
  }
  function genRecta(i) {
    if (i < 4) return { type: 'recta', from: 0, to: 100, step: 10, v: U.rand(1, 9) * 10 };
    if (i < 7) return { type: 'recta', from: 0, to: 1000, step: 100, v: U.rand(1, 9) * 100 };
    const c = U.rand(1, 8) * 100;
    return { type: 'recta', from: c, to: c + 100, step: 10, v: c + U.rand(1, 9) * 10 };
  }
  function genMisteri() {
    const t = U.rand(0, 4);
    if (t === 0) { const d = U.rand(2, 9), u = U.rand(1, 9); return { type: 'misteri', n: d * 10 + u, txt: `Sóc més gran que <b>${d * 10}</b> i més petit que <b>${d * 10 + 10}</b>. La meva xifra de les unitats és un <b>${u}</b>. Qui sóc?` }; }
    if (t === 1) { const n = U.rand(21, 98); return { type: 'misteri', n, txt: `Vaig just després del <b>${n - 1}</b> i just abans del <b>${n + 1}</b>. Qui sóc?` }; }
    if (t === 2) { const n = U.rand(2, 10); return { type: 'misteri', n: n * 2, txt: `Sóc el <b>doble</b> de ${n}. Qui sóc?` }; }
    if (t === 3) { const c = U.rand(1, 9), d = U.rand(0, 9), u = U.rand(0, 9); return { type: 'misteri', n: c * 100 + d * 10 + u, txt: `Tinc <b>${c} centenes</b>, <b>${d} desenes</b> i <b>${u} unitats</b>. Qui sóc?` }; }
    const d = U.rand(1, 9) * 10; return { type: 'misteri', n: d + 10, txt: `Sóc el número rodó que va després del <b>${d}</b> quan comptes de 10 en 10. Qui sóc?` };
  }
  function genOrdinal(i) {
    const run = U.shuffle(ANIMALS).slice(0, 5);
    const pos = U.rand(0, 4);
    const mode = ['lloc', 'qui', 'lloc', 'quants', 'qui', 'abrev', 'lloc', 'quants'][i % 8];
    return { type: 'ordinal', run, pos, mode };
  }

  const LEVELS = [
    {
      id: 'llegir', e: '🗣️', n: 'El cas del número parlant', d: 'Llegir números fins al 100',
      intro: [
        { who: LUPA, name: 'Lupa', text: 'Els <b>nombres cardinals</b> són els que fem servir per <b>comptar</b>: u, dos, tres… cent! Diuen <b>quantes coses</b> hi ha.' },
        { who: LUPA, name: 'Lupa', text: 'Primer cas: la Rata Embolica ha barrejat els noms dels números. Has de trobar el nom correcte de cada número!' },
      ],
      gen: (i) => (i % 2 === 0 ? { type: 'nom', n: no0(i < 4 ? 11 : 21, 99) } : { type: 'xifres', n: no0(i < 4 ? 11 : 21, 99) }),
    },
    {
      id: 'veins', e: '🏘️', n: 'El cas dels veïns', d: 'El número d\'abans i el de després',
      intro: [
        { who: LUPA, name: 'Lupa', text: 'Cada número té dos veïns: el d\'<b>abans</b> (un menys) i el de <b>després</b> (un més). El 46 viu entre el 45 i el 47!' },
        { who: LUPA, name: 'Lupa', text: 'Compte amb els números que acaben en <b>9</b>: després del 299 ve el <b>300</b>. I abans del 400 hi ha el <b>399</b>!' },
      ],
      gen: (i) => genVeins(i, i >= 3),
    },
    {
      id: 'compara', e: '🐊', n: 'El cas del cocodril golafre', d: 'Més gran, més petit o igual',
      intro: [
        { who: LUPA, name: 'Lupa', text: 'Per comparar números fem servir els signes <b>&gt;</b> (més gran que), <b>&lt;</b> (més petit que) i <b>=</b> (igual).' },
        { who: LUPA, name: 'Lupa', text: 'Truc: el signe és la <b>boca d\'un cocodril golafre</b> 🐊, i sempre s\'obre cap al número <b>més gran</b>, perquè vol menjar més!' },
        { who: LUPA, name: 'Lupa', text: 'Per saber quin és més gran: primer mira <b>quantes xifres</b> tenen. Si en tenen les mateixes, compara-les d\'<b>esquerra a dreta</b>.' },
      ],
      gen: genCompara,
    },
    {
      id: 'ordena', e: '📏', n: 'El cas de la fila', d: 'Ordenar de petit a gran',
      intro: [{ who: LUPA, name: 'Lupa', text: 'La Rata ha desordenat la fila dels números! Toca\'ls en ordre, del <b>més petit</b> al <b>més gran</b>. I a vegades a l\'inrevés!' }],
      gen: genOrdena,
    },
    {
      id: 'recta', e: '📍', n: 'El cas de la recta', d: 'On és el número?',
      intro: [{ who: LUPA, name: 'Lupa', text: 'A la <b>recta numèrica</b> els números estan en ordre, com les cases d\'un carrer. Compta les ratlletes per saber on és la fletxa!' }],
      gen: genRecta,
    },
    {
      id: 'parells', e: '🧦', n: 'El cas dels mitjons', d: 'Parells i senars',
      intro: [
        { who: LUPA, name: 'Lupa', text: 'Un número és <b>parell</b> si pots fer parelles sense que en sobri cap, com els mitjons. Si en sobra un, és <b>senar</b>!' },
        { who: LUPA, name: 'Lupa', text: 'Truc ràpid: mira l\'<b>última xifra</b>. Si és 0, 2, 4, 6 o 8, el número és parell. Si és 1, 3, 5, 7 o 9, és senar.' },
      ],
      gen: (i) => ({ type: 'parell', n: i < 3 ? U.rand(2, 12) : i < 6 ? U.rand(13, 99) : U.rand(100, 999) }),
    },
    {
      id: 'grans', e: '🧰', n: 'El cas de la caixa forta', d: 'Números fins al 9.999',
      intro: [{ who: LUPA, name: 'Lupa', text: 'La caixa forta de la Rata té números <b>grans</b>, amb milers! Truc: parteix el número pel <b>punt</b>. A l\'esquerra hi ha els milers: 3.450 → <b>tres mil</b> quatre-cents cinquanta.' }],
      gen: (i) => {
        const n = i < 3 ? U.rand(1, 9) * 1000 + U.rand(1, 9) * 100 : U.rand(1000, 9999);
        return i % 2 ? { type: 'xifres', n, input: 'teclat' } : { type: 'nom', n };
      },
    },
    {
      id: 'misteri', e: '📜', n: 'El cas de la carta misteriosa', d: 'Endevina el número',
      intro: [{ who: LUPA, name: 'Lupa', text: 'Hem trobat una carta plena d\'<b>endevinalles</b> de números! Llegeix cada pista amb atenció i escriu el número misteriós.' }],
      gen: () => genMisteri(),
    },
    {
      id: 'ordinals', e: '🏁', n: 'El cas de la gran cursa', d: 'Cardinals i ordinals',
      intro: [
        { who: LUPA, name: 'Lupa', text: 'Els números de comptar són els <b>cardinals</b>: u, dos, tres… Però per dir <b>en quin lloc</b> queda algú, fem servir els <b>ordinals</b>!' },
        { who: LUPA, name: 'Lupa', text: 'Els ordinals són: <b>primer</b> (1r), <b>segon</b> (2n), <b>tercer</b> (3r), <b>quart</b> (4t), <b>cinquè</b> (5è)…<br>Comptem des de la meta 🏁: el primer és el que hi arriba abans!' },
      ],
      gen: genOrdinal,
    },
  ];
  LEVELS.forEach((l, i) => { l.premi = PISTES[i]; l.N = 8; });

  function genBoss() {
    const i = U.rand(2, 7);
    return U.pick([
      () => ({ type: 'nom', n: U.rand(100, 999) }), () => ({ type: 'xifres', n: U.rand(100, 9999), input: 'teclat' }),
      () => genVeins(i, true), () => genCompara(i), () => genOrdena(i), () => genRecta(i),
      () => ({ type: 'parell', n: U.rand(10, 999) }), () => genMisteri(), () => genOrdinal(i),
    ])();
  }

  // ---------- Textos ----------
  function instr(q) {
    switch (q.type) {
      case 'nom': return 'Com es llegeix aquest número?';
      case 'xifres': return q.input === 'teclat' ? 'Escriu aquest número amb xifres. Toca l\'altaveu per escoltar-lo.' : 'Quin número és? Toca l\'altaveu per escoltar-lo.';
      case 'veins': return q.dir === 'abans' ? `Quin número va just <b>abans</b> del ${U.fmt(q.n)}?` : `Quin número va just <b>després</b> del ${U.fmt(q.n)}?`;
      case 'compara': return 'Quin signe hi va? Recorda: la boca del cocodril s\'obre cap al més gran!';
      case 'ordena': return q.asc ? 'Toca els números del <b>més petit</b> al <b>més gran</b>.' : 'Ara a l\'inrevés! Toca els números del <b>més gran</b> al <b>més petit</b>.';
      case 'recta': return 'Quin número assenyala la fletxa?';
      case 'parell': return `El ${U.fmt(q.n)}, és parell o senar?`;
      case 'misteri': return 'Endevinalla! Qui és el número misteriós?';
      case 'ordinal': {
        const a = q.run[q.pos];
        if (q.mode === 'lloc') return `En quin lloc ha arribat ${a.n}?`;
        if (q.mode === 'qui') return `Qui ha arribat en <b>${ORD[q.pos]}</b> lloc?`;
        if (q.mode === 'abrev') return `Com s'escriu <b>${ORD[q.pos]}</b> en abreujat?`;
        return `Quants animals han arribat <b>abans</b> que ${a.n}?`;
      }
    }
    return '';
  }
  function hint(q) {
    switch (q.type) {
      case 'nom': case 'xifres': return q.n >= 1000 ? 'Pista: parteix el número pel punt. Primer els milers, després les centenes i al final la resta.' : 'Pista: fixa\'t bé en les desenes i en els guionets. Vint porta <b>-i-</b>: vint-i-tres. Els altres, només guionet: trenta-tres.';
      case 'veins': return q.dir === 'abans' ? `Pista: el d'abans és un menys. ${U.fmt(q.n)} − 1 = ?` : `Pista: el de després és un més. ${U.fmt(q.n)} + 1 = ?`;
      case 'compara': return 'Pista: compta les xifres. Si en tenen les mateixes, compara la primera xifra de l\'esquerra. Si és igual, mira la següent.';
      case 'recta': return `Pista: cada ratlleta val <b>${q.step}</b>. Comença a comptar des del ${U.fmt(q.from)}.`;
      case 'parell': return `Pista: mira l'última xifra, el <b>${q.n % 10}</b>. Si és 0, 2, 4, 6 o 8, és parell.`;
      case 'misteri': return 'Pista: torna a llegir la carta a poc a poc. Cada frase t\'acosta al número!';
      case 'ordinal': return 'Pista: compta des de la meta 🏁. El que hi està més a prop és el primer.';
    }
    return 'Torna-ho a provar!';
  }

  // ---------- Pantalles ----------
  const RENDER = {
    nom(q, ctx) {
      ctx.area.appendChild(U.h(`<div class="big-q">${U.fmt(q.n)}</div>`));
      const t = numCat(q.n);
      let mal = U.shuffle(erradesText(q.n));
      semblants(q.n).forEach((v) => { const x = numCat(v); if (!mal.includes(x) && x !== t) mal.push(x); });
      mal = mal.slice(0, 3);
      const R = choices(ctx, U.shuffle([t, ...mal]).map((x) => ({ html: x, ok: x === t })), { cls: 'one-col' });
      R.speaks = true;
      return wrapChoices(R, () => say(t));
    },
    xifres(q, ctx) {
      const t = numCat(q.n);
      const card = U.h(`<div class="nom-card"><span>${t}</span><button class="icon-btn" title="Escolta">🔊</button></div>`);
      card.querySelector('button').onclick = () => say(t);
      ctx.area.appendChild(card);
      if (q.input === 'teclat') { const R = kpR(ctx, q.n, 4); R.afterInstr = () => say(t); return R; }
      const R = choices(ctx, U.shuffle([q.n, ...U.shuffle(semblants(q.n)).slice(0, 3)]).map((v) => ({ html: U.fmt(v), ok: v === q.n })), { cls: 'nums' });
      R.afterInstr = () => say(t);
      return R;
    },
    veins(q, ctx) {
      const want = q.dir === 'abans' ? q.n - 1 : q.n + 1;
      const box = U.h(`<div class="houses">
        <div class="house ${q.dir === 'abans' ? 'q' : ''}"><span>🏠</span><b>${q.dir === 'abans' ? '?' : U.fmt(q.n - 1)}</b></div>
        <div class="house me"><span>🏡</span><b>${U.fmt(q.n)}</b></div>
        <div class="house ${q.dir === 'despres' ? 'q' : ''}"><span>🏠</span><b>${q.dir === 'despres' ? '?' : U.fmt(q.n + 1)}</b></div></div>`);
      ctx.area.appendChild(box);
      const fill = () => { const h = box.querySelector('.house.q'); h.querySelector('b').textContent = U.fmt(want); h.classList.add('ok'); };
      if (q.input === 'teclat') return kpR(ctx, want, 4, fill);
      const mal = uniq([q.n, want + (q.dir === 'abans' ? -1 : 1), want + 10, want - 10, q.dir === 'abans' ? q.n + 1 : q.n - 1], (v) => v >= 0 && v !== want);
      return wrapChoices(choices(ctx, U.shuffle([want, ...mal.slice(0, 3)]).map((v) => ({ html: U.fmt(v), ok: v === want })), { cls: 'nums' }), fill);
    },
    compara(q, ctx) {
      const want = q.a > q.b ? '>' : q.a < q.b ? '<' : '=';
      const el = U.h(`<div class="cmp"><b>${U.fmt(q.a)}</b><span class="cmp-s">?</span><b>${U.fmt(q.b)}</b></div>`);
      ctx.area.appendChild(el);
      const esc = { '>': '&gt;', '<': '&lt;', '=': '=' };
      const fill = () => { const s = el.querySelector('.cmp-s'); s.innerHTML = esc[want]; s.classList.add('ok'); };
      const R = choices(ctx, ['<', '=', '>'].map((s) => ({ html: `<span class="sig">${esc[s]}</span>`, ok: s === want })), { cls: 'sigs' });
      return wrapChoices(R, fill);
    },
    // Tocar en ordre: només s'accepta el número correcte; cada error compta
    ordena(q, ctx, G) {
      const order = q.nums.slice().sort((a, b) => (q.asc ? a - b : b - a));
      const slots = U.h(`<div class="ord-slots">${order.map(() => '<span class="ord-slot"></span>').join(`<i>${q.asc ? '&lt;' : '&gt;'}</i>`)}</div>`);
      const bank = U.h('<div class="ord-bank"></div>');
      ctx.area.append(slots, bank);
      let k = 0, errors = 0;
      q.nums.forEach((v) => {
        const b = U.h(`<button class="ord-n">${U.fmt(v)}</button>`);
        b.onclick = () => {
          if (b.classList.contains('used') || k >= order.length) return;
          if (v !== order[k]) {
            errors++; sfx.bad(); U.shake(b);
            G.setGuide(q.asc ? `Encara no! Busca el <b>més petit</b> dels que queden.` : `Encara no! Busca el <b>més gran</b> dels que queden.`);
            return;
          }
          sfx.tick();
          b.classList.add('used');
          const s = slots.querySelectorAll('.ord-slot')[k];
          s.textContent = U.fmt(v); s.classList.add('ok');
          k++;
          if (k === order.length) setTimeout(() => ctx.submit(), 400);
        };
        bank.appendChild(b);
      });
      return { auto: true, extraMistakes: () => errors, check: () => (k >= order.length ? true : null), good() {} };
    },
    recta(q, ctx) {
      const n = (q.to - q.from) / q.step, W = 340, x0 = 20, x1 = 320;
      const X = (v) => x0 + ((v - q.from) / (q.to - q.from)) * (x1 - x0);
      let ticks = '';
      for (let i = 0; i <= n; i++) {
        const v = q.from + i * q.step, x = X(v), big = i === 0 || i === n || i === n / 2;
        ticks += `<line x1="${x}" y1="${big ? 40 : 46}" x2="${x}" y2="${big ? 64 : 58}" stroke="#fff" stroke-width="${big ? 3 : 2}"/>`;
        if (big) ticks += `<text x="${x}" y="84" text-anchor="middle" fill="#fff" font-size="15" font-weight="700">${U.fmt(v)}</text>`;
      }
      const svg = U.h(`<div class="recta"><svg viewBox="0 0 ${W} 92" xmlns="http://www.w3.org/2000/svg">
        <line x1="${x0 - 8}" y1="52" x2="${x1 + 8}" y2="52" stroke="#fff" stroke-width="4" stroke-linecap="round"/>${ticks}
        <g class="arrow"><text x="${X(q.v)}" y="30" text-anchor="middle" font-size="26">🔻</text></g>
        <text class="ans" x="${X(q.v)}" y="12" text-anchor="middle" fill="#ffd23f" font-size="15" font-weight="700"></text></svg></div>`);
      ctx.area.appendChild(svg);
      const fill = () => { svg.querySelector('.ans').textContent = U.fmt(q.v); };
      const mal = uniq([q.v + q.step, q.v - q.step, q.v + 2 * q.step, q.v - 2 * q.step, q.v + q.step / 2], (v) => v > q.from && v < q.to && v !== q.v);
      return wrapChoices(choices(ctx, U.shuffle([q.v, ...U.shuffle(mal).slice(0, 3)]).map((v) => ({ html: U.fmt(v), ok: v === q.v })), { cls: 'nums' }), fill);
    },
    parell(q, ctx) {
      const par = q.n % 2 === 0;
      ctx.area.appendChild(U.h(`<div class="big-q">${U.fmt(q.n)}</div>`));
      const pics = q.n <= 12 ? U.h(`<div class="socks">${Array.from({ length: Math.ceil(q.n / 2) }, (_, i) => `<span class="pair">${i * 2 + 1 < q.n ? '🧦🧦' : '🧦'}</span>`).join('')}</div>`) : null;
      if (pics) ctx.area.appendChild(pics);
      return choices(ctx, [{ html: 'Parell 👫', ok: par }, { html: 'Senar 🧍', ok: !par }], { cls: 'two' });
    },
    misteri(q, ctx) {
      const card = U.h(`<div class="carta">📜 ${q.txt}</div>`);
      ctx.area.appendChild(card);
      const R = kpR(ctx, q.n, 3);
      R.afterInstr = () => say(q.txt);
      return R;
    },
    ordinal(q, ctx) {
      const race = U.h(`<div class="race"><span class="flag">🏁</span>${q.run.map((a, i) => `<div class="runner ${i === q.pos && q.mode !== 'qui' ? 'hl' : ''}"><span>${a.e}</span><small class="pl">${ORD_AB[i]}</small></div>`).join('')}</div>`);
      ctx.area.appendChild(race);
      const show = () => race.classList.add('shown');
      const a = q.run[q.pos];
      if (q.mode === 'lloc') {
        const opts = U.shuffle([q.pos, ...U.shuffle([0, 1, 2, 3, 4].filter((k) => k !== q.pos)).slice(0, 3)]);
        return wrapChoices(choices(ctx, opts.map((k) => ({ html: `${cap(ORD[k])} (${ORD_AB[k]})`, ok: k === q.pos })), { cls: 'nums' }), show);
      }
      if (q.mode === 'qui') {
        const opts = U.shuffle([a, ...U.shuffle(q.run.filter((r) => r !== a)).slice(0, 3)]);
        return wrapChoices(choices(ctx, opts.map((r) => ({ html: `<span style="font-size:2.2rem">${r.e}</span> ${cap(r.n)}`, ok: r === a })), { cls: 'one-col' }), show);
      }
      if (q.mode === 'abrev') {
        const opts = U.shuffle([q.pos, ...U.shuffle([0, 1, 2, 3, 4].filter((k) => k !== q.pos)).slice(0, 3)]);
        return wrapChoices(choices(ctx, opts.map((k) => ({ html: ORD_AB[k], ok: k === q.pos })), { cls: 'nums' }), show);
      }
      // quants: un número cardinal
      const R = choices(ctx, U.shuffle([0, 1, 2, 3, 4]).map((k) => ({ html: k, ok: k === q.pos })), { cls: 'nums five' });
      return wrapChoices(R, show);
    },
  };

  Eloi.missio({
    save: 'cardinals',
    splash: { hero: '🕵️', title: 'El Detectiu Lupa<br>i els Números Perduts', sub: 'La Rata Embolica ho ha desordenat tot. Resol els casos amb el teu nas de detectiu!' },
    guide: { who: LUPA, name: 'Lupa' },
    intro: [
      { who: LUPA, name: 'Detectiu Lupa', text: 'Bona olfactada, <b>{nom}</b>! Sóc el <b>Detectiu Lupa</b>, el gos amb el nas més fi de la ciutat. 🐶🔍' },
      { who: RATA, name: 'Rata Embolica', text: 'Ji, ji! He embolicat tots els números de la ciutat: els he desordenat, els he amagat i els he canviat el nom! 🐀' },
      { who: LUPA, name: 'Detectiu Lupa', text: 'Necessito {un ajudant|una ajudanta} amb molt bon cap per als números. A cada cas resolt trobarem una <b>pista</b>. Amb totes les pistes, atraparem la Rata!' },
      { who: LUPA, name: 'Detectiu Lupa', text: 'Si t\'equivoques, tranquil·litat: tens dos intents i jo t\'ensumaré una pista. 👃', btn: 'Som-hi, detectiu! 🔍' },
    ],
    mapTitle: '🔍 Els casos del Lupa',
    album: { title: 'Les pistes del cas', empty: '❔', icon: '🗂️' },
    levels: LEVELS,
    boss: {
      id: 'final', e: '🐀', n: 'Atrapa la Rata Embolica!', d: 'Tots els casos barrejats',
      intro: [
        { who: RATA, name: 'Rata Embolica', text: 'Que m\'atrapareu? Ha! Sóc la rata més ràpida de les clavegueres! 🐀💨' },
        { who: LUPA, name: 'Detectiu Lupa', text: 'Cada resposta correcta ens acosta a la Rata 🐾. Si t\'equivoques, perds un cor ❤️. Tens 3 cors i un sol intent per pregunta!', btn: 'A per ella! 🐾' },
      ],
      gen: genBoss, hp: 10, lives: 3, me: '🐶', him: RATA, himName: 'Rata',
      hits: ['Ja la tenim més a prop! 🐾', 'Bona ensumada! 👃', 'Correcte, detectiu! 🔍', 'La Rata tremola! 🐀'],
      misses: ['Ui, s\'ha escapat per un forat! Mira la solució. 🕳️', 'La Rata riu: ji, ji! Seguim! 🐀'],
      win: [
        { who: RATA, name: 'Rata Embolica', text: 'Atrapada! No pot ser… Ningú no m\'havia atrapat mai! D\'acord, d\'acord, tornaré tots els números al seu lloc… 🐀😩' },
        { who: LUPA, name: 'Detectiu Lupa', text: 'Cas tancat! Ets {el millor detectiu|la millor detectiu} de números que he conegut, <b>{nom}</b>! 🕵️🏅' },
        { who: LUPA, name: 'Detectiu Lupa', text: 'T\'has guanyat un <b>joc de regal</b> i el teu <b>diploma</b>! 🎁🏅', btn: 'Vull el premi! 🎁' },
      ],
    },
    render: RENDER, instr, hint,
    sayGood: (q) => {
      if (q.type === 'compara') return q.a === q.b ? `${U.fmt(q.a)} és igual a ${U.fmt(q.b)}` : `${U.fmt(Math.max(q.a, q.b))} és més gran que ${U.fmt(Math.min(q.a, q.b))}`;
      if (q.type === 'parell') return `${U.fmt(q.n)} és ${q.n % 2 ? 'senar' : 'parell'}`;
      if (q.type === 'ordinal' && q.mode !== 'quants') return `${cap(q.run[q.pos].n)} ha arribat en ${ORD[q.pos]} lloc`;
      return '';
    },
    final: { titol: 'Detectiu dels Números', motiu: 'per haver resolt tots els casos dels nombres cardinals i ordinals, i haver atrapat la Rata Embolica amb el Detectiu Lupa.', emoji: '🔍', signa: 'Detectiu Lupa 🐶' },
  });
})();
