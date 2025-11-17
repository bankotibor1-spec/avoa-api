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

aapp.post('/chat', async (req, res) => {
  try {
    const { messages, systemPrompt } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      stream: true,
      messages: [
        ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
        ...messages
      ]
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let fullReply = "";

    for await (const chunk of completion) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        fullReply += delta;
        res.write(delta); // streamaj del
      }
    }

    res.end();

  } catch (err) {
    console.error(err);
    res.status(500).end("Error");
  }
});


// ✅ Dodamo ping endpoint
app.get("/", (req, res) => {
  res.send("🟢 Server is awake!");
});

// ✅ App start
app.listen(port, () => {
  console.log(`🚀 Avoa API is running on http://localhost:${port}`);
});
