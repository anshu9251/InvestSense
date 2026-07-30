import os
import httpx
from typing import TypedDict, List, Optional
from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq

from app.services.stock_service import get_stock_quote

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=GROQ_API_KEY,
    temperature=0.3,
)

NEWS_SEARCH_URL = "https://query1.finance.yahoo.com/v1/finance/search"
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/138.0.0.0 Safari/537.36"
    ),
    "Referer": "https://finance.yahoo.com/",
    "Accept": "application/json",
}


class ResearchState(TypedDict):
    symbol: str
    quote: Optional[dict]
    news: List[str]
    sentiment: Optional[str]
    report: Optional[str]
    error: Optional[str]


async def fetch_quote_node(state: ResearchState) -> ResearchState:
    quote = await get_stock_quote(state["symbol"])
    if "error" in quote:
        state["error"] = quote["error"]
    state["quote"] = quote
    return state


async def fetch_news_node(state: ResearchState) -> ResearchState:
    query = state["symbol"].replace(".NS", "").replace(".BO", "")
    headlines = []
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                NEWS_SEARCH_URL, params={"q": query}, headers=HEADERS
            )
            data = response.json()
        news_items = data.get("news", [])[:5]
        headlines = [item.get("title", "") for item in news_items if item.get("title")]
    except Exception:
        headlines = []

    state["news"] = headlines
    return state


async def sentiment_node(state: ResearchState) -> ResearchState:
    if not state["news"]:
        state["sentiment"] = "No recent news available to gauge sentiment."
        return state

    headlines_text = "\n".join(f"- {h}" for h in state["news"])
    prompt = (
        f"Here are recent news headlines about {state['symbol']}:\n\n{headlines_text}\n\n"
        "In 1-2 sentences, summarize the overall market sentiment these headlines "
        "suggest (positive, negative, neutral, or mixed) and briefly why. "
        "Be factual and neutral in tone, don't give investment advice."
    )

    try:
        response = await llm.ainvoke(prompt)
        state["sentiment"] = response.content
    except Exception as e:
        state["sentiment"] = f"Sentiment analysis unavailable: {str(e)}"

    return state


async def synthesis_node(state: ResearchState) -> ResearchState:
    if state.get("error"):
        state["report"] = f"Could not generate report: {state['error']}"
        return state

    quote = state["quote"]
    news_text = "\n".join(f"- {h}" for h in state["news"]) if state["news"] else "No recent news found."

    prompt = f"""You are a factual stock research assistant. Generate a concise, well-structured research
summary for {state['symbol']} using ONLY the data provided below. Do not invent numbers or facts.
Do not give buy/sell recommendations - this is informational research only, not financial advice.

PRICE DATA:
- Current Price: ₹{quote.get('current_price')}
- Day Change: {quote.get('day_change')} ({quote.get('day_change_percent')}%)
- Company: {quote.get('company_name', state['symbol'])}

RECENT NEWS HEADLINES:
{news_text}

SENTIMENT ANALYSIS:
{state['sentiment']}

Write a short report (150-200 words) with these sections:
1. Snapshot (price and day performance)
2. Recent News Summary (2-3 sentences synthesizing the headlines)
3. Sentiment (based on the sentiment analysis above)

End with a brief disclaimer that this is AI-generated informational content, not financial advice.
"""

    try:
        response = await llm.ainvoke(prompt)
        state["report"] = response.content
    except Exception as e:
        state["report"] = f"Could not generate report: {str(e)}"

    return state


def build_research_graph():
    graph = StateGraph(ResearchState)

    graph.add_node("fetch_quote", fetch_quote_node)
    graph.add_node("fetch_news", fetch_news_node)
    graph.add_node("analyze_sentiment", sentiment_node)
    graph.add_node("synthesize", synthesis_node)

    graph.set_entry_point("fetch_quote")
    graph.add_edge("fetch_quote", "fetch_news")
    graph.add_edge("fetch_news", "analyze_sentiment")
    graph.add_edge("analyze_sentiment", "synthesize")
    graph.add_edge("synthesize", END)

    return graph.compile()


research_graph = build_research_graph()


async def run_stock_research(symbol: str) -> dict:
    initial_state: ResearchState = {
        "symbol": symbol.upper().strip(),
        "quote": None,
        "news": [],
        "sentiment": None,
        "report": None,
        "error": None,
    }
    final_state = await research_graph.ainvoke(initial_state)
    return {
        "symbol": final_state["symbol"],
        "quote": final_state["quote"],
        "news": final_state["news"],
        "sentiment": final_state["sentiment"],
        "report": final_state["report"],
    }