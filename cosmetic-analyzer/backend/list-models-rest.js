import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

console.log("Fetching models from:", url.replace(API_KEY, "HIDDEN_KEY"));

async function listModels() {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - ${await response.text()}`);
        }
        const data = await response.json();
        console.log("Models:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Error:", e);
    }
}

listModels();
