import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    HiOutlineBell,
    HiOutlineMagnifyingGlass,
    HiOutlinePlus,
    HiOutlineSun,
    HiOutlineMoon,
    HiOutlineChevronDown,
    HiOutlineArrowRightOnRectangle,
    HiOutlineCog6Tooth,
} from "react-icons/hi2";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { getNotifications, getQuote } from "../../api";
import { Avatar, Button } from "../ui";
import "./Navbar.css";

function Navbar({ onAddHoldingClick, title, subtitle }) {
    const [showNotifDropdown, setShowNotifDropdown] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loadingNotifs, setLoadingNotifs] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [niftyQuote, setNiftyQuote] = useState(null);
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const notifRef = useRef(null);
    const profileRef = useRef(null);

    useEffect(() => {
        const fetchNotifs = async () => {
            try {
                const res = await getNotifications();
                setNotifications(res.data.notifications);
            } catch {
                setNotifications([]);
            }
        };
        fetchNotifs();
    }, []);

    useEffect(() => {
        getQuote("^NSEI")
            .then((res) => setNiftyQuote(res.data))
            .catch(() => setNiftyQuote(null));
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setShowNotifDropdown(false);
            }
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setShowProfileDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleBellClick = async () => {
        setShowNotifDropdown(!showNotifDropdown);
        setShowProfileDropdown(false);
        if (!showNotifDropdown) {
            setLoadingNotifs(true);
            try {
                const res = await getNotifications();
                setNotifications(res.data.notifications);
            } catch {
                setNotifications([]);
            } finally {
                setLoadingNotifs(false);
            }
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        navigate(`/ai-research?symbol=${encodeURIComponent(searchQuery.trim().toUpperCase())}`);
        setSearchQuery("");
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 17) return "Good afternoon";
        return "Good evening";
    };

    const typeIcon = { success: "✓", warning: "!", info: "i" };
    const typeClass = { success: "notif-success", warning: "notif-warning", info: "notif-info" };
    const firstName = user?.name?.split(" ")[0] || "there";

    return (
        <header className="navbar">
            <div className="navbar__top">
                <div className="navbar__greeting">
                    <motion.h1
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        {title === "Dashboard"
                            ? `${getGreeting()}, ${firstName}`
                            : title || "Dashboard"}
                    </motion.h1>
                    <span className="navbar__date">
                        {subtitle ||
                            new Date().toLocaleDateString("en-IN", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                            })}
                    </span>
                </div>

                <form className="navbar__search ui-search" onSubmit={handleSearch}>
                    <HiOutlineMagnifyingGlass className="ui-search__icon" size={18} />
                    <input
                        type="text"
                        className="ui-input ui-search__input"
                        placeholder="Search stocks, insights, reports..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoComplete="off"
                    />
                </form>

                <div className="navbar__actions">
                    {niftyQuote && !niftyQuote.error && (
                        <div className="navbar__market-pill">
                            <span className="navbar__market-label">NIFTY 50</span>
                            <span className="navbar__market-value">
                                {niftyQuote.current_price?.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                            </span>
                            <span
                                className={`navbar__market-change ${
                                    niftyQuote.day_change_percent >= 0 ? "positive" : "negative"
                                }`}
                            >
                                {niftyQuote.day_change_percent >= 0 ? "+" : ""}
                                {niftyQuote.day_change_percent}%
                            </span>
                        </div>
                    )}

                    {onAddHoldingClick && (
                        <Button
                            variant="primary"
                            size="sm"
                            icon={HiOutlinePlus}
                            onClick={onAddHoldingClick}
                            className="navbar__add-btn"
                        >
                            Add Holding
                        </Button>
                    )}

                    <button
                        className="navbar__icon-btn"
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                        title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                    >
                        {theme === "dark" ? <HiOutlineSun size={20} /> : <HiOutlineMoon size={20} />}
                    </button>

                    <div className="navbar__dropdown-wrap" ref={notifRef}>
                        <button
                            className="navbar__icon-btn navbar__notif-btn"
                            onClick={handleBellClick}
                            aria-label="Notifications"
                        >
                            <HiOutlineBell size={20} />
                            {notifications.length > 0 && (
                                <span className="navbar__notif-badge">{notifications.length}</span>
                            )}
                        </button>
                        {showNotifDropdown && (
                            <div className="ui-dropdown navbar__dropdown">
                                <div className="ui-dropdown__label">Notifications</div>
                                {loadingNotifs ? (
                                    <p className="navbar__dropdown-empty">Loading...</p>
                                ) : notifications.length === 0 ? (
                                    <p className="navbar__dropdown-empty">No new notifications</p>
                                ) : (
                                    notifications.map((n, i) => (
                                        <div key={i} className={`navbar__notif-item ${typeClass[n.type] || ""}`}>
                                            <span className="navbar__notif-type">{typeIcon[n.type] || "•"}</span>
                                            <span>{n.message}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    <div className="navbar__dropdown-wrap" ref={profileRef}>
                        <button
                            className="navbar__profile-trigger"
                            onClick={() => {
                                setShowProfileDropdown(!showProfileDropdown);
                                setShowNotifDropdown(false);
                            }}
                        >
                            <Avatar name={user?.name} size="sm" />
                            <HiOutlineChevronDown size={14} className="navbar__chevron" />
                        </button>
                        {showProfileDropdown && (
                            <div className="ui-dropdown navbar__dropdown">
                                <div className="navbar__profile-header">
                                    <Avatar name={user?.name} size="md" />
                                    <div>
                                        <p className="navbar__profile-name">{user?.name || "User"}</p>
                                        <p className="navbar__profile-email">{user?.email}</p>
                                    </div>
                                </div>
                                <div className="ui-dropdown__divider" />
                                <button className="ui-dropdown__item" onClick={() => { setShowProfileDropdown(false); navigate("/settings"); }}>
                                    <HiOutlineCog6Tooth size={16} />
                                    Settings
                                </button>
                                <div className="ui-dropdown__divider" />
                                <button className="ui-dropdown__item navbar__logout-item" onClick={handleLogout}>
                                    <HiOutlineArrowRightOnRectangle size={16} />
                                    Log out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Navbar;
