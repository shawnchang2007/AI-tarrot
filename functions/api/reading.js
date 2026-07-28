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
  const sharedKeywords = [...new Set(cards.flatMap((card) => card.keywords || []))].slice(0, 4);
  const sharedKeywordsZh = [...new Set(cards.flatMap((card) => card.keywordsZh || []))].slice(0, 4);
  const primaryKeyword = sharedKeywords[0] || "gentle resolve";
  const primaryKeywordZh = sharedKeywordsZh[0] || "温柔的坚定";
  const cardConnectionsEn = cards
    .map((card) => {
      const keyword = card.keywords?.[0] || "awareness";
      const orientation =
        card.orientation === "Reversed"
          ? `Reversed, it does not signal failure; it suggests that ${keyword} is developing inwardly and can be strengthened with patient attention.`
          : `Upright, it shows that ${keyword} is a resource you can actively use now.`;
      return `${card.name} in “${card.position}” speaks directly to this question: ${orientation}`;
    })
    .join(" ");
  const cardConnectionsZh = cards
    .map((card) => {
      const keyword = card.keywordsZh?.[0] || "觉察";
      const orientation =
        card.orientation === "Reversed"
          ? `逆位并不代表失败，而是提醒你：${keyword}正在内在形成，可以通过耐心关注逐渐增强。`
          : `正位说明，${keyword}正是你此刻可以主动调用的力量。`;
      return `${card.nameZh}落在“${card.positionZh}”：针对这个问题，${orientation}`;
    })
    .join("");

  return {
    en: {
      summary: `For “${question},” the constructive way forward begins with ${primaryKeyword}.`,
      connections: `In direct response to “${question},” ${cardConnectionsEn} Together, the spread points toward possibility rather than a fixed outcome: the useful message is to recognize what is already within your influence and build from there.`,
      encouragement: `This question does not place you at a dead end. It shows that you care enough to look for a wiser response. You do not need perfect certainty before moving forward; your willingness to notice ${primaryKeyword} gives you a practical starting point, and small evidence of progress can help confidence grow.`,
      actions: [
        `Write one sentence beginning with “What I can influence in this question is…” and name one real choice.`,
        `Turn ${primaryKeyword} into one small action you can complete within the next 24 hours.`,
        "At the end of the day, record one piece of evidence that you handled the situation with more clarity or care.",
      ],
      reflection: `What would a hopeful but realistic next step for “${question}” look like if you trusted your ability to adjust along the way?`,
    },
    zh: {
      summary: `面对“${question}”，这些牌把积极的突破口指向${primaryKeywordZh}。`,
      connections: `紧扣“${question}”来看，${cardConnectionsZh}整组牌并没有把你推向一个固定结局，而是把注意力带回仍在你掌握之中的选择：先看见可以调用的力量，再从那里建立新的可能。`,
      encouragement: `这个问题并不是一条死路。你愿意认真面对它，本身就说明你拥有改变回应方式的能力。你不需要等到完全确定才开始行动；从${primaryKeywordZh}出发，哪怕只是获得一点真实的进展，也会帮助你重新建立信心。`,
      actions: [
        "写下一句“在这个问题里，我仍然能够影响的是……”，并填入一个真实选择。",
        `把${primaryKeywordZh}变成一件能在未来 24 小时内完成的小行动。`,
        "今天结束时，记录一条证据：你已经比之前更清晰或更温柔地处理了这件事。",
      ],
      reflection: `如果相信自己可以边走边调整，“${question}”最积极而现实的下一步会是什么？`,
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

THE USER'S EXACT QUESTION — this is the single center of the reading:
${question}

THE DRAWN SPREAD:
${spread}

NON-NEGOTIABLE QUESTION FOCUS:
- Directly answer the user's exact question. Do not turn it into a general life reading or a generic explanation of tarot.
- Every section must contain insight that is specific to this question. If the question were replaced with a different question, the reading should no longer make sense.
- Use the user's concrete situation, concern, or desired direction throughout. Do not merely repeat the question.
- Connect every drawn card, its spread position, and its orientation to a distinct part of the question.

CONSTRUCTIVE INTERPRETATION:
- Interpret every card from a supportive, forward-looking angle. Challenging cards and reversed cards must become useful signals about a strength to develop, a pattern to understand, a boundary to protect, an opportunity to notice, or a choice the user can make.
- You may acknowledge a difficulty briefly and honestly, but immediately show the constructive meaning and the user's available path forward.
- Positive does not mean making promises. Never guarantee a desired outcome or say that everything will certainly work out. Create grounded hope through agency, clarity, resources, and realistic action.
- Never use frightening, fatalistic, discouraging, shaming, or dependency-forming language.

CONTENT STANDARD:
- The summary must directly answer the question with one clear, hopeful core message.
- The connections section must synthesize the cards into a question-specific answer, not list isolated textbook meanings.
- The encouragement must name a real strength, resource, opportunity, or choice visible in this particular spread.
- Each action must begin with a clear verb, be achievable within 24 hours or this week, and directly help with the user's question.
- The reflection question must open a constructive next step and keep the user's agency central.
- Avoid vague spiritual clichés, generic reassurance, and empty positivity.

Return the same reading in natural English and natural Simplified Chinese. The two versions must carry the same meaning and specificity. Return only a JSON object without a Markdown code fence:
{
  "en": {
    "summary": "one direct, hopeful answer to the exact question in 18 words or fewer",
    "connections": "a tightly question-specific synthesis of every card and spread position, 110-180 words",
    "encouragement": "grounded positive guidance naming the user's real strength or opportunity, 60-100 words",
    "actions": ["question-specific action beginning with a verb", "question-specific action beginning with a verb", "question-specific action beginning with a verb"],
    "reflection": "one constructive question that increases agency"
  },
  "zh": {
    "summary": "一句直接回答用户原问题、积极而不空泛的核心信息",
    "connections": "紧扣原问题，综合说明每张牌、牌位和正逆位如何共同给出正向答案",
    "encouragement": "指出这副牌中与原问题直接相关的真实力量、资源、机会或选择",
    "actions": ["以动词开头、直接帮助原问题的具体行动", "以动词开头、直接帮助原问题的具体行动", "以动词开头、直接帮助原问题的具体行动"],
    "reflection": "一个能够增加主动性并打开积极下一步的问题"
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
      temperature: 0.55,
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

  const systemPrompt = `You are Soluna, a warm, clear-minded bilingual tarot reflection guide.
Your sole task is to answer the user's exact question through the drawn cards from a constructive, empowering perspective.

NON-NEGOTIABLE PRINCIPLES:
1. QUESTION FIRST. Stay tightly anchored to the user's original question in every section. Never drift into a broad life reading, a generic tarot lesson, or unrelated advice.
2. CONSTRUCTIVE LENS. Interpret every card—including traditionally challenging or reversed cards—as a useful path toward clarity, growth, protection, resilience, opportunity, choice, or practical improvement.
3. GROUNDED POSITIVITY. Acknowledge real difficulty without dwelling on it, then clearly identify what can help. Do not use empty reassurance such as “everything will be fine.”
4. CARD-BASED REASONING. Use every drawn card, its position, orientation, and relationship to the other cards. Do not paste disconnected card definitions.
5. USER AGENCY. Keep the user's strengths, choices, resources, and achievable next steps at the center. Every paragraph should leave the user with more clarity, hope, or ability to act.
6. HONESTY. Tarot is a reflection tool, not a prediction. Never claim to know another person's private thoughts, guarantee an outcome, or create fear, shame, fatalism, or dependence.
7. SAFETY. Never present tarot as a basis for medical, legal, financial, or other high-stakes decisions.
8. BILINGUAL QUALITY. Write natural, specific English and natural Simplified Chinese with equivalent meaning. Avoid literal translation, stiff wording, vague spiritual clichés, and generic encouragement.

Before returning the JSON, verify silently that every section directly helps answer this exact question, every card is used, and every difficult symbol has been translated into a realistic constructive insight.`;
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
        temperature: 0.55,
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
