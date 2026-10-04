/* Números en lletres en català (0 – 99.999), seguint la normativa de l'IEC:
   - desenes i unitats amb guionet: quaranta-cinc
   - de 21 a 29 amb -i-: vint-i-tres
   - centenes amb guionet: dos-cents, tres-cents
   - "u" quan el número va sol (vint-i-u, cent u), "un" davant de "mil" (vint-i-un mil) */
(function (root) {
  'use strict';
  const UNI = ['zero', 'u', 'dos', 'tres', 'quatre', 'cinc', 'sis', 'set', 'vuit', 'nou', 'deu',
    'onze', 'dotze', 'tretze', 'catorze', 'quinze', 'setze', 'disset', 'divuit', 'dinou'];
  const DES = ['', '', 'vint', 'trenta', 'quaranta', 'cinquanta', 'seixanta', 'setanta', 'vuitanta', 'noranta'];

  function fins100(n, davant) {
    if (n < 20) return n === 1 && davant ? 'un' : UNI[n];
    const d = Math.floor(n / 10), u = n % 10;
    if (u === 0) return DES[d];
    const uw = u === 1 && davant ? 'un' : UNI[u];
    return d === 2 ? 'vint-i-' + uw : DES[d] + '-' + uw;
  }
  function fins1000(n, davant) {
    const c = Math.floor(n / 100), r = n % 100, p = [];
    if (c === 1) p.push('cent');
    else if (c > 1) p.push(UNI[c] + '-cents');
    if (r) p.push(fins100(r, davant));
    return p.join(' ');
  }
  function numCat(n) {
    if (n === 0) return 'zero';
    const m = Math.floor(n / 1000), r = n % 1000, p = [];
    if (m === 1) p.push('mil');
    else if (m > 1) p.push(fins1000(m, true) + ' mil');
    if (r) p.push(fins1000(r, false));
    return p.join(' ');
  }
  // Formes acceptades (u / un al final)
  function formesAcceptades(n) {
    const a = numCat(n);
    return Array.from(new Set([a, a.replace(/(^|[\s-])u$/, '$1un')]));
  }
  const normalitza = (s) => String(s).toLowerCase().replace(/[’']/g, '').replace(/\s*-\s*/g, '-').replace(/\s+/g, ' ').trim();
  const senseGuions = (s) => normalitza(s).replace(/-/g, ' ').replace(/\s+/g, ' ');

  /* Compara un text escrit amb el número.
     Retorna 'ok', 'guions' (correcte excepte els guionets) o 'no'. */
  function comprovaText(text, n) {
    const t = normalitza(text);
    const formes = formesAcceptades(n);
    if (formes.includes(t)) return 'ok';
    if (formes.some((f) => senseGuions(f) === senseGuions(t))) return 'guions';
    return 'no';
  }

  const DICCIONARI = [
    [1, 'u'], [2, 'dos'], [3, 'tres'], [4, 'quatre'], [5, 'cinc'], [6, 'sis'], [7, 'set'], [8, 'vuit'], [9, 'nou'],
    [10, 'deu'], [11, 'onze'], [12, 'dotze'], [13, 'tretze'], [14, 'catorze'], [15, 'quinze'], [16, 'setze'],
    [17, 'disset'], [18, 'divuit'], [19, 'dinou'], [20, 'vint'], [21, 'vint-i-u'], [22, 'vint-i-dos'],
    [30, 'trenta'], [31, 'trenta-u'], [40, 'quaranta'], [50, 'cinquanta'], [60, 'seixanta'], [70, 'setanta'],
    [80, 'vuitanta'], [90, 'noranta'], [100, 'cent'], [200, 'dos-cents'], [300, 'tres-cents'], [400, 'quatre-cents'],
    [500, 'cinc-cents'], [600, 'sis-cents'], [700, 'set-cents'], [800, 'vuit-cents'], [900, 'nou-cents'],
    [1000, 'mil'], [2000, 'dos mil'], [10000, 'deu mil'], [21000, 'vint-i-un mil'],
  ];

  /* ---------- Trossos: com es parteix un número per escriure'l ----------
     23.456 → [milers: "vint-i-tres mil"] [centenes: "quatre-cents"] [resta: "cinquanta-sis"]
     Els trossos que valen 0 no es diuen. */
  const nomMil = (m) => (m === 1 ? 'mil' : fins1000(m, true) + ' mil');
  const nomCent = (c) => (c === 1 ? 'cent' : UNI[c] + '-cents');
  function trossos(n) {
    const m = Math.floor(n / 1000), c = Math.floor((n % 1000) / 100), r = n % 100, t = [];
    if (m) t.push({ k: 'm', v: m, text: nomMil(m) });
    if (c) t.push({ k: 'c', v: c, text: nomCent(c) });
    if (r) t.push({ k: 'r', v: r, text: fins100(r, false) });
    return t;
  }
  // Gira les dues xifres d'un número (47 → 74) si té sentit
  const gira = (x) => (x >= 12 && x <= 98 && x % 10 && Math.floor(x / 10) !== x % 10 ? (x % 10) * 10 + Math.floor(x / 10) : null);

  // Errors típics per a un tros (per fer opcions incorrectes que ensenyin alguna cosa)
  function errades(p) {
    const out = new Set();
    if (p.k === 'm') {
      const m = p.v;
      if (m === 1) { out.add('un mil'); out.add('u mil'); }
      else {
        if (p.text.includes('-')) out.add(p.text.replace(/-i-|-/g, ' '));
        if (m < 10) out.add(UNI[m] + '-mil');
        if (m > 20 && m % 10 === 1) out.add(p.text.replace(/un mil$/, 'u mil'));
        const g = gira(m); if (g) out.add(nomMil(g));
        out.add(nomMil(m + 1 < 100 ? m + 1 : m - 1));
      }
    } else if (p.k === 'c') {
      const c = p.v;
      if (c === 1) { out.add('un cent'); out.add('u-cents'); }
      else { out.add(UNI[c] + '-cent'); out.add(UNI[c] + ' cents'); out.add(DES[c]); out.add(UNI[c] + '-centes'); }
    } else {
      const r = p.v, d = Math.floor(r / 10), u = r % 10;
      if (p.text.includes('-')) out.add(p.text.replace(/-i-|-/g, ' '));
      if (d === 2 && u) out.add('vint-' + UNI[u]);
      if (d > 2 && u) out.add(DES[d] + '-i-' + UNI[u]);
      if (d === 1 && u) out.add('deu-' + UNI[u]);
      const g = gira(r); if (g) out.add(fins100(g, false));
      if (r > 1) out.add(fins100(r - 1, false));
      if (r < 99) out.add(fins100(r + 1, false));
    }
    out.delete(p.text);
    return Array.from(out);
  }
  // Textos incorrectes però creïbles per a un número sencer
  function erradesText(n) {
    const parts = trossos(n), bones = formesAcceptades(n), out = new Set();
    for (let k = 0; k < 40 && out.size < 6; k++) {
      const i = Math.floor(Math.random() * parts.length);
      const e = errades(parts[i]);
      if (!e.length) continue;
      const alt = parts.map((p, j) => (j === i ? e[Math.floor(Math.random() * e.length)] : p.text)).join(' ');
      if (!bones.includes(alt)) out.add(alt);
    }
    return Array.from(out);
  }

  const api = { numCat, formesAcceptades, comprovaText, DICCIONARI, UNI, DES, fins100, trossos, errades, erradesText };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.NombresCa = api;
})(this);
