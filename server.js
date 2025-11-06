const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { Configuration, OpenAIApi } = require("openai");

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
);

app.get("/", (req, res) => {
  res.send("VetChat backend is online 🪖");
});

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) return res.status(400).json({ error: "Message required" });

    // Keyword triggers
    if (message.toLowerCase().includes("housing")) {
      return res.json({
        reply:
          "🏠 You can reach Veterans Housing Support at https://www.va.gov/homeless or call 1-877-424-3838.",
      });
    }

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message }],
    });

    const reply = completion.data.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PO
