# Els jocs de l'Eloi · 3r de Primària

Jocs educatius en català per a nens i nenes de 3r (curs 2026-27). En obrir-los per primer cop es demana el nom del jugador i si és nen o nena: el portal, les històries, la veu i els diplomes surten amb el seu nom. Són HTML, CSS i JavaScript estàtics: no necessiten servidor ni base de dades, i funcionen directament a GitHub Pages.

## Jocs

| Matèria | Joc | Carpeta |
|---|---|---|
| Matemàtiques | 🚀 Missió Galàxia Numèrica: descomposició DM/UM/C/D/U i números en lletres (pas a pas: fins al 99, fins al 999 i amb milers) | `mates/galaxia/` |
| Matemàtiques | 🥚 L'Incubadora del Doctor Per: taules de multiplicar del 2 al 10 (cada taula fa néixer un monstre) | `mates/taules/` |
| Matemàtiques | 🐸 Els Salts de la Granota Rita: sèries sumant i restant (+1… +100, −1… −100, descobrir la regla, dos forats) | `mates/series/` |
| Matemàtiques | 🕵️ El Detectiu Lupa i els Números Perduts: nombres cardinals (llegir, veïns, comparar, ordenar, recta numèrica, parells i senars, fins al 9.999, endevinalles) i ordinals | `mates/cardinals/` |
| Medi Natural | 🦴 El Laboratori de l'Ossi: el cos humà (temari de 3r) — repàs de les parts del cos, funcions vitals, aparells digestiu, respiratori, circulatori i excretor, sentits, sistema nerviós, aparell locomotor i reproductor | `medi/cos/` |
| Anglès | 🦜 L'Illa de les Paraules: vocabulari per temes | `angles/vocabulari/` |
| Anglès | 🍪 El Monstre Comptador: comptar de l'1 al 20 | `angles/comptar/` |

## Estructura

```
index.html          Portal amb tots els jocs
comu/comu.css       Estils compartits
comu/comu.js        Sons, veu, diàlegs, teclat, motor de preguntes, perfil del jugador (objecte global Eloi)
comu/premi.js       Premis: acudits, curiositats, jocs de regal (globus, talps, parelles) i diploma
comu/missio.js      Motor de jocs per nivells: mapa, nivells, col·lecció, repte final i premi
comu/missio.css     Estils del motor de nivells
mates/galaxia/      Joc de mates (nombres-ca.js = números en lletres en català)
medi/cos/           Joc del cos humà (dades.js = cos, cara i esquelet; aparells.js = aparells i preguntes)
angles/vocabulari/  Joc de vocabulari (paraules.js = llista de paraules editable)
angles/comptar/     Joc de comptar
```

## Norma per a tots els jocs

Tots els jocs acaben amb un **joc de regal** (només per divertir-se) i un **diploma** imprimible (`Eloi.premi.final`). Durant el joc hi ha recompenses: acudits i curiositats en acabar cada nivell, col·leccionables, ratxes d'encerts.

## Personalitzar

- **Nom del jugador:** es demana el primer cop; al portal hi ha el botó «Canvia el nom». Als textos es pot fer servir `{nom}`, `{el}` (l'Eloi / en Pau / la Martina), `{de}` (de l'Eloi / d'en Pau / de la Martina) i `{nen|nena}` per a les formes de nen o de nena.

- **Afegir vocabulari:** edita `angles/vocabulari/paraules.js`. Cada illa és un tema i cada paraula té la forma `{ en: 'dog', ca: 'gos', e: '🐶' }`.
- **El progrés** (estrelles, cofres...) es desa al navegador (`localStorage`). Si canvies de dispositiu, es comença de zero.
- **La veu** fa servir la síntesi de veu del navegador. A Microsoft Edge i a Android hi ha veus en català. Si el dispositiu no en té, s'utilitza una veu en castellà.

## Publicar a GitHub Pages

1. Puja el contingut d'aquesta carpeta a la branca `main` del repositori.
2. A GitHub, ves a **Settings → Pages → Build and deployment**, tria **Deploy from a branch**, branca `main` i carpeta `/ (root)`.
3. El lloc quedarà a `https://murillogarcia2809-ship-it.github.io/tercero_primaria/`.

## Provar en local

Pots obrir `index.html` directament al navegador, o servir la carpeta:

```
python -m http.server 8000
```

I després obrir http://localhost:8000
