# SlideAI — AI Presentation Generator

A production-ready, full-stack AI-powered presentation generator built with the MERN stack.

![SlideAI](https://img.shields.io/badge/SlideAI-Premium%20Suite-4338ca?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=nodedotjs)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=flat-square&logo=vercel)

## 🚀 Features

- **AI Slide Generation** — Generate complete presentations from a text prompt in seconds
- **Rich Editor** — 3-panel editor with slide panel, canvas, and properties panel
- **Multiple Layouts** — Title, Content, Two-Column, Chart, Image-Left/Right, Blank
- **Templates** — Pre-built templates for Business, Finance, Marketing, Education
- **AI Assistant** — In-editor AI to enhance, rewrite, or expand individual slides
- **Sharing** — Generate shareable public links for presentations
- **Export** — PDF export support
- **Favorites & Search** — Organise presentations with favorites and full-text search
- **Authentication** — JWT-based auth with HTTP-only cookies
- **Auto-save** — Debounced auto-save with visual status indicator
- **Undo/Redo** — Full undo/redo history in the editor

## 🛠 Tech Stack

| Layer       | Technology |
|-------------|------------|
| Frontend    | React 18 + Vite + Tailwind CSS |
| Backend     | Node.js + Express.js |
| Database    | MongoDB (Mongoose ODM) |
| Auth        | JWT + HTTP-only Cookies |
| AI          | Mock AI (swap for Gemini/OpenAI) |
| Deployment  | Vercel (frontend) + Railway/Render (backend) |

## 📁 Project Structure

```
SlideAi/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── App.jsx           # Router + route guards
│   │   ├── components/       # Layout, editor, shared UI
│   │   ├── context/          # AuthContext, EditorContext, ToastContext
│   │   ├── pages/            # Dashboard, Editor, Templates, Preview, etc.
│   │   ├── services/         # API service layer (axios)
│   │   └── utils/            # Constants, formatters
│   └── tailwind.config.js
│
├── server/                  # Express backend
│   └── src/
│       ├── index.js          # Entry point
│       ├── config/           # DB connection
│       ├── models/           # User, Presentation (Mongoose)
│       ├── controllers/      # Auth, Presentation, Upload
│       ├── middleware/        # JWT auth, validation, error handler
│       ├── routes/           # Auth, Presentations, Upload, Share
│       └── services/         # AI service (mock)
│
└── vercel.json              # Vercel deployment config
```

## ⚡ Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier)

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/SlideAi.git
cd SlideAi

# Install client deps
cd client && npm install

# Install server deps
cd ../server && npm install
```

### 2. Configure Environment

**Server** — copy `server/.env.example` to `server/.env`:
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-super-secret-key
CLIENT_URL=http://localhost:5173
PORT=5000
NODE_ENV=development
```

**Client** — copy `client/.env.example` to `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run Development Servers

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## 🌐 Deployment

### Deploy to Vercel (Frontend)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/SlideAi)

1. Connect your GitHub repo to Vercel
2. Set **Root Directory** to `client`
3. Add environment variable: `VITE_API_URL=https://your-backend.railway.app/api`
4. Deploy

### Deploy Backend to Railway

1. Connect GitHub repo to [Railway](https://railway.app)
2. Set root directory to `server`
3. Add environment variables (from `.env.example`)
4. Deploy

## 🔑 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/presentations` | List presentations |
| POST | `/api/presentations` | Create + AI generate |
| PATCH | `/api/presentations/:id` | Update presentation |
| DELETE | `/api/presentations/:id` | Delete presentation |
| POST | `/api/presentations/:id/slides` | Add slide |
| PATCH | `/api/presentations/:id/slides/:slideId` | Update slide |
| POST | `/api/presentations/:id/ai/enhance-slide` | AI enhance slide |
| POST | `/api/presentations/:id/share` | Enable sharing |
| GET | `/api/share/:shareId` | Public share view |
| GET | `/api/health` | Health check |

## 🤖 AI Integration

The app ships with a **mock AI service** that generates realistic slide content without any API key. To use a real AI provider:

1. Open `server/src/services/aiService.js`
2. Replace `generateSlides` with your preferred provider:

```js
// Google Gemini
import { GoogleGenerativeAI } from '@google/generative-ai';

// OpenAI
import OpenAI from 'openai';
```

## 📄 License

MIT © SlideAI
