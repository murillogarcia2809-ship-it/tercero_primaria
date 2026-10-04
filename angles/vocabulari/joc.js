/* L'Illa de les Paraules — vocabulari d'anglès amb la lloro Polly */
(function () {
  'use strict';
  const { U, sfx, say, stopSay, story, modal, confetti, floatMsg, choices, spell, quiz, store, starsFor } = Eloi;
  const ILLES = window.ILLES;
  const PLAYER = 'Eloi';
  const SAVE = 'illa';
  const POLLY = '🦜';
  const app = document.getElementById('app');

  const pic = (w) => (w.color ? `<span class="swatch" style="background:${w.color}"></span>` : w.e);
  const en = (t) => say(t, 'en');

  const ACTS = [
    { id: 'learn', e: '📚', n: 'Aprèn', d: 'Toca cada targeta i escolta com es diu', play: playLearn },
    { id: 'listen', e: '👂', n: 'Escolta i tria', d: 'Escolta la paraula i troba el dibuix', play: playListen },
    { id: 'look', e: '👀', n: 'Mira i tria', d: 'Mira el dibuix i tria la paraula', play: playLook },
    { id: 'memory', e: '🃏', n: 'Parelles', d: 'Troba les parelles de dibuix i paraula', play: playMemory },
    { id: 'spell', e: '✍️', n: 'Lletreja', d: 'Escriu la paraula amb les lletres', play: playSpell },
  ];

  const PRAISE = ['Great!', 'Well done!', 'Awesome!', 'Super!', 'Fantastic!', 'Excellent!', 'You\'re a star!', 'Brilliant!'];
  const EMO = ['🎉', '⭐', '🏴‍☠️', '💰', '🌟', '👏', '🤩'];

  // ---------- Progrés ----------
  const prog = () => store.get(SAVE, { intro: false, isl: {} });
  const saveProg = (p) => store.set(SAVE, p);
  const islP = (p, id) => (p.isl[id] = p.isl[id] || {});
  const coins = (p) => Object.values(p.isl).reduce((a, o) => a + ACTS.reduce((b, ac) => b + (o[ac.id] || 0), 0), 0);
  const chestOpen = (o) => ACTS.every((a) => (o[a.id] || 0) > 0);

  // ---------- Inici ----------
  function splash() {
    Eloi.setBack(null);
    app.innerHTML = `<div class="splash">
      <div class="hero">🦜</div>
      <h1>L'Illa de les Paraules</h1>
      <p class="sub">Ajuda la Polly a trobar els tresors… en anglès!</p>
      <button class="btn big" id="go">JUGAR ▶</button></div>`;
    app.querySelector('#go').onclick = async () => {
      Eloi.unlockAudio();
      sfx.whoosh();
      const p = prog();
      if (!p.intro) { await intro(); p.intro = true; saveProg(p); }
      showMap();
    };
  }
  function intro() {
    return story([
      { who: POLLY, name: 'Polly', text: '<b>Hello!</b> Sóc la Polly, la lloro pirata! 🏴‍☠️', say: 'Hello!', lang: 'en' },
      { who: POLLY, name: 'Polly', text: `Hola, <b>${PLAYER}</b>! He amagat cofres del tresor a ${ILLES.length} illes… però els cofres només s'obren amb paraules en <b>anglès</b>!` },
      { who: POLLY, name: 'Polly', text: 'A cada illa hi ha 5 reptes. Quan els superis tots, el cofre s\'obrirà i guanyaràs monedes d\'or 💰.' },
      { who: POLLY, name: 'Polly', text: 'Comença per <b>Aprèn</b> 📚: toca les targetes i escolta com es diu cada paraula. <b>Let\'s go!</b>', btn: 'Let\'s go! ⛵' },
    ]);
  }

  // ---------- Mapa d'illes ----------
  function showMap() {
    stopSay();
    Eloi.setBack(splash);
    const p = prog();
    app.innerHTML = `<div class="wrap"><h1>🗺️ Mapa del Tresor</h1>
      <div class="coins">💰 ${coins(p)} monedes · 🧰 ${ILLES.filter((i) => chestOpen(islP(p, i.id))).length}/${ILLES.length} cofres oberts</div>
      <div class="islands"></div>
      <div style="margin-top:34px"><button class="btn blue" id="hist">🦜 Història</button></div></div>`;
    const box = app.querySelector('.islands');
    ILLES.forEach((il) => {
      const o = islP(p, il.id);
      const done = ACTS.filter((a) => o[a.id]).length;
      const el = U.h(`<button class="island" style="--c1:${il.c1};--c2:${il.c2}">
        <span class="chest">${chestOpen(o) ? '💰' : '🧰'}</span>
        <div class="sand">${il.e}</div>
        <div class="iname">${il.en}</div><div class="ica">${il.ca} · ${done}/${ACTS.length}</div></button>`);
      el.onclick = () => { sfx.whoosh(); showIsland(il); };
      box.appendChild(el);
    });
    app.querySelector('#hist').onclick = intro;
  }

  // ---------- Illa ----------
  function showIsland(il) {
    stopSay();
    Eloi.setBack(showMap);
    const p = prog(), o = islP(p, il.id);
    const nextIdx = ACTS.findIndex((a) => !o[a.id]);
    app.innerHTML = `<div class="wrap"><h1>${il.e} ${il.en}</h1><div class="coins">${il.ca} · ${chestOpen(o) ? '💰 Cofre obert!' : '🧰 Cofre tancat'}</div><div class="acts"></div></div>`;
    const box = app.querySelector('.acts');
    ACTS.forEach((a, i) => {
      const open = i === 0 || o[ACTS[i - 1].id];
      const st = o[a.id] || 0;
      const el = U.h(`<button class="act ${open ? '' : 'locked'} ${i === nextIdx ? 'next' : ''}">
        <div class="ae">${open ? a.e : '🔒'}</div><div class="an">${i + 1}. ${a.n}</div><div class="ad">${a.d}</div>
        <div class="mini-stars">${[0, 1, 2].map((k) => `<span class="${k < st ? 'on' : ''}">⭐</span>`).join('')}</div></button>`);
      el.onclick = () => {
        if (!open) { sfx.bad(); floatMsg('🔒 Primer el repte anterior!'); return; }
        sfx.click();
        a.play(il, a);
      };
      box.appendChild(el);
    });
    say(`${il.ca}. ${nextIdx >= 0 ? 'Tria un repte!' : ''}`);
  }

  // Desa el resultat i mostra el final de l'activitat
  async function finish(il, act, stars, extraHtml = '') {
    const p = prog(), o = islP(p, il.id);
    const wasOpen = chestOpen(o);
    o[act.id] = Math.max(o[act.id] || 0, stars);
    saveProg(p);
    sfx.win(); confetti();
    en(U.pick(PRAISE));
    const nowOpen = chestOpen(o);
    if (nowOpen && !wasOpen) {
      await modal({ icon: '🧰', title: 'Repte superat!', stars, html: extraHtml, buttons: [{ label: 'Continua ▶', value: 'ok' }] });
      sfx.coin(); setTimeout(sfx.coin, 200); setTimeout(sfx.coin, 400); confetti(200);
      say('Has obert el cofre del tresor!');
      await modal({ icon: '💰', title: 'Cofre obert!', html: `<p>Has obert el cofre de l'illa <b>${il.en}</b>! Ja saps ${il.words.length} paraules noves en anglès. 🏴‍☠️</p>`, buttons: [{ label: 'Mapa 🗺️', value: 'ok' }] });
      showMap();
      return;
    }
    const v = await modal({
      icon: act.e, title: 'Repte superat!', stars, html: extraHtml,
      buttons: [{ label: '🔁 Repetir', value: 'again', cls: 'blue' }, { label: 'Continua ▶', value: 'ok' }],
    });
    if (v === 'again') act.play(il, act); else showIsland(il);
  }

  // Pantalla base de joc
  function playScreen(il, act, n) {
    Eloi.setBack(() => showIsland(il));
    app.innerHTML = `<div class="play">
      <div class="play-head"><span>${il.e} ${act.e} ${act.n}</span><div class="dots">${'<span></span>'.repeat(n || 0)}</div></div>
      <div class="guide"><div class="gchar">${POLLY}</div><div class="gbubble"></div><button class="icon-btn small" id="rep">🔊</button></div>
      <div class="area"></div>
      <div class="foot"><button class="btn green" id="chk">Comprova ✔</button></div></div>`;
    const bubble = app.querySelector('.gbubble');
    let cur = '', curLang = 'ca';
    const setGuide = (html, lang = 'ca', speak = true) => {
      cur = html; curLang = lang;
      bubble.innerHTML = html;
      bubble.classList.remove('pop'); void bubble.offsetWidth; bubble.classList.add('pop');
      return speak ? say(html, lang) : Promise.resolve();
    };
    app.querySelector('#rep').onclick = () => say(cur, curLang);
    const dots = [...app.querySelectorAll('.dots span')];
    return { area: app.querySelector('.area'), button: app.querySelector('#chk'), setGuide, dots };
  }

  // Executa una sèrie de preguntes amb la Polly
  async function runQuiz(il, act, S, questions, render, opts = {}) {
    const res = await quiz({
      area: S.area, button: S.button, questions,
      render: (q, ctx) => render(q, ctx),
      progress: (i) => S.dots.forEach((d, k) => d.classList.toggle('cur', k === i)),
      onCorrect: (q) => {
        sfx.ok();
        const w = U.pick(PRAISE);
        floatMsg(`${w} ${U.pick(EMO)}`);
        bubbleSay(S, `<b>${w}</b> ${q.en ? `<i>${q.en}</i> = ${q.ca}` : ''}`);
        en(q.en ? `${q.en}!` : w);
      },
      onWrong: (q, { giveUp }) => {
        sfx.bad();
        if (giveUp) { S.setGuide(`No passa res! És <b>${q.en}</b> (${q.ca}). 👀`, 'ca', false); en(q.en); }
        else S.setGuide('<b>Oops!</b> Torna-ho a provar! 💪', 'ca');
      },
      after: (r, i) => { if (S.dots[i]) S.dots[i].textContent = r.ok ? '💰' : '✔'; },
      ...opts,
    });
    return starsFor(res.mistakes, questions.length);
  }
  const bubbleSay = (S, html) => S.setGuide(html, 'ca', false);

  // ---------- 1. Aprèn ----------
  function playLearn(il, act) {
    const S = playScreen(il, act, 0);
    S.setGuide('Toca cada targeta per escoltar com es diu en anglès. Quan les hagis escoltat totes, prem <b>Fet!</b>');
    const grid = U.h('<div class="cards"></div>');
    const seen = new Set();
    S.button.textContent = 'Fet! ✔';
    S.button.disabled = true;
    il.words.forEach((w, i) => {
      const c = U.h(`<button class="lcard"><div class="p">${pic(w)}</div><div class="w">${w.en}</div><div class="c">${w.ca}</div></button>`);
      c.onclick = () => {
        sfx.pop(); en(w.en);
        c.classList.add('seen'); seen.add(i);
        if (seen.size === il.words.length && S.button.disabled) { S.button.disabled = false; floatMsg('Molt bé! 👏'); }
      };
      grid.appendChild(c);
    });
    S.area.appendChild(grid);
    S.button.onclick = () => finish(il, act, 3);
  }

  // ---------- 2. Escolta i tria ----------
  async function playListen(il, act) {
    const qs = U.shuffle(il.words).slice(0, Math.min(8, il.words.length));
    const S = playScreen(il, act, qs.length);
    const stars = await runQuiz(il, act, S, qs, (q, ctx) => {
      S.setGuide('Escolta la paraula i toca el dibuix correcte.', 'ca').then(() => en(q.en));
      const b = U.h('<button class="listen-btn" title="Escolta">🔊</button>');
      b.onclick = () => en(q.en);
      ctx.area.appendChild(b);
      const opts = U.shuffle([q, ...U.shuffle(il.words.filter((w) => w !== q)).slice(0, 3)]).map((w) => ({ html: pic(w), ok: w === q }));
      return choices(ctx, opts, { cls: 'pics' });
    });
    finish(il, act, stars);
  }

  // ---------- 3. Mira i tria ----------
  async function playLook(il, act) {
    const qs = U.shuffle(il.words).slice(0, Math.min(8, il.words.length));
    const S = playScreen(il, act, qs.length);
    const stars = await runQuiz(il, act, S, qs, (q, ctx) => {
      S.setGuide('Com es diu això en anglès?', 'ca');
      ctx.area.appendChild(U.h(`<div class="bigpic">${pic(q)}</div>`));
      const opts = U.shuffle([q, ...U.shuffle(il.words.filter((w) => w !== q)).slice(0, 3)]).map((w) => ({ html: w.en, ok: w === q }));
      return choices(ctx, opts);
    });
    finish(il, act, stars);
  }

  // ---------- 4. Parelles ----------
  function playMemory(il, act) {
    const S = playScreen(il, act, 0);
    S.button.style.visibility = 'hidden';
    S.setGuide('Gira dues cartes i troba les parelles: el dibuix amb la seva paraula!');
    const words = U.shuffle(il.words).slice(0, 6);
    const cards = U.shuffle(words.flatMap((w) => [{ w, kind: 'pic' }, { w, kind: 'txt' }]));
    const grid = U.h('<div class="memory"></div>');
    let open = [], moves = 0, found = 0, busy = false;
    cards.forEach((c) => {
      c.el = U.h(`<button class="mcard"><div class="in"><div class="f">🦜</div><div class="b ${c.kind}">${c.kind === 'pic' ? pic(c.w) : c.w.en}</div></div></button>`);
      c.el.onclick = async () => {
        if (busy || c.el.classList.contains('open') || c.el.classList.contains('done')) return;
        sfx.tick();
        c.el.classList.add('open');
        if (c.kind === 'txt') en(c.w.en);
        open.push(c);
        if (open.length < 2) return;
        moves++;
        const [a, b] = open;
        open = [];
        if (a.w === b.w) {
          await U.sleep(300);
          a.el.classList.add('done'); b.el.classList.add('done');
          sfx.ok(); en(a.w.en); found++;
          if (found === words.length) {
            await U.sleep(900);
            const extra = moves - words.length;
            finish(il, act, extra <= 3 ? 3 : extra <= 7 ? 2 : 1, `<p>Ho has fet en <b>${moves}</b> moviments!</p>`);
          }
        } else {
          busy = true;
          await U.sleep(1000);
          a.el.classList.remove('open'); b.el.classList.remove('open');
          busy = false;
        }
      };
      grid.appendChild(c.el);
    });
    S.area.appendChild(grid);
  }

  // ---------- 5. Lletreja ----------
  async function playSpell(il, act) {
    const short = il.words.filter((w) => w.en.length <= 8);
    const qs = U.shuffle(short.length >= 5 ? short : il.words).slice(0, 5);
    const S = playScreen(il, act, qs.length);
    const stars = await runQuiz(il, act, S, qs, (q, ctx) => {
      S.setGuide('Escriu la paraula en anglès amb les lletres. Toca l\'altaveu 🔊 per escoltar-la!', 'ca').then(() => en(q.en));
      const top = U.h(`<div style="display:flex;align-items:center;gap:18px"><div class="bigpic">${pic(q)}</div><button class="icon-btn" style="background:#fff">🔊</button></div>`);
      top.querySelector('button').onclick = () => en(q.en);
      ctx.area.appendChild(top);
      return spell(ctx, q.en, { extra: 2 });
    });
    finish(il, act, stars);
  }

  Eloi.topbar();
  splash();
})();
