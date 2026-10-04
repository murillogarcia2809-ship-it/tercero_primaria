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

  const api = { numCat, formesAcceptades, comprovaText, DICCIONARI };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.NombresCa = api;
})(this);
