// Cloudflare Worker: a small, safe backend for the AI Guide.
// Your Anthropic API key stays here as a secret, never in the website files.
const SYSTEM = `You are a friendly English teacher for beginners whose first language is Urdu.
Explain any concept simply. Reply mainly in Roman Urdu, and always show English words and example sentences in English.
Keep answers short (under 150 words), with 1-2 easy examples. If a question is not about learning or using English, politely bring the student back to English.`;

export default {
  async fetch(req, env) {
    const origin = env.ALLOWED_ORIGIN || "*";
    const cors = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    const reply = (obj, status = 200) =>
      new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json" } });

    if (req.method === "OPTIONS") return new Response(null, { headers: cors });
    if (req.method !== "POST") return reply({ error: "POST only" }, 405);

    let body;
    try { body = await req.json(); } catch { return reply({ error: "Bad request" }, 400); }

    const question = String(body.question || "").slice(0, 500).trim();
    if (!question) return reply({ error: "Empty question" }, 400);

    const history = (Array.isArray(body.history) ? body.history : [])
      .slice(-8)
      .filter(m => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .map(m => ({ role: m.role, content: m.content.slice(0, 800) }));

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-5-5",
        max_tokens: 400,
        system: SYSTEM,
        messages: [...history, { role: "user", content: question }],
      }),
    });
    if (!r.ok) return reply({ error: "AI service error" }, 502);
    const data = await r.json();
    const answer = (data.content || []).map(c => c.text || "").join("").trim();
    return reply({ answer });
  },
};
