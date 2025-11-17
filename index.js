
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

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
        ...messages
      ]
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(port, () => {
  console.log(`ðŸš€ Avoa API is running on http://localhost:${port}`);
});