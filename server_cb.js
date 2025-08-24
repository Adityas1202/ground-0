// MedyBuddy Chatbot using Cohere API with memory

const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const COHERE_API_KEY = "73w7goDSvlnOqKvpqeGyLeohXF03COVSwp7S7dC5"; // paste your Cohere key
const COHERE_API_URL = "https://api.cohere.ai/v1/chat";

// 🧠 Session-based conversation history
const sessionHistory = new Map();

app.post("/chat", async (req, res) => {
  const { message, sessionId = "default" } = req.body;
  
  // Input validation
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ reply: "Please provide a valid message" });
  }
  
  if (message.length > 500) {
    return res.status(400).json({ reply: "Message too long. Maximum 500 characters allowed." });
  }
  
  // Get or create history for this session
  if (!sessionHistory.has(sessionId)) {
    sessionHistory.set(sessionId, []);
  }
  const history = sessionHistory.get(sessionId);

  history.push({ role: "USER", message });

  try {
    const response = await fetch(COHERE_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${COHERE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "command-r",
        message: message,
        chat_history: history,
      }),
    });

    const data = await response.json();
    console.log("🔎 Cohere API response:", JSON.stringify(data, null, 2));

    const reply = data?.text || "⚠️ Sorry, MedyBuddy could not generate a reply";

    history.push({ role: "CHATBOT", message: reply });
    
    // Limit history size to prevent memory issues
    if (history.length > 20) {
      history.splice(0, 2);
    }

    res.json({ reply });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ reply: "⚠️ Error contacting Cohere API." });
  }
});

app.listen(3000, () => {
  console.log("✅ MedyBuddy chatbot running at http://localhost:3000");
});