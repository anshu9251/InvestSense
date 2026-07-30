import { useState, useEffect } from "react";
import { getStockResearch } from "../../api";
import "./AllInsights.css";

const POPULAR_SYMBOLS = ["RELIANCE.NS", "TCS.NS", "INFY.NS", "HDFCBANK.NS", "ITC.NS"];

function AllInsights({ initialSymbol = "" }) {
    const [symbol, setSymbol] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const runResearch = async (querySymbol) => {
        if (!querySymbol.trim()) return;
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const res = await getStockResearch(querySymbol.trim().toUpperCase());
            setResult(res.data);
        } catch (err) {
            setError("Could not generate research report. Try again.");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (initialSymbol) {
            runResearch(initialSymbol);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialSymbol]);

    const handleSearch = (e) => {
        e.preventDefault();
        runResearch(symbol);
    };

    const handleChipClick = (sym) => {
        setSymbol(sym);
        runResearch(sym);
    };

    return (
        <div className="research-container">
            <div className="research-hero">
                <span className="research-hero-icon">🧠</span>
                <h1>AI Stock Research</h1>
                <p>Get an instant AI-generated summary combining live price, recent news, and sentiment analysis.</p>
            </div>

            <form onSubmit={handleSearch} className="research-form-card">
                <input
                    type="text"
                    placeholder="Enter a stock symbol, e.g. RELIANCE.NS"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                />
                <button type="submit" disabled={loading}>
                    {loading ? "Researching..." : "Research"}
                </button>
            </form>

            <div className="popular-chips">
                <span className="popular-label">Popular:</span>
                {POPULAR_SYMBOLS.map((sym) => (
                    <button key={sym} className="chip" onClick={() => handleChipClick(sym)} disabled={loading}>
                        {sym}
                    </button>
                ))}
            </div>

            {loading && (
                <div className="research-card research-loading">
                    <div className="loading-spinner"></div>
                    <p>Fetching price, news, and analyzing sentiment...</p>
                </div>
            )}

            {error && (
                <div className="research-card research-error-card">
                    <span>⚠️</span>
                    <p>{error}</p>
                </div>
            )}

            {result && !loading && (
                <div className="research-card research-result">
                    <div className="research-header">
                        <div>
                            <span className="research-symbol">{result.quote?.company_name || result.symbol}</span>
                            <span className="research-ticker">{result.symbol}</span>
                        </div>
                        {result.quote?.current_price && (
                            <div className="research-price-block">
                                <span className="research-price">₹{result.quote.current_price}</span>
                                {result.quote?.day_change_percent !== undefined && (
                                    <span className={`research-change ${result.quote.day_change_percent >= 0 ? "positive" : "negative"}`}>
                                        {result.quote.day_change_percent >= 0 ? "+" : ""}
                                        {result.quote.day_change_percent}%
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="research-report">
                        {result.report?.split("\n").map((line, i) => {
                            const trimmed = line.trim();
                            if (!trimmed) return null;
                            const isHeading = trimmed.startsWith("**") && trimmed.endsWith("**");
                            const cleanText = trimmed.replace(/\*\*/g, "");
                            return isHeading ? (
                                <h3 key={i}>{cleanText}</h3>
                            ) : (
                                <p key={i}>{cleanText}</p>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

export default AllInsights;