import { useEffect, useMemo, useState } from "react";
import { drawCards, spreadPositions } from "./data/tarot";

const translations = {
  en: {
    documentTitle: "Soluna · Ask the Stars Within",
    ritualDocumentTitle: "Soluna · Your Ritual",
    metaDescription: "A gentle, AI-guided tarot reflection to help you notice your strengths and find a thoughtful next step.",
    navigation: "Main navigation",
    home: "Soluna home",
    navWhisper: "Between sun & moon",
    switchToEnglish: "Switch to English",
    switchToChinese: "切换到中文",
    eyebrow: "A gentle light for your inner sky",
    heroLineOne: "Ask the stars within,",
    heroLineTwo: "hear where your heart is leading.",
    heroCopyOne: "Tarot is not a verdict on your future. It is a mirror for what is already moving within you.",
    heroCopyTwo: "Soluna helps you notice your strength and find one gentle step forward.",
    begin: "Begin a reflection",
    askKicker: "01 · Name this moment",
    askTitle: "Where could you use a little light?",
    askCopy: "Ask about a relationship, your growth, your work, or a choice you have been holding.",
    questionLabel: "Your question",
    questionPlaceholder: "For example: How can I find my rhythm again while everything is changing?",
    chooseSpread: "Choose a spread",
    countOptions: [
      { value: 1, label: "One card", hint: "A quick reflection" },
      { value: 3, label: "Three cards", hint: "See · Understand · Act" },
      { value: 5, label: "Five cards", hint: "A deeper exploration" },
    ],
    deckNote: "Drawing from the complete 78-card Soluna deck, with original artwork for every card.",
    questionTooShort: "Share a little more so Soluna can better understand what is on your mind.",
    shuffle: "Enter the ritual",
    exitRitual: "Leave the ritual",
    yourIntention: "The question you are carrying",
    ritualSteps: ["Flame", "Breath", "Draw"],
    candleKicker: "The threshold · 01",
    candleTitle: "Light a quiet flame",
    candleCopy: "Let this small light mark the moment you turn your attention inward.",
    candleInstruction: "Touch the candle to light it",
    lightCandle: "Light the candle",
    candleLit: "The flame is lit",
    continueToBreath: "Continue to the breath",
    breatheKicker: "The threshold · 02",
    breatheTitle: "Take one slow breath",
    breatheCopy: "For three seconds, breathe in gently and hold your question without trying to solve it.",
    beginBreath: "Begin the 3-second breath",
    breatheIn: "Breathe in",
    breathReady: "Breath complete",
    breathComplete: "Your question is here. You do not need to force an answer.",
    continueToDraw: "I am ready to draw",
    shuffleKicker: "The threshold · 03",
    shuffleTitle: "The deck is listening",
    shuffleCopy: "Keep your question softly in mind while the cards find their place.",
    revealKicker: "03 · Reveal the constellation",
    revealedTitle: "Your cards are revealed",
    revealTitle: "Turn each card when it feels right",
    revealedCopy: "Upright and reversed are not good or bad—only different angles of reflection.",
    revealCopy: "Take your time. There is no right order.",
    revealAll: "Reveal all",
    listening: "Listening to the constellation…",
    askSoluna: "Ask Soluna to reflect",
    readingError: "Your reading could not arrive just yet.",
    cloudError: "The stars are behind the clouds for a moment. Please try again.",
    revealCard: "Reveal card",
    upright: "Upright",
    reversed: "Reversed",
    backMotto: "AS ABOVE · SO WITHIN",
    readingKicker: "A message from your inner sky",
    readingFallback: "You already carry the strength to move forward",
    connections: "How the cards connect",
    encouragement: "A little encouragement",
    actions: "Small steps you can try",
    reflection: "A question to carry with you",
    readingNote: "Soluna is a space for reflection and encouragement, not a certain prediction of the future.",
    restart: "Begin a new reflection ↗",
    footerMessage: "Between sun and moon, may you notice your own quiet light.",
    footerNote: "For reflection and entertainment only. Not a substitute for professional advice.",
  },
  zh: {
    documentTitle: "Soluna · 向内心的星辰发问",
    ritualDocumentTitle: "Soluna · 你的占卜仪式",
    metaDescription: "一次温柔的 AI 塔罗观照，陪你看见自己的力量，并找到清晰而实际的下一步。",
    navigation: "主导航",
    home: "Soluna 首页",
    navWhisper: "日月之间",
    switchToEnglish: "Switch to English",
    switchToChinese: "切换到中文",
    eyebrow: "照亮内心星空的一束柔光",
    heroLineOne: "向内心的星辰发问，",
    heroLineTwo: "听见心之所向。",
    heroCopyOne: "塔罗不是对未来的判决，而是一面映照内心变化的镜子。",
    heroCopyTwo: "Soluna 陪你看见自己的力量，并找到温柔而实际的下一步。",
    begin: "开启一次内在观照",
    askKicker: "01 · 为此刻命名",
    askTitle: "此刻的你，哪里需要一点光？",
    askCopy: "你可以询问关系、成长、工作，或一个萦绕心头的选择。",
    questionLabel: "你的问题",
    questionPlaceholder: "例如：当一切都在变化时，我该如何重新找回自己的节奏？",
    chooseSpread: "选择牌阵",
    countOptions: [
      { value: 1, label: "一张牌", hint: "快速获得一个观照" },
      { value: 3, label: "三张牌", hint: "看见 · 理解 · 行动" },
      { value: 5, label: "五张牌", hint: "进行一次深入探索" },
    ],
    deckNote: "从完整的 78 张 Soluna 塔罗牌中抽取，每张牌都拥有独立原创画面。",
    questionTooShort: "请再多写一点，让 Soluna 更好地理解你此刻的想法。",
    shuffle: "进入占卜仪式",
    exitRitual: "离开仪式",
    yourIntention: "此刻萦绕在你心中的问题",
    ritualSteps: ["点烛", "呼吸", "抽牌"],
    candleKicker: "进入仪式 · 01",
    candleTitle: "点亮一束安静的烛光",
    candleCopy: "让这一点微光成为界线，从日常的纷扰中，慢慢回到自己的内心。",
    candleInstruction: "轻触蜡烛，将它点亮",
    lightCandle: "点亮蜡烛",
    candleLit: "烛光已经亮起",
    continueToBreath: "继续，回到呼吸",
    breatheKicker: "进入仪式 · 02",
    breatheTitle: "做一次缓慢的深呼吸",
    breatheCopy: "用三秒钟轻轻吸气，把问题放在心里；此刻不必急着寻找答案。",
    beginBreath: "开始三秒呼吸",
    breatheIn: "缓缓吸气",
    breathReady: "呼吸完成",
    breathComplete: "你的问题已经被听见，不需要勉强自己立刻得到答案。",
    continueToDraw: "我准备好抽牌了",
    shuffleKicker: "进入仪式 · 03",
    shuffleTitle: "让牌组聆听你的问题",
    shuffleCopy: "在心里轻轻想着它，让属于你的牌慢慢找到位置。",
    revealKicker: "03 · 揭开星图",
    revealedTitle: "你的牌已经全部揭晓",
    revealTitle: "在感觉合适的时候，翻开每张牌",
    revealedCopy: "正位与逆位并非好坏之分，而是同一种能量的不同视角。",
    revealCopy: "慢慢来，没有必须遵循的翻牌顺序。",
    revealAll: "翻开全部",
    listening: "正在聆听星图……",
    askSoluna: "请 Soluna 为我解读",
    readingError: "这次解读暂时没有抵达。",
    cloudError: "星光暂时被云层遮住了，请稍后再试。",
    revealCard: "翻开第",
    upright: "正位",
    reversed: "逆位",
    backMotto: "如其在上 · 如其在心",
    readingKicker: "来自你内心星空的一封信",
    readingFallback: "你已经拥有继续前行的力量",
    connections: "这些牌如何彼此连接",
    encouragement: "给你的一点鼓励",
    actions: "你可以尝试的小步骤",
    reflection: "值得继续带在心里的问题",
    readingNote: "Soluna 用于自我观照与鼓励，而不是对未来作出确定预言。",
    restart: "开启一次新的观照 ↗",
    footerMessage: "在日月之间，愿你看见自己安静而坚定的光。",
    footerNote: "仅供自我观照与娱乐，不可替代专业建议。",
  },
};

function StarField() {
  const stars = useMemo(
    () =>
      Array.from({ length: 42 }, (_, index) => ({
        id: index,
        left: `${(index * 37 + 11) % 100}%`,
        top: `${(index * 53 + 7) % 100}%`,
        size: `${1 + (index % 3)}px`,
        delay: `${(index % 9) * 0.4}s`,
      })),
    [],
  );

  return (
    <div className="star-field" aria-hidden="true">
      {stars.map((star) => (
        <span
          key={star.id}
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
          }}
        />
      ))}
    </div>
  );
}

const cardRealms = {
  "Major Arcana": {
    key: "major",
    realm: { en: "Aether · Archetype", zh: "以太 · 原型" },
    accent: "#f2d69b",
    glow: "#9c78d8",
    marker: "✦",
  },
  Wands: {
    key: "wands",
    realm: { en: "Fire · Will", zh: "火 · 意志" },
    accent: "#f2bd78",
    glow: "#d56858",
    marker: "✺",
  },
  Cups: {
    key: "cups",
    realm: { en: "Water · Feeling", zh: "水 · 感受" },
    accent: "#a7dcf0",
    glow: "#547fc4",
    marker: "☽",
  },
  Swords: {
    key: "swords",
    realm: { en: "Air · Mind", zh: "风 · 思维" },
    accent: "#d4d9f6",
    glow: "#7798db",
    marker: "✧",
  },
  Pentacles: {
    key: "pentacles",
    realm: { en: "Earth · Form", zh: "土 · 形质" },
    accent: "#c8d99a",
    glow: "#71956d",
    marker: "⛤",
  },
};

function hashCardId(value) {
  return [...value].reduce((hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0, 17);
}

function toRoman(number) {
  const numerals = [
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let value = number;
  let result = "";
  numerals.forEach(([amount, symbol]) => {
    while (value >= amount) {
      result += symbol;
      value -= amount;
    }
  });
  return result || "0";
}

function getCardVisual(card) {
  const realm = cardRealms[card.arcana] || cardRealms["Major Arcana"];
  const seed = hashCardId(card.id);
  const majorNumber = card.id.startsWith("major-") ? Number(card.id.split("-")[1]) : null;
  const minorNumber = card.id.startsWith(`${realm.key}-`)
    ? Number(card.id.split("-")[1])
    : 1;
  const stars = Array.from({ length: 8 }, (_, index) => ({
    id: `${card.id}-star-${index}`,
    left: `${12 + ((seed + index * 29) % 76)}%`,
    top: `${9 + (((seed >> 3) + index * 37) % 60)}%`,
    size: `${index % 3 === 0 ? 5 : index % 2 === 0 ? 3 : 2}px`,
    delay: `${(index % 5) * 0.45}s`,
  }));
  const lines = Array.from({ length: 6 }, (_, index) => ({
    id: `${card.id}-line-${index}`,
    left: `${14 + ((seed + index * 19) % 57)}%`,
    top: `${15 + (((seed >> 2) + index * 31) % 50)}%`,
    width: `${28 + ((seed + index * 13) % 34)}px`,
    rotation: `${-52 + ((seed + index * 47) % 104)}deg`,
  }));

  return {
    ...realm,
    number: majorNumber === null ? String(minorNumber).padStart(2, "0") : toRoman(majorNumber),
    stars,
    lines,
  };
}

function TarotCard({ card, index, language, onReveal, t }) {
  const visual = getCardVisual(card);
  const orientationLabel = card.orientation === "Reversed" ? t.reversed : t.upright;
  const displayName = language === "zh" ? card.nameZh : card.name;
  const secondaryName = language === "zh" ? card.name : card.en;

  return (
    <button
      className={`tarot-card card-realm-${visual.key} ${card.revealed ? "is-revealed" : ""}`}
      type="button"
      onClick={() => onReveal(index)}
      aria-label={
        card.revealed
          ? `${displayName}，${orientationLabel}`
          : language === "zh"
            ? `${t.revealCard} ${index + 1} 张牌`
            : `${t.revealCard} ${index + 1}`
      }
      style={{
        "--card-accent": visual.accent,
        "--card-glow": visual.glow,
      }}
    >
      <span className="card-position">{card.position}</span>
      <span className="card-flip">
        <span className="card-face card-back">
          <span className="back-star back-star-one">✦</span>
          <span className="back-star back-star-two">·</span>
          <span className="back-star back-star-three">✧</span>
          <span className="back-orbit back-orbit-outer" />
          <span className="back-orbit back-orbit-inner" />
          <span className="back-axis back-axis-horizontal" />
          <span className="back-axis back-axis-vertical" />
          <span className="eclipse-sigil">
            <span className="sigil-sun" />
            <span className="sigil-moon" />
            <span className="sigil-star">✦</span>
          </span>
          <span className="back-motto">{t.backMotto}</span>
          <span className="back-brand">SOLUNA</span>
        </span>
        <span
          className={`card-face card-front card-front-${visual.key} ${card.orientation === "Reversed" ? "is-reversed" : ""}`}
        >
          <span className="card-corner card-corner-top">
            <span>{visual.marker}</span>
            {visual.number}
          </span>
          <span className="card-corner card-corner-bottom">
            <span>{visual.marker}</span>
            {visual.number}
          </span>
          <span className="card-art-rotatable">
            <span className="celestial-canvas" aria-hidden="true">
              <span className="card-nebula" />
              <span className="constellation-lines">
                {visual.lines.map((line) => (
                  <span
                    key={line.id}
                    style={{
                      left: line.left,
                      top: line.top,
                      width: line.width,
                      transform: `rotate(${line.rotation})`,
                    }}
                  />
                ))}
              </span>
              <span className="constellation-stars">
                {visual.stars.map((star) => (
                  <span
                    key={star.id}
                    style={{
                      left: star.left,
                      top: star.top,
                      width: star.size,
                      height: star.size,
                      animationDelay: star.delay,
                    }}
                  />
                ))}
              </span>
              <span className="astral-ring astral-ring-outer" />
              <span className="astral-ring astral-ring-inner" />
              <span className="card-illustration">
                <img
                  src={`/card-art/${card.id}.jpg`}
                  alt=""
                  draggable="false"
                  decoding="async"
                />
                <span className="illustration-vignette" />
              </span>
              <span className="realm-caption">{visual.realm[language]}</span>
            </span>
            <span className="card-nameplate">
              <span className="card-title">{displayName}</span>
              <span className="card-title-en">{secondaryName}</span>
            </span>
          </span>
          <span className="card-orientation">{orientationLabel}</span>
        </span>
      </span>
    </button>
  );
}

function LanguageSwitch({ language, onChange, t }) {
  return (
    <div
      className="language-switch"
      role="group"
      aria-label={language === "zh" ? "语言切换" : "Language selector"}
    >
      <button
        className={language === "en" ? "is-active" : ""}
        type="button"
        onClick={() => onChange("en")}
        aria-label={t.switchToEnglish}
        aria-pressed={language === "en"}
      >
        EN
      </button>
      <button
        className={language === "zh" ? "is-active" : ""}
        type="button"
        onClick={() => onChange("zh")}
        aria-label={t.switchToChinese}
        aria-pressed={language === "zh"}
      >
        中文
      </button>
    </div>
  );
}

function SiteNav({ language, onLanguageChange, onExitRitual, ritual, t }) {
  return (
    <nav className={`nav-shell ${ritual ? "ritual-nav" : ""}`} aria-label={t.navigation}>
      <a
        className="brand"
        href={ritual ? "/" : "#top"}
        aria-label={ritual ? t.exitRitual : t.home}
        onClick={ritual ? onExitRitual : undefined}
      >
        <span className="brand-mark">◐</span>
        <span>SOLUNA</span>
      </a>
      <div className="nav-actions">
        {ritual ? (
          <button className="ritual-exit" type="button" onClick={onExitRitual}>
            {t.exitRitual}
          </button>
        ) : (
          <span className="nav-whisper">{t.navWhisper}</span>
        )}
        <LanguageSwitch language={language} onChange={onLanguageChange} t={t} />
      </div>
    </nav>
  );
}

function RitualProgress({ stage, t }) {
  const activeIndex = stage === "candle" ? 0 : stage === "breathe" ? 1 : 2;

  return (
    <ol className="ritual-progress" aria-label={t.ritualDocumentTitle}>
      {t.ritualSteps.map((label, index) => (
        <li
          key={label}
          className={
            index < activeIndex
              ? "is-complete"
              : index === activeIndex
                ? "is-current"
                : ""
          }
          aria-current={index === activeIndex ? "step" : undefined}
        >
          <span>{index < activeIndex ? "✦" : `0${index + 1}`}</span>
          {label}
        </li>
      ))}
    </ol>
  );
}

function RitualQuestion({ question, t }) {
  return (
    <div className="ritual-question">
      <span>{t.yourIntention}</span>
      <p>“{question}”</p>
    </div>
  );
}

function CandleStage({ lit, onLight, onContinue, question, t }) {
  return (
    <section className="ritual-stage candle-stage">
      <div className="ritual-stage-copy">
        <span className="section-kicker">{t.candleKicker}</span>
        <h1>{t.candleTitle}</h1>
        <p>{t.candleCopy}</p>
      </div>

      <button
        className={`candle-interaction ${lit ? "is-lit" : ""}`}
        type="button"
        onClick={onLight}
        aria-label={lit ? t.candleLit : t.lightCandle}
        aria-pressed={lit}
      >
        <span className="candle-glow" aria-hidden="true" />
        <span className="candle-visual" aria-hidden="true">
          <span className="candle-flame">
            <span className="candle-flame-core" />
          </span>
          <span className="candle-wick" />
          <span className="candle-wax">
            <span className="wax-drip wax-drip-one" />
            <span className="wax-drip wax-drip-two" />
          </span>
          <span className="candle-pool" />
        </span>
        <small>{lit ? t.candleLit : t.candleInstruction}</small>
      </button>

      <RitualQuestion question={question} t={t} />

      <div className={`ritual-stage-action ${lit ? "is-visible" : ""}`}>
        <button className="primary-button" type="button" onClick={onContinue}>
          <span>{t.continueToBreath}</span>
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  );
}

function BreathStage({
  breathComplete,
  breathCount,
  isBreathing,
  onContinue,
  onStart,
  question,
  t,
}) {
  return (
    <section className="ritual-stage breath-stage">
      <div className="ritual-stage-copy">
        <span className="section-kicker">{t.breatheKicker}</span>
        <h1>{t.breatheTitle}</h1>
        <p>{t.breatheCopy}</p>
      </div>

      <button
        className={`breath-control ${isBreathing ? "is-breathing" : ""} ${breathComplete ? "is-complete" : ""}`}
        type="button"
        onClick={onStart}
        disabled={isBreathing || breathComplete}
        aria-label={t.beginBreath}
      >
        <span className="breath-orbit breath-orbit-one" aria-hidden="true" />
        <span className="breath-orbit breath-orbit-two" aria-hidden="true" />
        <span className="breath-core">
          <strong>{breathComplete ? "✦" : breathCount}</strong>
          <small>
            {isBreathing
              ? t.breatheIn
              : breathComplete
                ? t.breathReady
                : t.beginBreath}
          </small>
        </span>
      </button>

      <p className="breath-status" aria-live="polite">
        {breathComplete ? t.breathComplete : isBreathing ? `${t.breatheIn} · ${breathCount}` : " "}
      </p>

      <RitualQuestion question={question} t={t} />

      <div className={`ritual-stage-action ${breathComplete ? "is-visible" : ""}`}>
        <button className="primary-button" type="button" onClick={onContinue}>
          <span>{t.continueToDraw}</span>
          <span aria-hidden="true">✦</span>
        </button>
      </div>
    </section>
  );
}

function ShuffleStage({ question, t }) {
  return (
    <section className="ritual-stage shuffle-stage" aria-live="polite">
      <div className="ritual-stage-copy">
        <span className="section-kicker">{t.shuffleKicker}</span>
        <h1>{t.shuffleTitle}</h1>
        <p>{t.shuffleCopy}</p>
      </div>

      <div className="shuffle-deck" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <span className={`shuffle-card shuffle-card-${index + 1}`} key={index}>
            <span>◐</span>
          </span>
        ))}
      </div>

      <RitualQuestion question={question} t={t} />
    </section>
  );
}

function Reading({ language, reading, t }) {
  if (!reading) return null;
  const localizedReading = reading[language] || reading;

  return (
    <section className="reading-panel" aria-live="polite">
      <div className="section-kicker">{t.readingKicker}</div>
      <h2>{localizedReading.summary || t.readingFallback}</h2>
      <div className="reading-grid">
        <article>
          <span className="reading-icon">☾</span>
          <h3>{t.connections}</h3>
          <p>{localizedReading.connections}</p>
        </article>
        <article>
          <span className="reading-icon">✦</span>
          <h3>{t.encouragement}</h3>
          <p>{localizedReading.encouragement}</p>
        </article>
      </div>
      {localizedReading.actions?.length > 0 && (
        <div className="action-list">
          <h3>{t.actions}</h3>
          <ol>
            {localizedReading.actions.map((action, index) => (
              <li key={`${action}-${index}`}>{action}</li>
            ))}
          </ol>
        </div>
      )}
      {localizedReading.reflection && (
        <blockquote>
          <span>{t.reflection}</span>
          {localizedReading.reflection}
        </blockquote>
      )}
      <p className="reading-note">{t.readingNote}</p>
    </section>
  );
}

function readStoredRitual() {
  try {
    const stored = JSON.parse(window.sessionStorage.getItem("soluna-ritual") || "null");
    if (
      stored &&
      typeof stored.question === "string" &&
      [1, 3, 5].includes(Number(stored.count))
    ) {
      return {
        question: stored.question,
        count: Number(stored.count),
      };
    }
  } catch {
    // Ignore an invalid or unavailable session store.
  }
  return null;
}

export default function App() {
  const initialRitual = useMemo(() => readStoredRitual(), []);
  const startsInRitual =
    window.location.pathname === "/reading" && Boolean(initialRitual?.question);
  const [language, setLanguage] = useState(() => {
    const savedLanguage = window.localStorage.getItem("soluna-language");
    if (savedLanguage === "en" || savedLanguage === "zh") return savedLanguage;
    return window.navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
  });
  const [view, setView] = useState(startsInRitual ? "ritual" : "home");
  const [ritualStage, setRitualStage] = useState("candle");
  const [candleLit, setCandleLit] = useState(false);
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathComplete, setBreathComplete] = useState(false);
  const [breathCount, setBreathCount] = useState(3);
  const [question, setQuestion] = useState(initialRitual?.question || "");
  const [count, setCount] = useState(initialRitual?.count || 3);
  const [cards, setCards] = useState([]);
  const [reading, setReading] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const t = translations[language];

  const allRevealed = cards.length > 0 && cards.every((card) => card.revealed);

  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
    document.title = view === "ritual" ? t.ritualDocumentTitle : t.documentTitle;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", t.metaDescription);
    document.body.classList.toggle("ritual-active", view === "ritual");
    window.localStorage.setItem("soluna-language", language);
  }, [language, t.documentTitle, t.metaDescription, t.ritualDocumentTitle, view]);

  useEffect(() => {
    if (window.location.pathname === "/reading" && !initialRitual?.question) {
      window.history.replaceState({}, "", "/");
    }

    function handleHistoryChange() {
      const storedRitual = readStoredRitual();
      if (window.location.pathname === "/reading" && storedRitual?.question) {
        setQuestion(storedRitual.question);
        setCount(storedRitual.count);
        setView("ritual");
        setRitualStage("candle");
        setCandleLit(false);
        setBreathComplete(false);
      } else {
        setView("home");
      }
    }

    window.addEventListener("popstate", handleHistoryChange);
    return () => window.removeEventListener("popstate", handleHistoryChange);
  }, [initialRitual]);

  useEffect(() => {
    if (!isBreathing) return undefined;

    let remaining = 3;
    setBreathCount(remaining);
    const timer = window.setInterval(() => {
      remaining -= 1;
      setBreathCount(Math.max(remaining, 0));
      if (remaining <= 0) {
        window.clearInterval(timer);
        setIsBreathing(false);
        setBreathComplete(true);
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isBreathing]);

  useEffect(() => {
    if (ritualStage !== "shuffle") return undefined;

    const timer = window.setTimeout(() => {
      setCards(drawCards(count, language));
      setStatus("drawn");
      setRitualStage("cards");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 2600);

    return () => window.clearTimeout(timer);
  }, [count, language, ritualStage]);

  function changeLanguage(nextLanguage) {
    if (nextLanguage === language) return;
    setLanguage(nextLanguage);
    setError("");
    setCards((current) =>
      current.map((card, index) => ({
        ...card,
        position:
          spreadPositions[nextLanguage]?.[current.length]?.[index] ||
          spreadPositions.en[current.length][index],
      })),
    );
  }

  function beginRitual(event) {
    event.preventDefault();
    const cleanQuestion = question.trim();
    if (cleanQuestion.length < 4) {
      setError(t.questionTooShort);
      return;
    }

    setError("");
    setReading(null);
    setCards([]);
    setStatus("idle");
    setRitualStage("candle");
    setCandleLit(false);
    setIsBreathing(false);
    setBreathComplete(false);
    setBreathCount(3);
    window.sessionStorage.setItem(
      "soluna-ritual",
      JSON.stringify({ question: cleanQuestion, count }),
    );
    window.history.pushState({}, "", "/reading");
    setView("ritual");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function revealCard(index) {
    setCards((current) =>
      current.map((card, cardIndex) =>
        cardIndex === index ? { ...card, revealed: true } : card,
      ),
    );
  }

  function revealAll() {
    setCards((current) => current.map((card) => ({ ...card, revealed: true })));
  }

  function startBreath() {
    if (isBreathing || breathComplete) return;
    setBreathCount(3);
    setIsBreathing(true);
  }

  function beginShuffle() {
    if (!breathComplete) return;
    setCards([]);
    setStatus("shuffling");
    setRitualStage("shuffle");
  }

  async function requestReading() {
    setStatus("reading");
    setError("");

    try {
      const response = await fetch("/api/reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.trim(),
          language,
          cards: cards.map(({ name, nameZh, en, zh, orientation, keywords, keywordsZh }, index) => ({
            name,
            nameZh,
            en,
            zh,
            position: spreadPositions.en[cards.length][index],
            positionZh: spreadPositions.zh[cards.length][index],
            orientation,
            keywords,
            keywordsZh,
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t.readingError);
      setReading(data.reading);
      setStatus("complete");
      requestAnimationFrame(() => {
        document.querySelector(".reading-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (requestError) {
      setError(requestError.message || t.cloudError);
      setStatus("drawn");
    }
  }

  function exitRitual(event) {
    event?.preventDefault();
    setView("home");
    setRitualStage("candle");
    setCandleLit(false);
    setIsBreathing(false);
    setBreathComplete(false);
    setCards([]);
    setReading(null);
    setStatus("idle");
    setError("");
    window.history.pushState({}, "", "/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    window.sessionStorage.removeItem("soluna-ritual");
    setQuestion("");
    setCount(3);
    exitRitual();
  }

  if (view === "ritual") {
    return (
      <main className={`ritual-page ${language === "zh" ? "language-zh" : "language-en"}`}>
        <StarField />
        <SiteNav
          language={language}
          onLanguageChange={changeLanguage}
          onExitRitual={exitRitual}
          ritual
          t={t}
        />

        <div className="ritual-shell">
          <RitualProgress stage={ritualStage} t={t} />

          {ritualStage === "candle" && (
            <CandleStage
              lit={candleLit}
              onContinue={() => setRitualStage("breathe")}
              onLight={() => setCandleLit(true)}
              question={question}
              t={t}
            />
          )}

          {ritualStage === "breathe" && (
            <BreathStage
              breathComplete={breathComplete}
              breathCount={breathCount}
              isBreathing={isBreathing}
              onContinue={beginShuffle}
              onStart={startBreath}
              question={question}
              t={t}
            />
          )}

          {ritualStage === "shuffle" && <ShuffleStage question={question} t={t} />}

          {ritualStage === "cards" && (
            <section className="ritual-card-stage" id="card-table">
              <div className="section-heading centered ritual-card-heading">
                <span className="section-kicker">{t.revealKicker}</span>
                <h1>{allRevealed ? t.revealedTitle : t.revealTitle}</h1>
                <p>{allRevealed ? t.revealedCopy : t.revealCopy}</p>
              </div>

              <div className={`cards-grid cards-${cards.length}`}>
                {cards.map((card, index) => (
                  <TarotCard
                    key={`${card.id}-${index}`}
                    card={card}
                    index={index}
                    language={language}
                    onReveal={revealCard}
                    t={t}
                  />
                ))}
              </div>

              <div className="card-actions">
                {!allRevealed && (
                  <button className="text-button" type="button" onClick={revealAll}>
                    {t.revealAll}
                  </button>
                )}
                {allRevealed && status !== "complete" && (
                  <button
                    className="primary-button"
                    type="button"
                    onClick={requestReading}
                    disabled={status === "reading"}
                  >
                    <span>{status === "reading" ? t.listening : t.askSoluna}</span>
                    <span className={status === "reading" ? "spinner" : ""} aria-hidden="true">☾</span>
                  </button>
                )}
              </div>

              {error && (
                <p className="form-error centered-error" role="alert">
                  {error}
                </p>
              )}

              <Reading language={language} reading={reading} t={t} />

              {reading && (
                <div className="restart-wrap">
                  <button className="text-button" type="button" onClick={reset}>
                    {t.restart}
                  </button>
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className={`home-page ${language === "zh" ? "language-zh" : "language-en"}`}>
      <StarField />
      <SiteNav language={language} onLanguageChange={changeLanguage} ritual={false} t={t} />

      <header className="hero" id="top">
        <div className="celestial-symbol" aria-hidden="true">
          <span className="sun-halo" />
          <span className="hero-moon">◐</span>
          <span className="tiny-star star-a">✦</span>
          <span className="tiny-star star-b">·</span>
          <span className="tiny-star star-c">✧</span>
        </div>
        <p className="eyebrow">{t.eyebrow}</p>
        <h1>
          {t.heroLineOne}
          <br />
          <em>{t.heroLineTwo}</em>
        </h1>
        <p className="hero-copy">
          {t.heroCopyOne}
          <br />
          {t.heroCopyTwo}
        </p>
        <a className="hero-link" href="#ask">
          {t.begin} <span>↓</span>
        </a>
      </header>

      <section className="ask-section" id="ask">
        <div className="section-heading">
          <span className="section-kicker">{t.askKicker}</span>
          <h2>{t.askTitle}</h2>
          <p>{t.askCopy}</p>
        </div>

        <form className="question-form" onSubmit={beginRitual}>
          <label htmlFor="question">{t.questionLabel}</label>
          <div className="textarea-wrap">
            <textarea
              id="question"
              value={question}
              onChange={(event) => setQuestion(event.target.value.slice(0, 240))}
              placeholder={t.questionPlaceholder}
              rows="4"
            />
            <span>{question.length}/240</span>
          </div>

          <fieldset>
            <legend>{t.chooseSpread}</legend>
            <div className="count-options">
              {t.countOptions.map((option) => (
                <label key={option.value} className={count === option.value ? "is-selected" : ""}>
                  <input
                    type="radio"
                    name="count"
                    value={option.value}
                    checked={count === option.value}
                    onChange={() => setCount(option.value)}
                  />
                  <strong>{option.label}</strong>
                  <span>{option.hint}</span>
                </label>
              ))}
            </div>
            <p className="deck-note">
              <span aria-hidden="true">✦</span>
              {t.deckNote}
            </p>
          </fieldset>

          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="primary-button" type="submit">
            <span>{t.shuffle}</span>
            <span aria-hidden="true">✦</span>
          </button>
        </form>
      </section>

      <footer>
        <a className="brand footer-brand" href="#top">
          <span className="brand-mark">◐</span>
          <span>SOLUNA</span>
        </a>
        <p>{t.footerMessage}</p>
        <small>{t.footerNote}</small>
      </footer>
    </main>
  );
}
