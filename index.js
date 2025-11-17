require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json({ limit: '20mb' })); // povečana velikost za slike

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post('/chat', async (req, res) => {
  try {
    const { messages, systemPrompt } = req.body;

    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: "No messages provided." });
    }

    const openAIMessages = [
      ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
      ...messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    console.log("📤 Sending to OpenAI:", JSON.stringify(openAIMessages, null, 2));

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s

    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: openAIMessages,
      max_tokens: 1000,
      signal: controller.signal
    });

    clearTimeout(timeout);

    const reply = response.choices[0].message.content;
    console.log("✅ OpenAI reply:", reply);

    res.json({ reply });
  } catch (err) {
    console.error("❌ Server error (full):", err);
    res.status(500).json({ error: "Something went wrong." });
  }
});


// ✅ Wake-up ping endpoint
app.get("/", (req, res) => {
  res.send("🟢 Server is awake!");
});

app.listen(port, () => {
  console.log(`🚀 Avoa API is running on http://localhost:${port}`);
});
