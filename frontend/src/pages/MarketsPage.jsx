import { useState, useEffect } from "react";
import Navbar from "../components/layout/Navbar";
import { getQuote, addToWatchlist, getWatchlist } from "../api";
import "./MarketsPage.css";

const POPULAR_STOCKS = [
    "RELIANCE.NS", "TCS.NS", "INFY.NS", "HDFCBANK.NS", "ICICIBANK.NS",
    "ITC.NS", "SBIN.NS", "BHARTIARTL.NS", "WIPRO.NS", "HINDUNILVR.NS",
    "KOTAKBANK.NS", "LT.NS", "AXISBANK.NS", "MARUTI.NS", "SUNPHARMA.NS",
    "TATAMOTORS.NS", "TATASTEEL.NS", "TITAN.NS", "ASIANPAINT.NS", "BAJFINANCE.NS",
    "HCLTECH.NS", "ULTRACEMCO.NS", "NESTLEIND.NS", "POWERGRID.NS", "NTPC.NS",
    "ONGC.NS", "ADANIENT.NS", "M&M.NS", "TECHM.NS", "JSWSTEEL.NS",
];

function MarketsPage() {
    const [quotes, setQuotes] = useState({});
    const [loading, setLoading] = useState(true);
    const [watchlistSymbols, setWatchlistSymbols] = useState(new Set());
    const [addingSymbol, setAddingSymbol] = useState(null);

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);

            // Load existing watchlist first so we know which buttons should show "Added"
            try {
                const wl = await getWatchlist();
                setWatchlistSymbols(new Set(wl.data.watchlist.map((q) => q.symbol)));
            } catch {
                // ignore, non-critical
            }

            const results = {};
            for (const symbol of POPULAR_STOCKS) {
                try {
                    const res = await getQuote(symbol);
                    results[symbol] = res.data;
                    // Show results progressively instead of waiting for all 30
                    setQuotes((prev) => ({ ...prev, [symbol]: res.data }));
                } catch {
                    results[symbol] = { error: "Failed to load" };
                    setQuotes((prev) => ({ ...prev, [symbol]: { error: "Failed to load" } }));
                }
            }
            setLoading(false);
        };
        fetchAll();
    }, []);

    const handleAddToWatchlist = async (symbol) => {
        setAddingSymbol(symbol);
        try {
            await addToWatchlist(symbol);
            setWatchlistSymbols((prev) => new Set(prev).add(symbol));
        } catch (err) {
            alert("Failed to add: " + (err.response?.data?.detail || err.message));
        } finally {
            setAddingSymbol(null);
        }
    };

    return (
        <div className="markets-page">
            <Navbar title="Markets" />
            <div className="markets-body">
                <h2 className="markets-title">Popular Stocks</h2>

                {loading && Object.keys(quotes).length === 0 ? (
                    <p className="markets-status">Loading live quotes...</p>
                ) : (
                    <div className="markets-grid">
                        {POPULAR_STOCKS.map((symbol) => {
                            const q = quotes[symbol];
                            const isInWatchlist = watchlistSymbols.has(symbol);

                            if (!q) {
                                return (
                                    <div key={symbol} className="market-card skeleton">
                                        <span className="market-symbol">{symbol}</span>
                                        <span className="market-loading-text">Loading...</span>
                                    </div>
                                );
                            }

                            if (q.error) {
                                return (
                                    <div key={symbol} className="market-card error">
                                        <span className="market-symbol">{symbol}</span>
                                        <span className="market-error">Data unavailable</span>
                                    </div>
                                );
                            }

                            const isPositive = q.day_change_percent >= 0;
                            return (
                                <div key={symbol} className="market-card">
                                    <div className="market-card-top">
                                        <span className="market-symbol">{symbol}</span>
                                        <span className="market-name">{q.company_name || ""}</span>
                                    </div>
                                    <div className="market-price">₹{q.current_price}</div>
                                    <div className={`market-change ${isPositive ? "positive" : "negative"}`}>
                                        {isPositive ? "▲" : "▼"} {isPositive ? "+" : ""}
                                        {q.day_change_percent}%
                                    </div>
                                    <button
                                        className={`watchlist-toggle-btn ${isInWatchlist ? "added" : ""}`}
                                        onClick={() => handleAddToWatchlist(symbol)}
                                        disabled={isInWatchlist || addingSymbol === symbol}
                                    >
                                        {isInWatchlist ? "✓ In Watchlist" : addingSymbol === symbol ? "Adding..." : "+ Watchlist"}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MarketsPage;