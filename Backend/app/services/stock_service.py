import httpx
from datetime import datetime, timedelta
from typing import Optional, Dict

from app.db.connection import quote_cache_collection

CACHE_TTL_MINUTES = 15

BASE_URL = "https://query1.finance.yahoo.com/v8/finance/chart"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/138.0.0.0 Safari/537.36"
    ),
    "Referer": "https://finance.yahoo.com/",
    "Accept": "application/json",
    "Accept-Language": "en-US,en;q=0.9",
}


# ---------------- CACHE ---------------- #

async def get_cached_quote(symbol: str) -> Optional[Dict]:
    cached = await quote_cache_collection.find_one({"symbol": symbol})

    if cached:
        age = datetime.utcnow() - cached["fetched_at"]

        if age < timedelta(minutes=CACHE_TTL_MINUTES):
            return cached["data"]

    return None


async def save_quote_to_cache(symbol: str, data: Dict):
    await quote_cache_collection.update_one(
        {"symbol": symbol},
        {
            "$set": {
                "symbol": symbol,
                "data": data,
                "fetched_at": datetime.utcnow(),
            }
        },
        upsert=True,
    )


# ---------------- YAHOO API ---------------- #

async def fetch_quote(symbol: str) -> Dict:

    async with httpx.AsyncClient(
        headers=HEADERS,
        timeout=20,
        follow_redirects=True,
    ) as client:

        response = await client.get(
            f"{BASE_URL}/{symbol}",
            params={
                "range": "5d",
                "interval": "1d",
            },
        )

        response.raise_for_status()

        data = response.json()

    result = data.get("chart", {}).get("result")

    if not result:
        error = data.get("chart", {}).get("error")
        raise Exception(error or "No data returned from Yahoo")

    result = result[0]

    meta = result["meta"]

    quote = result["indicators"]["quote"][0]

    closes = quote["close"]

    closes = [x for x in closes if x is not None]

    if len(closes) == 0:
        raise Exception("No closing prices available")

    current_price = closes[-1]

    previous_close = (
        closes[-2]
        if len(closes) >= 2
        else current_price
    )

    day_change = current_price - previous_close

    day_change_percent = (
        (day_change / previous_close) * 100
        if previous_close
        else 0
    )

    return {
        "symbol": meta.get("symbol", symbol),
        "company_name": meta.get("longName")
        or meta.get("shortName")
        or symbol,
        "currency": meta.get("currency"),
        "exchange": meta.get("exchangeName"),
        "current_price": round(current_price, 2),
        "previous_close": round(previous_close, 2),
        "day_change": round(day_change, 2),
        "day_change_percent": round(day_change_percent, 2),
        "market_state": meta.get("marketState"),
        "market_cap": None,
        "pe_ratio": None,
    }


# ---------------- PUBLIC FUNCTIONS ---------------- #

async def get_stock_quote(symbol: str) -> Dict:

    symbol = symbol.upper().strip()

    cached = await get_cached_quote(symbol)

    if cached:
        return cached

    try:

        quote = await fetch_quote(symbol)

        await save_quote_to_cache(symbol, quote)

        return quote

    except Exception as e:

        return {
            "symbol": symbol,
            "error": str(e),
        }


async def get_multiple_quotes(symbols: list[str]) -> Dict[str, Dict]:

    results = {}

    for symbol in symbols:

        results[symbol] = await get_stock_quote(symbol)

    return results