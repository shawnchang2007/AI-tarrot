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
    summary: `这组牌邀请你在“${sharedKeywords.slice(0, 2).join("与") || "觉察与行动"}”之间找到自己的节奏。`,
    connections: `${first.position}上的${first.name}${first.orientation}，提醒你先看见当下真正需要被照顾的部分；${last.position}上的${last.name}${last.orientation}，则把视线带向可以主动选择的方向。正位与逆位都不是好坏，而是不同角度的提醒。`,
    encouragement: `你不必一次解决“${question}”里的所有不确定。愿意停下来提问，本身就说明你正在认真对待自己的感受，也已经迈出了改变的第一步。`,
    actions: [
      `写下现在最让你在意的一件事，并区分“事实”和“我的猜测”。`,
      `从“${sharedKeywords[0] || "温柔坚定"}”出发，选择一个今天就能完成的小行动。`,
      `给自己一个观察期限，再根据真实变化调整方向。`,
    ],
    reflection: "如果不需要立刻证明自己做得对，你真正想选择的方向是什么？",
  };
}

function buildPrompt(question, cards) {
  const spread = cards
    .map(
      (card, index) =>
        `${index + 1}. 位置：${card.position}；牌：${card.name}（${card.en}）；方向：${card.orientation}；关键词：${card.keywords.join("、")}`,
    )
    .join("\n");

  return `用户的问题：
${question}

本次牌阵：
${spread}

请结合牌阵位置、牌义、正逆位以及牌与牌之间的关系来回应。正位与逆位代表能量呈现角度，不代表简单的好坏。输出必须是一个 JSON 对象，不要使用 Markdown 代码块，格式如下：
{
  "summary": "一句温柔但具体的核心主题，35字以内",
  "connections": "解释牌面之间的联系，120-220字",
  "encouragement": "贴合问题的鼓励，80-160字",
  "actions": ["具体可执行的小行动1", "具体可执行的小行动2", "具体可执行的小行动3"],
  "reflection": "一个帮助用户继续自我探索的问题"
}`;
}

function parseModelReading(result) {
  const content =
    result?.response ||
    result?.choices?.[0]?.message?.content ||
    result?.result?.response ||
    "";

  if (typeof content !== "string" || !content.trim()) return null;

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

  try {
    const parsed = JSON.parse(jsonText);
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
    return response({ error: "请求格式不正确。" }, 400);
  }

  const question = String(payload?.question || "").trim();
  const cards = Array.isArray(payload?.cards) ? payload.cards : [];

  if (question.length < 4 || question.length > 240) {
    return response({ error: "问题需要在 4 到 240 个字之间。" }, 400);
  }

  if (![1, 3, 5].includes(cards.length)) {
    return response({ error: "请选择一张、三张或五张牌。" }, 400);
  }

  const safeCards = cards.map((card) => ({
    name: String(card?.name || "").slice(0, 30),
    en: String(card?.en || "").slice(0, 50),
    position: String(card?.position || "").slice(0, 30),
    orientation: card?.orientation === "逆位" ? "逆位" : "正位",
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

  const systemPrompt = `你是 Soluna，一位温柔、清醒、尊重用户自主性的塔罗自我探索引导者。
你的目标不是预言未来，而是借助牌面帮助用户整理感受、发现资源并形成小而可行的下一步。
请遵守：
1. 使用自然、克制、温暖的简体中文，避免空泛套话。
2. 不断言他人的内心，不承诺事件必然发生，不制造恐惧或依赖。
3. 不把塔罗作为医疗、法律、投资或重大人生决策的依据。
4. 先忠实解释牌面，再结合用户问题；将推测表达为可能性。
5. 鼓励用户保留选择权，行动建议必须现实、温和、非操控性。`;

  try {
    const result = await context.env.AI.run(MODEL, {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: buildPrompt(question, safeCards) },
      ],
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
