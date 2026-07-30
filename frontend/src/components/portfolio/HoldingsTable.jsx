import { Skeleton } from "../ui/Skeleton";
import "./HoldingsTable.css";

function HoldingsTable({ holdings, loading, onDelete }) {
    if (loading) {
        return (
            <div className="holdings-table-loading">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} variant="text" style={{ height: 48, margin: "8px 24px" }} />
                ))}
            </div>
        );
    }

    if (!holdings || holdings.length === 0) {
        return (
            <div className="holdings-empty">
                <p>No holdings yet.</p>
                <span>Add your first holding using the button above.</span>
            </div>
        );
    }

    return (
        <div className="table-wrapper">
            <table className="holdings-table">
                <thead>
                    <tr>
                        <th>Symbol</th>
                        <th>Qty</th>
                        <th>Buy Price</th>
                        <th>Current</th>
                        <th>Value</th>
                        <th>P/L</th>
                        <th>P/L %</th>
                        <th>Sector</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {holdings.map((h) => (
                        <tr key={h.id}>
                            <td className="symbol-cell">{h.symbol.replace(".NS", "").replace(".BO", "")}</td>
                            <td>{h.quantity}</td>
                            <td>₹{h.buy_price}</td>
                            <td>{h.error ? <span className="error-badge">Error</span> : `₹${h.current_price}`}</td>
                            <td>{h.error ? "—" : `₹${h.current_value?.toLocaleString("en-IN")}`}</td>
                            <td className={h.error ? "" : h.profit_loss >= 0 ? "positive" : "negative"}>
                                {h.error ? "—" : `${h.profit_loss >= 0 ? "+" : ""}₹${h.profit_loss?.toLocaleString("en-IN")}`}
                            </td>
                            <td className={h.error ? "" : h.profit_loss_percent >= 0 ? "positive" : "negative"}>
                                {h.error ? "—" : `${h.profit_loss_percent >= 0 ? "+" : ""}${h.profit_loss_percent}%`}
                            </td>
                            <td>
                                <span className="ui-sector-badge">{h.sector}</span>
                            </td>
                            <td>
                                <button className="delete-btn" onClick={() => onDelete(h.id)}>
                                    Remove
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default HoldingsTable;
