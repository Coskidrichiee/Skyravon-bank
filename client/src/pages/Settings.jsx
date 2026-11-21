
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useTheme } from "../context/ThemeContext";
import "./Settings.css";

const DEFAULT_SETTINGS = {
    notifications: true,
    transactionAlerts: true,
    loginAlerts: true,
    emailNotifications: true,
    showBalance: true,
};

function Settings() {
    const { user } = useAuth();
    const { darkMode, setDarkMode } = useTheme();

    const [preferences, setPreferences] = useState(DEFAULT_SETTINGS);
    const [successMessage, setSuccessMessage] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        try {
            const saved = localStorage.getItem("banking_settings");

            if (saved) {
                const parsed = JSON.parse(saved);

                setPreferences({
                    ...DEFAULT_SETTINGS,
                    ...parsed,
                });

                if (typeof parsed.darkMode === "boolean") {
                    setDarkMode(parsed.darkMode);
                }
            }
        } catch (error) {
            console.error("Unable to load banking settings:", error);
        }
    }, [setDarkMode]);

    const updatePreference = (key) => {
        setPreferences((previous) => ({
            ...previous,
            [key]: !previous[key],
        }));
    };

    const handleSavePreferences = () => {
        setIsSaving(true);

        try {
            localStorage.setItem(
                "banking_settings",
                JSON.stringify({
                    ...preferences,
                    darkMode,
                })
            );

            setSuccessMessage("Your preferences have been saved successfully.");

            window.setTimeout(() => {
                setSuccessMessage("");
            }, 3500);
        } catch (error) {
            console.error("Unable to save settings:", error);
            setSuccessMessage("Unable to save your settings. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const userInitial =
        user?.full_name?.charAt(0)?.toUpperCase() || "U";

    const avatarUrl = user?.profile_picture
        ? `http://localhost:5000/uploads/profiles/${user.profile_picture}`
        : null;

    const Toggle = ({ label, description, checked, onChange }) => (
        <div className="settings-option">
            <div className="settings-option-info">
                <strong>{label}</strong>
                <span>{description}</span>
            </div>

            <button
                type="button"
                role="switch"
                aria-checked={checked}
                aria-label={label}
                className={`settings-toggle ${checked ? "active" : ""}`}
                onClick={onChange}
            >
                <span />
            </button>
        </div>
    );

    return (
        <div className="settings-page">
            <header className="settings-header">
                <div className="settings-header-left">
                    <Link to="/dashboard" className="settings-back-button">
                        ←
                    </Link>

                    <div>
                        <span className="settings-breadcrumb">
                            MY ACCOUNT / PREFERENCES
                        </span>
                        <h1>Settings</h1>
                    </div>
                </div>

                <div className="settings-user">
                    <div className="settings-user-avatar">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Profile" />
                        ) : (
                            userInitial
                        )}
                    </div>

                    <div className="settings-user-info">
                        <strong>{user?.full_name || "Customer"}</strong>
                        <span>{user?.email || "Richiee Bank Customer"}</span>
                    </div>
                </div>
            </header>

            <main className="settings-content">
                <section className="settings-welcome">
                    <div>
                        <span className="settings-eyebrow">
                            PERSONALISE YOUR EXPERIENCE
                        </span>
                        <h2>Manage your banking preferences</h2>
                        <p>
                            Configure your notifications, security shortcuts
                            and display preferences in one place.
                        </p>
                    </div>

                    <div className="settings-welcome-icon">⚙</div>
                </section>

                {successMessage && (
                    <div
                        className="settings-feedback"
                        role="status"
                    >
                        <span>✓</span>
                        {successMessage}
                    </div>
                )}

                <div className="settings-grid">
                    {/* Notifications */}
                    <section className="settings-card">
                        <div className="settings-card-header">
                            <div className="settings-heading-icon blue">
                                ♧
                            </div>

                            <div>
                                <h3>Notifications</h3>
                                <p>Stay informed about your account.</p>
                            </div>
                        </div>

                        <div className="settings-options">
                            <Toggle
                                label="Push Notifications"
                                description="Receive important account notifications."
                                checked={preferences.notifications}
                                onChange={() => updatePreference("notifications")}
                            />

                            <Toggle
                                label="Transaction Alerts"
                                description="Get notified about account transactions."
                                checked={preferences.transactionAlerts}
                                onChange={() => updatePreference("transactionAlerts")}
                            />

                            <Toggle
                                label="Login Alerts"
                                description="Know when your account is accessed."
                                checked={preferences.loginAlerts}
                                onChange={() => updatePreference("loginAlerts")}
                            />

                            <Toggle
                                label="Email Notifications"
                                description="Receive account updates by email."
                                checked={preferences.emailNotifications}
                                onChange={() => updatePreference("emailNotifications")}
                            />
                        </div>
                    </section>

                    {/* Security */}
                    <section className="settings-card">
                        <div className="settings-card-header">
                            <div className="settings-heading-icon purple">
                                ♙
                            </div>

                            <div>
                                <h3>Security & Privacy</h3>
                                <p>Manage your account protection.</p>
                            </div>
                        </div>

                        <div className="settings-link-list">
                            <Link to="/change-password" className="settings-navigation-link">
                                <span className="settings-link-icon">🔑</span>
                                <span className="settings-link-copy">
                                    <strong>Change Password</strong>
                                    <small>Update your account password.</small>
                                </span>
                                <span className="settings-chevron">→</span>
                            </Link>

                            <Link to="/security" className="settings-navigation-link">
                                <span className="settings-link-icon">🛡</span>
                                <span className="settings-link-copy">
                                    <strong>Security Center</strong>
                                    <small>Review your security settings.</small>
                                </span>
                                <span className="settings-chevron">→</span>
                            </Link>

                            <Link to="/login-activity" className="settings-navigation-link">
                                <span className="settings-link-icon">📱</span>
                                <span className="settings-link-copy">
                                    <strong>Login Activity</strong>
                                    <small>Review recent account activity.</small>
                                </span>
                                <span className="settings-chevron">→</span>
                            </Link>
                        </div>
                    </section>

                    {/* Display */}
                    <section className="settings-card">
                        <div className="settings-card-header">
                            <div className="settings-heading-icon green">
                                ◐
                            </div>

                            <div>
                                <h3>Display Preferences</h3>
                                <p>Make your banking experience yours.</p>
                            </div>
                        </div>

                        <div className="settings-options">
                            <Toggle
                                label="Show Account Balance"
                                description="Display your balance by default."
                                checked={preferences.showBalance}
                                onChange={() => updatePreference("showBalance")}
                            />

                            <div className="settings-theme-option">
                                <div className="settings-option-info">
                                    <strong>Appearance</strong>
                                    <span>Choose your preferred application theme.</span>
                                </div>

                                <div className="settings-theme-buttons">
                                    <button
                                        type="button"
                                        className={!darkMode ? "selected" : ""}
                                        onClick={() => setDarkMode(false)}
                                    >
                                        ☀ <span>Light</span>
                                    </button>

                                    <button
                                        type="button"
                                        className={darkMode ? "selected" : ""}
                                        onClick={() => setDarkMode(true)}
                                    >
                                        ☾ <span>Dark</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Account */}
                    <section className="settings-card">
                        <div className="settings-card-header">
                            <div className="settings-heading-icon orange">
                                ⚙
                            </div>

                            <div>
                                <h3>Account Management</h3>
                                <p>Manage your personal account details.</p>
                            </div>
                        </div>

                        <div className="settings-link-list">
                            <Link to="/profile" className="settings-navigation-link">
                                <span className="settings-link-icon">👤</span>
                                <span className="settings-link-copy">
                                    <strong>Edit Profile</strong>
                                    <small>Update your personal information.</small>
                                </span>
                                <span className="settings-chevron">→</span>
                            </Link>

                            <Link to="/support" className="settings-navigation-link">
                                <span className="settings-link-icon">💬</span>
                                <span className="settings-link-copy">
                                    <strong>Contact Support</strong>
                                    <small>Get assistance with your account.</small>
                                </span>
                                <span className="settings-chevron">→</span>
                            </Link>

                            <Link to="/privacy" className="settings-navigation-link">
                                <span className="settings-link-icon">🔒</span>
                                <span className="settings-link-copy">
                                    <strong>Privacy Policy</strong>
                                    <small>Understand how your data is handled.</small>
                                </span>
                                <span className="settings-chevron">→</span>
                            </Link>

                            <Link to="/terms" className="settings-navigation-link">
                                <span className="settings-link-icon">📄</span>
                                <span className="settings-link-copy">
                                    <strong>Terms & Conditions</strong>
                                    <small>Read the terms of using Skyravon Bank.</small>
                                </span>
                                <span className="settings-chevron">→</span>
                            </Link>
                        </div>
                    </section>
                </div>

                <section className="settings-security-notice">
                    <div className="settings-notice-icon">🔐</div>
                    <div>
                        <strong>Your security matters</strong>
                        <p>
                            Skyravon Bank will never ask for your password,
                            transaction PIN or verification code through
                            unsolicited emails or phone calls.
                        </p>
                    </div>
                </section>

                <div className="settings-save-area">
                    <div>
                        <strong>Ready to save your changes?</strong>
                        <span>Your preferences are stored on this device.</span>
                    </div>

                    <button
                        type="button"
                        className="settings-save-button"
                        onClick={handleSavePreferences}
                        disabled={isSaving}
                    >
                        {isSaving ? "Saving..." : "Save Preferences"}
                        <span>→</span>
                    </button>
                </div>

                <footer className="settings-footer">
                    <span>© {new Date().getFullYear()} Skyravon Bank. All rights reserved.</span>

                    <div>
                        <Link to="/privacy">Privacy</Link>
                        <Link to="/terms">Terms</Link>
                        <Link to="/support">Support</Link>
                    </div>
                </footer>
            </main>
        </div>
    );
}

export default Settings;
