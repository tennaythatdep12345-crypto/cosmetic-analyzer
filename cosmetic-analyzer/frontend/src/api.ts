import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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
