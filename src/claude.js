const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.MIMO_API_KEY,
  baseURL: process.env.MIMO_BASE_URL,
});

async function chat(userMessage) {
  const response = await client.chat.completions.create({
    model: process.env.MIMO_MODEL || "mimo-v2.5-pro",
    max_tokens: 4096,
    messages: [{ role: "user", content: userMessage }],
  });

  return response.choices[0].message.content;
}

module.exports = { chat };
