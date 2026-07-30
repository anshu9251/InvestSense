import os
import json
import re
from datetime import date
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from langchain_groq import ChatGroq

from app.routes.auth import get_current_user

router = APIRouter(prefix="/api/agent", tags=["agent-assistant"])

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

llm = None
if GROQ_API_KEY:
    try:
        llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            api_key=GROQ_API_KEY,
            temperature=0.2,
        )
    except Exception:
        llm = None


class CommandRequest(BaseModel):
    message: str
    current_page: Optional[str] = "/"


class CommandResponse(BaseModel):
    reply: str
    action: Optional[str] = None
    params: Optional[Dict[str, Any]] = None


SYSTEM_PROMPT = f"""You are an intelligent fintech UI assistant for 'InvestSense AI'.
Your task is to analyze user requests and determine if they want to perform a manual UI action or ask a question.

Today's date is: {date.today().isoformat()}

Available Actions:
1. ADD_WATCHLIST: User wants to add a stock to watchlist.
   params: {{"symbol": "INFY.NS"}}
2. REMOVE_WATCHLIST: User wants to remove a stock from watchlist.
   params: {{"symbol": "INFY.NS"}}
3. ADD_HOLDING: User wants to add a stock/holding to portfolio (buy stock).
   params: {{"symbol": "RELIANCE.NS", "quantity": 10, "buy_price": 2400.0, "buy_date": "{date.today().isoformat()}", "sector": "Energy"}}
   Valid sectors: "IT", "Banking", "FMCG", "Pharma", "Auto", "Energy", "Other".
4. DELETE_HOLDING: User wants to remove, delete, or sell a stock holding from portfolio.
   params: {{"symbol": "RELIANCE.NS"}}
5. NAVIGATE: User wants to open or go to a page.
   params: {{"path": "/portfolio", "label": "Portfolio"}}  (valid paths: "/", "/portfolio", "/watchlist", "/markets", "/ai-research", "/settings")
6. GET_QUOTE: User wants current stock price or quote.
   params: {{"symbol": "AAPL"}}
7. RUN_RESEARCH: User wants deep AI research on a stock.
   params: {{"symbol": "TCS.NS"}}
8. SHOW_POPULAR: User wants to see trending or popular stocks.
   params: {{}}
9. CHAT: General question, greeting, or guidance.
   params: {{}}

RULES:
- Always format symbols properly. Indian stocks often end with .NS (e.g. INFY.NS, RELIANCE.NS, TCS.NS) or standard tickers like AAPL, TSLA, NVDA.
- Return strictly a raw JSON object with keys: "reply", "action", "params".
- Do not include markdown code block backticks (like ```json). Just the raw JSON string.

Example Output:
{{"reply": "Removing RELIANCE.NS from your portfolio holdings.", "action": "DELETE_HOLDING", "params": {{"symbol": "RELIANCE.NS"}}}}
"""


def _fallback_parse(message: str) -> CommandResponse:
    text = message.strip().lower()
    today_str = date.today().isoformat()

    # Check navigation
    if "portfolio" in text and ("go" in text or "open" in text or "show" in text or "navigate" in text):
        return CommandResponse(reply="Navigating to your Portfolio page.", action="NAVIGATE", params={"path": "/portfolio", "label": "Portfolio"})
    if "watchlist" in text and ("go" in text or "open" in text or "show" in text or "navigate" in text):
        return CommandResponse(reply="Opening your Watchlist.", action="NAVIGATE", params={"path": "/watchlist", "label": "Watchlist"})
    if "market" in text and ("go" in text or "open" in text or "show" in text or "navigate" in text):
        return CommandResponse(reply="Opening Markets overview.", action="NAVIGATE", params={"path": "/markets", "label": "Markets"})
    if "research" in text and ("go" in text or "open" in text or "show" in text or "navigate" in text):
        return CommandResponse(reply="Opening AI Research page.", action="NAVIGATE", params={"path": "/ai-research", "label": "AI Research"})

    # Check popular stocks
    if "popular" in text or "trending" in text or "top stock" in text:
        return CommandResponse(reply="Here are some popular trending stocks you can explore or add to your watchlist:", action="SHOW_POPULAR", params={})

    # Check remove holding / sell stock
    if "remove" in text or "delete" in text or "sell" in text:
        if "portfolio" in text or "holding" in text or "stock" in text or any(w.isupper() for w in message.split()):
            words = [w.strip(".,!?").upper() for w in message.split() if w.strip(".,!?").isupper() or "." in w]
            sym = None
            for w in words:
                if w not in ["REMOVE", "DELETE", "SELL", "FROM", "PORTFOLIO", "MY", "HOLDING", "STOCK", "THE"]:
                    sym = w
                    break
            if not sym:
                match = re.search(r'([a-zA-Z]{2,10}(?:\.[a-zA-Z]{2})?)', message.upper())
                if match:
                    sym = match.group(1)
            if sym:
                return CommandResponse(
                    reply=f"Removing {sym} from your portfolio.",
                    action="DELETE_HOLDING",
                    params={"symbol": sym}
                )

    # Check add watchlist
    if "watchlist" in text and ("add" in text or "track" in text):
        match = re.search(r'([a-zA-Z0-9\.]+)', text.replace("add", "").replace("watchlist", "").replace("to", "").replace("my", "").replace("stock", "").strip())
        if match:
            sym = match.group(1).upper()
            return CommandResponse(reply=f"Adding {sym} to your watchlist.", action="ADD_WATCHLIST", params={"symbol": sym})

    # Check add holding / buy stock
    if "buy" in text or "holding" in text or "add to portfolio" in text or "purchase" in text:
        qty_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:shares|quantity|qty)?', text)
        price_match = re.search(r'(?:at|@|price)\s*₹?\s*(\d+(?:\.\d+)?)', text)

        words = [w.strip(".,!?").upper() for w in message.split() if w.strip(".,!?").isupper() or "." in w]
        sym = "RELIANCE.NS"
        for w in words:
            if w not in ["BUY", "STOCK", "SHARES", "PORTFOLIO", "AT", "MY", "ADD", "TO"]:
                sym = w
                break

        qty = float(qty_match.group(1)) if qty_match else 1.0
        price = float(price_match.group(1)) if price_match else 100.0

        return CommandResponse(
            reply=f"Buying {qty} shares of {sym} at ₹{price} for your portfolio.",
            action="ADD_HOLDING",
            params={"symbol": sym, "quantity": qty, "buy_price": price, "buy_date": today_str, "sector": "Other"}
        )

    # Check quote
    if "price" in text or "quote" in text:
        match = re.search(r'([a-zA-Z]{2,10}(?:\.[a-zA-Z]{2})?)', text.upper())
        if match:
            sym = match.group(1)
            return CommandResponse(reply=f"Fetching latest quote for {sym}.", action="GET_QUOTE", params={"symbol": sym})

    return CommandResponse(
        reply="I can help you perform manual tasks! Try commands like: 'Add INFY.NS to watchlist', 'Buy 10 shares of RELIANCE.NS at 2400', 'Remove RELIANCE from portfolio', or 'Go to Markets'.",
        action="CHAT",
        params={}
    )


@router.post("/command", response_model=CommandResponse)
async def process_agent_command(
    req: CommandRequest,
    current_user: dict = Depends(get_current_user)
):
    if not llm:
        return _fallback_parse(req.message)

    try:
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"User current page: {req.current_page}\nUser message: {req.message}"}
        ]
        res = await llm.ainvoke(messages)
        content = res.content.strip()

        if content.startswith("```"):
            content = re.sub(r"^```(?:json)?\n?", "", content)
            content = re.sub(r"\n?```$", "", content)

        data = json.loads(content)
        return CommandResponse(
            reply=data.get("reply", "I've processed your request."),
            action=data.get("action"),
            params=data.get("params", {})
        )
    except Exception:
        return _fallback_parse(req.message)
