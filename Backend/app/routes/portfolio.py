import uuid
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.routes.auth import get_current_user
from app.db.connection import portfolios_collection
from app.models.portfolio import (
    HoldingCreate,
    Holding,
    HoldingWithMarketData,
    PortfolioResponse,
    PortfolioSummary,
    SectorAllocation,
)
from app.services.analytics_service import (
    calculate_portfolio_volatility,
    calculate_diversification_score,
    calculate_health_score,
)
from app.services.stock_service import get_stock_quote

router = APIRouter(prefix="/api/portfolio", tags=["portfolio"])


async def _get_or_create_portfolio(user_id: str) -> dict:
    portfolio = await portfolios_collection.find_one({"user_id": user_id})
    if not portfolio:
        new_portfolio = {"user_id": user_id, "holdings": []}
        await portfolios_collection.insert_one(new_portfolio)
        return new_portfolio
    return portfolio


@router.post("/add", response_model=Holding)
async def add_holding(holding_data: HoldingCreate, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    await _get_or_create_portfolio(user_id)

    new_holding = Holding(id=str(uuid.uuid4()), **holding_data.model_dump())

    await portfolios_collection.update_one(
        {"user_id": user_id},
        {"$push": {"holdings": new_holding.model_dump(mode="json")}},
    )

    return new_holding


@router.delete("/{holding_id}")
async def delete_holding(holding_id: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    result = await portfolios_collection.update_one(
        {"user_id": user_id},
        {"$pull": {"holdings": {"id": holding_id}}},
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Holding not found")
    return {"message": "Holding deleted successfully"}


@router.get("", response_model=PortfolioResponse)
async def get_portfolio(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    portfolio = await _get_or_create_portfolio(user_id)
    holdings = portfolio.get("holdings", [])

    enriched_holdings: List[HoldingWithMarketData] = []
    total_invested = 0.0
    total_current_value = 0.0
    sector_totals: dict[str, float] = {}

    for h in holdings:
        quote = await get_stock_quote(h["symbol"])
        invested_value = h["quantity"] * h["buy_price"]
        total_invested += invested_value

        if "error" in quote:
            enriched_holdings.append(
                HoldingWithMarketData(**h, invested_value=invested_value, error=quote["error"])
            )
            continue

        current_price = quote["current_price"]
        current_value = h["quantity"] * current_price
        profit_loss = current_value - invested_value
        profit_loss_percent = (profit_loss / invested_value * 100) if invested_value else 0

        total_current_value += current_value
        sector = h.get("sector", "Other")
        sector_totals[sector] = sector_totals.get(sector, 0) + current_value

        enriched_holdings.append(
            HoldingWithMarketData(
                **h,
                current_price=current_price,
                current_value=round(current_value, 2),
                invested_value=round(invested_value, 2),
                profit_loss=round(profit_loss, 2),
                profit_loss_percent=round(profit_loss_percent, 2),
            )
        )

    overall_profit_loss = total_current_value - total_invested
    overall_profit_loss_percent = (
        (overall_profit_loss / total_invested * 100) if total_invested else 0
    )

    sector_allocation = [
        SectorAllocation(
            sector=sector,
            value=round(value, 2),
            percentage=round((value / total_current_value * 100) if total_current_value else 0, 2),
        )
        for sector, value in sector_totals.items()
    ]

    summary = PortfolioSummary(
        total_invested=round(total_invested, 2),
        total_current_value=round(total_current_value, 2),
        overall_profit_loss=round(overall_profit_loss, 2),
        overall_profit_loss_percent=round(overall_profit_loss_percent, 2),
        sector_allocation=sector_allocation,
    )

    return PortfolioResponse(holdings=enriched_holdings, summary=summary)


@router.get("/risk-analysis")
async def get_risk_analysis(current_user: dict = Depends(get_current_user)):
    portfolio_data = await get_portfolio(current_user)
    holdings = [h.model_dump() for h in portfolio_data.holdings]
    summary = portfolio_data.summary

    valid_holdings = [h for h in holdings if not h.get("error")]

    volatility = await calculate_portfolio_volatility(valid_holdings)
    diversification_score = calculate_diversification_score(
        [s.model_dump() for s in summary.sector_allocation]
    )
    health = calculate_health_score(
        diversification_score=diversification_score,
        volatility=volatility,
        num_holdings=len(valid_holdings),
    )

    return {
        "diversification_score": diversification_score,
        "volatility": volatility,
        "health_score": health,
        "num_holdings": len(valid_holdings),
    }