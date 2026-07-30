import httpx
import math
from typing import List, Dict, Optional

CHART_BASE_URL = "https://query1.finance.yahoo.com/v8/finance/chart"

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


async def fetch_historical_closes(symbol: str, range_str: str = "3mo") -> Optional[List[float]]:
    """
    Fetch historical daily closing prices for a symbol using Yahoo's chart API.
    Returns a list of closing prices (oldest to newest), or None if it fails.
    """
    url = f"{CHART_BASE_URL}/{symbol}"
    params = {"range": range_str, "interval": "1d"}

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, params=params, headers=HEADERS)
            data = response.json()

        result = data["chart"]["result"][0]
        closes = result["indicators"]["quote"][0]["close"]
        # Filter out nulls (Yahoo sometimes returns None for holidays/gaps)
        closes = [c for c in closes if c is not None]
        return closes if len(closes) >= 2 else None
    except Exception:
        return None


def calculate_volatility(closes: List[float]) -> Optional[float]:
    """
    Calculate annualized volatility (%) from a list of daily closing prices.
    Uses standard deviation of daily log returns, annualized by sqrt(252).
    """
    if not closes or len(closes) < 2:
        return None

    daily_returns = []
    for i in range(1, len(closes)):
        if closes[i - 1] > 0:
            daily_return = (closes[i] - closes[i - 1]) / closes[i - 1]
            daily_returns.append(daily_return)

    if len(daily_returns) < 2:
        return None

    mean_return = sum(daily_returns) / len(daily_returns)
    variance = sum((r - mean_return) ** 2 for r in daily_returns) / (len(daily_returns) - 1)
    daily_std = math.sqrt(variance)

    annualized_volatility = daily_std * math.sqrt(252) * 100
    return round(annualized_volatility, 2)


async def calculate_portfolio_volatility(holdings: List[Dict]) -> Optional[float]:
    """
    Calculate portfolio-level volatility as a value-weighted average of
    each holding's individual volatility.
    """
    weighted_vols = []
    total_value = 0

    for h in holdings:
        if h.get("error") or not h.get("current_value"):
            continue

        closes = await fetch_historical_closes(h["symbol"])
        if not closes:
            continue

        vol = calculate_volatility(closes)
        if vol is None:
            continue

        value = h["current_value"]
        weighted_vols.append(vol * value)
        total_value += value

    if total_value == 0:
        return None

    return round(sum(weighted_vols) / total_value, 2)


def calculate_diversification_score(sector_allocation: List[Dict]) -> int:
    """
    Calculate a diversification score (0-100) using the Herfindahl-Hirschman
    Index (HHI). Lower concentration (more spread across sectors) = higher score.
    """
    if not sector_allocation:
        return 0

    shares = [s["percentage"] / 100 for s in sector_allocation]
    hhi = sum(share ** 2 for share in shares)

    score = round((1 - hhi) * 100)
    return max(0, min(100, score))


def calculate_health_score(diversification_score: int, volatility: Optional[float], num_holdings: int) -> Dict:
    """
    Combine diversification, volatility, and portfolio size into a single
    0-100 'Financial Health Score' with a breakdown so the calculation is
    transparent (not a black box).
    """
    diversification_component = diversification_score * 0.4

    if volatility is None:
        volatility_component = 20
    else:
        volatility_score = max(0, min(100, 100 - ((volatility - 15) / 45 * 100)))
        volatility_component = volatility_score * 0.4

    breadth_score = min(100, (num_holdings / 10) * 100)
    breadth_component = breadth_score * 0.2

    total_score = round(diversification_component + volatility_component + breadth_component)
    total_score = max(0, min(100, total_score))

    if total_score >= 75:
        label = "Strong"
    elif total_score >= 50:
        label = "Moderate"
    elif total_score >= 25:
        label = "Weak"
    else:
        label = "High Risk"

    return {
        "score": total_score,
        "label": label,
        "breakdown": {
            "diversification": round(diversification_component, 1),
            "volatility": round(volatility_component, 1),
            "breadth": round(breadth_component, 1),
        },
    }