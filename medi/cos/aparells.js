/* Aparells del cos (temari de 3r): figures de l'interior del cos, òrgans, targetes i preguntes.
   S'afegeix a l'objecte COS de dades.js. Les parts amb mk: 'el' es ressalten copiant el seu dibuix
   (elements amb data-part), útil per a tubs llargs com les venes o els nervis. */
(function (C) {
  'use strict';

  // Punts cada `step` unitats al llarg d'una línia trencada (per poder tocar tubs llargs)
  function samp(poly, step = 8) {
    const out = [];
    for (let i = 0; i < poly.length - 1; i++) {
      const [x1, y1] = poly[i], [x2, y2] = poly[i + 1];
      const n = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / step));
      for (let k = 0; k < n; k++) out.push([x1 + ((x2 - x1) * k) / n, y1 + ((y2 - y1) * k) / n]);
    }
    out.push(poly[poly.length - 1]);
    return out;
  }
  const pl = (poly) => 'M' + poly.map((p) => p.join(' ')).join(' L');
  const lines = (polys, attrs) => polys.map((q) => `<path d="${pl(q)}" ${attrs}/>`).join('');
  const mirX = (polys) => polys.map((q) => q.map(([x, y]) => [200 - x, y]));
  function prep(parts) {
    Object.values(parts).forEach((p) => {
      if (!p.mk) p.mk = p.p.map(([x, y]) => [x, y, 12]);
      if (p.s) {
        p.p = p.p.concat(p.p.filter((q) => q[0] !== 100).map(([x, y]) => [200 - x, y]));
        if (Array.isArray(p.mk)) p.mk = p.mk.concat(p.mk.filter((q) => q[0] !== 100).map(([x, y, rx, ry, r]) => [200 - x, y, rx, ry, r ? -r : r]));
      }
    });
    return parts;
  }

  // Silueta comuna: cap, tronc i braços, vista per dins
  const SIL = `<path d="M100 12 C124 12 138 30 138 52 C138 72 126 86 112 90 L112 100 C130 102 150 106 160 118 C168 128 170 146 170 170 L172 250 C172 258 162 260 160 250 L156 172 L150 172 L150 296 C150 326 128 336 100 336 C72 336 50 326 50 296 L50 172 L44 172 L40 250 C38 260 28 258 28 250 L30 170 C30 146 32 128 40 118 C50 106 70 102 88 100 L88 90 C74 86 62 72 62 52 C62 30 76 12 100 12Z" fill="#ffe9db" stroke="#e0a07a" stroke-width="3"/>`;
  const FACE = `<circle cx="88" cy="58" r="3" fill="#6d4c41"/><circle cx="112" cy="58" r="3" fill="#6d4c41"/>
    <path d="M100 62 L97 70 L102 70" stroke="#e0a07a" stroke-width="2" fill="none"/>`;
  const SMILE = '<path d="M92 78 Q100 83 108 78" stroke="#c0392b" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
  const svg = (inner) => `<svg viewBox="0 0 200 340" xmlns="http://www.w3.org/2000/svg">${SIL}${FACE}${inner}<g class="marks"></g></svg>`;

  // ---------- Aparell digestiu ----------
  const DIG_SVG = svg(`
    <path d="M90 76 Q100 86 110 76 Q100 80 90 76Z" fill="#c0392b" stroke="#922b21" stroke-width="2"/>
    <path d="M100 84 L100 100 L102 140 L110 150" stroke="#e57373" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M56 146 Q66 134 104 140 Q118 144 112 152 Q100 172 74 176 Q56 176 56 146Z" fill="#8d3b2f" stroke="#5d2219" stroke-width="2"/>
    <path d="M106 148 C120 134 146 142 142 164 C138 186 112 192 102 180 C96 172 104 166 112 170 C120 174 126 164 120 158 C114 152 108 156 106 148Z" fill="#ef9a9a" stroke="#c62828" stroke-width="2.5"/>
    <path d="M78 270 L66 270 L66 196 L134 196 L134 262 Q132 276 112 276 L104 282 L102 300" stroke="#8d6e63" stroke-width="13" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="M78 270 L66 270 L66 196 L134 196 L134 262 Q132 276 112 276 L104 282 L102 300" stroke="#bcaaa4" stroke-width="9" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="M100 190 C80 196 76 206 92 210 C112 214 124 206 120 220 C116 232 82 224 80 236 C78 248 118 240 120 252 C122 264 92 262 84 260" stroke="#e91e63" stroke-width="10" fill="none" stroke-linecap="round"/>
    <path d="M100 190 C80 196 76 206 92 210 C112 214 124 206 120 220 C116 232 82 224 80 236 C78 248 118 240 120 252 C122 264 92 262 84 260" stroke="#f8bbd0" stroke-width="6" fill="none" stroke-linecap="round"/>
    <circle cx="102" cy="304" r="5" fill="#5d4037"/>`);
  const DIG = prep({
    boca: { a: 'la boca', p: [[100, 79]], mk: [[100, 79, 13, 7]], info: 'A la boca, les dents trituren el menjar i la saliva l\'estova. La llengua el barreja.' },
    esofag: { a: 'l\'esòfag', p: [[100, 96], [101, 112], [102, 128]], mk: [[101, 114, 7, 26]], info: 'L\'esòfag és un tub que porta el menjar de la boca fins a l\'estómac.' },
    fetge: { a: 'el fetge', p: [[70, 156], [86, 152], [64, 164]], mk: [[82, 157, 28, 18]], info: 'El fetge fa un suc, la bilis, que ajuda a digerir els greixos.' },
    estomac: { a: 'l\'estómac', p: [[126, 160], [132, 172], [116, 180]], mk: [[124, 165, 21, 18]], info: 'L\'estómac és com una bossa que barreja el menjar amb els sucs gàstrics i el desfà.' },
    prim: { a: 'l\'intestí prim', p: [[100, 214], [90, 232], [110, 232], [100, 250], [86, 258]], mk: [[100, 228, 25, 36]], info: 'L\'intestí prim és molt llarg i estret. Aquí els nutrients dels aliments passen a la sang.' },
    gros: { a: 'l\'intestí gros', p: [[66, 210], [66, 232], [66, 256], [80, 196], [120, 196], [134, 210], [134, 232], [134, 256], [118, 276]], mk: [[66, 233, 10, 40], [100, 196, 38, 9], [134, 233, 10, 40]], info: 'L\'intestí gros recull les restes que no aprofitem i n\'absorbeix l\'aigua.' },
    anus: { a: 'l\'anus', p: [[102, 304]], mk: [[102, 304, 9]], info: 'Per l\'anus surten les restes que el cos no aprofita: els excrements.' },
  });

  // ---------- Aparell respiratori ----------
  const RESP_SVG = svg(`${SMILE}
    <path d="M92 128 C70 124 54 150 54 186 C54 210 70 216 94 206 Z" fill="#f48fb1" stroke="#c2185b" stroke-width="2.5"/>
    <path d="M108 128 C130 124 146 150 146 186 C146 210 130 216 106 206 Z" fill="#f48fb1" stroke="#c2185b" stroke-width="2.5"/>
    <path d="M70 160 Q78 170 74 186 M130 160 Q122 170 126 186" stroke="#d81b60" stroke-width="2" fill="none"/>
    <path d="M100 84 L100 140" stroke="#64b5f6" stroke-width="10" stroke-linecap="round"/>
    <path d="M95 94 H105 M95 102 H105 M95 110 H105 M95 118 H105 M95 126 H105 M95 134 H105" stroke="#e3f2fd" stroke-width="2"/>
    <path d="M100 140 L86 156 L78 172 M100 140 L114 156 L122 172" stroke="#64b5f6" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M50 226 Q100 196 150 226" stroke="#ad1457" stroke-width="6" fill="none" stroke-linecap="round"/>`);
  const RESP = prep({
    nas: { a: 'el nas', p: [[100, 66], [100, 74]], mk: [[100, 66, 10, 9]], info: 'L\'aire entra pel nas. Els pèls i els mocs del nas el netegen i l\'escalfen.' },
    traquea: { a: 'la tràquea', p: [[100, 92], [100, 108], [100, 124], [100, 136]], mk: [[100, 112, 8, 30]], info: 'La tràquea és un tub que porta l\'aire fins als pulmons.' },
    bronquis: { a: 'els bronquis', s: 1, p: [[88, 154], [80, 168]], mk: [[84, 160, 8, 14, 30]], info: 'Els bronquis són dos tubs que porten l\'aire a cada pulmó.' },
    pulmons: { a: 'els pulmons', s: 1, p: [[66, 150], [62, 180], [72, 200], [86, 190], [80, 136]], mk: [[72, 172, 21, 40]], info: 'Als pulmons, l\'oxigen de l\'aire passa a la sang.' },
    diafragma: { a: 'el diafragma', p: [[58, 222], [78, 213], [100, 211], [122, 213], [142, 222]], mk: [[100, 214, 50, 9]], info: 'El diafragma és un múscul que ajuda els pulmons a omplir-se i buidar-se d\'aire.' },
  });

  // ---------- Aparell circulatori ----------
  const ART = [[[106, 146], [96, 100], [92, 40]], [[100, 150], [60, 132], [40, 140], [34, 245]], [[118, 148], [140, 132], [160, 140], [166, 245]], [[104, 176], [84, 250], [76, 330]], [[110, 178], [110, 250], [108, 330]]];
  const VEN = [[[116, 146], [108, 100], [108, 40]], [[104, 162], [62, 146], [48, 152], [42, 245]], [[116, 164], [138, 146], [152, 152], [158, 245]], [[112, 178], [94, 250], [88, 330]], [[118, 178], [122, 250], [122, 330]]];
  const CIRC_SVG = svg(`${SMILE}
    <g data-part="venes" fill="none" stroke="#1e63d6" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${lines(VEN, '')}</g>
    <g data-part="arteries" fill="none" stroke="#e53935" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${lines(ART, '')}</g>
    <path d="M110 178 C84 160 88 138 101 140 C107 141 110 146 110 150 C110 146 113 141 119 140 C132 138 136 160 110 178Z" fill="#e53935" stroke="#9b1c1c" stroke-width="2.5"/>
    <path d="M100 148 Q104 144 108 148" stroke="#ffcdd2" stroke-width="2" fill="none"/>`);
  const CIRC = prep({
    cor: { a: 'el cor', p: [[110, 156], [102, 150], [118, 150]], mk: [[110, 157, 19, 19]], info: 'El cor és un múscul que bomba la sang per tot el cos. Batega sense parar!' },
    arteries: { a: 'les artèries', p: ART.flatMap((q) => samp(q)), mk: 'el', info: 'Les artèries són vasos sanguinis que porten la sang des del cor cap a tot el cos.' },
    venes: { a: 'les venes', p: VEN.flatMap((q) => samp(q)), mk: 'el', info: 'Les venes són vasos sanguinis que tornen la sang des del cos cap al cor.' },
  });

  // ---------- Aparell excretor (urinari) ----------
  const EXCR_SVG = svg(`${SMILE}
    <path d="M86 232 L96 292 M114 232 L104 292" stroke="#ffb74d" stroke-width="5" stroke-linecap="round"/>
    <path d="M78 204 C64 204 64 240 78 240 C86 240 88 230 84 222 C88 214 86 204 78 204Z" fill="#a1503a" stroke="#6d2f1f" stroke-width="2.5"/>
    <path d="M122 204 C136 204 136 240 122 240 C114 240 112 230 116 222 C112 214 114 204 122 204Z" fill="#a1503a" stroke="#6d2f1f" stroke-width="2.5"/>
    <ellipse cx="100" cy="302" rx="16" ry="12" fill="#ffd54f" stroke="#f9a825" stroke-width="2.5"/>
    <path d="M100 314 L100 334" stroke="#ffb74d" stroke-width="5" stroke-linecap="round"/>`);
  const EXCR = prep({
    ronyons: { a: 'els ronyons', s: 1, p: [[76, 214], [76, 230], [70, 222]], mk: [[76, 222, 15, 21]], info: 'Els ronyons filtren la sang i en treuen les substàncies que no serveixen. Així es fa l\'orina.' },
    ureters: { a: 'els urèters', s: 1, p: samp([[88, 246], [95, 286]], 9), mk: [[92, 264, 6, 26, -10]], info: 'Els urèters són dos tubs que porten l\'orina dels ronyons a la bufeta.' },
    bufeta: { a: 'la bufeta', p: [[100, 300], [90, 302], [110, 302]], mk: [[100, 302, 19, 15]], info: 'La bufeta guarda l\'orina fins que anem al lavabo.' },
    uretra: { a: 'la uretra', p: [[100, 322], [100, 332]], mk: [[100, 324, 7, 12]], info: 'Per la uretra, l\'orina surt fora del cos.' },
  });

  // ---------- Sistema nerviós ----------
  const NERV = [[[100, 110], [60, 122], [40, 150], [34, 245]], [[100, 150], [66, 170]], [[100, 190], [64, 208]], [[100, 270], [80, 334]], [[100, 230], [60, 250]]];
  const NERV_ALL = NERV.concat(mirX(NERV));
  const NERV_SVG = svg(`${SMILE}
    <g data-part="nervis" fill="none" stroke="#f9a825" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${lines(NERV_ALL, '')}</g>
    <path data-part="medulla" d="M100 54 L100 272" stroke="#ffca28" stroke-width="8" stroke-linecap="round" fill="none"/>
    <ellipse cx="100" cy="36" rx="29" ry="21" fill="#f8bbd0" stroke="#c2185b" stroke-width="2.5"/>
    <path d="M100 17 L100 56 M80 28 Q88 34 82 42 M120 28 Q112 34 118 42 M88 22 Q94 30 90 36 M112 22 Q106 30 110 36" stroke="#c2185b" stroke-width="1.8" fill="none"/>`);
  const NERVP = prep({
    cervell: { a: 'el cervell', p: [[100, 34], [84, 38], [116, 38], [100, 22]], mk: [[100, 36, 32, 24]], info: 'El cervell és el centre de comandament: pensa, recorda, aprèn i dona ordres a tot el cos.' },
    medulla: { a: 'la medul·la espinal', p: samp([[100, 66], [100, 272]], 10), mk: 'el', info: 'La medul·la espinal va per dins de la columna vertebral i porta missatges entre el cervell i el cos.' },
    nervis: { a: 'els nervis', p: NERV_ALL.flatMap((q) => samp(q)).filter(([x]) => Math.abs(x - 100) > 7), mk: 'el', info: 'Els nervis són com cables: porten missatges dels sentits al cervell i del cervell als músculs.' },
  });

  Object.assign(C.FIG, {
    dig: { svg: DIG_SVG, parts: DIG, tall: true, max: 28, ask: 'Com es diu l\'òrgan que brilla?' },
    resp: { svg: RESP_SVG, parts: RESP, tall: true, max: 28, ask: 'Com es diu l\'òrgan que brilla?' },
    circ: { svg: CIRC_SVG, parts: CIRC, tall: true, max: 24, ask: 'Com es diu la part que brilla?' },
    excr: { svg: EXCR_SVG, parts: EXCR, tall: true, max: 28, ask: 'Com es diu l\'òrgan que brilla?' },
    nerv: { svg: NERV_SVG, parts: NERVP, tall: true, max: 26, ask: 'Com es diu la part que brilla?' },
  });
  Object.assign(C.SETS, {
    dig: ['boca', 'esofag', 'estomac', 'fetge', 'prim', 'gros', 'anus'],
    resp: ['nas', 'traquea', 'bronquis', 'pulmons', 'diafragma'],
    circ: ['cor', 'arteries', 'venes'],
    excr: ['ronyons', 'ureters', 'bufeta', 'uretra'],
    nerv: ['cervell', 'medulla', 'nervis'],
  });
  Object.assign(C.SPELL, {
    dig: ['boca', 'fetge'], resp: ['pulmons', 'nas'], circ: ['cor', 'venes'], excr: ['ronyons', 'bufeta'], nerv: ['cervell', 'nervis'],
  });

  // ---------- Targetes per explorar (nivells sense figura) ----------
  C.CARDS = {
    funcions: [
      { e: '🍎', n: 'La nutrició', o: 'Menjar, respirar…', info: 'Amb la nutrició aconseguim l\'energia i els materials per créixer. Hi treballen els aparells digestiu, respiratori, circulatori i excretor.' },
      { e: '👀', n: 'La relació', o: 'Notar i respondre', info: 'Amb la relació notem el que passa al nostre voltant i hi responem. Hi treballen els sentits, el sistema nerviós i l\'aparell locomotor.' },
      { e: '👶', n: 'La reproducció', o: 'Tenir fills', info: 'Amb la reproducció les persones podem tenir fills. Hi treballa l\'aparell reproductor.' },
    ],
    repro: [
      { e: '👩', n: 'Aparell femení', o: 'ovaris i úter', info: 'L\'aparell reproductor femení té els ovaris, que fan els òvuls, i l\'úter, on creix el nadó.' },
      { e: '👨', n: 'Aparell masculí', o: 'testicles', info: 'L\'aparell reproductor masculí té els testicles, que fan els espermatozoides.' },
      { e: '✨', n: 'La fecundació', o: 'comença una vida', info: 'Quan un òvul i un espermatozoide s\'uneixen, comença una nova vida. Es diu fecundació.' },
      { e: '🤰', n: 'L\'embaràs', o: 'uns nou mesos', info: 'El nadó creix dins l\'úter de la mare uns nou mesos. S\'alimenta pel cordó umbilical.' },
      { e: '👶', n: 'El naixement', o: 'el part', info: 'Quan el nadó ja està preparat, neix. Aquest moment es diu el part. El melic és la marca del cordó umbilical.' },
      { e: '🧓', n: 'Etapes de la vida', o: 'de nadó a gran', info: 'Les etapes de la vida són la infància, l\'adolescència, l\'edat adulta i la vellesa.' },
    ],
  };
  C.FUNCIONS_SIT = [
    ['🍝', 'Menges un plat de macarrons.', 0], ['🏃', 'Sents el timbre i corres cap a la classe.', 1], ['🌬️', 'Respires aire fresc a la muntanya.', 0],
    ['👶', 'Neix un nadó.', 2], ['⚽', 'Veus la pilota i la xutes.', 1], ['🔥', 'Apartes la mà d\'una cosa que crema.', 1],
    ['🚽', 'Fas pipí.', 0], ['🤰', 'Una mare espera un nadó.', 2], ['🥛', 'Beus un got de llet.', 0],
  ];

  // ---------- Preguntes (la resposta correcta és la primera opció) ----------
  Object.assign(C.Q, {
    funcions: [
      { q: 'Quines són les tres funcions vitals?', o: ['nutrició, relació i reproducció', 'menjar, dormir i jugar', 'veure, sentir i tocar'], fb: 'Les funcions vitals són la nutrició, la relació i la reproducció.' },
      { q: 'Quina funció ens dona energia per créixer i jugar?', o: ['la nutrició', 'la relació', 'la reproducció'] },
      { q: 'Quins aparells treballen en la nutrició?', o: ['digestiu, respiratori, circulatori i excretor', 'només el locomotor', 'només els sentits'] },
      { q: 'Qui fa les funcions vitals?', o: ['tots els éssers vius', 'només les persones', 'les pedres i les cadires'], fb: 'Persones, animals i plantes: tots els éssers vius fan les funcions vitals.' },
    ],
    dig: [
      { q: 'Què fan les dents?', o: ['trituren el menjar', 'bomben la sang', 'netegen l\'aire'] },
      { q: 'Com es diu el líquid de la boca que estova el menjar?', o: ['la saliva', 'la suor', 'l\'orina'] },
      { q: 'On passen els nutrients a la sang?', o: ['a l\'intestí prim', 'a l\'esòfag', 'a la boca'], fb: 'Els nutrients passen a la sang a l\'intestí prim.' },
      { q: 'Per a què serveix l\'aparell digestiu?', o: ['per aprofitar els nutrients dels aliments', 'per moure els braços', 'per veure-hi'] },
      { q: 'Quin tub porta el menjar fins a l\'estómac?', o: ['l\'esòfag', 'la tràquea', 'la uretra'] },
      { q: 'Quin òrgan fa la bilis?', o: ['el fetge', 'l\'estómac', 'el cor'] },
    ],
    digTF: [
      { s: 'L\'intestí prim és més llarg que una persona.', v: true, fb: 'Fa uns sis metres!' },
      { s: 'Hem de mastegar bé el menjar abans d\'empassar-lo.', v: true },
      { s: 'El menjar passa de la boca directament a l\'intestí gros.', v: false, fb: 'Primer passa per l\'esòfag, l\'estómac i l\'intestí prim.' },
    ],
    resp: [
      { q: 'Quin gas de l\'aire necessita el nostre cos?', o: ['l\'oxigen', 'el fum', 'el diòxid de carboni'] },
      { q: 'Quin gas traiem quan expulsem l\'aire?', o: ['el diòxid de carboni', 'l\'oxigen', 'l\'heli'] },
      { q: 'Com es diu quan l\'aire entra als pulmons?', o: ['inspiració', 'expiració', 'digestió'], fb: 'Quan l\'aire entra és la inspiració.' },
      { q: 'Com es diu quan l\'aire surt dels pulmons?', o: ['expiració', 'inspiració', 'circulació'], fb: 'Quan l\'aire surt és l\'expiració.' },
      { q: 'Què és bo per als pulmons?', o: ['fer esport a l\'aire lliure', 'respirar fum', 'estar sempre tancat a casa'] },
    ],
    respTF: [
      { s: 'Quan inspirem, els pulmons s\'omplen d\'aire i el pit s\'infla.', v: true },
      { s: 'És millor respirar pel nas que per la boca.', v: true, fb: 'El nas neteja i escalfa l\'aire.' },
      { s: 'Podem estar moltes hores sense respirar.', v: false, fb: 'Necessitem respirar sempre, també quan dormim.' },
    ],
    circ: [
      { q: 'Què porta la sang a tot el cos?', o: ['oxigen i nutrients', 'aire i menjar sencer', 'ossos petits'] },
      { q: 'Quin òrgan bomba la sang?', o: ['el cor', 'l\'estómac', 'el fetge'] },
      { q: 'Com es diuen els tubs per on passa la sang?', o: ['vasos sanguinis', 'bronquis', 'urèters'], fb: 'Les artèries i les venes són vasos sanguinis.' },
      { q: 'Les artèries porten la sang…', o: ['del cor cap al cos', 'del cos cap al cor'], fb: 'Les artèries surten del cor.' },
      { q: 'Les venes porten la sang…', o: ['del cos cap al cor', 'del cor cap al cos'], fb: 'Les venes tornen la sang al cor.' },
      { q: 'Què notes si et poses dos dits al canell?', o: ['el pols, els batecs del cor', 'la respiració', 'la digestió'] },
    ],
    circTF: [
      { s: 'Quan fem esport, el cor batega més de pressa.', v: true },
      { s: 'La sang només és al cap.', v: false, fb: 'La sang arriba a tot el cos.' },
      { s: 'El cor és més o menys gran com el teu puny.', v: true },
    ],
    excr: [
      { q: 'Què fan els ronyons?', o: ['filtren la sang i fan l\'orina', 'bomben la sang', 'fan la saliva'] },
      { q: 'On es guarda l\'orina?', o: ['a la bufeta', 'a l\'estómac', 'als pulmons'] },
      { q: 'A part de l\'orina, què treiem per la pell?', o: ['la suor', 'la saliva', 'la bilis'], fb: 'Per la pell traiem la suor.' },
      { q: 'Per què és important beure aigua?', o: ['perquè els ronyons treballin bé', 'per tenir més ossos', 'no és gens important'] },
      { q: 'Quin aparell fa l\'orina?', o: ['l\'aparell excretor', 'l\'aparell digestiu', 'l\'aparell respiratori'] },
    ],
    excrTF: [
      { s: 'Quan suem, també traiem substàncies que no serveixen.', v: true },
      { s: 'L\'orina es fa a l\'estómac.', v: false, fb: 'L\'orina es fa als ronyons.' },
      { s: 'Tenim dos ronyons.', v: true },
    ],
    nerv: [
      { q: 'Quin òrgan pensa i dona ordres al cos?', o: ['el cervell', 'el cor', 'l\'estómac'] },
      { q: 'Quin os protegeix el cervell?', o: ['el crani', 'el fèmur', 'les costelles'] },
      { q: 'On és la medul·la espinal?', o: ['dins de la columna vertebral', 'dins de l\'estómac', 'dins del cor'] },
      { q: 'Què porten els nervis?', o: ['missatges', 'sang', 'aire'] },
      { q: 'Quins aparells treballen en la funció de relació?', o: ['sentits, sistema nerviós i aparell locomotor', 'digestiu i excretor', 'només el cor'] },
    ],
    nervTF: [
      { s: 'Quan dormim, el cervell també treballa.', v: true },
      { s: 'Per aprendre bé, el cervell necessita descansar i dormir.', v: true },
      { s: 'Els nervis porten missatges molt a poc a poc, com un cargol.', v: false, fb: 'Els missatges dels nervis són rapidíssims.' },
    ],
    repro: [
      { q: 'Per a què serveix l\'aparell reproductor?', o: ['per tenir fills', 'per respirar', 'per digerir'] },
      { q: 'On creix el nadó durant l\'embaràs?', o: ['a l\'úter de la mare', 'a l\'estómac de la mare', 'als pulmons'], fb: 'El nadó creix a l\'úter, no a l\'estómac.' },
      { q: 'Quant de temps dura l\'embaràs, més o menys?', o: ['nou mesos', 'dues setmanes', 'tres anys'] },
      { q: 'Per on s\'alimenta el nadó abans de néixer?', o: ['pel cordó umbilical', 'per la boca', 'pel nas'] },
      { q: 'Què fan els ovaris?', o: ['els òvuls', 'els espermatozoides', 'la saliva'] },
      { q: 'Què fan els testicles?', o: ['els espermatozoides', 'els òvuls', 'l\'orina'] },
      { q: 'Com es diu quan s\'uneixen un òvul i un espermatozoide?', o: ['la fecundació', 'la digestió', 'la respiració'] },
    ],
    reproTF: [
      { s: 'Totes les persones passem per les mateixes etapes de la vida.', v: true },
      { s: 'El melic és la marca que ens queda del cordó umbilical.', v: true },
      { s: 'Els nadons creixen dins de l\'estómac de la mare.', v: false, fb: 'Creixen dins de l\'úter.' },
    ],
  });

  // Preguntes d'ordenar (els elements, en l'ordre correcte)
  C.ORDRE = {
    dig: { q: 'Ordena el camí que fa el menjar dins del cos.', items: ['la boca', 'l\'esòfag', 'l\'estómac', 'l\'intestí prim', 'l\'intestí gros', 'l\'anus'] },
    resp: { q: 'Ordena el camí que fa l\'aire quan respirem.', items: ['el nas', 'la tràquea', 'els bronquis', 'els pulmons'] },
    excr: { q: 'Ordena el camí que fa l\'orina.', items: ['els ronyons', 'els urèters', 'la bufeta', 'la uretra'] },
    circ: { q: 'Ordena el camí de la sang.', items: ['el cor', 'les artèries', 'tot el cos', 'les venes', 'el cor'] },
    nerv: { q: 'Veus una pilota i la xutes. Ordena què passa.', items: ['els ulls veuen la pilota', 'els nervis porten el missatge al cervell', 'el cervell dona l\'ordre', 'els músculs de la cama xuten'] },
    repro: { q: 'Ordena les etapes de la vida.', items: ['👶 la infància', '🧑 l\'adolescència', '🧔 l\'edat adulta', '👴 la vellesa'] },
  };

  Object.assign(C.FETS, {
    funcions: 'Les plantes també fan les funcions vitals: s\'alimenten, noten el que passa al seu voltant i fan llavors!',
    dig: 'L\'intestí prim d\'un adult fa uns sis metres de llarg!',
    resp: 'Respirem més de vint mil vegades cada dia!',
    circ: 'Si posessis en fila tots els vasos sanguinis del cos, farien més de dues voltes a la Terra!',
    excr: 'Els ronyons filtren tota la sang del cos moltes vegades cada dia!',
    nerv: 'Els missatges dels nervis viatgen més de pressa que un cotxe de curses!',
    repro: 'Un nadó acabat de néixer pesa uns tres quilos!',
  });
})(window.COS);
