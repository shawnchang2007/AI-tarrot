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
  const cardInsightsEn = cards.map((card) => {
    const keywords = card.keywords?.length
      ? card.keywords
      : ["awareness", "choice", "steady growth"];
    const keywordList = keywords.join(", ");
    const orientationMeaning =
      card.orientation === "Reversed"
        ? `In its reversed direction, these qualities may be quieter, delayed, overextended, or asking to be rebuilt from within. This is not a negative verdict; it is an invitation to notice where the energy needs patience, balance, or a more personal expression.`
        : `Upright, these qualities are available more openly. The card invites you to recognize them as active resources rather than waiting for outside certainty.`;

    return {
      card: card.name,
      meaning: `${card.name} carries the core themes of ${keywordList}. ${orientationMeaning}`,
      connection: `In the spread position “${card.position},” this card speaks to “${question}” by highlighting ${keywords[0]} as a practical part of the answer. It suggests looking for one place where you can express this quality now, then using what you learn to make the next decision with more clarity and self-trust.`,
      guidance: `Work with ${keywords[0]} through one small, observable choice instead of demanding a perfect answer all at once.`,
    };
  });
  const cardInsightsZh = cards.map((card) => {
    const keywords = card.keywordsZh?.length
      ? card.keywordsZh
      : ["觉察", "选择", "稳步成长"];
    const keywordList = keywords.join("、");
    const orientationMeaning =
      card.orientation === "Reversed"
        ? `逆位表示这些力量可能暂时更内敛、受阻、失衡，或需要从内在重新建立。它不是负面的判决，而是在提醒你：这股能量需要更多耐心、界限或更适合自己的表达方式。`
        : `正位表示这些力量正较为清晰地向你开放，可以把它们视为此刻能够主动使用的资源，而不必等待外界先给出确定答案。`;

    return {
      card: card.nameZh,
      meaning: `${card.nameZh}的核心象征包含${keywordList}。${orientationMeaning}`,
      connection: `它落在“${card.positionZh}”这个位置，回应“${question}”时，重点是把${keywords[0]}看成答案中可以实际运用的一部分。你可以先找出一个当下能够表达这股力量的地方，再用得到的真实反馈，帮助自己更清晰、更相信自己地作出下一步选择。`,
      guidance: `把${keywords[0]}落实成一个看得见的小选择，不必要求自己一次就得到完美答案。`,
    };
  });

  return {
    en: {
      summary: `For “${question},” the constructive way forward begins with ${primaryKeyword}.`,
      cardInsights: cardInsightsEn,
      connections: `Read together, the spread answers “${question}” as a progression rather than a fixed prediction. The first card names what deserves your attention, the middle of the spread shows the inner resource or adjustment that can help, and the final position turns that understanding toward movement. The repeated themes of ${sharedKeywords.join(", ") || primaryKeyword} suggest that your most useful path is to work with what is already within your influence, gather real feedback, and let clarity grow through action rather than pressure.`,
      encouragement: `This question does not place you at a dead end. Your willingness to examine it already shows care, discernment, and the capacity to respond differently. The cards do not require perfect certainty from you. They point to ${primaryKeyword} as a starting resource: use it in a modest, observable way, notice what changes, and allow that evidence to strengthen your confidence step by step.`,
      actions: [
        `Write one sentence beginning with “What I can influence in this question is…” and name one real choice.`,
        `Turn ${primaryKeyword} into one small action you can complete within the next 24 hours.`,
        "At the end of the day, record one piece of evidence that you handled the situation with more clarity or care.",
      ],
      reflection: `What would a hopeful but realistic next step for “${question}” look like if you trusted your ability to adjust along the way?`,
    },
    zh: {
      summary: `面对“${question}”，这些牌把积极的突破口指向${primaryKeywordZh}。`,
      cardInsights: cardInsightsZh,
      connections: `把这些牌放在一起看，它们并不是在为“${question}”宣布一个固定结局，而是在呈现一条可以逐步理解和行动的路径。前面的牌指出最值得正视的部分，中间的牌提醒你已经拥有的资源或需要调整的方式，最后的位置则把理解带向行动。${sharedKeywordsZh.join("、") || primaryKeywordZh}这些反复出现的主题说明，答案不必来自一次性的确定，而可以从你仍然能够影响的地方开始，在真实反馈中逐渐变得清晰。`,
      encouragement: `这个问题并不是一条死路。你愿意认真面对它，本身就说明你拥有觉察、判断和改变回应方式的能力。牌面没有要求你先获得百分之百的确定，而是把${primaryKeywordZh}放在你面前，作为一个可以立即使用的起点。先把它落实在一个小而真实的选择里，再让得到的证据一步步帮助你建立信心。`,
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
- Include a cardInsights array with exactly one item for every drawn card, in the same order as the spread.
- For every card, first explain its core symbolic meaning and how upright or reversed changes that meaning. This must teach the user what the card means without becoming a generic tarot lecture.
- Then explain how that exact card, orientation, and spread position speaks to the user's exact question. Give each card a distinct role; do not repeat the same interpretation across cards.
- End each card insight with one concise, constructive way the user can work with that card's energy.
- The connections section must then synthesize the whole spread into a detailed, question-specific answer rather than repeating the individual explanations.
- The encouragement must name a real strength, resource, opportunity, or choice visible in this particular spread.
- Each action must begin with a clear verb, be achievable within 24 hours or this week, and directly help with the user's question.
- The reflection question must open a constructive next step and keep the user's agency central.
- Avoid vague spiritual clichés, generic reassurance, and empty positivity.

Return the same reading in natural English and natural Simplified Chinese. The two versions must carry the same meaning and specificity. Return only a JSON object without a Markdown code fence:
{
  "en": {
    "summary": "one direct, hopeful answer to the exact question in 25 words or fewer",
    "cardInsights": [
      {
        "card": "the exact English card name",
        "meaning": "45-75 words explaining the card's core symbolism and the effect of its orientation",
        "connection": "55-90 words explaining this card's distinct role in the spread and how it directly answers the exact question",
        "guidance": "one concise constructive sentence for working with this card"
      }
    ],
    "connections": "a detailed, tightly question-specific synthesis of how the full spread works together, 140-220 words",
    "encouragement": "grounded positive guidance naming the user's real strength or opportunity, 80-130 words",
    "actions": ["question-specific action beginning with a verb", "question-specific action beginning with a verb", "question-specific action beginning with a verb"],
    "reflection": "one constructive question that increases agency"
  },
  "zh": {
    "summary": "一句直接回答用户原问题、积极而不空泛的核心信息",
    "cardInsights": [
      {
        "card": "对应的中文牌名",
        "meaning": "具体解释这张牌的核心象征，以及正位或逆位如何改变表达，约80至130个汉字",
        "connection": "说明它所在的牌位如何独立而具体地回应用户原问题，约90至150个汉字",
        "guidance": "一句简洁、积极而现实的运用建议"
      }
    ],
    "connections": "紧扣原问题，详细综合所有牌、牌位和正逆方向如何共同构成答案，约220至360个汉字",
    "encouragement": "指出这副牌中与原问题直接相关的真实力量、资源、机会或选择，约130至220个汉字",
    "actions": ["以动词开头、直接帮助原问题的具体行动", "以动词开头、直接帮助原问题的具体行动", "以动词开头、直接帮助原问题的具体行动"],
    "reflection": "一个能够增加主动性并打开积极下一步的问题"
  }
}`;
}

function normalizeCardInsight(insight) {
  if (!insight || typeof insight !== "object") return null;
  if (!insight.meaning || !insight.connection) return null;
  return {
    card: String(insight.card || ""),
    meaning: String(insight.meaning),
    connection: String(insight.connection),
    guidance: String(insight.guidance || ""),
  };
}

function normalizeReading(reading, expectedCardCount) {
  if (!reading || typeof reading !== "object") return null;
  if (!reading.summary || !reading.encouragement) return null;
  const cardInsights = Array.isArray(reading.cardInsights)
    ? reading.cardInsights.map(normalizeCardInsight).filter(Boolean)
    : [];
  if (cardInsights.length !== expectedCardCount) return null;
  return {
    summary: String(reading.summary),
    cardInsights,
    connections: String(reading.connections || ""),
    encouragement: String(reading.encouragement),
    actions: Array.isArray(reading.actions)
      ? reading.actions.slice(0, 3).map(String)
      : [],
    reflection: String(reading.reflection || ""),
  };
}

function parseModelReading(result, expectedCardCount) {
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
    const en = normalizeReading(parsed.en, expectedCardCount);
    const zh = normalizeReading(parsed.zh, expectedCardCount);
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
      temperature: 0.48,
      max_tokens: 4000,
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
      const reading = parseModelReading(result, safeCards.length);
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
                  cardInsights: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        card: { type: "string" },
                        meaning: { type: "string" },
                        connection: { type: "string" },
                        guidance: { type: "string" },
                      },
                      required: ["card", "meaning", "connection", "guidance"],
                    },
                    minItems: safeCards.length,
                    maxItems: safeCards.length,
                  },
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
                required: ["summary", "cardInsights", "connections", "encouragement", "actions", "reflection"],
              },
              zh: {
                type: "object",
                properties: {
                  summary: { type: "string" },
                  cardInsights: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        card: { type: "string" },
                        meaning: { type: "string" },
                        connection: { type: "string" },
                        guidance: { type: "string" },
                      },
                      required: ["card", "meaning", "connection", "guidance"],
                    },
                    minItems: safeCards.length,
                    maxItems: safeCards.length,
                  },
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
                required: ["summary", "cardInsights", "connections", "encouragement", "actions", "reflection"],
              },
            },
            required: ["en", "zh"],
          },
        },
        temperature: 0.48,
        max_tokens: 4000,
      });

      const reading = parseModelReading(result, safeCards.length);
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
