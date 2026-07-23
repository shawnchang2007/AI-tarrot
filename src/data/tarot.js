const majorArcana = [
  ["The Fool", "✦", ["new beginnings", "trust", "courage"]],
  ["The Magician", "☿", ["creativity", "action", "possibility"]],
  ["The High Priestess", "☾", ["intuition", "stillness", "inner wisdom"]],
  ["The Empress", "♀", ["nurturing", "abundance", "gentle strength"]],
  ["The Emperor", "♈", ["boundaries", "stability", "responsibility"]],
  ["The Hierophant", "♉", ["belief", "learning", "shared wisdom"]],
  ["The Lovers", "♊", ["connection", "choice", "aligned values"]],
  ["The Chariot", "♋", ["direction", "determination", "momentum"]],
  ["Strength", "♌", ["patience", "confidence", "gentle resolve"]],
  ["The Hermit", "♍", ["solitude", "seeking", "inner light"]],
  ["Wheel of Fortune", "♃", ["turning point", "cycles", "welcoming change"]],
  ["Justice", "♎", ["honesty", "balance", "owning your choices"]],
  ["The Hanged Man", "♆", ["pause", "new perspective", "releasing control"]],
  ["Death", "♏", ["ending", "transformation", "making room for renewal"]],
  ["Temperance", "♐", ["harmony", "patience", "steady progress"]],
  ["The Devil", "♑", ["seeing the pattern", "desire", "reclaiming choice"]],
  ["The Tower", "♂", ["breaking old patterns", "truth", "rebuilding"]],
  ["The Star", "♒", ["hope", "healing", "trusting again"]],
  ["The Moon", "♓", ["feeling", "the unknown", "moving through uncertainty"]],
  ["The Sun", "☉", ["clarity", "vitality", "joy"]],
  ["Judgement", "♇", ["answering the call", "awakening", "choosing again"]],
  ["The World", "♄", ["completion", "integration", "a new chapter"]],
];

const suits = [
  {
    name: "Wands",
    glyph: "✺",
    theme: ["action", "passion", "creativity"],
  },
  {
    name: "Cups",
    glyph: "♢",
    theme: ["emotion", "connection", "intuition"],
  },
  {
    name: "Swords",
    glyph: "✧",
    theme: ["thought", "communication", "clarity"],
  },
  {
    name: "Pentacles",
    glyph: "⛤",
    theme: ["the practical", "resources", "steady growth"],
  },
];

const ranks = [
  ["Ace", ["a seed", "opportunity", "a beginning"]],
  ["Two", ["choice", "balance", "relationship"]],
  ["Three", ["growth", "collaboration", "expression"]],
  ["Four", ["stability", "boundaries", "rest"]],
  ["Five", ["challenge", "adjustment", "reorientation"]],
  ["Six", ["movement", "support", "returning to harmony"]],
  ["Seven", ["assessment", "persistence", "awareness"]],
  ["Eight", ["momentum", "practice", "inner strength"]],
  ["Nine", ["resilience", "accumulation", "nearing completion"]],
  ["Ten", ["completion", "responsibility", "a new cycle"]],
  ["Page", ["curiosity", "a message", "learning"]],
  ["Knight", ["pursuit", "motivation", "adjusting your pace"]],
  ["Queen", ["receptivity", "maturity", "inner mastery"]],
  ["King", ["leadership", "responsibility", "grounded expression"]],
];

const major = majorArcana.map(([name, glyph, keywords], index) => ({
  id: `major-${index}`,
  name,
  en: "Major Arcana",
  glyph,
  arcana: "Major Arcana",
  keywords,
}));

const minor = suits.flatMap((suit) =>
  ranks.map(([rank, keywords], index) => ({
    id: `${suit.name.toLowerCase()}-${index + 1}`,
    name: `${rank} of ${suit.name}`,
    en: "Minor Arcana",
    glyph: suit.glyph,
    arcana: suit.name,
    keywords: [suit.theme[index % suit.theme.length], ...keywords.slice(0, 2)],
  })),
);

export const tarotDeck = [...major, ...minor];

export const spreadPositions = {
  1: ["Your guidance for this moment"],
  3: ["Where you are now", "The strength to recognize", "A step you can take"],
  5: [
    "The heart of the question",
    "A resource already within you",
    "What you may be ready to release",
    "An action worth exploring",
    "The direction of your growth",
  ],
};

function randomIndex(max) {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return values[0] % max;
}

export function drawCards(count) {
  const pool = [...tarotDeck];
  const positions = spreadPositions[count];

  return Array.from({ length: count }, (_, index) => {
    const selectedIndex = randomIndex(pool.length);
    const card = pool.splice(selectedIndex, 1)[0];
    return {
      ...card,
      position: positions[index],
      orientation: randomIndex(2) === 0 ? "Upright" : "Reversed",
      revealed: false,
    };
  });
}
