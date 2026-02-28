import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function analyzeImage(base64Image: string, language: string = 'vi') {
    const response = await axios.post(`${API_URL}/analyze`, {
        imageBase64: base64Image,
        language: language,
    });
    return response.data;
}

export async function analyzeText(
    productType: string,
    inciList: string,
    claims: string = '',
    language: string = 'vi'
) {
    const response = await axios.post(`${API_URL}/analyze-text`, {
        product_type: productType,
        inci_list: inciList,
        claims,
        language,
    });
    return response.data;
}

export async function chatWithAI(message: string, history: Array<{ role: string, content: string }> = [], language: string = 'vi') {
    const response = await axios.post(`${API_URL}/chat`, {
        message,
        history,
        language: language,
    });
    return response.data;
}
