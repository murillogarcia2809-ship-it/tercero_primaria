/* Motor de "missió" per als jocs per nivells (necessita comu.js i premi.js).
   Pantalla d'inici → història → mapa de nivells → nivells (amb premi col·leccionable i acudit)
   → repte final → joc de regal + diploma (Eloi.premi.final).

   Eloi.missio(cfg) amb cfg = {
     save, splash: {hero, title, sub}, guide: {who, name}, intro: [línies de story],
     mapTitle, album: {title, empty},
     levels: [{id, e, n, d, intro, N, gen(i) → pregunta, premi: {e, nom, txt}}],
     boss: {id, e, n, d, intro, gen() → pregunta, hp, lives, me, him, himName, hits, misses, win: [línies]},
     render: {tipus(q, ctx, G) → R}, instr(q), hint(q), sayGood(q, R) → text a dir en encertar (opcional),
     final: {titol, motiu, emoji, signa}
   }
   G (per als renderers) = {setGuide, say}. Un renderer pot posar R.speaks = true si ja parla en encertar. */
(function () {
  'use strict';
  const { U, sfx, say, stopSay, story, floatMsg, quiz, store, starsFor, confetti } = Eloi;
  const PLAYER = Eloi.nom();
  const PRAISE = ['Molt bé!', 'Genial!', 'Fantàstic!', 'Quin crac!', 'Perfecte!', 'Increïble!', 'Bravo!', 'Molt ben fet!', 'Boníssim!', 'Uau!'];
  const EMO = ['🎉', '⭐', '🚀', '💥', '🌟', '👏', '🤩', '🥳'];
  const RATXA = { 3: 'Ratxa de 3! 🔥', 5: 'Ratxa de 5! Imparable! 🔥🔥', 8: 'Ratxa de 8! Llegendari! 🏆' };

  function missio(cfg) {
    const app = document.getElementById('app');
    const prog = () => Object.assign({ intro: false, lv: {}, seen: {} }, store.get(cfg.save, {}));
    const saveProg = (p) => store.set(cfg.save, p);
    const all = cfg.levels.concat([cfg.boss]);
    const unlocked = (i, p) => i === 0 || (p.lv[all[i - 1].id] || 0) > 0 || (p.lv[all[i].id] || 0) > 0;
    const totalStars = (p) => Object.values(p.lv).reduce((a, b) => a + b, 0);
    const G = { say };

    // ---------- Inici ----------
    function splash() {
      Eloi.setBack(null);
      app.innerHTML = `<div class="splash">
        <div class="hero">${cfg.splash.hero}</div>
        <h1>${cfg.splash.title}</h1>
        <p class="sub">${Eloi.t(cfg.splash.sub)}</p>
        <button class="btn big" id="go">JUGAR ▶</button></div>`;
      app.querySelector('#go').onclick = async () => {
        Eloi.unlockAudio();
        sfx.whoosh();
        const p = prog();
        if (!p.intro) { await story(cfg.intro); p.intro = true; saveProg(p); }
        showMap();
      };
    }

    // ---------- Mapa ----------
    function showMap() {
      stopSay();
      Eloi.setBack(splash);
      const p = prog();
      const nextIdx = all.findIndex((l, i) => unlocked(i, p) && !p.lv[l.id]);
      const fet = !!p.lv[cfg.boss.id];
      app.innerHTML = `<div class="mmap">
        <h1>${cfg.mapTitle}</h1>
        <div class="mm-sub">⭐ ${totalStars(p)} estrelles</div>
        <button class="album" id="album" title="${cfg.album.title}">${cfg.levels.map((l) => `<span class="${p.lv[l.id] ? '' : 'off'}">${p.lv[l.id] ? l.premi.e : cfg.album.empty}</span>`).join('')}</button>
        <div class="path"></div>
        <div class="mm-btns">
          <button class="btn blue" id="hist">📜 Història</button>
          ${fet ? '<button class="btn" id="dipl">🏅 Diploma</button><button class="btn green" id="regal">🎁 Joc de regal</button>' : ''}
        </div></div>`;
      const path = app.querySelector('.path');
      all.forEach((l, i) => {
        const open = unlocked(i, p), st = p.lv[l.id] || 0;
        const el = U.h(`<button class="stone ${open ? '' : 'locked'} ${i === nextIdx ? 'next' : ''} ${l === cfg.boss ? 'boss' : ''}">
          <div class="st-orb">${st && l.premi ? l.premi.e : l.e}${i === nextIdx ? '<span class="st-here">👇</span>' : ''}</div>
          <div class="st-txt"><b>${l.n}</b><small>${l.d}</small>
          <span class="mini-stars">${[0, 1, 2].map((k) => `<span class="${k < st ? 'on' : ''}">⭐</span>`).join('')}</span></div></button>`);
        el.onclick = () => {
          if (!open) { sfx.bad(); floatMsg('🔒 Primer l\'anterior!'); return; }
          sfx.whoosh();
          if (l === cfg.boss) playBoss(); else playLevel(l);
        };
        path.appendChild(el);
      });
      app.querySelector('#hist').onclick = () => story(cfg.intro);
      app.querySelector('#album').onclick = showAlbum;
      if (fet) {
        app.querySelector('#dipl').onclick = () => diploma();
        app.querySelector('#regal').onclick = () => Eloi.premi.jocRegal(showMap);
      }
      const nx = path.children[nextIdx];
      if (nx) setTimeout(() => nx.scrollIntoView({ block: 'center', behavior: 'smooth' }), 200);
    }

    function showAlbum() {
      sfx.click();
      const p = prog();
      const n = cfg.levels.filter((l) => p.lv[l.id]).length;
      Eloi.modal({
        icon: cfg.album.icon || '📒', title: cfg.album.title,
        html: `<p>Tens <b>${n}</b> de <b>${cfg.levels.length}</b>.</p><div class="album-grid">${cfg.levels.map((l) => (p.lv[l.id]
          ? `<div class="al-it"><span>${l.premi.e}</span><b>${l.premi.nom}</b><small>${l.premi.txt || ''}</small></div>`
          : `<div class="al-it off"><span>${cfg.album.empty}</span><b>???</b><small>${l.n}</small></div>`)).join('')}</div>`,
        buttons: [{ label: 'Tancar', value: 'ok' }],
      });
    }

    // ---------- Pantalla de joc ----------
    function playScreen(title, extraHead = '') {
      app.innerHTML = `<div class="play">
        ${extraHead}
        <div class="play-head"><div class="ptitle">${title}</div><div class="dots"></div></div>
        <div class="guide"><div class="gchar">${typeof cfg.guide.who === 'function' ? cfg.guide.who() : cfg.guide.who}</div><div class="gbubble"></div>
          <div class="gbtns"><button class="icon-btn small" id="rep" title="Torna-ho a dir">🔊</button><button class="icon-btn small" id="help" title="Explicació">❓</button></div></div>
        <div class="area"></div>
        <div class="foot"><button class="btn green" id="chk">Comprova ✔</button></div></div>`;
      const bubble = app.querySelector('.gbubble');
      let current = '';
      const setGuide = (html, speak = true) => {
        current = html;
        bubble.innerHTML = Eloi.t(html);
        bubble.classList.remove('pop'); void bubble.offsetWidth; bubble.classList.add('pop');
        return speak ? say(html) : Promise.resolve();
      };
      app.querySelector('#rep').onclick = () => say(current);
      G.setGuide = setGuide;
      return { area: app.querySelector('.area'), button: app.querySelector('#chk'), dots: app.querySelector('.dots'), setGuide, help: app.querySelector('#help') };
    }

    const makeRender = (S) => (q, ctx) => {
      const R = cfg.render[q.type](q, ctx, G);
      const sp = S.setGuide(cfg.instr(q));
      if (R.afterInstr) sp.then(R.afterInstr);
      return R;
    };

    async function playLevel(l) {
      Eloi.setBack(showMap);
      const p = prog();
      if (!p.seen[l.id] && l.intro) { await story(l.intro); p.seen[l.id] = true; saveProg(p); }
      const S = playScreen(`${l.e} ${l.n}`);
      if (l.intro) S.help.onclick = () => story(l.intro); else S.help.classList.add('hidden');
      const N = l.N || 8;
      S.dots.innerHTML = '<span></span>'.repeat(N);
      const dots = [...S.dots.children];
      let ratxa = 0;
      const res = await quiz({
        area: S.area, button: S.button,
        questions: Array.from({ length: N }, (_, i) => l.gen(i)),
        render: makeRender(S),
        progress: (i) => dots.forEach((d, k) => d.classList.toggle('cur', k === i)),
        onCorrect: (q, { attempts, R }) => {
          sfx.ok();
          const errs = attempts + (R.extraMistakes ? R.extraMistakes() : 0);
          ratxa = errs ? 0 : ratxa + 1;
          const w = U.pick(PRAISE);
          if (RATXA[ratxa]) { setTimeout(() => { sfx.star(); floatMsg(RATXA[ratxa], '#ffd23f'); }, 700); }
          floatMsg(`${w} ${U.pick(EMO)}`);
          const extra = cfg.sayGood ? cfg.sayGood(q, R) : '';
          return S.setGuide(`${w} ${errs ? '' : 'A la primera! '}${U.pick(EMO)}${extra ? '<br>' + extra : ''}`, !R.speaks);
        },
        onWrong: (q, { giveUp }) => {
          sfx.bad();
          ratxa = 0;
          return S.setGuide(giveUp ? 'No passa res! Mira la solució i fixa-t\'hi bé. 👀' : cfg.hint(q));
        },
        revealMs: 4000,
        after: (r, i) => {
          dots[i].textContent = r.ok ? '⭐' : '✔';
          if (i === Math.floor(N / 2) - 1) { sfx.coin(); floatMsg('Ja portes la meitat! 💪', '#7bed9f'); }
        },
      });
      const stars = starsFor(res.mistakes, N);
      const p2 = prog();
      const first = !p2.lv[l.id];
      p2.lv[l.id] = Math.max(p2.lv[l.id] || 0, stars);
      saveProg(p2);
      sfx.win(); confetti();
      const idx = cfg.levels.indexOf(l);
      const next = all[idx + 1];
      const premiHTML = first ? `<div class="unlock"><div class="un-e">${l.premi.e}</div><div><small>Nou per a la col·lecció!</small><b>${l.premi.nom}</b><span>${l.premi.txt || ''}</span></div></div>` : '';
      say(first ? `Nivell superat! Has aconseguit ${l.premi.nom}!` : 'Nivell superat!');
      const v = await Eloi.premi.modalNivell({
        icon: '🏆', title: 'Nivell superat!', stars,
        html: `<p><b>${l.n}</b>${res.mistakes ? ` amb ${res.mistakes} ${res.mistakes === 1 ? 'error' : 'errors'}` : ' sense cap error'}!</p>${premiHTML}`,
        buttons: [{ label: '🔁', value: 'again', cls: 'blue' }, { label: 'Mapa', value: 'map', cls: 'blue' }].concat(next ? [{ label: 'Següent ▶', value: 'next', cls: 'green' }] : []),
      });
      if (v === 'again') playLevel(l);
      else if (v === 'next') { sfx.whoosh(); if (next === cfg.boss) playBoss(); else playLevel(next); }
      else showMap();
    }

    // ---------- Repte final ----------
    async function playBoss() {
      const B = cfg.boss;
      Eloi.setBack(showMap);
      await story(B.intro);
      const HPMAX = B.hp || 10;
      let hp = HPMAX, lives = B.lives || 3;
      const head = `<div class="boss-bar">
        <div class="boss-side"><div class="who" id="me">${B.me}</div><div><b>${PLAYER}</b><div class="lives">${'<span>❤️</span>'.repeat(lives)}</div></div></div>
        <div class="boss-side"><div style="text-align:right"><b>${B.himName}</b><div class="hp"><i style="width:100%"></i></div></div><div class="who" id="him">${B.him}</div></div></div>`;
      const S = playScreen(`${B.e} ${B.n}`, head);
      S.help.classList.add('hidden');
      S.dots.remove();
      const me = app.querySelector('#me'), him = app.querySelector('#him');
      const hpBar = app.querySelector('.hp i'), lv = [...app.querySelectorAll('.lives span')];
      const hit = (el) => { el.classList.remove('hit'); void el.offsetWidth; el.classList.add('hit'); };
      await quiz({
        area: S.area, button: S.button, maxAttempts: 1, autoNextMs: 1200, revealMs: 3500,
        questions: Array.from({ length: 40 }, () => B.gen()),
        render: makeRender(S),
        onCorrect: () => {
          sfx.laser();
          setTimeout(() => { sfx.boom(); hit(him); hp--; hpBar.style.width = (hp / HPMAX) * 100 + '%'; }, 300);
          const w = U.pick(B.hits);
          floatMsg(w);
          return S.setGuide(w);
        },
        onWrong: () => {
          sfx.bad();
          setTimeout(() => { hit(me); lives--; lv.forEach((s, i) => s.classList.toggle('off', i >= lives)); }, 300);
          return S.setGuide(U.pick(B.misses));
        },
        after: async () => { await U.sleep(350); if (hp <= 0 || lives <= 0) return 'stop'; },
      });
      if (hp <= 0) {
        sfx.win(); confetti(200);
        const p = prog();
        p.lv[B.id] = Math.max(p.lv[B.id] || 0, lives);
        saveProg(p);
        await story(B.win);
        Eloi.premi.final(Object.assign({ joc: cfg.save, estrelles: totalStars(prog()), onClose: showMap }, cfg.final));
      } else {
        say('Gairebé! Torna-ho a provar, tu pots!');
        const v = await Eloi.modal({
          icon: '💪', title: 'Gairebé!',
          html: '<p>Has perdut els tres cors, però hi eres a prop! Torna-ho a provar, tu pots!</p>',
          buttons: [{ label: '🔁 Tornar-hi', value: 'again', cls: 'green' }, { label: 'Mapa', value: 'map' }],
        });
        if (v === 'again') playBoss(); else showMap();
      }
    }

    const diploma = () => Eloi.premi.diploma(Object.assign({ joc: cfg.save, estrelles: totalStars(prog()), onClose: showMap }, cfg.final));

    Eloi.topbar();
    splash();
    return { showMap };
  }

  Eloi.missio = missio;
})();
