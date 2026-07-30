import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { getWatchlist, addToWatchlist, removeFromWatchlist } from "../api";
import "./WatchlistPage.css";

function WatchlistPage() {
    const [watchlist, setWatchlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [symbolInput, setSymbolInput] = useState("");
    const [adding, setAdding] = useState(false);
    const [removingSymbol, setRemovingSymbol] = useState(null);

    const fetchWatchlist = async () => {
        setLoading(true);
        try {
            const res = await getWatchlist();
            setWatchlist(res.data.watchlist);
        } catch {
            setWatchlist([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWatchlist();
        window.addEventListener("watchlist-updated", fetchWatchlist);
        return () => window.removeEventListener("watchlist-updated", fetchWatchlist);
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!symbolInput.trim()) return;
        setAdding(true);
        try {
            await addToWatchlist(symbolInput.trim().toUpperCase());
            setSymbolInput("");
            await fetchWatchlist();
        } catch (err) {
            alert("Failed to add: " + (err.response?.data?.detail || err.message));
        } finally {
            setAdding(false);
        }
    };

    const handleRemove = async (symbol) => {
        setRemovingSymbol(symbol);
        try {
            await removeFromWatchlist(symbol);
            setWatchlist((prev) => prev.filter((q) => q.symbol !== symbol));
        } finally {
            setRemovingSymbol(null);
        }
    };

    return (
        <div className="watchlist-page">
            <Navbar title="Watchlist" />
            <div className="watchlist-body">
                <form onSubmit={handleAdd} className="watchlist-add-form">
                    <input
                        type="text"
                        placeholder="Add a symbol, e.g. INFY.NS"
                        value={symbolInput}
                        onChange={(e) => setSymbolInput(e.target.value)}
                        autoComplete="off"
                    />
                    <button type="submit" disabled={adding}>
                        {adding ? "Adding..." : "+ Add"}
                    </button>
                </form>

                <h2 className="watchlist-title">Your Watchlist</h2>

                {loading ? (
                    <p className="watchlist-status">Loading...</p>
                ) : watchlist.length === 0 ? (
                    <div className="watchlist-empty">
                        <span className="watchlist-empty-icon">★</span>
                        <p>Your watchlist is empty.</p>
                        <span className="watchlist-empty-sub">
                            Add symbols above, or browse <Link to="/markets">Markets</Link> to add stocks with one click.
                        </span>
                    </div>
                ) : (
                    <div className="watchlist-grid">
                        {watchlist.map((q) => {
                            if (q.error) {
                                return (
                                    <div key={q.symbol} className="watch-card error">
                                        <span className="watch-symbol">{q.symbol}</span>
                                        <span className="watch-error">Data unavailable</span>
                                        <button
                                            className="watch-remove-btn"
                                            onClick={() => handleRemove(q.symbol)}
                                            disabled={removingSymbol === q.symbol}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                );
                            }

                            const isPositive = q.day_change_percent >= 0;
                            return (
                                <div key={q.symbol} className="watch-card">
                                    <div className="watch-card-top">
                                        <span className="watch-symbol">{q.symbol}</span>
                                        <span className="watch-name">{q.company_name || ""}</span>
                                    </div>
                                    <div className="watch-price">₹{q.current_price}</div>
                                    <div className={`watch-change ${isPositive ? "positive" : "negative"}`}>
                                        {isPositive ? "▲" : "▼"} {isPositive ? "+" : ""}
                                        {q.day_change_percent}%
                                    </div>
                                    <button
                                        className="watch-remove-btn"
                                        onClick={() => handleRemove(q.symbol)}
                                        disabled={removingSymbol === q.symbol}
                                    >
                                        {removingSymbol === q.symbol ? "Removing..." : "Remove"}
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

export default WatchlistPage;