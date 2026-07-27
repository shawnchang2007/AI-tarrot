import { useMemo, useState } from "react";
import { drawCards } from "./data/tarot";

const countOptions = [
  { value: 1, label: "One card", hint: "A quick reflection" },
  { value: 3, label: "Three cards", hint: "See · Understand · Act" },
  { value: 5, label: "Five cards", hint: "A deeper exploration" },
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

const cardRealms = {
  "Major Arcana": {
    key: "major",
    realm: "Aether · Archetype",
    accent: "#f2d69b",
    glow: "#9c78d8",
    marker: "✦",
  },
  Wands: {
    key: "wands",
    realm: "Fire · Will",
    accent: "#f2bd78",
    glow: "#d56858",
    marker: "✺",
  },
  Cups: {
    key: "cups",
    realm: "Water · Feeling",
    accent: "#a7dcf0",
    glow: "#547fc4",
    marker: "☽",
  },
  Swords: {
    key: "swords",
    realm: "Air · Mind",
    accent: "#d4d9f6",
    glow: "#7798db",
    marker: "✧",
  },
  Pentacles: {
    key: "pentacles",
    realm: "Earth · Form",
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

function TarotCard({ card, index, onReveal }) {
  const visual = getCardVisual(card);

  return (
    <button
      className={`tarot-card card-realm-${visual.key} ${card.revealed ? "is-revealed" : ""}`}
      type="button"
      onClick={() => onReveal(index)}
      aria-label={card.revealed ? `${card.name}, ${card.orientation}` : `Reveal card ${index + 1}`}
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
          <span className="back-motto">AS ABOVE · SO WITHIN</span>
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
              <span className="celestial-emblem">
                <span className="emblem-halo" />
                <span className="emblem-glyph">{card.glyph}</span>
              </span>
              <span className="realm-caption">{visual.realm}</span>
            </span>
            <span className="card-nameplate">
              <span className="card-title">{card.name}</span>
              <span className="card-title-en">{card.en}</span>
            </span>
          </span>
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
      <div className="section-kicker">A message from your inner sky</div>
      <h2>{reading.summary || "You already carry the strength to move forward"}</h2>
      <div className="reading-grid">
        <article>
          <span className="reading-icon">☾</span>
          <h3>How the cards connect</h3>
          <p>{reading.connections}</p>
        </article>
        <article>
          <span className="reading-icon">✦</span>
          <h3>A little encouragement</h3>
          <p>{reading.encouragement}</p>
        </article>
      </div>
      {reading.actions?.length > 0 && (
        <div className="action-list">
          <h3>Small steps you can try</h3>
          <ol>
            {reading.actions.map((action, index) => (
              <li key={`${action}-${index}`}>{action}</li>
            ))}
          </ol>
        </div>
      )}
      {reading.reflection && (
        <blockquote>
          <span>A question to carry with you</span>
          {reading.reflection}
        </blockquote>
      )}
      <p className="reading-note">
        Soluna is a space for reflection and encouragement, not a certain prediction of the future.
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
      setError("Share a little more so Soluna can better understand what is on your mind.");
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
      if (!response.ok) throw new Error(data.error || "Your reading could not arrive just yet.");
      setReading(data.reading);
      setStatus("complete");
      requestAnimationFrame(() => {
        document.querySelector(".reading-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (requestError) {
      setError(requestError.message || "The stars are behind the clouds for a moment. Please try again.");
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
      <nav className="nav-shell" aria-label="Main navigation">
        <a className="brand" href="#top" aria-label="Soluna home">
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
          Ask the stars within,
          <br />
          <em>hear where your heart is leading.</em>
        </h1>
        <p className="hero-copy">
          Tarot is not a verdict on your future. It is a mirror for what is already moving within you.
          <br />
          Soluna helps you notice your strength and find one gentle step forward.
        </p>
        <a className="hero-link" href="#ask">
          Begin a reflection <span>↓</span>
        </a>
      </header>

      <section className="ask-section" id="ask">
        <div className="section-heading">
          <span className="section-kicker">01 · Name this moment</span>
          <h2>Where could you use a little light?</h2>
          <p>Ask about a relationship, your growth, your work, or a choice you have been holding.</p>
        </div>

        <form className="question-form" onSubmit={handleDraw}>
          <label htmlFor="question">Your question</label>
          <div className="textarea-wrap">
            <textarea
              id="question"
              value={question}
              onChange={(event) => setQuestion(event.target.value.slice(0, 240))}
              placeholder="For example: How can I find my rhythm again while everything is changing?"
              rows="4"
            />
            <span>{question.length}/240</span>
          </div>

          <fieldset>
            <legend>Choose a spread</legend>
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
            <span>Shuffle and draw</span>
            <span aria-hidden="true">✦</span>
          </button>
        </form>
      </section>

      {cards.length > 0 && (
        <section className="card-table" id="card-table">
          <div className="section-heading centered">
            <span className="section-kicker">02 · Reveal the constellation</span>
            <h2>{allRevealed ? "Your cards are revealed" : "Turn each card when it feels right"}</h2>
            <p>{allRevealed ? "Upright and reversed are not good or bad—only different angles of reflection." : "Take your time. There is no right order."}</p>
          </div>

          <div className={`cards-grid cards-${cards.length}`}>
            {cards.map((card, index) => (
              <TarotCard key={`${card.id}-${index}`} card={card} index={index} onReveal={revealCard} />
            ))}
          </div>

          <div className="card-actions">
            {!allRevealed && (
              <button className="text-button" type="button" onClick={revealAll}>
                Reveal all
              </button>
            )}
            {allRevealed && status !== "complete" && (
              <button
                className="primary-button"
                type="button"
                onClick={requestReading}
                disabled={status === "reading"}
              >
                <span>{status === "reading" ? "Listening to the constellation…" : "Ask Soluna to reflect"}</span>
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
            Begin a new reflection ↗
          </button>
        </div>
      )}

      <footer>
        <a className="brand footer-brand" href="#top">
          <span className="brand-mark">◐</span>
          <span>SOLUNA</span>
        </a>
        <p>Between sun and moon, may you notice your own quiet light.</p>
        <small>For reflection and entertainment only. Not a substitute for professional advice.</small>
      </footer>
    </main>
  );
}
