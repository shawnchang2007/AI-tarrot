const WORKERS_AI_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
const DEFAULT_DEEPSEEK_MODEL = "deepseek-v4-flash";

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
  const sharedKeywordsZh = [...new Set(cards.flatMap((card) => card.keywordsZh || []))].slice(0, 4);

  return {
    en: {
      summary: `These cards invite you to find your rhythm between ${sharedKeywords.slice(0, 2).join(" and ") || "awareness and action"}.`,
      connections: `${first.name} ${first.orientation.toLowerCase()} in “${first.position}” asks you to notice what needs care right now. ${last.name} ${last.orientation.toLowerCase()} in “${last.position}” gently turns your attention toward what you can choose. Upright and reversed are not good or bad—only different angles of reflection.`,
      encouragement: `You do not have to resolve every uncertainty inside “${question}” at once. The fact that you paused to ask means you are taking your feelings seriously, and that is already a meaningful first step.`,
      actions: [
        "Write down the one thing that matters most right now, then separate what you know from what you are assuming.",
        `Starting from “${sharedKeywords[0] || "gentle resolve"},” choose one small action you can complete today.`,
        "Give yourself a clear time to observe what changes, then adjust using what is actually happening.",
      ],
      reflection: "If you did not have to prove that your choice was right, what direction would you honestly want to explore?",
    },
    zh: {
      summary: `这些牌邀请你在${sharedKeywordsZh.slice(0, 2).join("与") || "觉察与行动"}之间，重新找到自己的节奏。`,
      connections: `${first.nameZh}${first.orientation === "Reversed" ? "逆位" : "正位"}落在“${first.positionZh}”，邀请你看见此刻最需要照顾的部分。${last.nameZh}${last.orientation === "Reversed" ? "逆位" : "正位"}位于“${last.positionZh}”，温柔地把注意力带回你仍然可以作出的选择。正位与逆位并非好坏之分，而是同一种能量的不同表达。`,
      encouragement: `你不必一次解决“${question}”里的所有不确定。愿意停下来认真发问，说明你正在尊重自己的感受；这本身就已经是一个有意义的开始。`,
      actions: [
        "写下此刻最重要的一件事，再把已经知道的事实与自己的猜测分开。",
        `从“${sharedKeywordsZh[0] || "温柔的坚定"}”出发，选择一件今天可以完成的小事。`,
        "为观察变化设定一个明确时间，再根据真实发生的情况调整下一步。",
      ],
      reflection: "如果不需要向任何人证明自己的选择是正确的，你真正想探索的方向是什么？",
    },
  };
}

function buildPrompt(question, cards, preferredLanguage) {
  const spread = cards
    .map(
      (card, index) =>
        `${index + 1}. Position: ${card.position} / ${card.positionZh}; card: ${card.name} / ${card.nameZh}; orientation: ${card.orientation}; keywords: ${card.keywords.join(", ")} / ${card.keywordsZh.join("、")}`,
    )
    .join("\n");

  return `The user's preferred interface language is ${preferredLanguage === "zh" ? "Simplified Chinese" : "English"}.

The user's question:
${question}

The spread:
${spread}

Connect the spread positions, card meanings, orientations, and relationships between the cards. Upright and reversed describe different ways an energy may be expressed; they do not mean simply good or bad.

Return the same reading in natural English and natural Simplified Chinese. The two versions must carry the same meaning and specificity. Return only a JSON object without a Markdown code fence:
{
  "en": {
    "summary": "a gentle and specific core theme in 12 words or fewer",
    "connections": "how the cards and positions connect, 90-150 words",
    "encouragement": "grounded encouragement tailored to the question, 60-100 words",
    "actions": ["specific small action 1", "specific small action 2", "specific small action 3"],
    "reflection": "one thoughtful question for continued reflection"
  },
  "zh": {
    "summary": "自然、具体、简洁的中文核心主题",
    "connections": "用自然简体中文说明牌与牌阵位置如何连接",
    "encouragement": "针对问题、克制而真诚的中文鼓励",
    "actions": ["具体可行的小行动 1", "具体可行的小行动 2", "具体可行的小行动 3"],
    "reflection": "一个值得继续思考的问题"
  }
}`;
}

function normalizeReading(reading) {
  if (!reading || typeof reading !== "object") return null;
  if (!reading.summary || !reading.encouragement) return null;
  return {
    summary: String(reading.summary),
    connections: String(reading.connections || ""),
    encouragement: String(reading.encouragement),
    actions: Array.isArray(reading.actions)
      ? reading.actions.slice(0, 3).map(String)
      : [],
    reflection: String(reading.reflection || ""),
  };
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
    const en = normalizeReading(parsed.en);
    const zh = normalizeReading(parsed.zh);
    return en && zh ? { en, zh } : null;
  } catch {
    return null;
  }
}

async function requestDeepSeek(env, systemPrompt, userPrompt) {
  const apiResponse = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: env.DEEPSEEK_MODEL || DEFAULT_DEEPSEEK_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      thinking: { type: "disabled" },
      temperature: 0.7,
      max_tokens: 1500,
    }),
  });

  if (!apiResponse.ok) {
    throw new Error(`DeepSeek returned ${apiResponse.status}`);
  }

  return apiResponse.json();
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
  const preferredLanguage = payload?.language === "zh" ? "zh" : "en";

  if (question.length < 4 || question.length > 240) {
    return response({
      error:
        preferredLanguage === "zh"
          ? "你的问题需要保持在 4 到 240 个字符之间。"
          : "Your question needs to be between 4 and 240 characters.",
    }, 400);
  }

  if (![1, 3, 5].includes(cards.length)) {
    return response({
      error:
        preferredLanguage === "zh"
          ? "请选择一张、三张或五张牌的牌阵。"
          : "Please choose a one-, three-, or five-card spread.",
    }, 400);
  }

  const safeCards = cards.map((card) => ({
    name: String(card?.name || "").slice(0, 30),
    nameZh: String(card?.nameZh || card?.name || "").slice(0, 30),
    en: String(card?.en || "").slice(0, 50),
    zh: String(card?.zh || "").slice(0, 50),
    position: String(card?.position || "").slice(0, 30),
    positionZh: String(card?.positionZh || card?.position || "").slice(0, 30),
    orientation: card?.orientation === "Reversed" ? "Reversed" : "Upright",
    keywords: Array.isArray(card?.keywords)
      ? card.keywords.slice(0, 4).map((keyword) => String(keyword).slice(0, 20))
      : [],
    keywordsZh: Array.isArray(card?.keywordsZh)
      ? card.keywordsZh.slice(0, 4).map((keyword) => String(keyword).slice(0, 20))
      : [],
  }));

  const systemPrompt = `You are Soluna, a warm, clear-minded bilingual tarot reflection guide who respects the user's autonomy.
Your purpose is not to predict the future. Use the cards to help the user organize their feelings, notice their resources, and find a small, realistic next step.
Follow these principles:
1. Write in natural, restrained, warm English and Simplified Chinese. Avoid literal translation, stiff wording, and vague spiritual clichés.
2. Never claim to know another person's private thoughts, promise that an event will happen, or create fear or dependence.
3. Never present tarot as a basis for medical, legal, financial, or other high-stakes decisions.
4. Explain the cards faithfully before connecting them to the question. Present interpretation as possibility, not fact.
5. Keep the user's agency central. Suggestions must be practical, gentle, and non-manipulative.`;
  const userPrompt = buildPrompt(question, safeCards, preferredLanguage);

  if (context.env?.DEEPSEEK_API_KEY) {
    try {
      const result = await requestDeepSeek(context.env, systemPrompt, userPrompt);
      const reading = parseModelReading(result);
      if (reading) {
        return response({ reading, source: "deepseek" });
      }
    } catch {
      // Continue to Workers AI or the deterministic fallback below.
    }
  }

  if (context.env?.AI) {
    try {
      const result = await context.env.AI.run(WORKERS_AI_MODEL, {
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            type: "object",
            properties: {
              en: {
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
              zh: {
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
            required: ["en", "zh"],
          },
        },
        temperature: 0.7,
        max_tokens: 1500,
      });

      const reading = parseModelReading(result);
      if (reading) {
        return response({ reading, source: "workers-ai" });
      }
    } catch {
      // Continue to the deterministic fallback below.
    }
  }

  return response({
    reading: createFallbackReading(question, safeCards),
    source: "card-meanings",
  });
}

export function onRequestGet() {
  return response({ status: "ok", service: "soluna-reading" });
}
