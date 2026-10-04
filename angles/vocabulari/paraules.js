/* Vocabulari d'anglès per illes (categories).
   Per afegir paraules: { en: 'word', ca: 'paraula', e: '😀' }  (o color: '#hex' per als colors).
   Per afegir una illa nova, copia un bloc i canvia-li l'id, el nom i les paraules. */
window.ILLES = [
  {
    id: 'animals', en: 'Animals', ca: 'Animals', e: '🐾', c1: '#a8e063', c2: '#56ab2f',
    words: [
      { en: 'dog', ca: 'gos', e: '🐶' }, { en: 'cat', ca: 'gat', e: '🐱' }, { en: 'bird', ca: 'ocell', e: '🐦' },
      { en: 'fish', ca: 'peix', e: '🐟' }, { en: 'horse', ca: 'cavall', e: '🐴' }, { en: 'cow', ca: 'vaca', e: '🐮' },
      { en: 'pig', ca: 'porc', e: '🐷' }, { en: 'duck', ca: 'ànec', e: '🦆' }, { en: 'rabbit', ca: 'conill', e: '🐰' },
      { en: 'lion', ca: 'lleó', e: '🦁' }, { en: 'elephant', ca: 'elefant', e: '🐘' }, { en: 'monkey', ca: 'mico', e: '🐵' },
      { en: 'frog', ca: 'granota', e: '🐸' }, { en: 'mouse', ca: 'ratolí', e: '🐭' }, { en: 'sheep', ca: 'ovella', e: '🐑' },
      { en: 'snake', ca: 'serp', e: '🐍' },
    ],
  },
  {
    id: 'colours', en: 'Colours', ca: 'Colors', e: '🎨', c1: '#f857a6', c2: '#ff5858',
    words: [
      { en: 'red', ca: 'vermell', color: '#e53935' }, { en: 'blue', ca: 'blau', color: '#1e88e5' },
      { en: 'green', ca: 'verd', color: '#43a047' }, { en: 'yellow', ca: 'groc', color: '#fdd835' },
      { en: 'orange', ca: 'taronja', color: '#fb8c00' }, { en: 'purple', ca: 'lila', color: '#8e24aa' },
      { en: 'pink', ca: 'rosa', color: '#f48fb1' }, { en: 'black', ca: 'negre', color: '#111111' },
      { en: 'white', ca: 'blanc', color: '#ffffff' }, { en: 'brown', ca: 'marró', color: '#6d4c41' },
      { en: 'grey', ca: 'gris', color: '#9e9e9e' },
    ],
  },
  {
    id: 'food', en: 'Food', ca: 'Menjar', e: '🍎', c1: '#f6d365', c2: '#fda085',
    words: [
      { en: 'apple', ca: 'poma', e: '🍎' }, { en: 'banana', ca: 'plàtan', e: '🍌' }, { en: 'bread', ca: 'pa', e: '🍞' },
      { en: 'cheese', ca: 'formatge', e: '🧀' }, { en: 'egg', ca: 'ou', e: '🥚' }, { en: 'milk', ca: 'llet', e: '🥛' },
      { en: 'pizza', ca: 'pizza', e: '🍕' }, { en: 'cake', ca: 'pastís', e: '🍰' }, { en: 'water', ca: 'aigua', e: '💧' },
      { en: 'chicken', ca: 'pollastre', e: '🍗' }, { en: 'ice cream', ca: 'gelat', e: '🍦' }, { en: 'carrot', ca: 'pastanaga', e: '🥕' },
      { en: 'grapes', ca: 'raïm', e: '🍇' }, { en: 'sandwich', ca: 'entrepà', e: '🥪' }, { en: 'strawberry', ca: 'maduixa', e: '🍓' },
    ],
  },
  {
    id: 'body', en: 'My body', ca: 'El cos', e: '🧍', c1: '#ffd1a9', c2: '#ff9a76',
    words: [
      { en: 'eyes', ca: 'ulls', e: '👀' }, { en: 'ear', ca: 'orella', e: '👂' }, { en: 'nose', ca: 'nas', e: '👃' },
      { en: 'mouth', ca: 'boca', e: '👄' }, { en: 'hand', ca: 'mà', e: '✋' }, { en: 'foot', ca: 'peu', e: '🦶' },
      { en: 'leg', ca: 'cama', e: '🦵' }, { en: 'arm', ca: 'braç', e: '💪' }, { en: 'teeth', ca: 'dents', e: '🦷' },
      { en: 'face', ca: 'cara', e: '🙂' }, { en: 'hair', ca: 'cabells', e: '💇' }, { en: 'tongue', ca: 'llengua', e: '👅' },
    ],
  },
  {
    id: 'clothes', en: 'Clothes', ca: 'La roba', e: '👕', c1: '#89f7fe', c2: '#66a6ff',
    words: [
      { en: 't-shirt', ca: 'samarreta', e: '👕' }, { en: 'trousers', ca: 'pantalons', e: '👖' }, { en: 'dress', ca: 'vestit', e: '👗' },
      { en: 'shoes', ca: 'sabates', e: '👟' }, { en: 'cap', ca: 'gorra', e: '🧢' }, { en: 'socks', ca: 'mitjons', e: '🧦' },
      { en: 'coat', ca: 'abric', e: '🧥' }, { en: 'scarf', ca: 'bufanda', e: '🧣' }, { en: 'gloves', ca: 'guants', e: '🧤' },
      { en: 'boots', ca: 'botes', e: '👢' }, { en: 'hat', ca: 'barret', e: '🎩' }, { en: 'shorts', ca: 'pantalons curts', e: '🩳' },
    ],
  },
  {
    id: 'school', en: 'School', ca: "L'escola", e: '🎒', c1: '#fbc2eb', c2: '#a18cd1',
    words: [
      { en: 'pencil', ca: 'llapis', e: '✏️' }, { en: 'book', ca: 'llibre', e: '📕' }, { en: 'scissors', ca: 'tisores', e: '✂️' },
      { en: 'ruler', ca: 'regle', e: '📏' }, { en: 'bag', ca: 'motxilla', e: '🎒' }, { en: 'pen', ca: 'bolígraf', e: '🖊️' },
      { en: 'crayon', ca: 'cera', e: '🖍️' }, { en: 'computer', ca: 'ordinador', e: '💻' }, { en: 'clock', ca: 'rellotge', e: '🕒' },
      { en: 'chair', ca: 'cadira', e: '🪑' }, { en: 'notebook', ca: 'llibreta', e: '📓' }, { en: 'paintbrush', ca: 'pinzell', e: '🖌️' },
    ],
  },
  {
    id: 'family', en: 'Family', ca: 'La família', e: '👨‍👩‍👧', c1: '#ffecd2', c2: '#fcb69f',
    words: [
      { en: 'mum', ca: 'mare', e: '👩' }, { en: 'dad', ca: 'pare', e: '👨' }, { en: 'brother', ca: 'germà', e: '👦' },
      { en: 'sister', ca: 'germana', e: '👧' }, { en: 'baby', ca: 'nadó', e: '👶' }, { en: 'grandma', ca: 'àvia', e: '👵' },
      { en: 'grandpa', ca: 'avi', e: '👴' }, { en: 'family', ca: 'família', e: '👨‍👩‍👧‍👦' },
    ],
  },
  {
    id: 'weather', en: 'Weather', ca: 'El temps', e: '🌦️', c1: '#a1c4fd', c2: '#4b6cb7',
    words: [
      { en: 'sunny', ca: 'assolellat', e: '☀️' }, { en: 'rainy', ca: 'plujós', e: '🌧️' }, { en: 'cloudy', ca: 'ennuvolat', e: '☁️' },
      { en: 'windy', ca: 'ventós', e: '🌬️' }, { en: 'snowy', ca: 'nevat', e: '❄️' }, { en: 'stormy', ca: 'amb tempesta', e: '⛈️' },
      { en: 'rainbow', ca: 'arc de Sant Martí', e: '🌈' }, { en: 'hot', ca: 'calor', e: '🥵' }, { en: 'cold', ca: 'fred', e: '🥶' },
    ],
  },
];
