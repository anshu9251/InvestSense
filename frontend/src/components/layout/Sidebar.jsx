import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    HiOutlineSquares2X2,
    HiOutlineBriefcase,
    HiOutlineSparkles,
    HiOutlineChartBar,
    HiOutlineStar,
    HiOutlineCog6Tooth,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlineBolt,
} from "react-icons/hi2";
import { useAuth } from "../../context/AuthContext";
import { Avatar, Badge } from "../ui";
import logoImg from "../../assets/LOGO.png";
import "./Sidebar.css";

const NAV_GROUPS = [
    {
        label: "Overview",
        items: [
            { label: "Dashboard", icon: HiOutlineSquares2X2, path: "/" },
            { label: "Portfolio", icon: HiOutlineBriefcase, path: "/portfolio" },
        ],
    },
    {
        label: "Research",
        items: [
            { label: "AI Research", icon: HiOutlineSparkles, path: "/ai-research" },
            { label: "Markets", icon: HiOutlineChartBar, path: "/markets" },
            { label: "Watchlist", icon: HiOutlineStar, path: "/watchlist" },
        ],
    },
    {
        label: "Account",
        items: [
            { label: "Settings", icon: HiOutlineCog6Tooth, path: "/settings" },
        ],
    },
];

const COLLAPSE_KEY = "investsense-sidebar-collapsed";

function Sidebar() {
    const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSE_KEY) === "true");
    const { user } = useAuth();

    useEffect(() => {
        localStorage.setItem(COLLAPSE_KEY, collapsed);
        document.documentElement.style.setProperty(
            "--sidebar-current-width",
            collapsed ? "var(--sidebar-collapsed-width)" : "var(--sidebar-width)"
        );
    }, [collapsed]);

    const firstName = user?.name?.split(" ")[0] || "Investor";

    return (
        <motion.aside
            className={`sidebar ${collapsed ? "sidebar--collapsed" : ""}`}
            initial={false}
            animate={{ width: collapsed ? 80 : 272 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
            <div className="sidebar__inner">
                <div className="sidebar__header">
                    <div
                        className="sidebar__logo"
                        onClick={() => collapsed && setCollapsed(false)}
                        style={{ cursor: collapsed ? "pointer" : "default" }}
                        title={collapsed ? "Expand sidebar" : undefined}
                    >
                        <div className="sidebar__logo-icon">
                            <img src={logoImg} alt="InvestSense Logo" className="sidebar__logo-img" />
                        </div>
                        <AnimatePresence>
                            {!collapsed && (
                                <motion.div
                                    className="sidebar__logo-text"
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -8 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <span className="sidebar__logo-title">InvestSense</span>
                                    <span className="sidebar__logo-sub">AI Platform</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <button
                        className="sidebar__collapse-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            setCollapsed(!collapsed);
                        }}
                        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {collapsed ? <HiOutlineChevronRight size={14} /> : <HiOutlineChevronLeft size={16} />}
                    </button>
                </div>

                <nav className="sidebar__nav">
                    {NAV_GROUPS.map((group) => (
                        <div key={group.label} className="sidebar__group">
                            {!collapsed && <span className="sidebar__group-label">{group.label}</span>}
                            {group.items.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.path === "/"}
                                    className={({ isActive }) =>
                                        `sidebar__nav-item ${isActive ? "sidebar__nav-item--active" : ""}`
                                    }
                                    title={collapsed ? item.label : undefined}
                                >
                                    <item.icon className="sidebar__nav-icon" size={20} />
                                    {!collapsed && <span>{item.label}</span>}
                                    <span className="sidebar__nav-indicator" />
                                </NavLink>
                            ))}
                        </div>
                    ))}
                </nav>

                <div className="sidebar__footer">
                    <div className="sidebar__profile">
                        <Avatar name={user?.name} size="sm" />
                        {!collapsed && (
                            <div className="sidebar__profile-info">
                                <span className="sidebar__profile-name">{user?.name || "User"}</span>
                                <span className="sidebar__profile-email">{user?.email || ""}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.aside>
    );
}

export default Sidebar;
