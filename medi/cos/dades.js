/* Dades del joc "El Laboratori de l'Ossi": figures (SVG), parts del cos i preguntes.
   Coordenades en unitats del viewBox de cada figura. Les parts amb `s` són simètriques:
   es dibuixen i es poden tocar als dos costats (x → 200 - x). */
window.COS = (function () {
  'use strict';

  const mir = (l) => l.concat(l.filter((p) => p[0] !== 100).map(([x, y, rx, ry, rot]) => [200 - x, y, rx, ry, rot ? -rot : rot]));
  function prep(parts) {
    Object.values(parts).forEach((p) => {
      p.mk = p.mk || p.p.map(([x, y]) => [x, y, 12]);
      if (p.s) { p.p = mir(p.p); p.mk = mir(p.mk); }
    });
    return parts;
  }

  // ---------- Figura: el cos (davant) ----------
  const SK = '#f6c9a0', SKD = '#d9956a';
  const limb = (d, w) => `<path d="${d}" stroke="${SKD}" stroke-width="${w + 5}"/><path d="${d}" stroke="${SK}" stroke-width="${w}"/>`;
  const BODY_SVG = `<svg viewBox="0 0 200 400" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      ${limb('M82 240 L81 308 L80 370', 22)}${limb('M118 240 L119 308 L120 370', 22)}
      ${limb('M63 112 L46 168 L38 226', 16)}${limb('M137 112 L154 168 L162 226', 16)}
      <path d="M75 309 Q81 313 87 309 M113 309 Q119 313 125 309 M42 168 Q47 172 52 167 M158 168 Q153 172 148 167" stroke="${SKD}" stroke-width="2"/>
    </g>
    <g fill="${SK}" stroke="${SKD}" stroke-width="2.5">
      <circle cx="36" cy="242" r="11"/><circle cx="164" cy="242" r="11"/>
      <ellipse cx="73" cy="383" rx="16" ry="8"/><ellipse cx="127" cy="383" rx="16" ry="8"/>
      <rect x="89" y="76" width="22" height="28"/>
    </g>
    <path d="M66 100 Q100 94 134 100 L148 132 L134 136 L134 216 L66 216 L66 136 L52 132 Z" fill="#ff7f50" stroke="#d9603a" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M88 99 Q100 110 112 99" stroke="#d9603a" stroke-width="2.5" fill="none"/>
    <circle cx="100" cy="160" r="13" fill="#ffd23f" stroke="#e0a800" stroke-width="2"/>
    <path d="M66 212 L134 212 L138 262 L104 262 L100 240 L96 262 L62 262 Z" fill="#3b82f6" stroke="#1d4ed8" stroke-width="2.5" stroke-linejoin="round"/>
    <g fill="${SK}" stroke="${SKD}" stroke-width="2.5">
      <circle cx="64" cy="52" r="9"/><circle cx="136" cy="52" r="9"/><circle cx="100" cy="48" r="36"/>
    </g>
    <path d="M63 44 Q60 10 100 11 Q140 10 137 44 Q130 26 112 30 Q100 22 88 30 Q70 26 63 44Z" fill="#7a4a2a"/>
    <circle cx="87" cy="50" r="4" fill="#2b2540"/><circle cx="113" cy="50" r="4" fill="#2b2540"/>
    <circle cx="80" cy="62" r="5" fill="#ff9e9e" opacity=".6"/><circle cx="120" cy="62" r="5" fill="#ff9e9e" opacity=".6"/>
    <path d="M89 66 Q100 76 111 66" stroke="#a0522d" stroke-width="3" fill="none" stroke-linecap="round"/>
    <g class="marks"></g></svg>`;

  const BODY = prep({
    cap: { a: 'el cap', p: [[100, 46], [78, 38], [122, 38], [100, 22], [100, 70]], mk: [[100, 48, 40, 40]],
      info: 'Al cap hi ha la cara i, a dins, el cervell, que controla tot el cos.' },
    coll: { a: 'el coll', p: [[100, 92]], mk: [[100, 92, 15, 11]],
      info: 'El coll uneix el cap amb el tronc i ens permet girar el cap.' },
    tronc: { a: 'el tronc', p: [[100, 120], [100, 150], [100, 185], [80, 140], [120, 140], [80, 190], [120, 190], [100, 210]], mk: [[100, 160, 40, 60]],
      info: 'Al tronc hi ha el pit, la panxa i l\'esquena. A dins hi ha el cor i els pulmons.' },
    sup: { a: 'les extremitats superiors', s: 1, p: [[60, 118], [52, 145], [46, 170], [42, 198], [38, 226], [36, 246]], mk: [[50, 172, 15, 80, 12]],
      info: 'Les extremitats superiors són els braços i les mans. Serveixen per agafar coses.' },
    inf: { a: 'les extremitats inferiors', s: 1, p: [[82, 245], [82, 275], [81, 308], [81, 340], [80, 372], [72, 386]], mk: [[80, 314, 18, 84]],
      info: 'Les extremitats inferiors són les cames i els peus. Serveixen per caminar, córrer i saltar.' },
    espatlla: { a: 'l\'espatlla', s: 1, p: [[64, 110]], info: 'L\'espatlla uneix el braç amb el tronc.' },
    bras: { a: 'el braç', s: 1, p: [[55, 139]], mk: [[55, 139, 10, 24, 17]], info: 'El braç va de l\'espatlla fins al colze. Aquí hi ha el múscul bíceps.' },
    colze: { a: 'el colze', s: 1, p: [[47, 166]], info: 'El colze és al mig del braç i ens deixa doblegar-lo.' },
    avantbras: { a: 'l\'avantbraç', s: 1, p: [[42, 196]], mk: [[42, 196, 10, 22, 8]], info: 'L\'avantbraç va del colze fins al canell.' },
    canell: { a: 'el canell', s: 1, p: [[39, 222]], mk: [[39, 222, 11, 9]], info: 'El canell uneix la mà amb l\'avantbraç. Aquí portem el rellotge.' },
    ma: { a: 'la mà', s: 1, p: [[36, 243], [36, 255]], mk: [[36, 243, 14]], info: 'La mà té cinc dits i serveix per agafar coses.' },
    maluc: { a: 'el maluc', s: 1, p: [[68, 228]], info: 'El maluc uneix la cama amb el tronc.' },
    cuixa: { a: 'la cuixa', s: 1, p: [[82, 262], [82, 284]], mk: [[82, 276, 14, 24]], info: 'La cuixa va del maluc fins al genoll.' },
    genoll: { a: 'el genoll', s: 1, p: [[81, 308]], info: 'El genoll és al mig de la cama i ens deixa doblegar-la.' },
    cama: { a: 'la cama', s: 1, p: [[81, 334], [81, 352]], mk: [[81, 342, 13, 22]], info: 'La cama va del genoll fins al turmell.' },
    turmell: { a: 'el turmell', s: 1, p: [[80, 370]], mk: [[80, 370, 12, 9]], info: 'El turmell uneix el peu amb la cama.' },
    peu: { a: 'el peu', s: 1, p: [[72, 385], [61, 385]], mk: [[72, 384, 19, 11]], info: 'Amb els peus caminem. Cada peu té cinc dits.' },
  });

  // ---------- Figura: la cara ----------
  const FACE_SVG = `<svg viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg">
    <g fill="${SK}" stroke="${SKD}" stroke-width="3">
      <ellipse cx="24" cy="120" rx="13" ry="21"/><ellipse cx="176" cy="120" rx="13" ry="21"/>
      <ellipse cx="100" cy="118" rx="76" ry="90"/>
    </g>
    <path d="M27 108 Q18 120 27 132 M173 108 Q182 120 173 132" stroke="${SKD}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M24 108 Q14 20 100 18 Q186 20 176 108 Q170 70 150 60 Q120 70 100 56 Q80 70 50 60 Q30 70 24 108Z" fill="#7a4a2a"/>
    <path d="M54 88 Q70 78 86 88 M114 88 Q130 78 146 88" stroke="#5a3218" stroke-width="6" fill="none" stroke-linecap="round"/>
    <g stroke="#2b2540" stroke-width="2"><ellipse cx="70" cy="108" rx="13" ry="11" fill="#fff"/><ellipse cx="130" cy="108" rx="13" ry="11" fill="#fff"/></g>
    <circle cx="70" cy="109" r="6.5" fill="#3d6bd1"/><circle cx="130" cy="109" r="6.5" fill="#3d6bd1"/>
    <circle cx="70" cy="109" r="3" fill="#111"/><circle cx="130" cy="109" r="3" fill="#111"/>
    <circle cx="72" cy="106" r="1.8" fill="#fff"/><circle cx="132" cy="106" r="1.8" fill="#fff"/>
    <path d="M100 116 Q92 136 94 140 Q100 144 106 140" stroke="${SKD}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <circle cx="50" cy="148" r="13" fill="#ff9e9e" opacity=".55"/><circle cx="150" cy="148" r="13" fill="#ff9e9e" opacity=".55"/>
    <path d="M76 160 Q100 192 124 160 Z" fill="#a33a3a" stroke="#7a2020" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M80 161 L120 161 L118 167 L82 167Z" fill="#fff"/>
    <ellipse cx="100" cy="176" rx="12" ry="6" fill="#ff7b8a"/>
    <path d="M88 200 Q100 206 112 200" stroke="${SKD}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <g class="marks"></g></svg>`;

  const FACE = prep({
    cabells: { a: 'els cabells', s: 1, p: [[100, 32], [50, 62]], mk: [[100, 34, 46, 16], [44, 72, 12, 22]],
      info: 'Els cabells protegeixen el cap del sol i del fred.' },
    front: { a: 'el front', p: [[100, 72]], mk: [[100, 72, 28, 11]], info: 'El front és la part de dalt de la cara, sobre les celles.' },
    celles: { a: 'les celles', s: 1, p: [[70, 86]], mk: [[70, 86, 20, 9]], info: 'Les celles eviten que la suor ens entri als ulls.' },
    ulls: { a: 'els ulls', s: 1, p: [[70, 108]], mk: [[70, 108, 18, 15]], info: 'Amb els ulls hi veiem. És el sentit de la vista.' },
    nas: { a: 'el nas', p: [[100, 132]], mk: [[100, 130, 13, 17]], info: 'Amb el nas respirem i notem les olors.' },
    galtes: { a: 'les galtes', s: 1, p: [[50, 148]], mk: [[50, 148, 16]], info: 'Les galtes es posen vermelles quan tenim calor.' },
    boca: { a: 'la boca', p: [[100, 170]], mk: [[100, 172, 28, 17]], info: 'Amb la boca mengem, parlem i somriem.' },
    llengua: { a: 'la llengua', p: [[100, 172]], mk: [[100, 175, 16, 10]], info: 'Amb la llengua notem el gust del menjar.' },
    orelles: { a: 'les orelles', s: 1, p: [[24, 120]], mk: [[24, 120, 17, 25]], info: 'Amb les orelles hi sentim. És el sentit de l\'oïda.' },
    barbeta: { a: 'la barbeta', p: [[100, 199]], mk: [[100, 199, 22, 10]], info: 'La barbeta és la part de baix de la cara.' },
  });

  // ---------- Figura: l'esquelet ----------
  const BN = '#fdf8ec', BND = '#9c8a6b';
  const bone = (d, w) => `<path d="${d}" stroke="${BND}" stroke-width="${w + 3}"/><path d="${d}" stroke="${BN}" stroke-width="${w}"/>`;
  const side = (f) => f(1) + f(-1);           // dibuixa als dos costats
  const X = (x, k) => (k > 0 ? x : 200 - x);
  let vert = '';
  for (let y = 88; y <= 226; y += 9) vert += `<rect x="95" y="${y}" width="10" height="7" rx="2"/>`;
  let ribs = '';
  for (let i = 0; i < 6; i++) {
    const y = 112 + i * 10, w = 30 - i * 1.5;
    ribs += side((k) => bone(`M${X(98, k)} ${y} C${X(98 - w * 0.7, k)} ${y - 6} ${X(98 - w * 1.15, k)} ${y + 6} ${X(98 - w * 0.95, k)} ${y + 16}`, 4));
  }
  const SKEL_SVG = `<svg viewBox="0 0 200 400" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="196" height="396" rx="18" fill="#dfe9f3"/>
    <g fill="${BN}" stroke="${BND}" stroke-width="2">${vert}</g>
    <path d="M100 220 C86 214 70 218 68 232 C68 246 82 252 92 246 L100 240 L108 246 C118 252 132 246 132 232 C130 218 114 214 100 220Z" fill="${BN}" stroke="${BND}" stroke-width="2.5"/>
    <ellipse cx="85" cy="235" rx="5" ry="6" fill="#dfe9f3" stroke="${BND}"/><ellipse cx="115" cy="235" rx="5" ry="6" fill="#dfe9f3" stroke="${BND}"/>
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      ${side((k) => bone(`M${X(84, k)} 248 L${X(82, k)} 302`, 8))}
      ${side((k) => bone(`M${X(81, k)} 318 L${X(80, k)} 368`, 7) + bone(`M${X(88, k)} 321 L${X(87, k)} 366`, 3))}
      ${side((k) => bone(`M${X(80, k)} 375 L${X(68, k)} 385`, 6) + bone(`M${X(76, k)} 378 L${X(62, k)} 382`, 3))}
      ${side((k) => bone(`M${X(62, k)} 106 L${X(48, k)} 164`, 7))}
      ${side((k) => bone(`M${X(47, k)} 171 L${X(39, k)} 222`, 4) + bone(`M${X(51, k)} 172 L${X(44, k)} 223`, 4))}
      ${side((k) => bone(`M${X(37, k)} 236 L${X(32, k)} 250`, 2.5) + bone(`M${X(40, k)} 237 L${X(39, k)} 252`, 2.5) + bone(`M${X(43, k)} 236 L${X(45, k)} 249`, 2.5))}
      ${ribs}
      ${bone('M100 106 L100 152', 6)}
      ${side((k) => bone(`M${X(97, k)} 100 Q${X(80, k)} 95 ${X(64, k)} 104`, 5))}
    </g>
    <g fill="${BN}" stroke="${BND}" stroke-width="2">
      ${side((k) => `<circle cx="${X(62, k)}" cy="106" r="5"/><circle cx="${X(48, k)}" cy="166" r="5"/><circle cx="${X(41, k)}" cy="231" r="6"/>`)}
      ${side((k) => `<circle cx="${X(84, k)}" cy="249" r="6"/><circle cx="${X(82, k)}" cy="303" r="6"/><circle cx="${X(81, k)}" cy="311" r="5.5"/><circle cx="${X(80, k)}" cy="371" r="5"/>`)}
      <ellipse cx="100" cy="44" rx="30" ry="32"/>
      <path d="M78 62 Q82 86 100 87 Q118 86 122 62 Q110 73 100 73 Q90 73 78 62Z"/>
    </g>
    <ellipse cx="89" cy="44" rx="8" ry="9" fill="#3a3550"/><ellipse cx="111" cy="44" rx="8" ry="9" fill="#3a3550"/>
    <path d="M100 52 L96 60 L104 60Z" fill="#3a3550"/>
    <path d="M88 67 L112 67 M92 64 L92 71 M97 65 L97 72 M103 65 L103 72 M108 64 L108 71" stroke="${BND}" stroke-width="1.5"/>
    <g class="marks"></g></svg>`;

  const SKEL = prep({
    crani: { a: 'el crani', p: [[100, 34], [84, 40], [116, 40], [100, 18], [100, 52]], mk: [[100, 44, 33, 35]],
      info: 'El crani és com un casc: protegeix el cervell.' },
    mandibula: { a: 'la mandíbula', p: [[100, 81], [86, 75]], mk: [[100, 77, 25, 12]], s: 1,
      info: 'La mandíbula és l\'únic os del cap que es mou. La fem servir per mastegar i parlar.' },
    clavicula: { a: 'la clavícula', s: 1, p: [[80, 99]], mk: [[81, 100, 19, 8]], info: 'La clavícula uneix l\'espatlla amb el pit.' },
    costelles: { a: 'les costelles', s: 1, p: [[76, 122], [74, 140], [78, 158]], mk: [[100, 138, 38, 31]],
      info: 'Les costelles fan una gàbia que protegeix el cor i els pulmons.' },
    columna: { a: 'la columna vertebral', p: [[100, 96], [100, 125], [100, 145], [100, 170], [100, 190], [100, 210]], mk: [[100, 158, 9, 72]],
      info: 'La columna vertebral ens manté drets. Està feta de moltes peces petites que es diuen vèrtebres.' },
    humer: { a: 'l\'húmer', s: 1, p: [[55, 135], [60, 115], [50, 155]], mk: [[55, 135, 9, 32, 13]], info: 'L\'húmer és l\'os del braç.' },
    pelvis: { a: 'la pelvis', p: [[100, 232], [80, 232], [120, 232], [100, 246]], mk: [[100, 233, 35, 20]],
      info: 'La pelvis és l\'os del maluc. Aguanta el pes del tronc.' },
    femur: { a: 'el fèmur', s: 1, p: [[83, 262], [83, 285], [82, 300]], mk: [[83, 276, 10, 32]], info: 'El fèmur és l\'os de la cuixa. És l\'os més llarg del cos!' },
    rotula: { a: 'la ròtula', s: 1, p: [[81, 311]], mk: [[81, 311, 9]], info: 'La ròtula és un os petit i rodó que protegeix el genoll.' },
    tibia: { a: 'la tíbia', s: 1, p: [[81, 332], [81, 350], [80, 364]], mk: [[81, 343, 10, 28]], info: 'La tíbia és l\'os de la cama.' },
  });

  const FIG = {
    body: { svg: BODY_SVG, parts: BODY, tall: true, max: 32, ask: 'Com es diu la part del cos que brilla?' },
    face: { svg: FACE_SVG, parts: FACE, tall: false, max: 40, ask: 'Com es diu la part de la cara que brilla?' },
    skel: { svg: SKEL_SVG, parts: SKEL, tall: true, max: 30, ask: 'Com es diu l\'os que brilla?' },
  };

  // ---------- Grups de parts per nivell ----------
  const SETS = {
    cos: ['cap', 'coll', 'tronc', 'sup', 'inf'],
    cara: ['cabells', 'front', 'celles', 'ulls', 'nas', 'galtes', 'boca', 'orelles', 'barbeta'],
    extr: ['espatlla', 'bras', 'colze', 'avantbras', 'canell', 'ma', 'maluc', 'cuixa', 'genoll', 'cama', 'turmell', 'peu'],
    art: ['coll', 'espatlla', 'colze', 'canell', 'maluc', 'genoll', 'turmell'],
    ossos: ['crani', 'mandibula', 'clavicula', 'costelles', 'columna', 'humer', 'pelvis', 'femur', 'rotula', 'tibia'],
    sentits: ['ulls', 'orelles', 'nas', 'llengua', 'cabells', 'front', 'galtes'],
  };
  // Paraules per lletrejar (sense accents, màxim 7 lletres)
  const SPELL = {
    cos: ['cap', 'coll', 'tronc'],
    cara: ['ulls', 'nas', 'boca', 'front', 'galtes', 'celles', 'orelles', 'barbeta'],
    extr: ['colze', 'genoll', 'canell', 'cuixa', 'peu', 'turmell', 'cama'],
    ossos: ['crani', 'pelvis'],
  };

  // Què fa cada articulació (nivell de les articulacions)
  const ART_INFO = {
    coll: 'El coll és una articulació: ens deixa girar el cap i dir que sí i que no.',
    espatlla: 'L\'espatlla ens deixa moure el braç en totes direccions, com un molí.',
    colze: 'El colze ens deixa doblegar el braç, per exemple per menjar.',
    canell: 'El canell ens deixa moure la mà per saludar.',
    maluc: 'El maluc ens deixa moure la cama endavant i enrere, i asseure\'ns.',
    genoll: 'El genoll ens deixa doblegar la cama per xutar o pujar escales.',
    turmell: 'El turmell ens deixa moure el peu i posar-nos de puntetes.',
  };

  // ---------- Preguntes (la resposta correcta sempre és la primera opció) ----------
  const Q = {
    cos: [
      { q: 'Els braços i les mans són les extremitats…', o: ['superiors', 'inferiors'], fb: 'Els braços i les mans són les extremitats superiors.' },
      { q: 'Les cames i els peus són les extremitats…', o: ['inferiors', 'superiors'], fb: 'Les cames i els peus són les extremitats inferiors.' },
      { q: 'En quines tres parts es divideix el cos humà?', o: ['cap, tronc i extremitats', 'ulls, nas i boca', 'mans, peus i dits'], fb: 'El cos té tres parts: cap, tronc i extremitats.' },
      { q: 'Quina part del cos uneix el cap amb el tronc?', o: ['el coll', 'el genoll', 'la mà'], fb: 'El coll uneix el cap amb el tronc.' },
      { q: 'On són el cor i els pulmons?', o: ['al tronc', 'al cap', 'a les cames'], fb: 'El cor i els pulmons són a dins del tronc.' },
    ],
    cara: [
      { q: 'Amb quina part de la cara hi veiem?', o: ['els ulls', 'les orelles', 'el nas'] },
      { q: 'Quina part de la cara hi ha just sobre els ulls?', o: ['les celles', 'les galtes', 'la barbeta'] },
      { q: 'Amb què parlem i mengem?', o: ['amb la boca', 'amb el front', 'amb les celles'] },
    ],
    extr: [
      { q: 'El colze és a les extremitats…', o: ['superiors', 'inferiors'], fb: 'El colze és al braç: extremitats superiors.' },
      { q: 'El genoll és a les extremitats…', o: ['inferiors', 'superiors'], fb: 'El genoll és a la cama: extremitats inferiors.' },
      { q: 'Quina part uneix la mà amb l\'avantbraç?', o: ['el canell', 'el turmell', 'el colze'] },
      { q: 'Quina part uneix el peu amb la cama?', o: ['el turmell', 'el canell', 'el genoll'] },
      { q: 'On portem el rellotge?', o: ['al canell', 'al turmell', 'al colze'] },
      { q: 'Quina part va del maluc fins al genoll?', o: ['la cuixa', 'la cama', 'el braç'] },
    ],
    artTap: [
      { q: 'Quina articulació doblegues per xutar una pilota? Toca-la!', ok: ['genoll'] },
      { q: 'Saludes movent la mà. Quina articulació fas servir? Toca-la!', ok: ['canell'] },
      { q: 'Dius que no amb el cap. Quina articulació mous? Toca-la!', ok: ['coll'] },
      { q: 'Doblegues el braç per menjar-te un entrepà. Toca l\'articulació!', ok: ['colze'] },
      { q: 'Fas voltes amb el braç com un molí. Toca l\'articulació!', ok: ['espatlla'] },
      { q: 'T\'aixeques de puntetes. Toca l\'articulació que uneix el peu i la cama!', ok: ['turmell'] },
      { q: 'Quina articulació uneix la cama amb el tronc? Toca-la!', ok: ['maluc'] },
      { q: 'Toca qualsevol articulació del braç!', ok: ['espatlla', 'colze', 'canell'] },
      { q: 'Toca qualsevol articulació de la cama!', ok: ['maluc', 'genoll', 'turmell'] },
    ],
    art: [
      { q: 'Què és una articulació?', o: ['la unió entre dos ossos', 'un os molt llarg', 'un múscul de la cama'], fb: 'Una articulació és la unió entre dos ossos.' },
      { q: 'Quina d\'aquestes parts NO és una articulació?', o: ['la cuixa', 'el colze', 'el genoll'], fb: 'La cuixa no és una articulació. El colze i el genoll, sí.' },
      { q: 'Quina d\'aquestes parts SÍ que és una articulació?', o: ['el turmell', 'la cuixa', 'l\'avantbraç'], fb: 'El turmell és una articulació.' },
      { q: 'Per a què serveixen les articulacions?', o: ['per doblegar i moure el cos', 'per veure-hi', 'per respirar'], fb: 'Les articulacions ens permeten doblegar i moure el cos.' },
    ],
    ossosTap: [
      { q: 'Toca l\'os que protegeix el cervell com si fos un casc.', ok: ['crani'] },
      { q: 'Toca els ossos que protegeixen el cor i els pulmons.', ok: ['costelles'] },
      { q: 'Toca l\'os més llarg de tot el cos.', ok: ['femur'] },
      { q: 'Toca l\'os que ens manté drets i que està fet de vèrtebres.', ok: ['columna'] },
      { q: 'Toca l\'únic os del cap que es mou quan mastegues.', ok: ['mandibula'] },
      { q: 'Toca l\'os petit i rodó que protegeix el genoll.', ok: ['rotula'] },
    ],
    ossos: [
      { q: 'Com es diu el conjunt de tots els ossos del cos?', o: ['l\'esquelet', 'la musculatura', 'la pell'], fb: 'Tots els ossos junts formen l\'esquelet.' },
      { q: 'Com són els ossos?', o: ['durs i resistents', 'tous com una esponja', 'líquids com l\'aigua'], fb: 'Els ossos són durs i resistents.' },
      { q: 'Les peces petites de la columna vertebral es diuen…', o: ['vèrtebres', 'costelles', 'dents'], fb: 'La columna està feta de vèrtebres.' },
      { q: 'Quin os hi ha a dins de la cuixa?', o: ['el fèmur', 'el crani', 'l\'húmer'], fb: 'A la cuixa hi ha el fèmur.' },
      { q: 'Quin os hi ha a dins del braç?', o: ['l\'húmer', 'la tíbia', 'la pelvis'], fb: 'Al braç hi ha l\'húmer.' },
    ],
    muscTF: [
      { s: 'Els músculs ens permeten moure el cos.', v: true },
      { s: 'Els músculs estiren els ossos per fer-los moure.', v: true },
      { s: 'El cor és un múscul que treballa sense parar.', v: true },
      { s: 'Quan correm no fem servir cap múscul.', v: false, fb: 'Quan correm fem servir molts músculs, sobretot els de les cames.' },
      { s: 'Els ossos es poden moure sols, sense músculs.', v: false, fb: 'Els ossos necessiten els músculs per moure\'s.' },
      { s: 'Fer esport fa que els músculs es tornin més forts.', v: true },
      { s: 'Tenim només deu ossos a tot el cos.', v: false, fb: 'Una persona adulta té més de 200 ossos!' },
      { s: 'Per somriure també fem servir músculs, els de la cara.', v: true },
      { s: 'Quan dormim, el cor s\'atura.', v: false, fb: 'El cor no para mai, tampoc quan dormim.' },
      { s: 'Per tenir ossos i músculs forts ens convé menjar bé i fer exercici.', v: true },
    ],
    musc: [
      { q: 'Què formen junts els ossos, els músculs i les articulacions?', o: ['l\'aparell locomotor', 'l\'aparell digestiu', 'els cinc sentits'], fb: 'Junts formen l\'aparell locomotor, que ens permet moure\'ns.' },
      { q: 'Quin múscul es fa gros quan doblegues el braç amb força?', o: ['el bíceps', 'el fèmur', 'el crani'], fb: 'És el bíceps. El fèmur i el crani són ossos!' },
      { q: 'Quin múscul bombeja la sang per tot el cos?', o: ['el cor', 'el bíceps', 'la ròtula'], fb: 'El cor és un múscul que bombeja la sang.' },
      { q: 'Què és millor per tenir els músculs forts?', o: ['fer esport i menjar bé', 'mirar la tele tot el dia', 'menjar només llaminadures'] },
      { q: 'Com es diuen les parts toves del cos que ens fan moure?', o: ['els músculs', 'els ossos', 'els cabells'] },
    ],
    sentitsQ: [
      { q: 'Amb quin òrgan notem el tacte?', o: ['la pell', 'les orelles', 'el nas'], fb: 'Amb la pell notem si una cosa és freda, calenta, suau o aspra.' },
      { q: 'Quants sentits tenim?', o: ['cinc', 'tres', 'deu'], fb: 'Tenim cinc sentits: vista, oïda, olfacte, gust i tacte.' },
      { q: 'Quin gust té la llimona?', o: ['àcid', 'dolç', 'salat'], e: '🍋' },
      { q: 'Quin gust té el sucre?', o: ['dolç', 'amarg', 'salat'], e: '🍬' },
      { q: 'Quin gust tenen les patates fregides?', o: ['salat', 'dolç', 'àcid'], e: '🍟' },
    ],
  };

  const SENTITS = {
    vista: { e: '👁️', n: 'la vista', o: 'els ulls', part: 'ulls', info: 'Amb els ulls veiem els colors, les formes i les coses que es mouen.' },
    oida: { e: '👂', n: 'l\'oïda', o: 'les orelles', part: 'orelles', info: 'Amb les orelles sentim els sons: la música, les veus i els sorolls.' },
    olfacte: { e: '👃', n: 'l\'olfacte', o: 'el nas', part: 'nas', info: 'Amb el nas notem les olors, les bones i les dolentes.' },
    gust: { e: '👅', n: 'el gust', o: 'la llengua', part: 'llengua', info: 'Amb la llengua notem si el menjar és dolç, salat, àcid o amarg.' },
    tacte: { e: '✋', n: 'el tacte', o: 'la pell', part: null, info: 'Amb la pell notem si una cosa és freda o calenta, suau o aspra.' },
  };
  const SITUACIONS = [
    ['🌹', 'Ensumes una rosa.', 'olfacte'], ['🎵', 'Escoltes una cançó.', 'oida'], ['🍋', 'Tastes una llimona.', 'gust'],
    ['🧊', 'Toques un glaçó i està molt fred.', 'tacte'], ['🌈', 'Mires l\'arc de Sant Martí.', 'vista'],
    ['🐱', 'Acaricies un gat molt suau.', 'tacte'], ['🥖', 'Notes l\'olor del pa acabat de fer.', 'olfacte'],
    ['📖', 'Llegeixes un conte.', 'vista'], ['🔔', 'Sents el timbre de l\'escola.', 'oida'],
    ['🍦', 'Menges un gelat de maduixa.', 'gust'], ['🐶', 'Sents un gos que borda.', 'oida'],
  ];

  const FETS = {
    cos: 'Quan neixes, el cap fa una quarta part de tot el cos!',
    cara: 'Parpellegem unes quinze vegades cada minut sense adonar-nos-en!',
    extr: 'Cada mà té 27 ossos!',
    art: 'El genoll és l\'articulació més gran del cos!',
    ossos: 'Un adult té 206 ossos, però un nadó en té gairebé 300!',
    musc: 'Per somriure fem servir més de deu músculs de la cara!',
    sentits: 'El nas pot distingir milers d\'olors diferents!',
    final: 'El cor batega unes cent mil vegades cada dia!',
  };

  return { FIG, SETS, SPELL, ART_INFO, Q, SENTITS, SITUACIONS, FETS };
})();
