# 🚀 InvestSense AI - Smart Financial Portfolio & Stock Research Platform

**InvestSense AI** is a modern, full-stack, AI-powered financial portfolio management and stock market research platform. Built with FastAPI, React 19, MongoDB, and LangGraph with Groq (LLaMA 3.3 70B), InvestSense AI brings institutional-grade stock analytics, automated news sentiment synthesis, risk assessment, and a natural language AI UI Assistant directly to retail investors.

---

## ✨ Features

### 📈 Portfolio Management & Advanced Analytics
- **Live Performance Tracking**: Real-time calculation of invested capital, current market value, overall P&L, and percentage returns.
- **Sector Breakdown**: Visual allocation across key sectors (IT, Banking, Energy, FMCG, Pharma, Auto, etc.).
- **Risk & Health Assessment**: Algorithmic portfolio health scoring, volatility metrics, and diversification analysis.
- **Holdings Management**: Easy buy/sell management for US and Indian (NSE/BSE) equities.

### 🤖 LangGraph-Powered AI Stock Research
- **Autonomous Multi-Step AI Agent**: Uses a compiled state graph (LangGraph) for stock analysis:
  1. **Quote Fetching**: Retrieves real-time stock metrics.
  2. **News Scraping**: Scrapes Yahoo Finance for recent market headlines.
  3. **Sentiment Analysis**: Evaluates market sentiment (Bullish/Bearish/Neutral) using LLaMA 3.3 70B.
  4. **Executive Synthesis**: Generates a structured research summary report.

### 💬 Floating Natural Language AI UI Assistant
- Interactive floating assistant available on all pages.
- Parse natural language commands into UI actions (e.g., *"Buy 10 shares of RELIANCE.NS at 2400"*, *"Add INFY.NS to watchlist"*, *"Go to Markets"*, or *"Research TCS.NS"*).

### 📊 Real-Time Market Overview & Watchlists
- Real-time stock quote lookup for Indian equities (`.NS`, `.BO`) and Global stocks.
- Dynamic watchlist to track trending tickers.
- Market trends, indices tracking, and top gainers/losers overview.

### 🔐 Security & Personalization
- JWT-based authentication with bcrypt password hashing.
- Light & Dark mode theme toggle with seamless context management.
- Responsive mobile & desktop UI layout built with Framer Motion animations.

---

## 🛠️ Tech Stack

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.10+)
- **Database**: [MongoDB](https://www.mongodb.com/) (Motor Async Driver)
- **AI Agent Framework**: [LangGraph](https://github.com/langchain-ai/langgraph) & [LangChain Groq](https://github.com/langchain-ai/langchain-got) (Model: `llama-3.3-70b-versatile`)
- **Authentication**: JWT (`python-jose`) + `passlib` (Bcrypt)
- **HTTP Client**: `httpx`

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Routing**: React Router v7
- **Styling & Animations**: Vanilla CSS3 design system + [Framer Motion](https://www.framer.com/motion/)
- **Charts & Data Vis**: [Recharts](https://recharts.org/)
- **Icons**: React Icons
- **HTTP Client**: Axios

---

## 📁 Repository Structure

```
Fintech Project/
├── Backend/
│   ├── app/
│   │   ├── db/              # MongoDB connection setup & collection bindings
│   │   ├── models/          # Pydantic data schemas (User, Portfolio, Watchlist, Stock)
│   │   ├── routes/          # API Route handlers (Auth, Portfolio, Stock, Watchlist, AI Agent)
│   │   ├── services/        # Core business logic (Stock quotes, Risk Analytics, LangGraph Agent)
│   │   └── main.py          # FastAPI app initialization & CORS middleware
│   ├── .env_sample          # Environment variable template
│   ├── requirements.txt     # Python backend dependencies
│   └── test.py              # Backend smoke test script
├── frontend/
│   ├── public/              # Static public assets
│   ├── src/
│   │   ├── components/      # Reusable UI components (Sidebar, Navbar, Floating Agent, etc.)
│   │   ├── context/         # AuthContext & ThemeContext React states
│   │   ├── pages/           # Application views (Dashboard, Portfolio, Markets, Watchlist, AI Research, Settings)
│   │   ├── api.js           # Centralized Axios API service layer
│   │   ├── App.jsx          # Route definitions & layout wrappers
│   │   └── main.jsx         # React application entry point
│   ├── package.json         # Node dependencies & NPM scripts
│   └── vite.config.js       # Vite build configuration
└── README.md                # Project documentation
```

---

## ⚙️ Getting Started

### Prerequisites
- **Python**: 3.10 or higher
- **Node.js**: v18 or higher (with `npm`)
- **MongoDB**: A running MongoDB instance or MongoDB Atlas Connection String
- **Groq API Key**: Free API key from [Groq Console](https://console.groq.com/) for LLM inference.

---

### 1️⃣ Backend Setup

1. Navigate to the `Backend` directory:
   ```bash
   cd Backend
   ```

2. Create and activate a virtual environment:
   - **Windows**:
     ```bash
     python -m venv venv
     .\venv\Scripts\activate
     ```
   - **macOS/Linux**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   Copy `.env_sample` to `.env` and fill in your keys:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   GROQ_API_KEY=your_groq_api_key
   JWT_SECRET_KEY=your_random_secret_key
   ```

5. Start the FastAPI backend server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   The backend will be available at `http://localhost:8000` (API Docs at `http://localhost:8000/docs`).

---

### 2️⃣ Frontend Setup

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install Node packages:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend application will run locally at `http://localhost:5173`.

---

## 🔌 API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| **POST** | `/api/auth/register` | Register a new user | ❌ |
| **POST** | `/api/auth/login` | Login and receive JWT access token | ❌ |
| **GET** | `/api/auth/me` | Fetch current logged-in user profile | ✅ |
| **GET** | `/api/portfolio` | Get user portfolio summary and enriched holdings | ✅ |
| **POST** | `/api/portfolio/add` | Add stock holding to portfolio | ✅ |
| **DELETE**| `/api/portfolio/{holding_id}` | Delete stock holding from portfolio | ✅ |
| **GET** | `/api/portfolio/risk-analysis` | Get volatility, diversification & health score | ✅ |
| **GET** | `/api/stock/quote/{symbol}` | Fetch live quote data for a stock ticker | ✅ |
| **POST** | `/api/stock/research` | Trigger LangGraph AI Research workflow | ✅ |
| **GET** | `/api/watchlist` | Get user watchlist tickers | ✅ |
| **POST** | `/api/watchlist/add` | Add ticker to watchlist | ✅ |
| **DELETE**| `/api/watchlist/remove/{symbol}` | Remove ticker from watchlist | ✅ |
| **POST** | `/api/agent/command` | Natural Language UI Assistant command parsing | ✅ |

---

## 💡 Usage Highlights

1. **Register/Login**: Create an account or sign in to access protected routes.
2. **Dashboard**: View overall portfolio value, performance charts, and market overview.
3. **Portfolio**: Monitor gainers/losers, track sector allocation, evaluate health score, and manage stock positions.
4. **AI Research**: Enter any stock ticker (e.g. `RELIANCE.NS`, `TCS.NS`, `AAPL`, `NVDA`) to generate an AI research report.
5. **Floating AI Assistant**: Click the bot icon on the bottom right or type natural commands like *"Navigate to portfolio"* or *"Buy 5 shares of AAPL at 180"*.

---

## 📜 License
This project is open source and available under the [MIT License](LICENSE).
