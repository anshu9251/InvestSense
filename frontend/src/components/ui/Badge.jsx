import "./ui.css";

export function Badge({ children, variant = "default", className = "" }) {
    return (
        <span className={`ui-badge ${variant !== "default" ? `ui-badge--${variant}` : ""} ${className}`}>
            {children}
        </span>
    );
}

export default Badge;
