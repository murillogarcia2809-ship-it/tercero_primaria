/* L'Incubadora del Doctor Per — les taules de multiplicar.
   Cada taula és un ou de monstre: quan la superes, l'ou es trenca i neix un monstre per a la col·lecció. */
(function () {
  'use strict';
  const { U, sfx, say, keypad, choices } = Eloi;

  const PER = '🧑‍🔬';
  const GUINEU = '🦊';
  const ORDRE = [2, 5, 10, 3, 4, 6, 7, 8, 9];
  const MONSTRES = {
    2: { e: '🐲', nom: 'Dosset el drac', txt: 'Té 2 ales i esternuda bombolles.' },
    5: { e: '👾', nom: 'Cinquet el marcià', txt: 'Té 5 ulls i saluda amb les 5 antenes.' },
    10: { e: '🦖', nom: 'Rex Deuet', txt: 'Compta fins a 10 amb els dits dels peus.' },
    3: { e: '🦄', nom: 'Tresa la unicorn', txt: 'La seva crinera té 3 colors.' },
    4: { e: '🐢', nom: 'Quim Quatrepotes', txt: 'Una tortuga de 4 potes molt ràpida (diu ell).' },
    6: { e: '🐞', nom: 'Sisa la marieta', txt: 'Té 6 potes i 6 punts negres.' },
    7: { e: '🦕', nom: 'Setsaure', txt: 'Fa una migdiada els 7 dies de la setmana.' },
    8: { e: '🐙', nom: 'Vuitona la pop', txt: 'Pot fer 8 abraçades alhora!' },
    9: { e: '👻', nom: 'Nouet el fantasma', txt: 'Fa "bu!" 9 vegades cada nit.' },
  };
  // Coses que venen en grups: per als problemes i els dibuixos
  const COSES = {
    2: [{ e: '🧦', u: 'parell de mitjons', p: 'parells de mitjons', q: 'mitjons' }, { e: '👀', u: 'nen', p: 'nens', q: 'ulls', te: 2 }],
    3: [{ e: '🛺', u: 'tricicle', p: 'tricicles', q: 'rodes', f: 1 }, { e: '🍀', u: 'trèvol', p: 'trèvols', q: 'fulles', f: 1 }],
    4: [{ e: '🐶', u: 'gos', p: 'gossos', q: 'potes', f: 1 }, { e: '🚗', u: 'cotxe', p: 'cotxes', q: 'rodes', f: 1 }],
    5: [{ e: '✋', u: 'mà', p: 'mans', q: 'dits' }, { e: '⭐', u: 'estrella', p: 'estrelles', q: 'puntes', f: 1 }],
    6: [{ e: '🐜', u: 'formiga', p: 'formigues', q: 'potes', f: 1 }, { e: '🥚', u: 'capsa', p: 'capses', q: 'ous' }],
    7: [{ e: '📅', u: 'setmana', p: 'setmanes', q: 'dies' }, { e: '🌈', u: 'arc de Sant Martí', p: 'arcs de Sant Martí', q: 'colors' }],
    8: [{ e: '🕷️', u: 'aranya', p: 'aranyes', q: 'potes', f: 1 }, { e: '🐙', u: 'pop', p: 'pops', q: 'braços' }],
    9: [{ e: '🐱', u: 'gat', p: 'gats', q: 'vides', f: 1 }, { e: '🍬', u: 'bossa', p: 'bosses', q: 'caramels' }],
    10: [{ e: '🙌', u: 'nen', p: 'nens', q: 'dits a les mans' }, { e: '🥢', u: 'paquet', p: 'paquets', q: 'llapis' }],
  };
  const ICONA = { 2: '🍒', 3: '🍓', 4: '🍪', 5: '🍩', 6: '🧁', 7: '🍬', 8: '🍭', 9: '🫐', 10: '🟡' };

  // ---------- Generadors ----------
  const ks = (from, to) => U.shuffle(Array.from({ length: to - from + 1 }, (_, i) => from + i));
  function genTaula(n) {
    const facils = ks(1, 5), totes = ks(2, 10), grups = ks(2, 5);
    return (i) => {
      switch (i) {
        case 0: return { type: 'mira', n };
        case 1: return { type: 'salts', n, k: U.rand(4, 7) };
        case 2: return { type: 'grups', n, k: grups[0] };
        case 3: return { type: 'tria', n, k: facils[0] };
        case 4: return { type: 'tria', n, k: totes[0] };
        case 5: return { type: 'problema', n, k: U.rand(2, 6) };
        case 6: return { type: 'teclat', n, k: totes[1] };
        default: return { type: 'teclat', n, k: totes[2] };
      }
    };
  }
  function genBoss() {
    const n = U.pick(ORDRE), k = U.rand(2, 10);
    const t = U.pick(['tria', 'tria', 'teclat', 'teclat', 'falta', 'problema']);
    return { type: t, n, k: t === 'problema' ? U.rand(2, 6) : k };
  }

  // Opcions incorrectes creïbles
  function dolents(n, k) {
    const r = n * k, s = new Set();
    [n * (k + 1), n * (k - 1), r + 1, r - 1, (n + 1) * k, r + 2, r + n + 1, (n - 1) * k].forEach((x) => { if (x > 0 && x !== r) s.add(x); });
    return U.shuffle([...s]).slice(0, 3);
  }
  const saltsFins = (n, k) => Array.from({ length: k }, (_, i) => n * (i + 1));

  // ---------- Textos ----------
  function instr(q) {
    switch (q.type) {
      case 'mira': return `Aprenem la <b>taula del ${q.n}</b>! Toca l'ou cada vegada per descobrir una multiplicació.`;
      case 'salts': return `Compta de <b>${q.n} en ${q.n}</b>. Quin número falta?`;
      case 'grups': return 'Quantes llaminadures hi ha en total?';
      case 'tria': case 'teclat': return 'Quant fa aquesta multiplicació?';
      case 'falta': return 'Quin número falta perquè sigui correcte?';
      case 'problema': return 'Problema del Doctor Per! Llegeix-lo bé i calcula.';
    }
    return '';
  }
  function hint(q) {
    const { n, k } = q;
    if (q.type === 'salts') return `Pista: cada salt suma <b>${n}</b>. Mira el número d'abans i suma-hi ${n}.`;
    if (q.type === 'falta') return `Pista: compta de ${n} en ${n} fins a arribar a <b>${n * k}</b>. Quants salts has fet?`;
    if (k === 1) return `Pista: qualsevol número per <b>1</b> és ell mateix!`;
    const s = saltsFins(n, k - 1);
    return `Pista: compta de ${n} en ${n}, <b>${k}</b> vegades: ${s.join(', ')}… i un salt més!`;
  }

  // ---------- Pantalles ----------
  const RENDER = {
    // Aprendre la taula: cada toc a l'ou descobreix una fila
    mira(q, ctx) {
      const n = q.n;
      let k = 0;
      const el = U.h(`<div class="mira">
        <button class="egg-btn" aria-label="Següent">🥚<small>Toca'm!</small></button>
        <div class="taula">${Array.from({ length: 10 }, (_, i) => `<button class="t-row" data-k="${i + 1}"><span>${n} × ${i + 1}</span><b>= ${n * (i + 1)}</b></button>`).join('')}</div></div>`);
      const rows = [...el.querySelectorAll('.t-row')], egg = el.querySelector('.egg-btn');
      const dir = (r) => say(`${n} × ${r} = ${n * r}`);
      rows.forEach((r) => { r.onclick = () => { if (r.classList.contains('on')) { sfx.tick(); dir(+r.dataset.k); } }; });
      egg.onclick = () => {
        if (k >= 10) return;
        const r = rows[k++];
        r.classList.add('on', 'pop');
        sfx.pop();
        egg.classList.remove('wob'); void egg.offsetWidth; egg.classList.add('wob');
        dir(k);
        if (k === 10) {
          egg.innerHTML = '🐣<small>Ja la tens!</small>';
          sfx.star();
          setTimeout(() => ctx.submit(), 2400);
        }
      };
      ctx.area.appendChild(el);
      return { auto: true, speaks: true, check: () => (k >= 10 ? true : null), good() {} };
    },

    // Comptar de n en n amb un forat
    salts(q, ctx) {
      const s = saltsFins(q.n, q.k), pos = U.rand(1, q.k - 1);
      ctx.area.appendChild(U.h(`<div class="skip-line">${s.map((x, i) => `<span class="${i === pos ? 'gap' : ''}">${i === pos ? '?' : x}</span>`).join('<i>➜</i>')}</div>`));
      const want = s[pos];
      const mal = [want + 1, want - 1, want + q.n, want - q.n + 1, want + 2].filter((v, i, a) => v > 0 && v !== want && a.indexOf(v) === i);
      const opts = U.shuffle([want, ...U.shuffle(mal).slice(0, 3)]).map((v) => ({ html: v, ok: v === want }));
      const R = choices(ctx, opts, { cls: 'nums' });
      const fill = () => { const g = ctx.area.querySelector('.gap'); g.textContent = want; g.classList.add('ok'); };
      const good = R.good, rev = R.reveal;
      R.good = () => { good(); fill(); };
      R.reveal = () => { rev(); fill(); };
      return R;
    },

    // Grups de llaminadures: k plats amb n cada un
    grups(q, ctx) {
      const { n, k } = q;
      ctx.area.appendChild(U.h(`<div class="grups">${Array.from({ length: k }, () => `<div class="plat">${ICONA[n].repeat(n)}</div>`).join('')}</div>`));
      const txt = U.h(`<div class="q-txt"><b>${k}</b> plats amb <b>${n}</b> cada un.<br><span class="suma">${Array(k).fill(n).join(' + ')} = ${n} × ${k}</span></div>`);
      ctx.area.appendChild(txt);
      return choices(ctx, U.shuffle([n * k, ...dolents(n, k)]).map((v) => ({ html: v, ok: v === n * k })), { cls: 'nums' });
    },

    tria(q, ctx) {
      ctx.area.appendChild(U.h(`<div class="big-q">${q.n} × ${q.k} = <span class="hole-n">?</span></div>`));
      const R = choices(ctx, U.shuffle([q.n * q.k, ...dolents(q.n, q.k)]).map((v) => ({ html: v, ok: v === q.n * q.k })), { cls: 'nums' });
      const fill = () => { ctx.area.querySelector('.hole-n').textContent = q.n * q.k; };
      const good = R.good, rev = R.reveal;
      R.good = () => { good(); fill(); };
      R.reveal = () => { rev(); fill(); };
      return R;
    },

    teclat(q, ctx) {
      ctx.area.appendChild(U.h(`<div class="big-q">${q.n} × ${q.k} = <span class="hole-n">?</span></div>`));
      const kp = keypad(ctx.area, { max: 3 });
      return {
        check: () => (kp.value === null ? null : kp.value === q.n * q.k),
        bad: () => U.shake(kp.el.querySelector('.kp-display')),
        good: () => { kp.lock(true); ctx.area.querySelector('.hole-n').textContent = q.n * q.k; },
        reveal() { kp.set(q.n * q.k); kp.lock(true); ctx.area.querySelector('.hole-n').textContent = q.n * q.k; },
      };
    },

    // n × ? = resultat
    falta(q, ctx) {
      ctx.area.appendChild(U.h(`<div class="big-q">${q.n} × <span class="hole-n">?</span> = ${q.n * q.k}</div>`));
      const set = new Set([q.k]);
      while (set.size < 4) { const v = U.rand(1, 10); set.add(v); }
      const R = choices(ctx, U.shuffle([...set]).map((v) => ({ html: v, ok: v === q.k })), { cls: 'nums' });
      const fill = () => { ctx.area.querySelector('.hole-n').textContent = q.k; };
      const good = R.good, rev = R.reveal;
      R.good = () => { good(); fill(); };
      R.reveal = () => { rev(); fill(); };
      return R;
    },

    problema(q, ctx) {
      const { n, k } = q;
      const c = U.pick(COSES[n]);
      const text = `Hi ha <b>${k} ${c.p}</b>. Cada ${c.u} té <b>${n} ${c.q}</b>. Quant${c.f ? 'es' : 's'} ${c.q} hi ha en total?`;
      ctx.area.appendChild(U.h(`<div class="problema"><div class="pb-pic">${c.e.repeat(k)}</div><div class="q-txt">${text}</div></div>`));
      const kp = keypad(ctx.area, { max: 3 });
      return {
        afterInstr: () => say(text),
        check: () => (kp.value === null ? null : kp.value === n * k),
        bad: () => U.shake(kp.el.querySelector('.kp-display')),
        good: () => kp.lock(true),
        reveal() { kp.set(n * k); kp.lock(true); },
      };
    },
  };

  // ---------- Nivells ----------
  const levels = ORDRE.map((n) => ({
    id: 't' + n, e: '🥚', n: `La taula del ${n}`, d: { 2: 'Comptem de 2 en 2', 5: 'Com els dits de la mà', 10: 'La més fàcil: afegeix un 0!' }[n] || `Comptem de ${n} en ${n}`,
    N: 8, gen: genTaula(n), premi: MONSTRES[n],
    intro: [
      ...(n === 2 ? [
        { who: PER, name: 'Doctor Per', text: 'Multiplicar és una manera ràpida de <b>sumar el mateix número</b> moltes vegades.' },
        { who: PER, name: 'Doctor Per', text: '<b>2 × 3</b> vol dir sumar el 2 tres vegades:<br><b>2 + 2 + 2 = 6</b>.<br>El signe <b>×</b> es llegeix <b>per</b>: dos per tres, sis!' },
      ] : []),
      ...(n === 10 ? [{ who: PER, name: 'Doctor Per', text: 'Truc secret de la taula del 10: només cal <b>afegir un zero</b>! 10 × 4 = 4<b>0</b>. 😎' }] : []),
      ...(n === 5 ? [{ who: PER, name: 'Doctor Per', text: 'Els resultats de la taula del 5 sempre acaben en <b>0</b> o en <b>5</b>: 5, 10, 15, 20… ✋' }] : []),
      ...(n === 9 ? [{ who: PER, name: 'Doctor Per', text: 'Truc de màgia del 9: les xifres del resultat sempre sumen 9! 9 × 3 = 27, i 2 + 7 = 9. 🪄' }] : []),
      ...(n === 4 ? [{ who: PER, name: 'Doctor Per', text: 'Truc: la taula del 4 és el <b>doble de la del 2</b>. 2 × 3 = 6, doncs 4 × 3 = 12!' }] : []),
      ...(n === 6 ? [{ who: PER, name: 'Doctor Per', text: 'Truc: la taula del 6 és el <b>doble de la del 3</b>. 3 × 4 = 12, doncs 6 × 4 = 24!' }] : []),
      ...(n === 8 ? [{ who: PER, name: 'Doctor Per', text: 'Truc: la taula del 8 és el <b>doble de la del 4</b>. 4 × 5 = 20, doncs 8 × 5 = 40!' }] : []),
      ...(n === 3 ? [{ who: PER, name: 'Doctor Per', text: 'La taula del 3 té ritme: 3, 6, 9… 12, 15, 18… 21, 24, 27… i 30! 🎵' }] : []),
      ...(n === 7 ? [{ who: PER, name: 'Doctor Per', text: 'La del 7 és la més rebel, però tu ja en saps molts trossos: 7 × 2 = 2 × 7 = 14! L\'ordre no importa. 😉' }] : []),
      { who: PER, name: 'Doctor Per', text: `Aquest ou necessita l'energia de la <b>taula del ${n}</b> per trencar-se. Què hi deu haver a dins? 🥚`, btn: 'A incubar! 🔥' },
    ],
  }));

  Eloi.missio({
    save: 'taules',
    splash: { hero: '🥚', title: 'L\'Incubadora<br>del Doctor Per', sub: 'Les taules de multiplicar fan néixer monstres! Quants en podràs col·leccionar?' },
    guide: { who: PER, name: 'Doctor Per' },
    intro: [
      { who: PER, name: 'Doctor Per', text: 'Hola, <b>{nom}</b>! Sóc el <b>Doctor Per</b>, inventor de monstres simpàtics. 🧑‍🔬' },
      { who: PER, name: 'Doctor Per', text: 'A la meva incubadora tinc <b>9 ous de monstre</b>. Però només es trenquen amb una energia molt especial: l\'energia de les <b>taules de multiplicar</b>! 🥚⚡' },
      { who: GUINEU, name: 'Guineu Lladregota', text: 'Ji, ji, ji… Quan neixin tots, me\'ls enduré! 🦊' },
      { who: PER, name: 'Doctor Per', text: 'Oh, no, la Guineu Lladregota! Ajuda\'m a fer néixer tots els monstres i després l\'aturarem junts. Si t\'equivoques, tens dos intents i et donaré pistes.', btn: 'Som-hi! 🚀' },
    ],
    mapTitle: '🥚 L\'Incubadora',
    album: { title: 'Els meus monstres', empty: '🥚', icon: '🐣' },
    levels,
    boss: {
      id: 'final', e: '🦊', n: 'Atura la Guineu!', d: 'Totes les taules barrejades',
      intro: [
        { who: GUINEU, name: 'Guineu Lladregota', text: 'Ja són tots fora de l\'ou? Perfecte! Ara me\'ls enduc! Ji, ji, ji! 🦊' },
        { who: PER, name: 'Doctor Per', text: 'Cada multiplicació correcta llança un pastís a la Guineu 🥧. Si t\'equivoques, perds un cor ❤️. Tens 3 cors i un sol intent per pregunta!', btn: 'Al rescat! 🥧' },
      ],
      gen: genBoss, hp: 10, lives: 3, me: '🧑‍🔬', him: GUINEU, himName: 'Guineu',
      hits: ['Pastissada! 🥧', 'Plaf! 🥧', 'De ple! 💥', 'Toma pastís! 🥧'],
      misses: ['Ui! Mira la solució i seguim! 💪', 'La Guineu l\'ha esquivat! 🦊'],
      win: [
        { who: GUINEU, name: 'Guineu Lladregota', text: 'Uf, quina pastissada! Em rendeixo! Ets massa ràpid multiplicant! 🦊🥧' },
        { who: PER, name: 'Doctor Per', text: 'Ho has aconseguit, <b>{nom}</b>! Els monstres estan a salvo i ja et saps totes les taules! 🐲👾🦖🦄🐢🐞🦕🐙👻' },
        { who: PER, name: 'Doctor Per', text: 'T\'has guanyat un <b>joc de regal</b> i el teu <b>diploma</b>! 🎁🏅', btn: 'Vull el premi! 🎁' },
      ],
    },
    render: RENDER, instr, hint,
    sayGood: (q) => (q.type === 'mira' || q.type === 'salts' ? '' : `${q.n} × ${q.k} = ${q.n * q.k}`),
    final: { titol: '{Mestre|Mestra} de les Taules', motiu: 'per haver après les taules de multiplicar del 2 al 10, fet néixer 9 monstres i aturat la Guineu Lladregota.', emoji: '🥚', signa: 'Doctor Per 🧑‍🔬' },
  });
})();
