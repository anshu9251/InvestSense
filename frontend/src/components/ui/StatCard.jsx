import { motion } from "framer-motion";
import "./ui.css";

function MiniSparkline({ trend = "up", color }) {
    const path = trend === "up"
        ? "M0,16 L8,12 L16,14 L24,8 L32,10 L40,4"
        : "M0,4 L8,8 L16,6 L24,12 L32,10 L40,16";

    return (
        <svg className="ui-stat-card__sparkline" viewBox="0 0 40 20" preserveAspectRatio="none">
            <path
                d={path}
                fill="none"
                stroke={color || "var(--primary)"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.6"
            />
        </svg>
    );
}

export function StatCard({ icon: Icon, label, value, change, changeLabel, trend, index = 0, className = "" }) {
    const isPositive = trend === "positive" || (change && !String(change).startsWith("-"));
    const trendType = trend === "negative" ? "down" : "up";
    const sparkColor = isPositive ? "var(--success)" : trend === "negative" ? "var(--danger)" : "var(--primary)";

    return (
        <motion.div
            className={`ui-stat-card ${className}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
        >
            <div className="ui-stat-card__top">
                {Icon && (
                    <div className="ui-stat-card__icon">
                        <Icon size={18} />
                    </div>
                )}
                <MiniSparkline trend={trendType} color={sparkColor} />
            </div>
            <span className="ui-stat-card__label">{label}</span>
            <span className="ui-stat-card__value">{value}</span>
            {(change || changeLabel) && (
                <div className={`ui-stat-card__change ${isPositive ? "positive" : trend === "negative" ? "negative" : ""}`}>
                    {change && <span>{change}</span>}
                    {changeLabel && <span className="ui-stat-card__change-label">{changeLabel}</span>}
                </div>
            )}
        </motion.div>
    );
}

export default StatCard;
