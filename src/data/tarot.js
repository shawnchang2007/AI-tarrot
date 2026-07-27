const majorArcana = [
  ["The Fool", "愚人", "✦", ["new beginnings", "trust", "courage"], ["新的开始", "信任", "勇气"]],
  ["The Magician", "魔术师", "☿", ["creativity", "action", "possibility"], ["创造力", "行动", "可能性"]],
  ["The High Priestess", "女祭司", "☾", ["intuition", "stillness", "inner wisdom"], ["直觉", "静心", "内在智慧"]],
  ["The Empress", "皇后", "♀", ["nurturing", "abundance", "gentle strength"], ["滋养", "丰盛", "温柔的力量"]],
  ["The Emperor", "皇帝", "♈", ["boundaries", "stability", "responsibility"], ["边界", "稳定", "责任"]],
  ["The Hierophant", "教皇", "♉", ["belief", "learning", "shared wisdom"], ["信念", "学习", "共同智慧"]],
  ["The Lovers", "恋人", "♊", ["connection", "choice", "aligned values"], ["连接", "选择", "价值一致"]],
  ["The Chariot", "战车", "♋", ["direction", "determination", "momentum"], ["方向", "决心", "推进"]],
  ["Strength", "力量", "♌", ["patience", "confidence", "gentle resolve"], ["耐心", "自信", "温柔的坚定"]],
  ["The Hermit", "隐者", "♍", ["solitude", "seeking", "inner light"], ["独处", "探寻", "内在之光"]],
  ["Wheel of Fortune", "命运之轮", "♃", ["turning point", "cycles", "welcoming change"], ["转折", "周期", "迎接变化"]],
  ["Justice", "正义", "♎", ["honesty", "balance", "owning your choices"], ["诚实", "平衡", "为选择负责"]],
  ["The Hanged Man", "倒吊人", "♆", ["pause", "new perspective", "releasing control"], ["暂停", "新视角", "放下控制"]],
  ["Death", "死神", "♏", ["ending", "transformation", "making room for renewal"], ["结束", "蜕变", "为新生腾出空间"]],
  ["Temperance", "节制", "♐", ["harmony", "patience", "steady progress"], ["调和", "耐心", "稳步前行"]],
  ["The Devil", "恶魔", "♑", ["seeing the pattern", "desire", "reclaiming choice"], ["看见模式", "欲望", "重获选择"]],
  ["The Tower", "高塔", "♂", ["breaking old patterns", "truth", "rebuilding"], ["打破旧模式", "真相", "重建"]],
  ["The Star", "星星", "♒", ["hope", "healing", "trusting again"], ["希望", "疗愈", "重新信任"]],
  ["The Moon", "月亮", "♓", ["feeling", "the unknown", "moving through uncertainty"], ["感受", "未知", "穿过不确定"]],
  ["The Sun", "太阳", "☉", ["clarity", "vitality", "joy"], ["清晰", "活力", "喜悦"]],
  ["Judgement", "审判", "♇", ["answering the call", "awakening", "choosing again"], ["回应召唤", "觉醒", "重新选择"]],
  ["The World", "世界", "♄", ["completion", "integration", "a new chapter"], ["完成", "整合", "新的篇章"]],
];

const suits = [
  {
    name: "Wands",
    zh: "权杖",
    glyph: "✺",
    theme: ["action", "passion", "creativity"],
    themeZh: ["行动", "热情", "创造力"],
  },
  {
    name: "Cups",
    zh: "圣杯",
    glyph: "♢",
    theme: ["emotion", "connection", "intuition"],
    themeZh: ["情感", "连接", "直觉"],
  },
  {
    name: "Swords",
    zh: "宝剑",
    glyph: "✧",
    theme: ["thought", "communication", "clarity"],
    themeZh: ["思考", "沟通", "清晰"],
  },
  {
    name: "Pentacles",
    zh: "星币",
    glyph: "⛤",
    theme: ["the practical", "resources", "steady growth"],
    themeZh: ["现实层面", "资源", "稳定成长"],
  },
];

const ranks = [
  ["Ace", "王牌", ["a seed", "opportunity", "a beginning"], ["种子", "机会", "开始"]],
  ["Two", "二", ["choice", "balance", "relationship"], ["选择", "平衡", "关系"]],
  ["Three", "三", ["growth", "collaboration", "expression"], ["成长", "合作", "表达"]],
  ["Four", "四", ["stability", "boundaries", "rest"], ["稳定", "边界", "休息"]],
  ["Five", "五", ["challenge", "adjustment", "reorientation"], ["挑战", "调整", "重新定位"]],
  ["Six", "六", ["movement", "support", "returning to harmony"], ["流动", "支持", "回归和谐"]],
  ["Seven", "七", ["assessment", "persistence", "awareness"], ["评估", "坚持", "觉察"]],
  ["Eight", "八", ["momentum", "practice", "inner strength"], ["动能", "练习", "内在力量"]],
  ["Nine", "九", ["resilience", "accumulation", "nearing completion"], ["韧性", "积累", "接近完成"]],
  ["Ten", "十", ["completion", "responsibility", "a new cycle"], ["完成", "责任", "新的循环"]],
  ["Page", "侍从", ["curiosity", "a message", "learning"], ["好奇", "消息", "学习"]],
  ["Knight", "骑士", ["pursuit", "motivation", "adjusting your pace"], ["追寻", "动力", "调整节奏"]],
  ["Queen", "皇后", ["receptivity", "maturity", "inner mastery"], ["接纳", "成熟", "内在掌控"]],
  ["King", "国王", ["leadership", "responsibility", "grounded expression"], ["领导力", "责任", "踏实表达"]],
];

const major = majorArcana.map(([name, nameZh, glyph, keywords, keywordsZh], index) => ({
  id: `major-${index}`,
  name,
  nameZh,
  en: "Major Arcana",
  zh: "大阿卡纳",
  glyph,
  arcana: "Major Arcana",
  keywords,
  keywordsZh,
}));

const minor = suits.flatMap((suit) =>
  ranks.map(([rank, rankZh, keywords, keywordsZh], index) => ({
    id: `${suit.name.toLowerCase()}-${index + 1}`,
    name: `${rank} of ${suit.name}`,
    nameZh: `${suit.zh}${rankZh}`,
    en: "Minor Arcana",
    zh: "小阿卡纳",
    glyph: suit.glyph,
    arcana: suit.name,
    keywords: [suit.theme[index % suit.theme.length], ...keywords.slice(0, 2)],
    keywordsZh: [suit.themeZh[index % suit.themeZh.length], ...keywordsZh.slice(0, 2)],
  })),
);

export const tarotDeck = [...major, ...minor];

export const spreadPositions = {
  en: {
    1: ["Your guidance for this moment"],
    3: ["Where you are now", "The strength to recognize", "A step you can take"],
    5: [
      "The heart of the question",
      "A resource already within you",
      "What you may be ready to release",
      "An action worth exploring",
      "The direction of your growth",
    ],
  },
  zh: {
    1: ["此刻的指引"],
    3: ["你当下的位置", "值得看见的力量", "可以迈出的一步"],
    5: [
      "问题的核心",
      "你已经拥有的资源",
      "你也许准备放下的事",
      "值得尝试的行动",
      "你的成长方向",
    ],
  },
};

function randomIndex(max) {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return values[0] % max;
}

export function drawCards(count, language = "en") {
  const pool = [...tarotDeck];
  const positions = spreadPositions[language]?.[count] || spreadPositions.en[count];

  return Array.from({ length: count }, (_, index) => {
    const selectedIndex = randomIndex(pool.length);
    const card = pool.splice(selectedIndex, 1)[0];
    return {
      ...card,
      position: positions[index],
      positionIndex: index,
      orientation: randomIndex(2) === 0 ? "Upright" : "Reversed",
      revealed: false,
    };
  });
}
