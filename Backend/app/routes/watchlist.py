from fastapi import APIRouter, Depends, HTTPException
from app.routes.auth import get_current_user
from app.db.connection import db
from app.models.watchlist import WatchlistAdd
from app.services.stock_service import get_stock_quote

router = APIRouter(prefix="/api/watchlist", tags=["watchlist"])
watchlist_collection = db["watchlists"]


@router.post("/add")
async def add_to_watchlist(data: WatchlistAdd, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    symbol = data.symbol.upper().strip()

    doc = await watchlist_collection.find_one({"user_id": user_id})
    if not doc:
        await watchlist_collection.insert_one({"user_id": user_id, "symbols": [symbol]})
    elif symbol not in doc.get("symbols", []):
        await watchlist_collection.update_one(
            {"user_id": user_id}, {"$push": {"symbols": symbol}}
        )
    return {"message": "Added to watchlist"}


@router.delete("/{symbol}")
async def remove_from_watchlist(symbol: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    await watchlist_collection.update_one(
        {"user_id": user_id}, {"$pull": {"symbols": symbol.upper()}}
    )
    return {"message": "Removed from watchlist"}


@router.get("")
async def get_watchlist(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    doc = await watchlist_collection.find_one({"user_id": user_id})
    symbols = doc.get("symbols", []) if doc else []

    results = []
    for symbol in symbols:
        quote = await get_stock_quote(symbol)
        results.append(quote)
    return {"watchlist": results}