require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post('/chat', async (req, res) => {
  try {
    const { messages, systemPrompt } = req.body;

    // ⛔️ Validacija: preveri da je "content" array z objekti, ne stringi
    const formattedMessages = messages.map(msg => {
      return {
        role: msg.role,
        content: msg.content.map(part => {
          if (part.type === "text") {
            return { type: "text", text: part.text };
          } else if (part.type === "image_url") {
            return {
              type: "image_url",
              image_url: { url: part.image_url.url }
            };
          }
        })
      };
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
        ...formattedMessages
      ]
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ✅ Ping endpoint za “wake-up”
app.get("/", (req, res) => {
  res.send("🟢 Server is awake!");
});

app.listen(port, () => {
  console.log(`🚀 Avoa API is running on http://localhost:${port}`);
});
