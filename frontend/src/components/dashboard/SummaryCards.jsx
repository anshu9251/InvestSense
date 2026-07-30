import {
    HiOutlineBanknotes,
    HiOutlineWallet,
    HiOutlineArrowTrendingUp,
    HiOutlineChartPie,
} from "react-icons/hi2";
import { StatCard } from "../ui/StatCard";
import { Skeleton } from "../ui/Skeleton";
import "./SummaryCards.css";

function SummaryCards({ summary, loading }) {
    if (loading) {
        return (
            <div className="summary-cards">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="summary-cards__skeleton">
                        <Skeleton variant="title" />
                        <Skeleton variant="text" style={{ marginTop: 12, height: 32 }} />
                    </div>
                ))}
            </div>
        );
    }

    if (!summary) return null;

    const cards = [
        {
            icon: HiOutlineBanknotes,
            label: "Total Invested",
            value: `₹${summary.total_invested.toLocaleString("en-IN")}`,
            changeLabel: "Portfolio cost basis",
        },
        {
            icon: HiOutlineWallet,
            label: "Current Value",
            value: `₹${summary.total_current_value.toLocaleString("en-IN")}`,
            change: `${summary.overall_profit_loss >= 0 ? "+" : ""}₹${Math.abs(summary.overall_profit_loss).toLocaleString("en-IN")}`,
            changeLabel: "vs invested",
            trend: summary.overall_profit_loss >= 0 ? "positive" : "negative",
        },
        {
            icon: HiOutlineArrowTrendingUp,
            label: "Overall P/L",
            value: `${summary.overall_profit_loss >= 0 ? "+" : ""}₹${summary.overall_profit_loss.toLocaleString("en-IN")}`,
            change: `${summary.overall_profit_loss_percent >= 0 ? "+" : ""}${summary.overall_profit_loss_percent}%`,
            trend: summary.overall_profit_loss >= 0 ? "positive" : "negative",
        },
        {
            icon: HiOutlineChartPie,
            label: "Overall P/L %",
            value: `${summary.overall_profit_loss_percent >= 0 ? "+" : ""}${summary.overall_profit_loss_percent}%`,
            changeLabel: "All-time return",
            trend: summary.overall_profit_loss_percent >= 0 ? "positive" : "negative",
        },
    ];

    return (
        <div className="summary-cards">
            {cards.map((c, i) => (
                <StatCard key={c.label} {...c} index={i} />
            ))}
        </div>
    );
}

export default SummaryCards;
