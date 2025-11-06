import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import fetch from "node-fetch"; // 👈 Added for API calls

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (req, res) => {
  res.send("VetChat backend is online 🪖");
});

// 🧠 Chat with location-aware responses
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message required" });

    const text = message.toLowerCase();

    // --- Detect ZIP or City ---
    const zipMatch = text.match(/\b\d{5}\b/);
    const cityMatch = text.match(/\bin\s([a-zA-Z\s]+?)(\.|,|$)/);

    // --- If user sent a ZIP or City ---
    if (zipMatch || cityMatch) {
      const location = zipMatch ? zipMatch[0] : cityMatch[1].trim();

      // Step 1: Convert to latitude/longitude
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          location
        )}&format=json&limit=1`
      );
      const geoData = await geoRes.json();

      if (geoData.length > 0) {
        const { lat, lon, display_name } = geoData[0];

        // Step 2: Get nearby VA facilities (within ~50 miles)
        const vaRes = await fetch(
          `https://sandbox-api.va.gov/services/va_facilities/v0/facilities?latitude=${lat}&longitude=${lon}&radius=50`,
          {
            headers: {
              "User-Agent": "VetChatApp",
            },
          }
        );
        const vaData = await vaRes.json();

        const facilities =
          vaData.data?.slice(0, 5).map((f) => {
            const name = f.attributes.name;
            const phone = f.attributes.phone?.main || "N/A";
            const url = f.attributes.website || "https://www.va.gov/find-locations";
            return `🏥 **${name}**\n📞 ${phone}\n🔗 ${url}`;
          }) || [];

        const reply =
          facilities.length > 0
            ? `📍 **Nearby VA Resources near ${display_name}:**\n\n${facilities.join(
                "\n\n"
              )}`
            : `📍 I found your location (${display_name}), but I couldn’t locate nearby VA centers right now. Try https://www.va.gov/find-locations`;

        return res.json({ reply });
      } else {
        return res.json({
          reply: `I couldn’t locate "${location}". Could you check the city or ZIP and try again?`,
        });
      }
    }

    // --- Crisis Keywords ---
    const crisis = /\bsuicid(e|al)\b|\bkill myself\b|\bwant to die\b|\bhurt myself\b/i;
    if (crisis.test(text)) {
      return res.json({
        reply:
          "⚠️ You're not alone, and your life matters.\n\n" +
          "🇺🇸 **Veterans Crisis Line:** Dial **988**, then press **1**\n" +
          "💬 Chat online: https://www.veteranscrisisline.net/get-help-now/chat/\n" +
          "📱 Text **838255** to reach a trained responder 24/7.",
      });
    }

    // --- Keyword detection ---
    const categories = [
      {
        key: "housing",
        words: ["homeless", "shelter", "housing", "eviction"],
        reply:
          "🏠 For housing or shelter support:\n" +
          "• **VA Homeless Programs:** https://www.va.gov/homeless\n" +
          "• **Call 1-877-424-3838** (24/7 National Call Center for Homeless Veterans)",
      },
      {
        key: "substance",
        words: ["alcohol", "drugs", "addiction", "rehab", "detox"],
        reply:
          "🍃 If you’re struggling with alcohol or substance use:\n" +
          "• **VA Substance Use Helpline:** 1-800-273-8255 (Press 1)\n" +
          "• Learn more: https://www.mentalhealth.va.gov/substance-abuse/",
      },
      {
        key: "benefits",
        words: ["benefits", "claim", "disability", "compensation", "gi bill"],
        reply:
          "💼 For VA benefits and claims:\n" +
          "• Visit https://www.va.gov or call **1-800-827-1000**",
      },
      {
        key: "jobs",
        words: ["job", "employment", "career", "resume", "work"],
        reply:
          "🧰 For job and career support:\n" +
          "• **VA Employment Services:** https://www.va.gov/careers-employment\n" +
          "• **Hire Heroes USA:** https://www.hireheroesusa.org/",
      },
    ];

    const matches = categories
      .filter((cat) => cat.words.some((w) => text.includes(w)))
      .map((cat) => cat.reply);

    if (matches.length > 0) {
      return res.json({ reply: matches.join("\n\n") });
    }

    // --- Default AI fallback ---
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
app.listen(PORT, () =>
  console.log(`VetChat backend running on port ${PORT}`)
);
Added real VA facility location search by ZIP/city
