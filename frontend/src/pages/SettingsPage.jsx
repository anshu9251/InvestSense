import { useAuth } from "../context/AuthContext";
import "./SettingsPage.css";
import { useTheme } from "../context/ThemeContext";

function getInitials(name) {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    return parts.length > 1
        ? (parts[0][0] + parts[1][0]).toUpperCase()
        : parts[0].slice(0, 2).toUpperCase();
}

function SettingsPage() {
    const { user, logout } = useAuth();
    const { theme } = useTheme();

    return (
        <div className="settings-page">
            <div className="settings-body">
                <h2 className="settings-page-title">Settings</h2>

                <div className="profile-card">
                    <div className="profile-avatar">{getInitials(user?.name)}</div>
                    <div>
                        <div className="profile-name">{user?.name}</div>
                        <div className="profile-email">{user?.email}</div>
                    </div>
                </div>

                <div className="settings-section">
                    <h3>Account Information</h3>
                    <div className="settings-row">
                        <div>
                            <span className="settings-row-label">Full Name</span>
                            <span className="settings-row-desc">Your display name across InvestSense</span>
                        </div>
                        <span className="settings-row-value">{user?.name}</span>
                    </div>
                    <div className="settings-row">
                        <div>
                            <span className="settings-row-label">Email Address</span>
                            <span className="settings-row-desc">Used for login and notifications</span>
                        </div>
                        <span className="settings-row-value">{user?.email}</span>
                    </div>
                </div>

                <div className="settings-section">
                    <h3>Preferences</h3>
                    <div className="settings-row">
                        <div>
                            <span className="settings-row-label">Currency</span>
                            <span className="settings-row-desc">Display currency for prices and totals</span>
                        </div>
                        <span className="settings-badge">INR (₹)</span>
                    </div>
                    <div className="settings-row">
                    <div>
                        <span className="settings-row-label">Theme</span>
                        <span className="settings-row-desc">Interface appearance</span>
                    </div>
            <span className="settings-badge">{theme === "dark" ? "Dark" : "Light"}</span>
</div>
                </div>

                <div className="settings-section danger">
                    <h3>Account Actions</h3>
                    <div className="settings-row">
                        <div>
                            <span className="settings-row-label">Log Out</span>
                            <span className="settings-row-desc">Sign out of your account on this device</span>
                        </div>
                        <button className="logout-btn" onClick={logout}>Log Out</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SettingsPage;