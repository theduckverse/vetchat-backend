import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (req, res) => {
  res.send("VetChat backend is online 🪖");
});

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message required" });

    const text = message.toLowerCase();

    // 🆘 --- CRISIS / SELF-HARM ---
    const crisisPatterns = [
      /\bsuicid(e|al)\b/,
      /\bkill myself\b/,
      /\bwant to die\b/,
      /\bend it all\b/,
      /\bhurt myself\b/,
      /\btake my life\b/,
      /\bcan't go on\b/,
      /\bself[\s-]?harm\b/,
      /\bhopeless\b/,
      /\bworthless\b/,
    ];

    if (crisisPatterns.some((regex) => regex.test(text))) {
      return res.json({
        reply:
          "⚠️ I'm really concerned about how you're feeling. You're not alone.\n\n" +
          "🇺🇸 **Veterans Crisis Line:** Dial **988**, then press **1**\n" +
          "💬 Chat online: https://www.veteranscrisisline.net/get-help-now/chat/\n" +
          "📱 Text **838255** to reach a trained responder 24/7.\n\n" +
          "Help is always available — you deserve support and safety.",
      });
    }

    // 🍃 --- SUBSTANCE USE / ALCOHOL / DRUGS ---
    const substancePatterns = [
      /\balcohol\b/,
      /\bdrunk\b/,
      /\bdrinking\b/,
      /\bdrugs?\b/,
      /\baddict(ed|ion)?\b/,
      /\busing again\b/,
      /\brelapse\b/,
      /\bdetox\b/,
      /\brehab\b/,
      /\bsober( living)?\b/,
    ];

    if (substancePatterns.some((regex) => regex.test(text))) {
      return res.json({
        reply:
          "🍃 It sounds like you might be dealing with alcohol or substance challenges.\n\n" +
          "You can contact the **VA Substance Use Helpline** at **1-800-273-8255 (Press 1)**\n" +
          "or visit https://www.mentalhealth.va.gov/substance-abuse/index.asp\n\n" +
          "They offer confidential treatment programs and peer support for Veterans.",
      });
    }

    // 🏠 --- HOUSING / HOMELESSNESS ---
    const housingPatterns = [
      /\bhomeless\b/,
      /\bhomelessness\b/,
      /\bhousing\b/,
      /\bshelter\b/,
      /\bno place\b/,
      /\bno where\b/,
      /\bnowhere to (go|stay)\b/,
      /\bsleep(ing)? outside\b/,
      /\bneed (a )?home\b/,
      /\btemporary housing\b/,
      /\beviction\b/,
    ];

    if (housingPatterns.some((regex) => regex.test(text))) {
      return res.json({
        reply:
          "🏠 For housing or shelter support:\n\n" +
          "• **VA Homeless Programs:** https://www.va.gov/homeless\n" +
          "• **National Call Center for Homeless Veterans:** 1-877-424-3838 (available 24/7)\n\n" +
          "They can help you find local shelters, transitional housing, or rental assistance.",
      });
    }

    // 💼 --- BENEFITS / CLAIMS ---
    const benefitsPatterns = [
      /\bbenefit(s)?\b/,
      /\bclaim(s)?\b/,
      /\bdisability\b/,
      /\bcompensation\b/,
      /\bgi bill\b/,
      /\bfile (a )?claim\b/,
      /\bva help\b/,
      /\bva application\b/,
      /\bservice connected\b/,
      /\beducation benefit(s)?\b/,
      /\bpension\b/,
    ];

    if (benefitsPatterns.some((regex) => regex.test(text))) {
      return res.json({
        reply:
          "💼 For VA benefits and claims assistance:\n\n" +
          "• Visit https://www.va.gov or call **1-800-827-1000**\n" +
          "• For GI Bill & education benefits: https://www.va.gov/education/\n\n" +
          "They can guide you on claims, disability compensation, and educational programs.",
      });
    }

    // 🧰 --- EMPLOYMENT / JOBS ---
    const jobPatterns = [
      /\bjob(s)?\b/,
      /\bemployment\b/,
      /\bcareer(s)?\b/,
      /\bwork\b/,
      /\bhiring\b/,
      /\bresume\b/,
      /\bneed a job\b/,
      /\blooking for work\b/,
      /\btransition(ing)? out\b/,
    ];

    if (jobPatterns.some((regex) => regex.test(text))) {
      return res.json({
        reply:
          "🧰 Looking for employment or career support?\n\n" +
          "• **VA Veterans Employment Center:** https://www.va.gov/careers-employment/\n" +
          "• **Hire Heroes USA:** https://www.hireheroesusa.org/\n" +
          "• **Veteran Readiness & Employment (VR&E):** https://www.va.gov/careers-employment/vre/\n\n" +
          "They offer resume help, job listings, and career transition guidance.",
      });
    }

    // 🧠 --- NORMAL AI RESPONSE (if no keyword matched) ---
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: message }],
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

    // Send to OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: message }],
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`VetChat backend running on port ${PORT}`));
