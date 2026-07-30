from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.db.connection import ping_database
from app.routes import portfolio
from app.routes import stock
from app.routes import auth
from app.routes import watchlist
from app.routes import notifications
from app.routes import agent_assistant

@asynccontextmanager
async def lifespan(app: FastAPI):
    await ping_database()
    yield


import os

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    origins.append(frontend_url)

app = FastAPI(title="InvestSense AI", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.netlify\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(portfolio.router)
app.include_router(stock.router)
app.include_router(auth.router)
app.include_router(watchlist.router)
app.include_router(notifications.router)
app.include_router(agent_assistant.router)

@app.get("/")
async def root():
    return {"message": "InvestSense AI backend is running"}