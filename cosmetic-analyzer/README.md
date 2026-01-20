# Cosmetic Analyzer AI

A professional cosmetic ingredient analyzer powered by Google Gemini AI. Upload a photo of your skincare product's ingredient list and get instant, expert analysis.

## Features

- 📸 Upload or capture ingredient list photos
- 🧪 Professional ingredient analysis (INCI names)
- ⚠️ Safety ratings and comedogenic scores
- 💡 Pros, cons, and interaction warnings
- 🎯 Product recommendation score (0-100)

## Quick Start

### Prerequisites

- Node.js 16+ installed
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Setup

1. **Backend Setup**

```bash
cd backend
npm install
```

Create `.env` file in `backend/` directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3001
```

2. **Frontend Setup**

```bash
cd frontend
npm install
```

### Running the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
cosmetic-analyzer/
├─ frontend/          # React + Vite + Tailwind UI
├─ backend/           # Express API + Gemini integration
└─ README.md
```

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, Google Generative AI SDK
- **AI Model**: Gemini 2.1 Pro (Vision)

## Deployment

- **Backend**: Deploy to Render, Railway, or Vercel
- **Frontend**: Deploy to Vercel or Netlify

## License

MIT
