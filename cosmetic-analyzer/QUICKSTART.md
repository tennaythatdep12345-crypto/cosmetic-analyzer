# 🚀 Quick Start Guide

## Prerequisites
- ✅ Node.js 16+ installed
- ✅ Google Gemini API key

## Step 1: Get Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

## Step 2: Configure Backend

1. Navigate to the `backend` folder
2. Create a `.env` file (copy from `.env.example`)
3. Add your API key:

```env
GEMINI_API_KEY=your_actual_api_key_here
PORT=3001
```

## Step 3: Start the Backend Server

Open a terminal in the `backend` folder:

```bash
cd backend
npm start
```

You should see:
```
🚀 Server listening on http://localhost:3001
📡 API endpoint: http://localhost:3001/analyze
```

## Step 4: Start the Frontend

Open a **NEW terminal** in the `frontend` folder:

```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

## Step 5: Test the Application

1. Open your browser to [http://localhost:5173](http://localhost:5173)
2. Click "Upload Photo" or "Use Camera"
3. Select an image of a cosmetic ingredient list
4. Wait for the AI analysis (10-30 seconds)
5. View the detailed results!

## 📸 Sample Images to Test

You can test with:
- A photo of any skincare product's ingredient list
- Screenshots of ingredient lists from online stores
- Product packaging photos showing INCI ingredients

## 🔧 Troubleshooting

### Backend won't start
- ✅ Check that `.env` file exists in `backend/` folder
- ✅ Verify your `GEMINI_API_KEY` is correct
- ✅ Ensure port 3001 is not already in use

### Frontend won't start
- ✅ Make sure you ran `npm install` in the frontend folder
- ✅ Check that port 5173 is available

### Analysis fails
- ✅ Verify backend is running (check http://localhost:3001/health)
- ✅ Check browser console for errors (F12)
- ✅ Ensure image is clear and readable
- ✅ Try a smaller image (< 10MB)

### CORS errors
- ✅ Make sure backend is running on port 3001
- ✅ Frontend should be on port 5173

## 🎯 Next Steps

### Deploy to Production

**Backend (Render/Railway):**
1. Push code to GitHub
2. Create new Web Service
3. Set environment variable: `GEMINI_API_KEY`
4. Deploy!

**Frontend (Vercel/Netlify):**
1. Push code to GitHub
2. Import project
3. Set build command: `npm run build`
4. Set environment variable: `VITE_API_BASE=https://your-backend-url.com`
5. Deploy!

## 📚 Project Structure

```
cosmetic-analyzer/
├─ backend/              # Express API + Gemini AI
│  ├─ server.js         # Main server file
│  ├─ package.json      # Dependencies
│  └─ .env             # API keys (create this!)
├─ frontend/            # React + Vite + Tailwind
│  ├─ src/
│  │  ├─ App.tsx       # Main app component
│  │  ├─ api.ts        # Backend API calls
│  │  └─ components/   # UI components
│  └─ package.json     # Dependencies
└─ README.md           # Documentation
```

## 💡 Tips

- Use clear, well-lit photos for best results
- Ensure ingredient text is horizontal and in focus
- The AI works best with standard INCI ingredient lists
- Analysis typically takes 10-30 seconds

## 🎨 Features

- ✅ Upload or capture ingredient photos
- ✅ AI-powered ingredient analysis
- ✅ Safety ratings (safe/low_risk/watch/avoid)
- ✅ Comedogenic ratings (0-5 scale)
- ✅ Pros, cons, and warnings
- ✅ Overall recommendation score (0-100)
- ✅ Beautiful, responsive UI

Enjoy analyzing your cosmetics! 💄✨
