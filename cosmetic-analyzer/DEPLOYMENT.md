# 🚀 Deployment Guide

This guide covers deploying your Cosmetic Analyzer AI to production.

## Architecture Overview

```
Frontend (Vercel/Netlify)  →  Backend (Render/Railway)  →  Google Gemini AI
```

---

## Backend Deployment

### Option 1: Render (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

3. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `cosmetic-analyzer` repository

4. **Configure Service**
   - **Name**: `cosmetic-analyzer-api`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. **Add Environment Variables**
   - Click "Environment" tab
   - Add variable:
     - Key: `GEMINI_API_KEY`
     - Value: `your_actual_gemini_api_key`
   - Add variable:
     - Key: `PORT`
     - Value: `3001` (or leave empty, Render sets this)

6. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (2-5 minutes)
   - Copy your service URL: `https://cosmetic-analyzer-api.onrender.com`

### Option 2: Railway

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure**
   - Railway auto-detects Node.js
   - Set root directory: `backend`
   - Add environment variable: `GEMINI_API_KEY`

4. **Deploy**
   - Railway automatically deploys
   - Get your URL from the deployment

### Option 3: Vercel Serverless (Alternative)

Create `backend/api/analyze.js`:

```javascript
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ... (copy logic from server.js)
}
```

Deploy with Vercel CLI:
```bash
cd backend
vercel
```

---

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Update API Base URL**
   
   Create `frontend/.env.production`:
   ```env
   VITE_API_BASE=https://your-backend-url.onrender.com
   ```

2. **Deploy with Vercel CLI**
   ```bash
   npm install -g vercel
   cd frontend
   vercel
   ```

3. **Or Deploy via Dashboard**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Configure:
     - **Framework Preset**: Vite
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
   - Add environment variable:
     - `VITE_API_BASE`: `https://your-backend-url.onrender.com`
   - Deploy!

### Option 2: Netlify

1. **Create `frontend/netlify.toml`**
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Deploy**
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop your `frontend/dist` folder
   - Or connect GitHub repository
   - Set environment variable: `VITE_API_BASE`

### Option 3: GitHub Pages

1. **Update `vite.config.ts`**
   ```typescript
   export default defineConfig({
     plugins: [react()],
     base: '/cosmetic-analyzer/', // your repo name
   })
   ```

2. **Build and Deploy**
   ```bash
   npm run build
   npx gh-pages -d dist
   ```

---

## Environment Variables Summary

### Backend
| Variable | Description | Example |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Your Google Gemini API key | `AIza...` |
| `PORT` | Server port (optional) | `3001` |

### Frontend
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE` | Backend API URL | `https://api.example.com` |

---

## Post-Deployment Checklist

- [ ] Backend health check works: `https://your-backend.com/health`
- [ ] Frontend loads correctly
- [ ] CORS is configured (backend allows frontend domain)
- [ ] API key is set correctly
- [ ] Test image upload and analysis
- [ ] Check browser console for errors
- [ ] Test on mobile devices
- [ ] Monitor API usage in Google AI Studio

---

## Monitoring & Maintenance

### Backend Monitoring
- **Render**: Check logs in dashboard
- **Railway**: View logs in project dashboard
- Monitor API usage: [Google AI Studio](https://makersuite.google.com)

### Frontend Monitoring
- **Vercel**: Analytics dashboard
- **Netlify**: Analytics and logs
- Use browser DevTools for client-side errors

### Cost Optimization
- **Gemini API**: Free tier includes 60 requests/minute
- **Render**: Free tier includes 750 hours/month
- **Vercel/Netlify**: Free tier sufficient for most projects

---

## Troubleshooting

### CORS Errors
Update `backend/server.js`:
```javascript
app.use(cors({
  origin: ['https://your-frontend.vercel.app', 'http://localhost:5173']
}));
```

### API Key Issues
- Verify key is correct in environment variables
- Check Google AI Studio for quota limits
- Ensure no extra spaces in `.env` file

### Build Failures
- Check Node.js version (use 18+)
- Clear `node_modules` and reinstall
- Verify all dependencies are in `package.json`

### Slow Response Times
- Gemini API can take 10-30 seconds
- Consider adding loading states
- Implement request timeout handling

---

## Security Best Practices

1. **Never commit `.env` files**
   - Already in `.gitignore`
   - Use platform environment variables

2. **API Key Protection**
   - Keep API key server-side only
   - Never expose in frontend code

3. **Rate Limiting**
   - Implement rate limiting on backend
   - Monitor for abuse

4. **Input Validation**
   - Validate image size (already implemented)
   - Sanitize user inputs

---

## Scaling Considerations

### For High Traffic

1. **Add Redis Caching**
   - Cache similar image analyses
   - Reduce API calls

2. **Use CDN**
   - Serve frontend assets via CDN
   - Improve global performance

3. **Database Integration**
   - Store analysis history
   - Enable user accounts

4. **Load Balancing**
   - Deploy multiple backend instances
   - Use Render's auto-scaling

---

## Custom Domain Setup

### Vercel
1. Go to project settings
2. Add custom domain
3. Update DNS records

### Render
1. Go to service settings
2. Add custom domain
3. Configure DNS

---

## Continuous Deployment

Both Vercel and Render support automatic deployments:

1. Push to `main` branch
2. Platform automatically builds and deploys
3. Zero-downtime deployments

---

## Support & Resources

- **Gemini API Docs**: [ai.google.dev](https://ai.google.dev)
- **Render Docs**: [render.com/docs](https://render.com/docs)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Vite Docs**: [vitejs.dev](https://vitejs.dev)

---

Happy deploying! 🚀
