import { motion } from "framer-motion";
import "./ui.css";

const variants = {
    primary: "ui-btn--primary",
    secondary: "ui-btn--secondary",
    ghost: "ui-btn--ghost",
    danger: "ui-btn--danger",
};

const sizes = {
    sm: "ui-btn--sm",
    md: "",
    lg: "ui-btn--lg",
};

export function Button({
    children,
    variant = "primary",
    size = "md",
    className = "",
    icon: Icon,
    loading = false,
    ...props
}) {
    const renderIcon = () => {
        if (!Icon) return null;
        if (typeof Icon === "function") {
            return <Icon size={size === "sm" ? 14 : 16} />;
        }
        return Icon;
    };

    return (
        <motion.button
            className={`ui-btn ${variants[variant]} ${sizes[size]} ${className}`}
            whileTap={{ scale: 0.98 }}
            disabled={loading || props.disabled}
            {...props}
        >
            {renderIcon()}
            {loading ? "Loading..." : children}
        </motion.button>
    );
}

export default Button;
