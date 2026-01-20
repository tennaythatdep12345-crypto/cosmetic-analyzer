// Test script to list available Gemini models
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function listModels() {
    try {
        console.log("🔍 Fetching available models...\n");

        // Try to list models
        const models = await genAI.listModels();

        console.log("✅ Available models:");
        for await (const model of models) {
            console.log(`- ${model.name}`);
            console.log(`  Display name: ${model.displayName}`);
            console.log(`  Supported methods: ${model.supportedGenerationMethods?.join(', ')}`);
            console.log();
        }
    } catch (error) {
        console.error("❌ Error:", error.message);

        // Try common models manually
        console.log("\n🔄 Testing common models manually...\n");

        const modelsToTest = [
            "gemini-pro",
            "gemini-pro-vision",
            "gemini-1.5-pro",
            "gemini-1.5-flash",
            "gemini-1.5-pro-latest",
            "gemini-1.5-flash-latest"
        ];

        for (const modelName of modelsToTest) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hello");
                console.log(`✅ ${modelName} - WORKS`);
            } catch (err) {
                console.log(`❌ ${modelName} - ${err.message.split('\n')[0]}`);
            }
        }
    }
}

listModels();
