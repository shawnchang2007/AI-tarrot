const MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};

function response(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

function createFallbackReading(question, cards) {
  const first = cards[0];
  const last = cards[cards.length - 1];
  const sharedKeywords = [...new Set(cards.flatMap((card) => card.keywords || []))].slice(0, 4);

  return {
    summary: `These cards invite you to find your rhythm between ${sharedKeywords.slice(0, 2).join(" and ") || "awareness and action"}.`,
    connections: `${first.name} ${first.orientation.toLowerCase()} in “${first.position}” asks you to notice what needs care right now. ${last.name} ${last.orientation.toLowerCase()} in “${last.position}” gently turns your attention toward what you can choose. Upright and reversed are not good or bad—only different angles of reflection.`,
    encouragement: `You do not have to resolve every uncertainty inside “${question}” at once. The fact that you paused to ask means you are taking your feelings seriously, and that is already a meaningful first step.`,
    actions: [
      `Write down the one thing that matters most right now, then separate what you know from what you are assuming.`,
      `Starting from “${sharedKeywords[0] || "gentle resolve"},” choose one small action you can complete today.`,
      `Give yourself a clear time to observe what changes, then adjust using what is actually happening.`,
    ],
    reflection: "If you did not have to prove that your choice was right, what direction would you honestly want to explore?",
  };
}

function buildPrompt(question, cards) {
  const spread = cards
    .map(
      (card, index) =>
        `${index + 1}. Position: ${card.position}; card: ${card.name} (${card.en}); orientation: ${card.orientation}; keywords: ${card.keywords.join(", ")}`,
    )
    .join("\n");

  return `The user's question:
${question}

The spread:
${spread}

Connect the spread positions, card meanings, orientations, and relationships between the cards. Upright and reversed describe different ways an energy may be expressed; they do not mean simply good or bad. Return only a JSON object without a Markdown code fence:
{
  "summary": "a gentle and specific core theme in 12 words or fewer",
  "connections": "how the cards and positions connect, 90-150 words",
  "encouragement": "grounded encouragement tailored to the question, 60-100 words",
  "actions": ["specific small action 1", "specific small action 2", "specific small action 3"],
  "reflection": "one thoughtful question for continued reflection"
}`;
}

function parseModelReading(result) {
  const content =
    result?.response ||
    result?.choices?.[0]?.message?.content ||
    result?.result?.response ||
    "";

  try {
    let parsed = content;
    if (typeof content === "string") {
      if (!content.trim()) return null;
      const cleaned = content
        .trim()
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/, "");
      const objectStart = cleaned.indexOf("{");
      const objectEnd = cleaned.lastIndexOf("}");
      const jsonText =
        objectStart >= 0 && objectEnd > objectStart
          ? cleaned.slice(objectStart, objectEnd + 1)
          : cleaned;
      parsed = JSON.parse(jsonText);
    }

    if (!parsed || typeof parsed !== "object") return null;
    if (!parsed.summary || !parsed.encouragement) return null;
    return {
      summary: String(parsed.summary),
      connections: String(parsed.connections || ""),
      encouragement: String(parsed.encouragement),
      actions: Array.isArray(parsed.actions)
        ? parsed.actions.slice(0, 3).map(String)
        : [],
      reflection: String(parsed.reflection || ""),
    };
  } catch {
    return null;
  }
}

export async function onRequestPost(context) {
  let payload;

  try {
    payload = await context.request.json();
  } catch {
    return response({ error: "The request format is not valid." }, 400);
  }

  const question = String(payload?.question || "").trim();
  const cards = Array.isArray(payload?.cards) ? payload.cards : [];

  if (question.length < 4 || question.length > 240) {
    return response({ error: "Your question needs to be between 4 and 240 characters." }, 400);
  }

  if (![1, 3, 5].includes(cards.length)) {
    return response({ error: "Please choose a one-, three-, or five-card spread." }, 400);
  }

  const safeCards = cards.map((card) => ({
    name: String(card?.name || "").slice(0, 30),
    en: String(card?.en || "").slice(0, 50),
    position: String(card?.position || "").slice(0, 30),
    orientation: card?.orientation === "Reversed" ? "Reversed" : "Upright",
    keywords: Array.isArray(card?.keywords)
      ? card.keywords.slice(0, 4).map((keyword) => String(keyword).slice(0, 20))
      : [],
  }));

  if (!context.env?.AI) {
    return response({
      reading: createFallbackReading(question, safeCards),
      source: "card-meanings",
    });
  }

  const systemPrompt = `You are Soluna, a warm, clear-minded tarot reflection guide who respects the user's autonomy.
Your purpose is not to predict the future. Use the cards to help the user organize their feelings, notice their resources, and find a small, realistic next step.
Follow these principles:
1. Write in natural, restrained, warm English. Avoid vague spiritual clichés.
2. Never claim to know another person's private thoughts, promise that an event will happen, or create fear or dependence.
3. Never present tarot as a basis for medical, legal, financial, or other high-stakes decisions.
4. Explain the cards faithfully before connecting them to the question. Present interpretation as possibility, not fact.
5. Keep the user's agency central. Suggestions must be practical, gentle, and non-manipulative.`;

  try {
    const result = await context.env.AI.run(MODEL, {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: buildPrompt(question, safeCards) },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            connections: { type: "string" },
            encouragement: { type: "string" },
            actions: {
              type: "array",
              items: { type: "string" },
              minItems: 3,
              maxItems: 3,
            },
            reflection: { type: "string" },
          },
          required: ["summary", "connections", "encouragement", "actions", "reflection"],
        },
      },
      temperature: 0.7,
      max_tokens: 900,
    });

    const reading = parseModelReading(result);
    return response({
      reading: reading || createFallbackReading(question, safeCards),
      source: reading ? "workers-ai" : "ai-unparsed",
    });
  } catch {
    return response({
      reading: createFallbackReading(question, safeCards),
      source: "ai-error",
    });
  }
}

export function onRequestGet() {
  return response({ status: "ok", service: "soluna-reading" });
}
