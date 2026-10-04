# Els jocs de l'Eloi · 3r de Primària

Jocs educatius en català per a l'Eloi (curs 2026-27). Són HTML, CSS i JavaScript estàtics: no necessiten servidor ni base de dades, i funcionen directament a GitHub Pages.

## Jocs

| Matèria | Joc | Carpeta |
|---|---|---|
| Matemàtiques | 🚀 Missió Galàxia Numèrica: descomposició DM/UM/C/D/U i números en lletres (pas a pas: fins al 99, fins al 999 i amb milers) | `mates/galaxia/` |
| Anglès | 🦜 L'Illa de les Paraules: vocabulari per temes | `angles/vocabulari/` |
| Anglès | 🍪 El Monstre Comptador: comptar de l'1 al 20 | `angles/comptar/` |

## Estructura

```
index.html          Portal amb tots els jocs
comu/comu.css       Estils compartits
comu/comu.js        Sons, veu, diàlegs, teclat, motor de preguntes (objecte global Eloi)
mates/galaxia/      Joc de mates (nombres-ca.js = números en lletres en català)
angles/vocabulari/  Joc de vocabulari (paraules.js = llista de paraules editable)
angles/comptar/     Joc de comptar
```

## Personalitzar

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
