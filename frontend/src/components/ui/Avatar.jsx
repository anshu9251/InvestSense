import "./ui.css";

export function Avatar({ name, size = "md", className = "" }) {
    const initials = name
        ? name.trim().split(" ").length > 1
            ? (name.trim().split(" ")[0][0] + name.trim().split(" ")[1][0]).toUpperCase()
            : name.trim().slice(0, 2).toUpperCase()
        : "?";

    return (
        <div className={`ui-avatar ui-avatar--${size} ${className}`}>
            {initials}
        </div>
    );
}

export default Avatar;
