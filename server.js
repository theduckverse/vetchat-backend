import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Configuration, OpenAIApi } from "openai";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
}));

app.get("/", (req, res) => {
  res.send("VetChat backend is online 🪖");
});

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    // Add keyword detection here
    if (message.toLowerCase().includes("housing")) {
      return res.json({ reply: "You can reach Veterans Housing Support at https://www.va.gov/homeless or call 1-877-424-3838." });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: message }],
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(10000, () => console.log("VetChat backend running on port 10000"));
