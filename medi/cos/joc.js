/* El Laboratori de l'Ossi — les parts del cos humà (Medi natural, 3r) */
(function () {
  'use strict';
  const { U, sfx, say, stopSay, story, modal, confetti, floatMsg, choices, spell, quiz, store, starsFor } = Eloi;
  const { FIG, SETS, SPELL, ART_INFO, Q, SENTITS, SITUACIONS, FETS, CARDS, FUNCIONS_SIT, ORDRE } = COS;
  const PLAYER = 'Eloi';
  const SAVE = 'cos';
  const app = document.getElementById('app');

  const cap1 = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const llista = (a) => (a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' o ' + a[a.length - 1]);
  const nom = (fig, id) => FIG[fig].parts[id].a;

  // L'Ossi, l'esquelet del laboratori de l'escola
  const OSSI = `<svg class="ossi" viewBox="0 0 200 215" xmlns="http://www.w3.org/2000/svg">
    <path d="M100 14 C152 14 180 50 178 92 C177 118 164 132 152 138 L152 160 Q152 172 140 172 L60 172 Q48 172 48 160 L48 138 C36 132 23 118 22 92 C20 50 48 14 100 14Z" fill="#fffaf0" stroke="#c9b994" stroke-width="5"/>
    <circle cx="70" cy="90" r="24" fill="#2b2540"/><circle cx="130" cy="90" r="24" fill="#2b2540"/>
    <circle class="eye" cx="76" cy="84" r="8" fill="#fff"/><circle class="eye" cx="136" cy="84" r="8" fill="#fff"/>
    <path d="M100 110 L91 128 L109 128Z" fill="#2b2540"/>
    <circle cx="44" cy="122" r="9" fill="#ffb3c1" opacity=".75"/><circle cx="156" cy="122" r="9" fill="#ffb3c1" opacity=".75"/>
    <rect x="64" y="140" width="72" height="22" rx="7" fill="#fff" stroke="#c9b994" stroke-width="3"/>
    <path d="M82 140 V162 M100 140 V162 M118 140 V162" stroke="#c9b994" stroke-width="3"/>
    <path d="M100 186 L72 172 L72 204 Z M100 186 L128 172 L128 204 Z" fill="#e53935" stroke="#b71c1c" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="100" cy="188" r="8" fill="#ff5252" stroke="#b71c1c" stroke-width="3"/>
  </svg>`;
  function anim(m, cls, ms = 500) {
    if (!m) return;
    m.classList.remove(cls); void m.getBoundingClientRect(); m.classList.add(cls);
    setTimeout(() => m.classList.remove(cls), ms);
  }

  const LEVELS = [
    // Temari de 3r: repàs del cos, funcions vitals i els aparells que les fan
    { sec: '🔁 Repàs: el cos per fora', id: 'cos', e: '🧍', n: 'Les parts del cos', d: 'Cap, tronc i extremitats', play: () => figLevel('cos', 'body', genCos) },
    { id: 'extr', e: '🦵', n: 'Braços i cames', d: 'De l\'espatlla al turmell', play: () => figLevel('extr', 'body', genExtr) },
    { sec: '🌱 Les funcions vitals', id: 'funcions', e: '🌱', n: 'Les funcions vitals', d: 'Nutrició, relació i reproducció',
      play: (l) => cardLevel(l, CARDS.funcions, 'Tots els éssers vius fem tres <b>funcions vitals</b>. Toca cada targeta per descobrir-les!', genFuncions) },
    { sec: '🍎 La nutrició', id: 'dig', e: '🍽️', n: 'L\'aparell digestiu', d: 'El camí del menjar', play: () => figLevel('dig', 'dig', genDig) },
    { id: 'resp', e: '🫁', n: 'L\'aparell respiratori', d: 'El camí de l\'aire', play: () => figLevel('resp', 'resp', genResp) },
    { id: 'circ', e: '❤️', n: 'L\'aparell circulatori', d: 'El cor, les artèries i les venes', play: () => figLevel('circ', 'circ', genCirc) },
    { id: 'excr', e: '💧', n: 'L\'aparell excretor', d: 'Els ronyons i l\'orina', play: () => figLevel('excr', 'excr', genExcr) },
    { sec: '👀 La relació', id: 'sentits', e: '👃', n: 'Els cinc sentits', d: 'Vista, oïda, olfacte, gust i tacte', play: playSentits },
    { id: 'nerv', e: '🧠', n: 'El sistema nerviós', d: 'Cervell, medul·la i nervis', play: () => figLevel('nerv', 'nerv', genNerv) },
    { id: 'ossos', e: '🦴', n: 'L\'esquelet', d: 'Crani, costelles, fèmur…', play: () => figLevel('ossos', 'skel', genOssos) },
    { id: 'art', e: '🔩', n: 'Les articulacions', d: 'On es dobleguen els ossos', play: () => figLevel('art', 'body', genArt) },
    { id: 'musc', e: '💪', n: 'Els músculs', d: 'L\'aparell locomotor', play: playMusc },
    { sec: '👶 La reproducció', id: 'repro', e: '👶', n: 'L\'aparell reproductor', d: 'Embaràs, naixement i etapes de la vida',
      play: (l) => cardLevel(l, CARDS.repro, 'Gràcies a la <b>reproducció</b> neixen persones noves. Toca cada targeta per descobrir com passa!', genRepro) },
    { sec: '🏆 Repte final', id: 'final', e: '🏆', n: 'Gran repte final', d: 'Tots els aparells barrejats!', play: () => runLevel(lv('final'), genFinal()) },
  ];
  const lv = (id) => LEVELS.find((l) => l.id === id);
  const PRAISE = ['Molt bé!', 'Genial!', 'Fantàstic!', 'Ets un crac!', 'Perfecte!', 'Increïble!', 'Boníssim!'];

  const prog = () => store.get(SAVE, { intro: false, lv: {} });
  const saveProg = (p) => store.set(SAVE, p);

  // ---------- Figura interactiva (cos, cara o esquelet) ----------
  function makeFig(kind, ids, o = {}) {
    const F = FIG[kind];
    const box = U.h(`<div class="figbox ${kind} ${o.size || ''}">${F.svg}<div class="figlabel hidden"></div></div>`);
    const svg = box.querySelector('svg'), marks = svg.querySelector('.marks'), label = box.querySelector('.figlabel');
    const vb = svg.viewBox.baseVal;
    if (F.tall) svg.style.aspectRatio = `${vb.width} / ${vb.height}`;
    const api = {
      el: box,
      mark(id, cls) {
        if (F.parts[id].mk === 'el') {
          // Tubs llargs (venes, nervis…): es ressalta una còpia del seu dibuix
          svg.querySelectorAll(`[data-part="${id}"]`).forEach((e) => {
            if (marks.contains(e)) return;
            const c = e.cloneNode(true);
            c.removeAttribute('data-part');
            c.setAttribute('class', `mkp ${cls}`);
            marks.appendChild(c);
          });
          return;
        }
        F.parts[id].mk.forEach(([x, y, rx, ry, rot]) => {
          marks.insertAdjacentHTML('beforeend', `<ellipse class="mk ${cls}" cx="${x}" cy="${y}" rx="${rx}" ry="${ry || rx}" transform="rotate(${rot || 0} ${x} ${y})"/>`);
        });
      },
      clear(cls) { marks.querySelectorAll(cls ? `.mk.${cls}, .mkp.${cls}` : '.mk, .mkp').forEach((e) => e.remove()); },
      label(t) { label.textContent = t; label.classList.toggle('hidden', !t); },
    };
    if (o.onTap) {
      // Busquem la part (del grup actiu) més propera al punt tocat
      svg.addEventListener('click', (e) => {
        const m = svg.getScreenCTM();
        if (!m) return;
        const pt = svg.createSVGPoint();
        pt.x = e.clientX; pt.y = e.clientY;
        const { x, y } = pt.matrixTransform(m.inverse());
        let best = null, bd = F.max;
        ids.forEach((id) => F.parts[id].p.forEach(([px, py]) => {
          const d = Math.hypot(px - x, py - y);
          if (d < bd) { bd = d; best = id; }
        }));
        o.onTap(best);
      });
    }
    return api;
  }

  // ---------- Inici ----------
  function splash() {
    Eloi.setBack(null);
    app.innerHTML = `<div class="splash">
      <div class="hero-ossi">${OSSI}</div>
      <h1>El Laboratori de l'Ossi</h1>
      <p class="sub">Descobreix com és el cos humà!</p>
      <button class="btn big" id="go">JUGAR ▶</button></div>`;
    app.querySelector('#go').onclick = async () => {
      Eloi.unlockAudio();
      sfx.pop();
      const p = prog();
      if (!p.intro) { await intro(); p.intro = true; saveProg(p); }
      showLevels();
    };
  }
  function intro() {
    return story([
      { who: OSSI, name: 'Ossi', text: `Hola, <b>${PLAYER}</b>! Sóc l'<b>Ossi</b>, l'esquelet del laboratori de l'escola. 🦴` },
      { who: OSSI, name: 'Ossi', text: 'Cada nit, quan tothom se\'n va, faig una mica de gresca… i l\'endemà no recordo com es diu cada part del cos! 😅' },
      { who: OSSI, name: 'Ossi', text: 'M\'ajudes a aprendre com és el <b>cos humà</b>? Primer repassarem les parts del cos i després descobrirem què hi ha a dins: els <b>aparells</b> que fan les funcions vitals.' },
      { who: OSSI, name: 'Ossi', text: 'A cada repte, primer <b>explorarem</b> i després et faré preguntes. Som-hi, doctor Eloi!', btn: 'Som-hi! 🩺' },
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
      <div class="hero-ossi small">${OSSI}</div>
      <h1>El Laboratori de l'Ossi</h1>
      <div class="belly">⭐ ${total} de ${LEVELS.length * 3} estrelles</div>
      <div class="levels"></div>
      <div style="margin-top:26px"><button class="btn blue" id="hist">🦴 Història</button></div></div>`;
    const box = app.querySelector('.levels');
    LEVELS.forEach((l, i) => {
      const open = i === 0 || p.lv[LEVELS[i - 1].id] || p.lv[l.id];
      if (l.sec) box.appendChild(U.h(`<div class="sec">${l.sec}</div>`));
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
    const o = app.querySelector('.wrap .ossi');
    o.onclick = () => { anim(o, 'happy'); sfx.pop(); say('Hola! Sóc l\'Ossi!'); };
  }

  async function finish(l, stars) {
    const p = prog();
    p.lv[l.id] = Math.max(p.lv[l.id] || 0, stars);
    saveProg(p);
    sfx.win(); confetti();
    const all = LEVELS.every((x) => p.lv[x.id]);
    say(U.pick(PRAISE));
    const v = await modal({
      icon: '🦴', title: 'Repte superat!', stars,
      html: `<p>💡 <b>Sabies que…</b> ${FETS[l.id]}</p>` +
        (all && l.id === 'final' ? `<p>Ja ets un expert del cos humà, ${PLAYER}! L'Ossi et nomena <b>doctor del laboratori</b>! 🩺</p>` : ''),
      buttons: [{ label: '🔁 Repetir', value: 'again', cls: 'blue' }, { label: 'Continua ▶', value: 'ok' }],
    });
    if (v === 'again') l.play(l); else showLevels();
  }

  function playScreen(l, n) {
    Eloi.setBack(showLevels);
    app.innerHTML = `<div class="play">
      <div class="play-head"><span>${l.e} ${l.n}</span><div class="dots">${'<span></span>'.repeat(n || 0)}</div></div>
      <div class="guide"><div class="gchar">${OSSI}</div><div class="gbubble"></div><button class="icon-btn small" id="rep" title="Escolta">🔊</button></div>
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
      dots: [...app.querySelectorAll('.dots span')], ossi: app.querySelector('.guide .ossi'),
    };
  }

  // ---------- Exploració: toca les parts per aprendre-les ----------
  function learnFig(l, kind, ids, { intro, info = {} }) {
    return new Promise((res) => {
      const S = playScreen(l, 0);
      const done = (prog().lv[l.id] || 0) > 0;
      const parts = FIG[kind].parts;
      const seen = new Set();
      const row = U.h(`<div class="learn ${FIG[kind].tall ? 'tall' : ''}"></div>`);
      const chips = U.h('<div class="chips"></div>');
      const chipEl = {};
      const show = (id) => {
        if (!id) { sfx.tick(); return; }
        sfx.pop(); anim(S.ossi, 'happy');
        fig.clear(); fig.mark(id, 'hl'); fig.label(cap1(parts[id].a));
        Object.values(chipEl).forEach((c) => c.classList.remove('cur'));
        chipEl[id].classList.add('seen', 'cur');
        seen.add(id);
        S.setGuide(`<b>${cap1(parts[id].a)}</b>. ${info[id] || parts[id].info}`);
        upd();
      };
      const fig = makeFig(kind, ids, { onTap: show });
      ids.forEach((id) => {
        const c = U.h(`<button class="chip">${parts[id].a}</button>`);
        c.onclick = () => show(id);
        chipEl[id] = c;
        chips.appendChild(c);
      });
      row.appendChild(fig.el);
      row.appendChild(chips);
      S.area.appendChild(row);
      const upd = () => {
        const all = seen.size === ids.length;
        S.button.disabled = !(all || done);
        S.button.textContent = all || done ? 'Comença el repte ▶' : `Explora-les totes (${seen.size} de ${ids.length})`;
      };
      upd();
      S.setGuide(intro);
      S.button.onclick = () => { sfx.click(); stopSay(); res(); };
    });
  }

  async function figLevel(id, kind, gen) {
    const l = lv(id);
    const INTROS = {
      cos: 'El cos humà té tres parts: el <b>cap</b>, el <b>tronc</b> i les <b>extremitats</b>. Toca cada part per descobrir-la!',
      dig: 'L\'<b>aparell digestiu</b> transforma els aliments en <b>nutrients</b>. Toca cada òrgan i descobreix el camí del menjar!',
      resp: 'L\'<b>aparell respiratori</b> fa entrar l\'aire, que porta l\'<b>oxigen</b>, i treu el diòxid de carboni. Toca cada part!',
      circ: 'L\'<b>aparell circulatori</b> porta la <b>sang</b> per tot el cos. La sang reparteix l\'oxigen i els nutrients. Toca cada part!',
      excr: 'L\'<b>aparell excretor</b> treu del cos les substàncies que no serveixen, amb l\'<b>orina</b> i la suor. Toca cada òrgan!',
      nerv: 'El <b>sistema nerviós</b> rep la informació dels sentits i dona ordres als músculs. Toca cada part!',
      extr: 'Ara, els <b>braços</b> i les <b>cames</b>. Toca cada part, de l\'espatlla fins al peu!',
      art: 'Les <b>articulacions</b> són els llocs on s\'uneixen dos ossos. Gràcies a elles podem doblegar el cos. Toca-les totes!',
      ossos: 'Això és un <b>esquelet</b> com jo! Els ossos ens aguanten i protegeixen el que tenim a dins. Toca cada os!',
    };
    await learnFig(l, kind, SETS[id], { intro: INTROS[id], info: id === 'art' ? ART_INFO : {} });
    runLevel(l, gen());
  }

  // ---------- Generadors de preguntes ----------
  // De més fàcil a més difícil: reconèixer (opcions) → localitzar (tocar) → escriure (lletres)
  function figQs(fig, ids, { nName, nTap, spellWords, extra = [], late = [], tapIds }) {
    const order = U.shuffle(ids);
    const qs = order.slice(0, nName).map((target) => ({ t: 'name', fig, ids, target }));
    const rest = order.slice(nName).concat(order.slice(0, nName));
    qs.push(...extra);
    rest.slice(0, nTap).forEach((id) => qs.push({ t: 'tap', fig, ids: tapIds || ids, ok: [id], q: `Toca ${nom(fig, id)}!` }));
    qs.push(...late);
    if (spellWords) {
      const w = U.pick(spellWords);
      qs.push({ t: 'spell', fig, ids, target: w, word: w });
    }
    return qs;
  }
  const pickC = (pool, n) => U.shuffle(pool).slice(0, n).map((c) => ({ t: 'choice', ...c }));
  const genCos = () => figQs('body', SETS.cos, { nName: 2, nTap: 4, spellWords: SPELL.cos, extra: pickC(Q.cos, 2) });
  const pickTF = (pool, n) => U.shuffle(pool).slice(0, n).map((c) => ({ t: 'tf', ...c }));
  const ordQ = (k) => ({ t: 'order', ...ORDRE[k] });
  const genDig = () => figQs('dig', SETS.dig, { nName: 3, nTap: 3, spellWords: SPELL.dig, extra: pickC(Q.dig, 2), late: [ordQ('dig'), ...pickTF(Q.digTF, 1)] });
  const genResp = () => figQs('resp', SETS.resp, { nName: 2, nTap: 3, spellWords: SPELL.resp, extra: pickC(Q.resp, 2), late: [ordQ('resp'), ...pickTF(Q.respTF, 1)] });
  const genExcr = () => figQs('excr', SETS.excr, { nName: 2, nTap: 3, spellWords: SPELL.excr, extra: pickC(Q.excr, 2), late: [ordQ('excr'), ...pickTF(Q.excrTF, 1)] });
  function genNerv() {
    const ch = pickC(Q.nerv, 4);
    return figQs('nerv', SETS.nerv, { nName: 2, nTap: 2, spellWords: SPELL.nerv, extra: ch.slice(0, 2), late: [...ch.slice(2), ordQ('nerv'), ...pickTF(Q.nervTF, 1)] });
  }
  function genCirc() {
    // Les artèries i les venes són fines: es reconeixen amb opcions; per tocar, el cor
    const ids = SETS.circ, name = (target) => ({ t: 'name', fig: 'circ', ids, target });
    const ch = pickC(Q.circ, 3);
    return [name('cor'), ch[0], name(U.pick(['arteries', 'venes'])), ch[1],
      { t: 'tap', fig: 'circ', ids, ok: ['cor'], q: 'Toca l\'òrgan que bomba la sang!' }, ch[2], ordQ('circ'), ...pickTF(Q.circTF, 1),
      { t: 'spell', fig: 'circ', ids, target: 'cor', word: 'cor' }];
  }
  function genFuncions() {
    const F = ['la nutrició', 'la relació', 'la reproducció'];
    const sit = U.shuffle(FUNCIONS_SIT).slice(0, 5).map(([e, text, k]) => (
      { t: 'choice', e, q: `${text} Quina funció vital és?`, o: [F[k], ...F.filter((_, i) => i !== k)], fb: `És ${F[k]}.` }));
    const ch = pickC(Q.funcions, 3);
    return [ch[0], sit[0], sit[1], ch[1], sit[2], sit[3], ch[2], sit[4]];
  }
  function genRepro() {
    const ch = pickC(Q.repro, 5), tf = pickTF(Q.reproTF, 2);
    return [ch[0], ch[1], tf[0], ch[2], ordQ('repro'), ch[3], tf[1], ch[4]];
  }
  const genExtr = () => figQs('body', SETS.extr, { nName: 3, nTap: 4, spellWords: SPELL.extr, extra: pickC(Q.extr, 2) });
  function genArt() {
    const ids = SETS.extr.concat('coll');   // es poden tocar també parts que no són articulacions
    const ch = pickC(Q.art, 3);
    return ch.slice(0, 2).concat(
      U.shuffle(Q.artTap).slice(0, 5).map((c) => ({ t: 'tap', fig: 'body', ids, ok: c.ok, q: c.q })),
      ch[2],
    );
  }
  function genOssos() {
    const ids = SETS.ossos;
    const qs = figQs('skel', ids, { nName: 3, nTap: 2, extra: pickC(Q.ossos, 2) });
    U.shuffle(Q.ossosTap).slice(0, 3).forEach((c) => qs.push({ t: 'tap', fig: 'skel', ids, ok: c.ok, q: c.q }));
    return qs;
  }
  function genMusc() {
    const tf = U.shuffle(Q.muscTF).slice(0, 5).map((c) => ({ t: 'tf', ...c }));
    const ch = pickC(Q.musc, 3);
    const tap = { t: 'tap', fig: 'body', ids: SETS.extr, ok: ['bras'], q: 'Toca on tens el múscul <b>bíceps</b>! És el que es fa gros quan doblegues el braç.', fb: 'El bíceps és al braç.' };
    return [tf[0], tf[1], ch[0], tf[2], tap, ch[1], tf[3], tf[4], ch[2]];
  }
  function senseQ([e, text, k]) {
    const others = U.shuffle(Object.keys(SENTITS).filter((x) => x !== k)).slice(0, 3);
    const o = [k, ...others].map((x) => `${SENTITS[x].e} ${SENTITS[x].n}`);
    return { t: 'choice', e, q: `${text} Quin sentit fas servir?`, o, fb: `Fas servir ${SENTITS[k].n}, amb ${SENTITS[k].o}.` };
  }
  function organQ(k) {
    const s = SENTITS[k];
    const de = s.n.startsWith('el ') ? `del ${s.n.slice(3)}` : `de ${s.n}`;
    return { t: 'tap', fig: 'face', ids: SETS.sentits, ok: [s.part], q: `Toca l'òrgan del sentit ${de}!`, fb: `Amb ${s.o} tenim ${s.n}.` };
  }
  function genSentits() {
    const sit = U.shuffle(SITUACIONS).slice(0, 4).map(senseQ);
    const org = U.shuffle(['vista', 'oida', 'olfacte', 'gust']).slice(0, 2).map(organQ);
    const ch = pickC(Q.sentitsQ, 2);
    return [sit[0], sit[1], org[0], ch[0], sit[2], org[1], sit[3], ch[1]];
  }
  function genFinal() {
    // Dues preguntes de cada aparell de la nutrició i una de la resta (14 en total)
    return [genFuncions, genDig, genResp, genCirc, genExcr, genSentits, genNerv, genOssos, genMusc, genRepro]
      .flatMap((g, i) => U.shuffle(g().filter((q) => q.t !== 'spell' && q.t !== 'order')).slice(0, i >= 1 && i <= 4 ? 2 : 1));
  }

  // ---------- Pantalles de pregunta ----------
  function renderQ(S, q, ctx) {
    if (q.t === 'name') {
      const F = FIG[q.fig], a = nom(q.fig, q.target);
      S.setGuide(F.ask);
      const fig = makeFig(q.fig, q.ids, { size: F.tall ? 'mid' : 'small' });
      fig.mark(q.target, 'hl');
      const row = U.h(`<div class="qrow ${F.tall ? 'tall' : ''}"></div>`);
      row.appendChild(fig.el);
      ctx.area.appendChild(row);
      const others = U.shuffle(q.ids.filter((i) => i !== q.target)).slice(0, 3);
      const R = choices(ctx, U.shuffle([q.target, ...others]).map((id) => ({ html: nom(q.fig, id), ok: id === q.target })),
        { cls: F.tall ? 'col' : 'two', parent: row });
      const good = R.good;
      R.good = () => { good(); fig.clear(); fig.mark(q.target, 'ok'); };
      return Object.assign(R, { fb: `És ${a}.`, sol: `Era ${a}.` });
    }
    if (q.t === 'tap') {
      S.setGuide(q.q);
      let picked = null, lastBad = null, locked = false;
      const fig = makeFig(q.fig, q.ids, {
        onTap(id) {
          if (locked) return;
          if (!id) { sfx.tick(); floatMsg('Toca just a sobre! 👆'); return; }
          picked = id;
          ctx.submit();
        },
      });
      ctx.area.appendChild(fig.el);
      const okNames = q.ok.map((id) => nom(q.fig, id));
      return {
        auto: true,
        check: () => (picked === null ? null : q.ok.includes(picked)),
        bad() {
          lastBad = picked; picked = null;
          fig.clear(); fig.mark(lastBad, 'bad'); fig.label(`Això és ${nom(q.fig, lastBad)}`);
          setTimeout(() => { if (!locked) { fig.clear('bad'); fig.label(''); } }, 1600);
        },
        why: () => `Això és ${nom(q.fig, lastBad)}. Torna-ho a provar: ${q.q}`,
        good() { locked = true; fig.clear(); fig.mark(picked, 'ok'); fig.label(cap1(nom(q.fig, picked))); },
        reveal() { locked = true; fig.clear(); q.ok.forEach((id) => fig.mark(id, 'hl')); fig.label(cap1(llista(okNames))); },
        get fb() { return q.fb || (picked ? `Això és ${nom(q.fig, picked)}.` : ''); },
        sol: `Era ${llista(okNames)}. ${q.fb || ''}`,
      };
    }
    if (q.t === 'spell') {
      const a = nom(q.fig, q.target);
      S.setGuide('Escriu el nom de la part que brilla amb les lletres.');
      const fig = makeFig(q.fig, q.ids, { size: 'small' });
      fig.mark(q.target, 'hl');
      ctx.area.appendChild(fig.el);
      return Object.assign(spell(ctx, q.word, { extra: 2 }), { fb: `${cap1(a)}.`, sol: `Es diu ${a}.` });
    }
    if (q.t === 'order') return orderQ(S, q, ctx);
    if (q.t === 'tf') {
      S.setGuide('Llegeix la frase. És <b>cert</b> o és <b>fals</b>?').then(() => say(q.s));
      const card = U.h(`<div class="statement">${q.s} <button class="icon-btn small" title="Escolta">🔊</button></div>`);
      card.querySelector('button').onclick = () => say(q.s);
      ctx.area.appendChild(card);
      const R = choices(ctx, [{ html: '✅ Cert', ok: q.v }, { html: '❌ Fals', ok: !q.v }], { cls: 'two tf' });
      const ans = q.v ? 'És cert!' : 'És fals!';
      return Object.assign(R, { fb: `${ans} ${q.fb || ''}`, sol: `${q.v ? 'Era cert.' : 'Era fals.'} ${q.fb || ''}` });
    }
    // Pregunta d'opcions (la correcta és la primera de la llista)
    S.setGuide(q.q);
    if (q.e) ctx.area.appendChild(U.h(`<div class="qemoji">${q.e}</div>`));
    const long = q.o.some((x) => x.length > 16);
    const R = choices(ctx, U.shuffle(q.o.map((h, i) => ({ html: h, ok: i === 0 }))), { cls: long ? 'one' : 'two' });
    return Object.assign(R, { fb: q.fb || `${cap1(q.o[0])}.`, sol: `Era: <b>${q.o[0]}</b>. ${q.fb || ''}` });
  }

  // Ordenar: es toquen els elements en ordre; tocant-ne un de la llista es treu
  function orderQ(S, q, ctx) {
    S.setGuide(`${q.q} Toca'ls en ordre.`);
    const el = U.h('<div class="order"><div class="ord-slots"></div><div class="chips ord-bank"></div></div>');
    const slotsEl = el.querySelector('.ord-slots'), bankEl = el.querySelector('.ord-bank');
    let locked = false;
    const put = (s, it) => {
      s.item = it;
      s.el.querySelector('.ot').innerHTML = it ? it.t : '';
    };
    const slots = q.items.map((_, i) => {
      const s = { el: U.h(`<button class="oslot"><span class="on">${i + 1}</span><span class="ot"></span></button>`), item: null };
      s.el.onclick = () => { if (locked || !s.item) return; s.item.b.classList.remove('used'); put(s, null); };
      slotsEl.appendChild(s.el);
      return s;
    });
    const bank = U.shuffle(q.items.map((t) => ({ t })));
    bank.forEach((it) => {
      it.b = U.h(`<button class="chip">${it.t}</button>`);
      it.b.onclick = () => {
        const s = slots.find((x) => !x.item);
        if (locked || it.b.classList.contains('used') || !s) return;
        sfx.tick();
        put(s, it); it.b.classList.add('used');
        if (slots.every((x) => x.item)) setTimeout(() => ctx.submit(), 300);
      };
      bankEl.appendChild(it.b);
    });
    ctx.area.appendChild(el);
    const clear = () => slots.forEach((s) => { if (s.item) { s.item.b.classList.remove('used'); put(s, null); } });
    return {
      auto: true,
      // Es compara el text: hi pot haver elements repetits (el cor surt dues vegades)
      check: () => (slots.every((s) => s.item) ? slots.every((s, i) => s.item.t === q.items[i]) : null),
      bad() { U.shake(slotsEl); setTimeout(clear, 500); },
      good() { locked = true; slots.forEach((s) => s.el.classList.add('right')); },
      reveal() {
        locked = true;
        slots.forEach((s, i) => { s.el.querySelector('.ot').innerHTML = q.items[i]; s.el.classList.add('right'); });
        bank.forEach((it) => it.b.classList.add('used'));
      },
      fb: 'Aquest és l\'ordre correcte!',
      sol: 'Fixa\'t bé en l\'ordre correcte.',
    };
  }

  async function runLevel(l, qs) {
    const S = playScreen(l, qs.length);
    const res = await quiz({
      area: S.area, button: S.button, questions: qs,
      render: (q, ctx) => renderQ(S, q, ctx),
      progress: (i) => S.dots.forEach((d, k) => d.classList.toggle('cur', k === i)),
      onCorrect: (q, { R }) => {
        sfx.ok(); anim(S.ossi, 'happy');
        const w = U.pick(PRAISE);
        floatMsg(`${w} 🦴`);
        return S.setGuide(`<b>${w}</b> ${R.fb || ''}`);
      },
      onWrong: (q, { giveUp, R }) => {
        sfx.bad(); anim(S.ossi, 'sad');
        if (giveUp) return S.setGuide(`No passa res! ${R.sol || ''} 👀`);
        return S.setGuide(R.why ? R.why() : '<b>Torna-ho a provar!</b> 💪');
      },
      after: (r, i) => { if (S.dots[i]) S.dots[i].textContent = r.ok ? '⭐' : '✔'; },
      autoNextMs: 1900,
    });
    finish(l, starsFor(res.mistakes, qs.length));
  }

  // ---------- Els músculs: primer una petita explicació ----------
  async function playMusc(l) {
    await story([
      { who: OSSI, name: 'Ossi', text: 'Jo només soc ossos, però tu també tens <b>músculs</b>! Són tous i estan enganxats als ossos.' },
      { who: OSSI, name: 'Ossi', text: 'Quan un múscul s\'encongeix, <b>estira l\'os</b> i el fa moure. Doblega el braç i toca\'t el <b>bíceps</b>: el notes dur? 💪' },
      { who: OSSI, name: 'Ossi', text: 'Els <b>ossos</b>, els <b>músculs</b> i les <b>articulacions</b> treballen junts. Formen l\'<b>aparell locomotor</b>, que ens permet moure\'ns.' },
      { who: OSSI, name: 'Ossi', text: 'I sabies que el <b>cor</b> també és un múscul? No para mai de bategar, ni quan dorms! ❤️', btn: 'Comença el repte ▶' },
    ]);
    runLevel(l, genMusc());
  }

  // ---------- Nivells amb targetes per explorar ----------
  function playSentits(l) {
    const cards = Object.values(SENTITS).map((s) => ({ e: s.e, n: cap1(s.n), o: s.o, info: s.info }));
    cardLevel(l, cards, 'Tenim <b>cinc sentits</b>. Toca cada targeta per descobrir-los!', genSentits);
  }
  // Targetes per explorar abans del repte (funcions vitals, sentits, reproducció)
  function cardLevel(l, cards, intro, gen) {
    const S = playScreen(l, 0);
    const done = (prog().lv[l.id] || 0) > 0;
    const seen = new Set();
    S.setGuide(intro);
    const grid = U.h('<div class="senses"></div>');
    cards.forEach((s, k) => {
      const c = U.h(`<button class="sense"><div class="se">${s.e}</div><div class="sn">${s.n}</div><div class="so">${s.o}</div></button>`);
      c.onclick = () => {
        sfx.pop(); anim(S.ossi, 'happy');
        grid.querySelectorAll('.sense').forEach((x) => x.classList.remove('cur'));
        c.classList.add('seen', 'cur');
        seen.add(k);
        S.setGuide(`<b>${s.n}</b>. ${s.info}`);
        upd();
      };
      grid.appendChild(c);
    });
    S.area.appendChild(grid);
    const upd = () => {
      const all = seen.size === cards.length;
      S.button.disabled = !(all || done);
      S.button.textContent = all || done ? 'Comença el repte ▶' : `Explora-les totes (${seen.size} de ${cards.length})`;
    };
    upd();
    S.button.onclick = () => { sfx.click(); stopSay(); runLevel(l, gen()); };
  }

  Eloi.topbar();
  splash();
})();
