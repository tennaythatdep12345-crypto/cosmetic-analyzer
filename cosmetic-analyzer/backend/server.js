// Express server using direct REST API calls to Gemini
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "15mb" }));

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.warn("⚠️  WARNING: GEMINI_API_KEY not set. Please set it in .env file");
}

const ANALYSIS_PROMPT = `You are an expert cosmetic chemist and safety reviewer.

Input: an image of a product's ingredient list (INCI). Extract ingredients, normalize names, and return JSON:
{
    "product_name": "...",
    "product_type": "cleanser|moisturizer|serum|sunscreen|toner|mask|other",
    "ingredients_raw": ["..."],
    "ingredients_analyzed": [
        { 
            "name": "",
            "function": "",
            "function_vi": "Description de la fonction en français, courte et facile à comprendre",
            "safety_level": "safe|low_risk|watch|avoid",
            "comedogenic_rating": 0-5,
            "comedogenic_warning": true/false,
            "uncertain": false
        }
    ],
    "top_ingredients": ["Listez les 5-7 premiers ingrédients"],
    "notable_ingredients": ["..."],
    "suitable_for_skin_types": ["normal", "oily", "dry", "combination", "sensitive", "acne-prone"],
    "pros": ["..."],
    "cons": ["..."],
    "warnings": ["..."],
    "ingredient_interactions": {
        "retinol": "Compatible / Incompatible / Non pertinent",
        "aha_bha": "Compatible / Incompatible / Non pertinent",
        "vitamin_c": "Compatible / Incompatible / Non pertinent",
        "benzoyl_peroxide": "Compatible / Incompatible / Non pertinent",
        "niacinamide": "Compatible / Incompatible / Non pertinent"
    },
    "overall_assessment": {
        "strengths": ["Point fort 1", "Point fort 2"],
        "usage_notes": ["Conseil d'utilisation 1", "Conseil d'utilisation 2"]
    },
    "recommendation_score": 0-100
}

Rules:
- Output valid JSON only. Do not include extra prose.
- **IMPORTANT: For function_vi, write in FRENCH.** (Keep the key name 'function_vi' for compatibility, but the content must be French).
- For pros, cons, warnings, usage_notes, and strengths: **Write in FRENCH.**
- Set comedogenic_warning to true if comedogenic_rating >= 3.
- In suitable_for_skin_types, list ALL skin types based on ingredients.
- For warnings, include specific concerns in French (e.g., "Contient du parfum").
- Extract ALL ingredients in order from the image.
`;
app.post("/analyze", async (req, res) => {
    try {
        const { imageBase64 } = req.body;
        if (!imageBase64) {
            return res.status(400).json({ error: "imageBase64 required" });
        }

        console.log("📸 Analyzing image with Gemini AI...");

        // Prepare image data (remove data URL prefix if present)
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

        // Detect mime type
        let mimeType = "image/png";
        if (imageBase64.includes("data:image/jpeg") || imageBase64.includes("data:image/jpg")) {
            mimeType = "image/jpeg";
        } else if (imageBase64.includes("data:image/webp")) {
            mimeType = "image/webp";
        }

        // Use v1beta API with gemini-2.5-flash (available in your project)
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

        const requestBody = {
            contents: [{
                parts: [
                    { text: ANALYSIS_PROMPT },
                    {
                        inline_data: {
                            mime_type: mimeType,
                            data: base64Data
                        }
                    }
                ]
            }]
        };

        // Helper function for retrying fetch
        const fetchWithRetry = async (url, options, retries = 3, backoff = 1000) => {
            try {
                const response = await fetch(url, options);
                if (response.status === 429 && retries > 0) {
                    console.warn(`⚠️ API Rate Limit (429). Retrying in ${backoff}ms... (${retries} left)`);
                    await new Promise(r => setTimeout(r, backoff));
                    return fetchWithRetry(url, options, retries - 1, backoff * 2);
                }
                return response;
            } catch (err) {
                if (retries > 0) {
                    console.warn(`⚠️ Network error. Retrying in ${backoff}ms... (${retries} left)`);
                    await new Promise(r => setTimeout(r, backoff));
                    return fetchWithRetry(url, options, retries - 1, backoff * 2);
                }
                throw err;
            }
        };

        const response = await fetchWithRetry(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error("API Error:", errorData);
            throw new Error(`API returned ${response.status}: ${errorData}`);
        }

        const data = await response.json();
        console.log("✅ Received response from Gemini");

        // Extract text from response
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

        if (!text) {
            throw new Error("No text in response");
        }

        // Parse JSON from response
        let parsed;
        try {
            parsed = JSON.parse(text);
        } catch (e) {
            // Try to extract JSON from markdown code blocks
            const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const jsonStr = jsonMatch[1] || jsonMatch[0];
                parsed = JSON.parse(jsonStr);
            } else {
                console.error("Failed to parse JSON from response:", text);
                return res.status(500).json({
                    ok: false,
                    error: "Failed to parse AI response",
                    raw: text
                });
            }
        }

        res.json({ ok: true, result: parsed });
    } catch (err) {
        console.error("❌ Error:", err);
        res.status(500).json({ ok: false, error: err.message });
    }
});

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ============= AI CHAT ENDPOINT =============
const CHAT_SYSTEM_PROMPT = `Vous êtes SkinLab AI - un assistant expert en dermatologie et cosmétiques.

RÔLE: Vous agissez comme un dermatologue amical, fournissant des conseils sur:
- L'analyse des ingrédients cosmétiques (noms INCI, sécurité).
- Les soins de la peau par type (grasse, sèche, sensible, mixte, acnéique).
- Les problèmes de peau courants (acné, hyperpigmentation, vieillissement).
- La routine de soins (matin/soir).

LORSQUE VOUS RECOMMANDEZ DES PRODUITS:
- Suggérez 2-3 produits SPÉCIFIQUES de marques populaires (La Roche-Posay, CeraVe, The Ordinary, Bioderma, Avene).
- Expliquez POURQUOI ce produit convient (ingrédients clés).
- Indiquez si possible une fourchette de prix.

DIRECTIVES:
1. RÉPONDEZ TOUJOURS EN FRANÇAIS.
2. Expliquez simplement, évitez le jargon trop technique sans explication.
3. À la fin, rappelez: "💡 Ceci est une suggestion à titre informatif !"
4. Utilisez des émojis pour être plus convivial.

IMPORTANT - FORMAT DU TEXTE:
- N'utilisez PAS de markdown comme **gras** ou # titres.
- Utilisez des tirets pour les listes.
- Faites des paragraphes courts.
- Réponse concise (max 4-5 paragraphes).
`;



// Store conversation history per session (in-memory, resets on server restart)
const conversations = new Map();

app.post("/chat", async (req, res) => {
    try {
        const { message, sessionId = 'default' } = req.body;

        if (!message) {
            return res.status(400).json({ ok: false, error: "Message is required" });
        }

        console.log(`💬 Chat message from session ${sessionId}: ${message.substring(0, 50)}...`);

        // Get or create conversation history
        if (!conversations.has(sessionId)) {
            conversations.set(sessionId, []);
        }
        const history = conversations.get(sessionId);

        // Build conversation context
        const conversationContext = history.map(msg =>
            `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
        ).join('\n');

        const fullPrompt = conversationContext
            ? `${conversationContext}\n\nUser: ${message}\n\nAssistant:`
            : `User: ${message}\n\nAssistant:`;

        // Call Gemini API
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

        const requestBody = {
            contents: [{
                parts: [{ text: CHAT_SYSTEM_PROMPT + '\n\n' + fullPrompt }]
            }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1024,
            }
        };

        // Helper function for retrying fetch
        const fetchWithRetry = async (url, options, retries = 3, backoff = 1000) => {
            try {
                const response = await fetch(url, options);
                if (response.status === 429 && retries > 0) {
                    console.warn(`⚠️ API Rate Limit (429). Retrying in ${backoff}ms... (${retries} left)`);
                    await new Promise(r => setTimeout(r, backoff));
                    return fetchWithRetry(url, options, retries - 1, backoff * 2);
                }
                return response;
            } catch (err) {
                if (retries > 0) {
                    console.warn(`⚠️ Network error. Retrying in ${backoff}ms... (${retries} left)`);
                    await new Promise(r => setTimeout(r, backoff));
                    return fetchWithRetry(url, options, retries - 1, backoff * 2);
                }
                throw err;
            }
        };

        const response = await fetchWithRetry(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error("Chat API Error:", errorData);
            throw new Error(`API returned ${response.status}: ${errorData}`);
        }

        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Xin lỗi, tôi không thể trả lời câu hỏi này.";

        // Update conversation history (keep last 10 exchanges)
        history.push({ role: 'user', content: message });
        history.push({ role: 'assistant', content: reply });
        if (history.length > 20) {
            history.splice(0, 2); // Remove oldest exchange
        }

        console.log("✅ Chat response sent");
        res.json({ ok: true, reply });

    } catch (err) {
        console.error("❌ Chat Error:", err);
        res.status(500).json({ ok: false, error: err.message });
    }
});

// Clear chat history endpoint
app.post("/chat/clear", (req, res) => {
    const { sessionId = 'default' } = req.body;
    conversations.delete(sessionId);
    res.json({ ok: true, message: "Conversation cleared" });
});
app.get("/", (req, res) => {
  res.send("Cosmetic Analyzer API is running ✅");
});
app.listen(PORT, () => {
    console.log(`🚀 Server listening on http://localhost:${PORT}`);
    console.log(`📡 API endpoints:`);
    console.log(`   - POST /analyze (image analysis)`);
    console.log(`   - POST /chat (AI chat)`);
    console.log(`🤖 Using model: gemini-2.5-flash`);
});

