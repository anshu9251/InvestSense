import { NavLink } from "react-router-dom";
import {
    HiOutlineSquares2X2,
    HiOutlineBriefcase,
    HiOutlineChartBar,
    HiOutlineStar,
    HiOutlineEllipsisHorizontal,
} from "react-icons/hi2";
import "./MobileNav.css";

const ITEMS = [
    { label: "Home", icon: HiOutlineSquares2X2, path: "/" },
    { label: "Portfolio", icon: HiOutlineBriefcase, path: "/portfolio" },
    { label: "Markets", icon: HiOutlineChartBar, path: "/markets" },
    { label: "Watchlist", icon: HiOutlineStar, path: "/watchlist" },
    { label: "More", icon: HiOutlineEllipsisHorizontal, path: "/settings" },
];

function MobileNav() {
    return (
        <nav className="mobile-nav">
            {ITEMS.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/"}
                    className={({ isActive }) =>
                        `mobile-nav__item ${isActive ? "mobile-nav__item--active" : ""}`
                    }
                >
                    <item.icon size={22} />
                    <span>{item.label}</span>
                </NavLink>
            ))}
        </nav>
    );
}

export default MobileNav;
