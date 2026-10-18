/* Premis comuns per a tots els jocs (necessita comu.js).
   NORMA: tots els jocs acaben amb un joc de regal (només per divertir-se) i un diploma.
   Exposa Eloi.premi amb:
     acudit(), curiositat()           → un acudit {p, r} o una curiositat (sense repetir fins que s'acaben)
     modalNivell(opts)                → el modal de final de nivell amb un acudit o una curiositat de premi
     final({joc, titol, motiu, emoji, estrelles, signa, onClose}) → tria joc de regal → diploma
     diploma(opts), jocRegal(onDone)  → per obrir-los des d'un botó del mapa */
(function () {
  'use strict';
  const { U, sfx, say, stopSay, store, confetti, modal } = Eloi;
  const PLAYER = Eloi.nom();

  const ACUDITS = [
    { p: 'La mestra pregunta: si tinc cinc pomes en una mà i sis a l\'altra, què tinc?', r: 'Unes mans enormes! 🍎🙌' },
    { p: 'Què li diu el zero al vuit?', r: 'Quin cinturó més maco que portes! 0️⃣➡️8️⃣' },
    { p: 'Per què el llibre de mates està tan trist?', r: 'Perquè té massa problemes! 📕😢' },
    { p: 'Un caragol és atracat per dues tortugues. El policia li pregunta: com eren? I el caragol diu…', r: 'No ho sé, va anar tot molt ràpid! 🐌💨' },
    { p: 'Com saps que hi ha un elefant amagat a la nevera?', r: 'Per les petjades a la mantega! 🐘🧈' },
    { p: 'Quin és l\'animal més antic del món?', r: 'La zebra, perquè és en blanc i negre! 🦓📺' },
    { p: 'Què fa una vaca quan surt el sol?', r: 'Ombra! 🐄☀️' },
    { p: 'Què és un punt verd en un racó?', r: 'Un pèsol castigat! 🟢😅' },
    { p: 'Doctor, doctor, em sento com una cortina!', r: 'Doncs corri\'s una mica! 🪟😂' },
    { p: 'Doctor, doctor, tothom m\'ignora!', r: 'Següent! 👨‍⚕️' },
    { p: 'La mestra diu: Joan, digue\'m dos pronoms. I el Joan respon…', r: 'Qui, jo? I la mestra: molt bé! 😄' },
    { p: 'Per què els ocells volen cap al sud a l\'hivern?', r: 'Perquè caminant trigarien massa! 🐦🚶' },
    { p: 'Què li diu un semàfor a un altre semàfor?', r: 'No em miris, que m\'estic canviant! 🚦🙈' },
    { p: 'Què li diu una paret a una altra paret?', r: 'Ens trobem a la cantonada! 🧱' },
    { p: 'Com es diu el cosí vegetarià de Bruce Lee?', r: 'Brocco Lee! 🥦🥋' },
    { p: 'Un pop va al metge i diu: doctor, em fa mal el braç. El metge pregunta: quin? I el pop diu…', r: 'Tots vuit! 🐙' },
    { p: 'Has vist mai un elefant amagat dalt d\'un arbre?', r: 'No? Doncs és que s\'amaguen molt bé! 🐘🌳' },
    { p: 'Per què les girafes tenen el coll tan llarg?', r: 'Perquè el cap els queda molt lluny del cos! 🦒' },
    { p: 'Saps quin és el súmmum d\'un jardiner?', r: 'Que el deixin plantat! 🌱😆' },
    { p: 'Què fa una abella al gimnàs?', r: 'Zumba! 🐝💃' },
    { p: 'Mama, mama, puc sortir a jugar? Amb aquests forats als mitjons?', r: 'No, amb el Pau del pis de dalt! 🧦😂' },
    { p: 'Per què l\'ordinador va anar al metge?', r: 'Perquè tenia un virus! 💻🤧' },
  ];
  const CURIOSITATS = [
    'Un pop té <b>3 cors</b> i <b>8 braços</b>. 🐙',
    'Les abelles fan les cel·les de la bresca amb <b>6 costats</b>: són hexàgons! 🐝',
    'Una aranya té <b>8 potes</b> i un insecte en té <b>6</b>. 🕷️',
    'Un any té <b>365 dies</b>, que són <b>52 setmanes</b> i un dia. 📅',
    'Si sumes les dues cares oposades d\'un dau, sempre dona <b>7</b>! 🎲',
    'Truc de la taula del 9: les xifres del resultat sumen 9. 9 × 3 = 27, i 2 + 7 = 9! 🪄',
    'El <b>zero</b> el van inventar a l\'Índia fa més de 1.000 anys. 0️⃣',
    'La girafa té <b>7 ossos</b> al coll, els mateixos que tu! 🦒',
    'Els dofins dormen amb <b>mig cervell</b> despert. 🐬',
    'Al cavallet de mar, és el <b>pare</b> qui porta les cries a la panxa. 🐴',
    'Els flamencs són rosats pel menjar: si no mengen gambetes, es tornen blancs! 🦩',
    'Una formiga pot aixecar fins a <b>50 vegades</b> el seu pes. 🐜',
    'El cor d\'un nen batega unes <b>100.000 vegades</b> cada dia. ❤️',
    'L\'Everest, la muntanya més alta, fa <b>8.849 metres</b>. 🏔️',
    'Les estrelles de mar tenen <b>5 braços</b>, i si en perden un, els torna a créixer! ⭐',
    'Un colibrí bat les ales unes <b>50 vegades</b> per segon. 🐦',
    'Qualsevol número multiplicat per <b>0</b> dona <b>0</b>. El zero s\'ho menja tot! 😋',
    'Un pop pot canviar de color en menys d\'un segon. 🎨',
    'Els cargols tenen milers de dents petitíssimes! 🐌',
    'Si apilessis 1.000 fulls de paper, faria uns <b>10 centímetres</b> d\'alt. 📄',
  ];

  // Agafa un element sense repetir fins que s'han vist tots (es recorda entre partides)
  function nextOf(list, key) {
    let seen = store.get(key, []);
    if (seen.length >= list.length) seen = [];
    const free = list.map((_, i) => i).filter((i) => !seen.includes(i));
    const i = U.pick(free);
    seen.push(i);
    store.set(key, seen);
    return list[i];
  }
  const acudit = () => nextOf(ACUDITS, 'premi-acudits');
  const curiositat = () => nextOf(CURIOSITATS, 'premi-curiositats');

  // HTML d'una sorpresa: acudit (amb botó per veure la resposta) o curiositat
  function sorpresaHTML(tipus) {
    if (tipus === 'curiositat' || (!tipus && Math.random() < 0.35)) {
      return { html: `<div class="sorpresa cur"><div class="s-tit">🤓 Sabies que…?</div><div class="s-txt">${curiositat()}</div></div>`, kind: 'cur' };
    }
    const a = acudit();
    return {
      html: `<div class="sorpresa jk"><div class="s-tit">😂 Acudit de premi</div><div class="s-txt">${a.p}</div>
        <button class="btn small-btn s-reveal">Resposta 👀</button><div class="s-ans hidden">${a.r}</div></div>`,
      kind: 'jk', a,
    };
  }
  function wireSorpresa(root, s) {
    const el = root.querySelector('.sorpresa');
    if (!el) return;
    const txt = el.querySelector('.s-txt').innerHTML;
    if (s.kind === 'cur') { setTimeout(() => say('Sabies que ' + txt), 900); return; }
    setTimeout(() => say(s.a.p), 900);
    const b = el.querySelector('.s-reveal'), ans = el.querySelector('.s-ans');
    b.onclick = () => {
      b.remove(); ans.classList.remove('hidden'); ans.classList.add('pop');
      sfx.pop(); setTimeout(() => sfx.ok(), 120);
      say(s.a.r);
    };
  }
  // Modal de final de nivell amb sorpresa (els paràmetres són els de Eloi.modal)
  function modalNivell(o) {
    const s = sorpresaHTML(o.sorpresa);
    const p = modal(Object.assign({}, o, { html: (o.html || '') + s.html }));
    const bgs = document.querySelectorAll('.modal-bg');
    wireSorpresa(bgs[bgs.length - 1], s);
    return p;
  }

  // ---------- Capa a pantalla completa ----------
  function overlay(cls = '') {
    const ov = U.h(`<div class="premi-ov ${cls}"><div class="premi-in"></div></div>`);
    document.body.appendChild(ov);
    return { ov, box: ov.querySelector('.premi-in'), close: () => { stopSay(); ov.remove(); } };
  }

  // ---------- Jocs de regal ----------
  const JOCS = [
    { id: 'globus', e: '🎈', n: 'Explota globus', d: 'Toca tots els globus que puguis!' },
    { id: 'talps', e: '🐹', n: 'Atrapa el talp', d: 'Toca el talp abans que s\'amagui!' },
    { id: 'parelles', e: '🃏', n: 'Parelles', d: 'Troba les cartes iguals.' },
  ];

  function jocRegal(onDone) {
    const O = overlay('regal');
    O.box.innerHTML = `<div class="r-head"><div class="r-gift">🎁</div><h2>Joc de regal!</h2>
      <p>T'has guanyat un joc només per divertir-te. Tria'n un!</p></div><div class="r-list"></div>
      <div class="r-foot"><button class="btn blue" id="r-skip">Ara no, vull el diploma 🏅</button></div>`;
    say('Joc de regal! T\'has guanyat un joc només per divertir-te. Tria\'n un!');
    const list = O.box.querySelector('.r-list');
    JOCS.forEach((j) => {
      const best = store.get('premi-best', {})[j.id];
      const b = U.h(`<button class="r-card"><span class="r-e">${j.e}</span><b>${j.n}</b><small>${j.d}</small>${best ? `<small class="r-best">🏆 Rècord: ${best}</small>` : ''}</button>`);
      b.onclick = () => { sfx.whoosh(); stopSay(); MINI[j.id](O, () => { O.close(); onDone && onDone(); }); };
      list.appendChild(b);
    });
    O.box.querySelector('#r-skip').onclick = () => { sfx.click(); O.close(); onDone && onDone(); };
  }

  function saveBest(id, v, lowerIsBetter) {
    const b = store.get('premi-best', {});
    const rec = b[id] === undefined || (lowerIsBetter ? v < b[id] : v > b[id]);
    if (rec) { b[id] = v; store.set('premi-best', b); }
    return rec;
  }
  // Pantalla de resultat d'un joc de regal
  function fiMini(O, done, { e, txt, rec, again }) {
    sfx.win(); confetti(90);
    O.box.innerHTML = `<div class="r-head"><div class="r-gift">${e}</div><h2>${txt}</h2>
      ${rec ? '<p class="r-rec">🏆 Nou rècord!</p>' : ''}</div>
      <div class="modal-btns"><button class="btn blue" id="r-again">🔁 Un altre cop</button><button class="btn green" id="r-ok">Continuar ▶</button></div>`;
    say(U.stripTags(txt) + (rec ? '. Nou rècord!' : ''));
    O.box.querySelector('#r-again').onclick = () => { sfx.click(); again(); };
    O.box.querySelector('#r-ok').onclick = () => { sfx.click(); done(); };
  }
  // Compte enrere 3, 2, 1
  async function compte(O, titol) {
    for (const n of ['3', '2', '1', 'Ja!']) {
      O.box.innerHTML = `<div class="r-count"><small>${titol}</small><div class="pop">${n}</div></div>`;
      sfx.tick();
      await U.sleep(650);
    }
  }

  const MINI = {
    // Globus que pugen: cada globu +1, el daurat +3
    async globus(O, done) {
      await compte(O, '🎈 Explota tots els globus!');
      const T = 25;
      let punts = 0, temps = T, viu = true;
      O.box.innerHTML = `<div class="m-bar"><span>🎈 <b id="m-p">0</b></span><span>⏱️ <b id="m-t">${T}</b></span></div><div class="m-sky"></div>`;
      const sky = O.box.querySelector('.m-sky'), pEl = O.box.querySelector('#m-p'), tEl = O.box.querySelector('#m-t');
      const COL = ['#ff5a5f', '#4fc3f7', '#2ecc71', '#b388ff', '#ff9f43', '#ff6b9d'];
      const spawn = () => {
        if (!viu) return;
        const gold = Math.random() < 0.12;
        const g = U.h(`<button class="balloon ${gold ? 'gold' : ''}" style="left:${U.rand(4, 82)}%;--c:${gold ? '#ffd23f' : U.pick(COL)};animation-duration:${(Math.random() * 2 + 3.4).toFixed(2)}s">${gold ? '⭐' : ''}</button>`);
        g.addEventListener('pointerdown', () => {
          if (g.classList.contains('popped')) return;
          g.classList.add('popped'); sfx.pop();
          punts += gold ? 3 : 1; pEl.textContent = punts;
          const f = U.h(`<div class="m-plus" style="left:${g.style.left};top:${g.getBoundingClientRect().top - sky.getBoundingClientRect().top}px">+${gold ? 3 : 1}</div>`);
          sky.appendChild(f); setTimeout(() => f.remove(), 700);
          setTimeout(() => g.remove(), 200);
        });
        g.addEventListener('animationend', () => g.remove());
        sky.appendChild(g);
        setTimeout(spawn, U.rand(280, 520));
      };
      spawn();
      const tick = setInterval(() => {
        temps--; tEl.textContent = temps;
        if (temps <= 0) {
          clearInterval(tick); viu = false;
          const rec = saveBest('globus', punts);
          fiMini(O, done, { e: '🎈', txt: `Has explotat <b>${punts}</b> punts de globus!`, rec, again: () => MINI.globus(O, done) });
        }
      }, 1000);
    },

    // Talps que surten dels forats
    async talps(O, done) {
      await compte(O, '🐹 Toca el talp!');
      const T = 25;
      let punts = 0, temps = T, viu = true;
      O.box.innerHTML = `<div class="m-bar"><span>🐹 <b id="m-p">0</b></span><span>⏱️ <b id="m-t">${T}</b></span></div>
        <div class="m-holes">${'<div class="hole"><button class="mole"></button></div>'.repeat(9)}</div>`;
      const pEl = O.box.querySelector('#m-p'), tEl = O.box.querySelector('#m-t');
      const moles = [...O.box.querySelectorAll('.mole')];
      moles.forEach((m) => {
        m.addEventListener('pointerdown', () => {
          if (!m.classList.contains('up') || m.classList.contains('hit')) return;
          const v = m.dataset.v === 'gold' ? 3 : 1;
          m.classList.add('hit'); sfx.chomp();
          punts += v; pEl.textContent = punts;
          m.textContent = '😵';
          setTimeout(() => m.classList.remove('up', 'hit'), 250);
        });
      });
      const surt = () => {
        if (!viu) return;
        const free = moles.filter((m) => !m.classList.contains('up'));
        if (free.length) {
          const m = U.pick(free), gold = Math.random() < 0.12;
          m.dataset.v = gold ? 'gold' : '';
          m.textContent = gold ? '🌟' : '🐹';
          m.classList.add('up');
          setTimeout(() => m.classList.remove('up'), U.rand(800, 1250) - Math.min(350, punts * 10));
        }
        setTimeout(surt, U.rand(380, 700));
      };
      surt();
      const tick = setInterval(() => {
        temps--; tEl.textContent = temps;
        if (temps <= 0) {
          clearInterval(tick); viu = false;
          const rec = saveBest('talps', punts);
          fiMini(O, done, { e: '🐹', txt: `Has atrapat <b>${punts}</b> punts de talps!`, rec, again: () => MINI.talps(O, done) });
        }
      }, 1000);
    },

    // Memory de 6 parelles
    parelles(O, done) {
      const ems = U.shuffle(['🐶', '🐱', '🦊', '🐸', '🐵', '🦄', '🐙', '🐼', '🦁', '🐷', '🐧', '🦖']).slice(0, 6);
      const cards = U.shuffle(ems.concat(ems));
      let obertes = [], trobades = 0, intents = 0, ocupat = false;
      O.box.innerHTML = `<div class="m-bar"><span>🃏 Parelles: <b id="m-p">0</b> / 6</span><span>🔄 <b id="m-t">0</b></span></div>
        <div class="m-cards">${cards.map((e) => `<button class="mcard" data-e="${e}"><span>${e}</span></button>`).join('')}</div>`;
      say('Troba les parelles de cartes iguals!');
      const pEl = O.box.querySelector('#m-p'), tEl = O.box.querySelector('#m-t');
      O.box.querySelectorAll('.mcard').forEach((c) => {
        c.onclick = async () => {
          if (ocupat || c.classList.contains('open')) return;
          sfx.tick();
          c.classList.add('open');
          obertes.push(c);
          if (obertes.length < 2) return;
          intents++; tEl.textContent = intents;
          const [a, b] = obertes;
          obertes = [];
          if (a.dataset.e === b.dataset.e) {
            sfx.coin(); a.classList.add('done'); b.classList.add('done');
            trobades++; pEl.textContent = trobades;
            if (trobades === 6) {
              await U.sleep(600);
              const rec = saveBest('parelles', intents, true);
              fiMini(O, done, { e: '🃏', txt: `Totes les parelles en <b>${intents}</b> intents!`, rec, again: () => MINI.parelles(O, done) });
            }
          } else {
            ocupat = true;
            await U.sleep(800);
            a.classList.remove('open'); b.classList.remove('open');
            ocupat = false;
          }
        };
      });
    },
  };

  // ---------- Diploma ----------
  // o = {joc, titol, motiu, emoji, estrelles, signa, onClose}
  function diploma(o) {
    const O = overlay('dipl');
    const avui = new Date().toLocaleDateString('ca-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    O.box.innerHTML = `<div class="diploma2">
      <div class="d-corner tl">${o.emoji || '⭐'}</div><div class="d-corner tr">${o.emoji || '⭐'}</div>
      <div class="d-medal">🏅</div>
      <div class="d-small">DIPLOMA</div>
      <div class="d-title">${Eloi.t(o.titol)}</div>
      <p>Aquest diploma s'atorga a</p>
      <div class="d-name">${PLAYER}</div>
      <p class="d-why">${Eloi.t(o.motiu)}</p>
      ${o.estrelles ? `<p class="d-stars">⭐ ${o.estrelles} estrelles</p>` : ''}
      <div class="d-foot"><span>${avui}</span><span class="d-sign">${o.signa || ''}</span></div>
      <div class="no-print d-btns"><button class="btn blue" id="d-print">🖨️ Imprimir</button><button class="btn" id="d-close">Tornar ▶</button></div>
    </div>`;
    const d = store.get('diplomes', {});
    d[o.joc] = { titol: Eloi.t(o.titol), data: avui };
    store.set('diplomes', d);
    sfx.win(); confetti(160);
    say(`Diploma! ${o.titol}. Aquest diploma s'atorga a ${PLAYER}, ${U.stripTags(o.motiu)}`);
    O.box.querySelector('#d-print').onclick = () => window.print();
    O.box.querySelector('#d-close').onclick = () => { sfx.click(); O.close(); o.onClose && o.onClose(); };
  }

  // Final de joc: primer el joc de regal i després el diploma
  function final(o) {
    jocRegal(() => diploma(o));
  }
  const teDiploma = (joc) => !!store.get('diplomes', {})[joc];

  Eloi.premi = { acudit, curiositat, sorpresaHTML, wireSorpresa, modalNivell, jocRegal, diploma, final, teDiploma };
})();
