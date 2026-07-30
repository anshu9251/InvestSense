import { ChartCard } from "../ui/Card";
import "./TopHoldings.css";

function TopHoldings({ holdings }) {
    const valid = holdings
        .filter((h) => !h.error)
        .sort((a, b) => b.current_value - a.current_value)
        .slice(0, 5);

    const total = valid.reduce((s, h) => s + h.current_value, 0);

    return (
        <ChartCard title="Top holdings" subtitle="By current value">
            {valid.length > 0 ? (
                <div className="top-holdings">
                    {valid.map((h, i) => {
                        const pct = total > 0 ? ((h.current_value / total) * 100).toFixed(1) : 0;
                        const symbol = h.symbol.replace(".NS", "").replace(".BO", "");
                        const isPositive = h.profit_loss >= 0;

                        return (
                            <div key={h.id} className="top-holdings__item">
                                <div className="top-holdings__rank">{i + 1}</div>
                                <div className="top-holdings__info">
                                    <div className="top-holdings__row">
                                        <span className="top-holdings__symbol">{symbol}</span>
                                        <span className="top-holdings__value">
                                            ₹{h.current_value.toLocaleString("en-IN")}
                                        </span>
                                    </div>
                                    <div className="top-holdings__row">
                                        <span className="top-holdings__sector">{h.sector}</span>
                                        <span className={`top-holdings__pl ${isPositive ? "positive" : "negative"}`}>
                                            {isPositive ? "+" : ""}{h.profit_loss_percent}%
                                        </span>
                                    </div>
                                    <div className="top-holdings__bar-wrap">
                                        <div
                                            className="top-holdings__bar"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                                <span className="top-holdings__pct">{pct}%</span>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="empty-state">Add holdings to see top positions</p>
            )}
        </ChartCard>
    );
}

export default TopHoldings;
