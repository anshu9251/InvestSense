from fastapi import APIRouter, Depends
from app.routes.auth import get_current_user
from app.routes.portfolio import get_portfolio
from app.db.connection import db
from app.services.stock_service import get_stock_quote

router = APIRouter(prefix="/api/notifications", tags=["notifications"])
watchlist_collection = db["watchlists"]

SIGNIFICANT_MOVE_THRESHOLD = 2.0  # percent


@router.get("")
async def get_notifications(current_user: dict = Depends(get_current_user)):
    notifications = []

    # 1. Check portfolio holdings for significant day moves
    portfolio_data = await get_portfolio(current_user)
    for h in portfolio_data.holdings:
        if h.error or h.current_price is None:
            continue

    # 2. Overall portfolio P/L notification
    summary = portfolio_data.summary
    if summary.overall_profit_loss_percent >= 5:
        notifications.append({
            "type": "success",
            "message": f"Your portfolio is up {summary.overall_profit_loss_percent}% overall. Nice work!",
        })
    elif summary.overall_profit_loss_percent <= -10:
        notifications.append({
            "type": "warning",
            "message": f"Your portfolio is down {abs(summary.overall_profit_loss_percent)}% overall.",
        })

    # 3. Diversification warning
    if len(summary.sector_allocation) == 1 and len(portfolio_data.holdings) > 1:
        notifications.append({
            "type": "warning",
            "message": "Your portfolio is concentrated in a single sector. Consider diversifying.",
        })

    # 4. Watchlist significant movers
    doc = await watchlist_collection.find_one({"user_id": current_user["id"]})
    symbols = doc.get("symbols", []) if doc else []
    for symbol in symbols:
        quote = await get_stock_quote(symbol)
        if "error" in quote:
            continue
        change = quote.get("day_change_percent", 0)
        if abs(change) >= SIGNIFICANT_MOVE_THRESHOLD:
            direction = "up" if change > 0 else "down"
            notifications.append({
                "type": "info",
                "message": f"{symbol} is {direction} {abs(change)}% today.",
            })

    return {"notifications": notifications, "count": len(notifications)}