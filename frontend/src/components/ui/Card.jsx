import { motion } from "framer-motion";
import "./ui.css";

export function Card({ children, className = "", hover = true, padding = "default", ...props }) {
    return (
        <motion.div
            className={`ui-card ui-card--${padding} ${hover ? "ui-card--hover" : ""} ${className}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            {...props}
        >
            {children}
        </motion.div>
    );
}

export function ChartCard({ title, subtitle, action, children, className = "" }) {
    return (
        <Card className={`ui-chart-card ${className}`} hover={false}>
            {(title || action) && (
                <div className="ui-chart-card__header">
                    <div>
                        {title && <h3 className="ui-chart-card__title">{title}</h3>}
                        {subtitle && <p className="ui-chart-card__subtitle">{subtitle}</p>}
                    </div>
                    {action && <div className="ui-chart-card__action">{action}</div>}
                </div>
            )}
            <div className="ui-chart-card__body">{children}</div>
        </Card>
    );
}

export default Card;
