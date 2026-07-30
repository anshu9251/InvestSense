from fastapi import APIRouter, HTTPException
from app.services.agent_service import run_stock_research
from app.services.stock_service import get_stock_quote
router = APIRouter(prefix="/api/stock", tags=["stock"])


@router.get("/{symbol}/research")
async def get_stock_research(symbol: str):
    try:
        result = await run_stock_research(symbol)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Research generation failed: {str(e)}")

@router.get("/{symbol}/quote")
async def get_quote(symbol: str):
    return await get_stock_quote(symbol)