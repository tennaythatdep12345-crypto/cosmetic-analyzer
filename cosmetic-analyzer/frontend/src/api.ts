import axios from 'axios';

const API_URL = 'https://cosmetic-analyzer.onrender.com';

export async function analyzeImage(base64Image: string) {
    const response = await axios.post(`${API_URL}/analyze`, {
        imageBase64: base64Image,
    });
    return response.data;
}

export async function chatWithAI(message: string, history: Array<{ role: string, content: string }> = []) {
    const response = await axios.post(`${API_URL}/chat`, {
        message,
        history,
    });
    return response.data;
}
