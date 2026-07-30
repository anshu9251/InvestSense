from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date
from enum import Enum


class SectorEnum(str, Enum):
    IT = "IT"
    BANKING = "Banking"
    FMCG = "FMCG"
    PHARMA = "Pharma"
    AUTO = "Auto"
    ENERGY = "Energy"
    OTHER = "Other"


class HoldingCreate(BaseModel):
    symbol: str = Field(..., description="Stock symbol, e.g. RELIANCE.NS")
    quantity: float = Field(..., gt=0, description="Number of shares held")
    buy_price: float = Field(..., gt=0, description="Price per share at purchase")
    buy_date: date
    sector: Optional[SectorEnum] = SectorEnum.OTHER


class Holding(HoldingCreate):
    id: str = Field(..., description="Unique identifier for this holding")


class HoldingWithMarketData(Holding):
    current_price: Optional[float] = None
    current_value: Optional[float] = None
    invested_value: Optional[float] = None
    profit_loss: Optional[float] = None
    profit_loss_percent: Optional[float] = None
    error: Optional[str] = None  # populated if yfinance lookup failed for this symbol


class SectorAllocation(BaseModel):
    sector: str
    value: float
    percentage: float


class PortfolioSummary(BaseModel):
    total_invested: float
    total_current_value: float
    overall_profit_loss: float
    overall_profit_loss_percent: float
    sector_allocation: List[SectorAllocation]


class PortfolioResponse(BaseModel):
    holdings: List[HoldingWithMarketData]
    summary: PortfolioSummary


class Portfolio(BaseModel):
    user_id: str
    holdings: List[Holding] = []