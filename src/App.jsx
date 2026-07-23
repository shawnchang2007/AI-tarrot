import { useMemo, useState } from "react";
import { drawCards } from "./data/tarot";

const countOptions = [
  { value: 1, label: "一张牌", hint: "快速指引" },
  { value: 3, label: "三张牌", hint: "看见 · 理解 · 行动" },
  { value: 5, label: "五张牌", hint: "完整探索" },
];

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

function TarotCard({ card, index, onReveal }) {
  return (
    <button
      className={`tarot-card ${card.revealed ? "is-revealed" : ""}`}
      type="button"
      onClick={() => onReveal(index)}
      aria-label={card.revealed ? `${card.name}，${card.orientation}` : `翻开第 ${index + 1} 张牌`}
    >
      <span className="card-position">{card.position}</span>
      <span className="card-flip">
        <span className="card-face card-back">
          <span className="orbit orbit-one" />
          <span className="orbit orbit-two" />
          <span className="moon-mark">◐</span>
          <span className="back-brand">SOLUNA</span>
        </span>
        <span className={`card-face card-front ${card.orientation === "逆位" ? "is-reversed" : ""}`}>
          <span className="card-number">{String(index + 1).padStart(2, "0")}</span>
          <span className="card-glyph">{card.glyph}</span>
          <span className="card-title">{card.name}</span>
          <span className="card-title-en">{card.en}</span>
          <span className="card-orientation">{card.orientation}</span>
        </span>
      </span>
    </button>
  );
}

function Reading({ reading }) {
  if (!reading) return null;

  return (
    <section className="reading-panel" aria-live="polite">
      <div className="section-kicker">来自星图的回应</div>
      <h2>{reading.summary || "你已经拥有继续前行的力量"}</h2>
      <div className="reading-grid">
        <article>
          <span className="reading-icon">☾</span>
          <h3>牌面之间的联系</h3>
          <p>{reading.connections}</p>
        </article>
        <article>
          <span className="reading-icon">✦</span>
          <h3>给你的鼓励</h3>
          <p>{reading.encouragement}</p>
        </article>
      </div>
      {reading.actions?.length > 0 && (
        <div className="action-list">
          <h3>你可以尝试的下一步</h3>
          <ol>
            {reading.actions.map((action, index) => (
              <li key={`${action}-${index}`}>{action}</li>
            ))}
          </ol>
        </div>
      )}
      {reading.reflection && (
        <blockquote>
          <span>留给你的问题</span>
          {reading.reflection}
        </blockquote>
      )}
      <p className="reading-note">
        Soluna 提供的是自我探索与鼓励，不是对未来的确定预言。
      </p>
    </section>
  );
}

export default function App() {
  const [question, setQuestion] = useState("");
  const [count, setCount] = useState(3);
  const [cards, setCards] = useState([]);
  const [reading, setReading] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const allRevealed = cards.length > 0 && cards.every((card) => card.revealed);

  function handleDraw(event) {
    event.preventDefault();
    const cleanQuestion = question.trim();
    if (cleanQuestion.length < 4) {
      setError("请多写一点，让 Soluna 更理解你此刻的感受。");
      return;
    }

    setError("");
    setReading(null);
    setCards(drawCards(count));
    setStatus("drawn");
    requestAnimationFrame(() => {
      document.getElementById("card-table")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
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

  async function requestReading() {
    setStatus("reading");
    setError("");

    try {
      const response = await fetch("/api/reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.trim(),
          cards: cards.map(({ name, en, position, orientation, keywords }) => ({
            name,
            en,
            position,
            orientation,
            keywords,
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "解读暂时没有抵达");
      setReading(data.reading);
      setStatus("complete");
      requestAnimationFrame(() => {
        document.querySelector(".reading-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (requestError) {
      setError(requestError.message || "星光暂时被云层遮住了，请稍后再试。");
      setStatus("drawn");
    }
  }

  function reset() {
    setCards([]);
    setReading(null);
    setStatus("idle");
    setError("");
    document.getElementById("ask")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <main>
      <StarField />
      <nav className="nav-shell" aria-label="主导航">
        <a className="brand" href="#top" aria-label="Soluna 首页">
          <span className="brand-mark">◐</span>
          <span>SOLUNA</span>
        </a>
        <span className="nav-whisper">Between sun &amp; moon</span>
      </nav>

      <header className="hero" id="top">
        <div className="celestial-symbol" aria-hidden="true">
          <span className="sun-halo" />
          <span className="hero-moon">◐</span>
          <span className="tiny-star star-a">✦</span>
          <span className="tiny-star star-b">·</span>
          <span className="tiny-star star-c">✧</span>
        </div>
        <p className="eyebrow">A gentle light for your inner sky</p>
        <h1>
          向星光提问，
          <br />
          <em>听见内心的方向。</em>
        </h1>
        <p className="hero-copy">
          塔罗不是命运的判决，而是一面映照内心的镜子。
          <br />
          Soluna 陪你看见力量，找到可以向前的一小步。
        </p>
        <a className="hero-link" href="#ask">
          开始一次探索 <span>↓</span>
        </a>
      </header>

      <section className="ask-section" id="ask">
        <div className="section-heading">
          <span className="section-kicker">01 · 写下此刻</span>
          <h2>你想从哪里获得一点光？</h2>
          <p>可以谈谈关系、成长、工作或一个正在犹豫的选择。</p>
        </div>

        <form className="question-form" onSubmit={handleDraw}>
          <label htmlFor="question">你的问题</label>
          <div className="textarea-wrap">
            <textarea
              id="question"
              value={question}
              onChange={(event) => setQuestion(event.target.value.slice(0, 240))}
              placeholder="例如：面对最近的变化，我该如何找回自己的节奏？"
              rows="4"
            />
            <span>{question.length}/240</span>
          </div>

          <fieldset>
            <legend>选择牌阵</legend>
            <div className="count-options">
              {countOptions.map((option) => (
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
          </fieldset>

          {error && cards.length === 0 && <p className="form-error" role="alert">{error}</p>}
          <button className="primary-button" type="submit">
            <span>洗牌并抽取</span>
            <span aria-hidden="true">✦</span>
          </button>
        </form>
      </section>

      {cards.length > 0 && (
        <section className="card-table" id="card-table">
          <div className="section-heading centered">
            <span className="section-kicker">02 · 翻开星图</span>
            <h2>{allRevealed ? "牌面已经显现" : "凭直觉翻开每一张牌"}</h2>
            <p>{allRevealed ? "正位与逆位都不是好坏，而是不同角度的提醒。" : "慢一点，没有正确的顺序。"}</p>
          </div>

          <div className={`cards-grid cards-${cards.length}`}>
            {cards.map((card, index) => (
              <TarotCard key={`${card.id}-${index}`} card={card} index={index} onReveal={revealCard} />
            ))}
          </div>

          <div className="card-actions">
            {!allRevealed && (
              <button className="text-button" type="button" onClick={revealAll}>
                翻开全部
              </button>
            )}
            {allRevealed && status !== "complete" && (
              <button
                className="primary-button"
                type="button"
                onClick={requestReading}
                disabled={status === "reading"}
              >
                <span>{status === "reading" ? "正在聆听星图…" : "请 Soluna 为我解读"}</span>
                <span className={status === "reading" ? "spinner" : ""} aria-hidden="true">☾</span>
              </button>
            )}
          </div>
          {error && cards.length > 0 && <p className="form-error centered-error" role="alert">{error}</p>}
        </section>
      )}

      <Reading reading={reading} />

      {reading && (
        <div className="restart-wrap">
          <button className="text-button" type="button" onClick={reset}>
            开始新的探索 ↗
          </button>
        </div>
      )}

      <footer>
        <a className="brand footer-brand" href="#top">
          <span className="brand-mark">◐</span>
          <span>SOLUNA</span>
        </a>
        <p>愿你在日与月之间，看见自己的微光。</p>
        <small>仅用于自我探索与娱乐，不替代专业建议。</small>
      </footer>
    </main>
  );
}
