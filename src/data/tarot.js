const majorArcana = [
  ["愚者", "The Fool", "✦", ["新的开始", "信任", "勇气"]],
  ["魔术师", "The Magician", "☿", ["创造力", "行动", "可能性"]],
  ["女祭司", "The High Priestess", "☾", ["直觉", "静心", "内在智慧"]],
  ["皇后", "The Empress", "♀", ["滋养", "丰盛", "温柔力量"]],
  ["皇帝", "The Emperor", "♈", ["边界", "稳定", "责任"]],
  ["教皇", "The Hierophant", "♉", ["信念", "学习", "传统智慧"]],
  ["恋人", "The Lovers", "♊", ["连接", "选择", "价值一致"]],
  ["战车", "The Chariot", "♋", ["方向", "决心", "前进"]],
  ["力量", "Strength", "♌", ["耐心", "自信", "温柔坚定"]],
  ["隐者", "The Hermit", "♍", ["独处", "寻找", "内在明灯"]],
  ["命运之轮", "Wheel of Fortune", "♃", ["转机", "周期", "接纳变化"]],
  ["正义", "Justice", "♎", ["诚实", "平衡", "承担选择"]],
  ["倒吊人", "The Hanged Man", "♆", ["暂停", "换个角度", "放下控制"]],
  ["死神", "Death", "♏", ["结束", "蜕变", "为新生腾出空间"]],
  ["节制", "Temperance", "♐", ["调和", "耐心", "循序渐进"]],
  ["恶魔", "The Devil", "♑", ["看见束缚", "欲望", "夺回选择"]],
  ["高塔", "The Tower", "♂", ["打破旧模式", "真相", "重新建立"]],
  ["星星", "The Star", "♒", ["希望", "疗愈", "重新相信"]],
  ["月亮", "The Moon", "♓", ["感受", "未知", "穿过迷雾"]],
  ["太阳", "The Sun", "☉", ["清晰", "生命力", "喜悦"]],
  ["审判", "Judgement", "♇", ["回应召唤", "觉醒", "重新选择"]],
  ["世界", "The World", "♄", ["完成", "整合", "迈向新阶段"]],
];

const suits = [
  {
    name: "权杖",
    en: "Wands",
    glyph: "✺",
    theme: ["行动", "热情", "创造"],
  },
  {
    name: "圣杯",
    en: "Cups",
    glyph: "♢",
    theme: ["情感", "关系", "直觉"],
  },
  {
    name: "宝剑",
    en: "Swords",
    glyph: "✧",
    theme: ["思考", "沟通", "清晰"],
  },
  {
    name: "星币",
    en: "Pentacles",
    glyph: "⛤",
    theme: ["现实", "资源", "稳步成长"],
  },
];

const ranks = [
  ["王牌", "Ace", ["种子", "机会", "开始"]],
  ["二", "Two", ["选择", "平衡", "关系"]],
  ["三", "Three", ["成长", "合作", "表达"]],
  ["四", "Four", ["稳定", "边界", "休整"]],
  ["五", "Five", ["挑战", "调整", "重新定位"]],
  ["六", "Six", ["流动", "支持", "走向和谐"]],
  ["七", "Seven", ["评估", "坚持", "保持觉察"]],
  ["八", "Eight", ["推进", "练习", "内在力量"]],
  ["九", "Nine", ["积累", "韧性", "接近完成"]],
  ["十", "Ten", ["完成", "承担", "进入新周期"]],
  ["侍从", "Page", ["好奇", "消息", "学习"]],
  ["骑士", "Knight", ["追寻", "动力", "调整节奏"]],
  ["王后", "Queen", ["接纳", "成熟", "内在掌握"]],
  ["国王", "King", ["引领", "负责", "稳定运用"]],
];

const major = majorArcana.map(([name, en, glyph, keywords], index) => ({
  id: `major-${index}`,
  name,
  en,
  glyph,
  arcana: "大阿卡纳",
  keywords,
}));

const minor = suits.flatMap((suit) =>
  ranks.map(([rank, rankEn, keywords], index) => ({
    id: `${suit.en.toLowerCase()}-${index + 1}`,
    name: `${suit.name}${rank}`,
    en: `${rankEn} of ${suit.en}`,
    glyph: suit.glyph,
    arcana: suit.name,
    keywords: [suit.theme[index % suit.theme.length], ...keywords.slice(0, 2)],
  })),
);

export const tarotDeck = [...major, ...minor];

export const spreadPositions = {
  1: ["此刻的指引"],
  3: ["你所处的位置", "需要看见的力量", "可以采取的行动"],
  5: ["问题的核心", "你拥有的资源", "需要松开的阻碍", "值得尝试的行动", "前方的成长方向"],
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
      orientation: randomIndex(2) === 0 ? "正位" : "逆位",
      revealed: false,
    };
  });
}
