import "./ui.css";

export function Skeleton({ variant = "text", className = "", style }) {
    return <div className={`ui-skeleton ui-skeleton--${variant} ${className}`} style={style} />;
}

export default Skeleton;
