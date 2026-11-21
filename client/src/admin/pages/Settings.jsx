

import React, { useEffect, useState } from "react";
import {
    FaUser,
    FaLock,
    FaBell,
    FaShieldAlt,
    FaSave,
    FaEye,
    FaEyeSlash,
    FaCheckCircle,
    FaCog
} from "react-icons/fa";

import "../css/settings.css";

const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

const getToken = () =>
    localStorage.getItem("banking_admin_token") ||
    localStorage.getItem("adminToken") ||
    localStorage.getItem("banking_token");

const defaultNotifications = {
    email_notifications: true,
    transaction_alerts: true,
    security_alerts: true
};

const readLocalJSON = (key, fallback = {}) => {
    try {
        return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
    } catch {
        return fallback;
    }
};

const Settings = () => {
    const [admin, setAdmin] = useState({
        full_name: "",
        email: "",
        role: ""
    });

    const [passwords, setPasswords] = useState({
        current_password: "",
        new_password: "",
        confirm_password: ""
    });

    const [notifications, setNotifications] = useState(() => ({
        ...defaultNotifications,
        ...readLocalJSON("admin_notifications", defaultNotifications)
    }));

    const [showPasswords, setShowPasswords] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const savedAdmin = readLocalJSON("admin", {});

        setAdmin({
            full_name:
                savedAdmin.full_name ||
                savedAdmin.name ||
                "",
            email: savedAdmin.email || "",
            role: savedAdmin.role || ""
        });
    }, []);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;

        setAdmin((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;

        setPasswords((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleNotificationChange = (e) => {
        const { name, checked } = e.target;

        setNotifications((prev) => ({
            ...prev,
            [name]: checked
        }));
    };

    const getResponseData = async (response) => {
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(
                data.message || `Request failed (${response.status}).`
            );
        }

        return data;
    };

    const saveProfile = async () => {
        setLoading(true);
        setMessage("");
        setError("");

        try {
            if (!admin.full_name.trim() || !admin.email.trim()) {
                throw new Error("Full name and email are required.");
            }

            const token = getToken();

            if (!token) {
                throw new Error("Admin session not found. Please log in again.");
            }

            const response = await fetch(
                `${API_BASE_URL}/api/admin/settings/profile`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        full_name: admin.full_name.trim(),
                        email: admin.email.trim()
                    })
                }
            );

            const data = await getResponseData(response);

            if (!data.admin) {
                throw new Error("Server did not return updated administrator details.");
            }

            const savedAdmin = {
                ...readLocalJSON("admin", {}),
                name: data.admin.full_name,
                full_name: data.admin.full_name,
                email: data.admin.email,
                role: data.admin.role
            };

            localStorage.setItem("admin", JSON.stringify(savedAdmin));

            setAdmin({
                full_name: data.admin.full_name || "",
                email: data.admin.email || "",
                role: data.admin.role || ""
            });

            setMessage("Profile updated successfully.");

        } catch (err) {
            setError(err.message || "Unable to update profile.");
        } finally {
            setLoading(false);
        }
    };

    const changePassword = async () => {
        setLoading(true);
        setMessage("");
        setError("");

        try {
            if (
                !passwords.current_password ||
                !passwords.new_password ||
                !passwords.confirm_password
            ) {
                throw new Error("Please complete all password fields.");
            }

            if (passwords.new_password.length < 8) {
                throw new Error("New password must contain at least 8 characters.");
            }

            if (passwords.new_password !== passwords.confirm_password) {
                throw new Error("New passwords do not match.");
            }

            const token = getToken();

            if (!token) {
                throw new Error("Admin session not found. Please log in again.");
            }

            const response = await fetch(
                `${API_BASE_URL}/api/admin/settings/password`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(passwords)
                }
            );

            const data = await getResponseData(response);

            setPasswords({
                current_password: "",
                new_password: "",
                confirm_password: ""
            });

            setMessage(data.message || "Password changed successfully.");

        } catch (err) {
            setError(err.message || "Password update failed.");
        } finally {
            setLoading(false);
        }
    };

    const saveNotifications = () => {
        try {
            localStorage.setItem(
                "admin_notifications",
                JSON.stringify(notifications)
            );

            setMessage("Notification preferences saved on this device.");
            setError("");
        } catch {
            setError("Unable to save notification preferences.");
        }
    };

    return (
        <div className="admin-settings">

            {/* HEADER */}
            <div className="settings-header">
                <div>
                    <h1>Settings</h1>
                    <p>Manage your account, security and preferences.</p>
                </div>

                <div className="settings-header-icon">
                    <FaCog />
                </div>
            </div>

            {/* NOTIFICATIONS */}
            {message && (
                <div className="settings-message success">
                    <FaCheckCircle /> {message}
                </div>
            )}

            {error && (
                <div className="settings-message error">
                    {error}
                </div>
            )}

            {/* PROFILE SETTINGS */}
            <section className="settings-card">
                <div className="settings-card-heading">
                    <div className="settings-icon blue">
                        <FaUser />
                    </div>

                    <div>
                        <h2>Profile Information</h2>
                        <p>Update your administrator details.</p>
                    </div>
                </div>

                <div className="settings-form-grid">
                    <div className="settings-field">
                        <label>Full Name</label>
                        <input
                            type="text"
                            name="full_name"
                            value={admin.full_name}
                            onChange={handleProfileChange}
                            placeholder="Enter your full name"
                        />
                    </div>

                    <div className="settings-field">
                        <label>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={admin.email}
                            onChange={handleProfileChange}
                            placeholder="Enter your email"
                        />
                    </div>

                    <div className="settings-field">
                        <label>Administrator Role</label>
                        <input
                            type="text"
                            value={admin.role}
                            disabled
                        />
                    </div>
                </div>

                <button
                    type="button"
                    className="settings-save-btn"
                    onClick={saveProfile}
                    disabled={loading}
                >
                    <FaSave />
                    {loading ? "Please wait..." : "Save Profile"}
                </button>
            </section>

            {/* PASSWORD SETTINGS */}
            <section className="settings-card">
                <div className="settings-card-heading">
                    <div className="settings-icon purple">
                        <FaLock />
                    </div>

                    <div>
                        <h2>Change Password</h2>
                        <p>Keep your administrator account secure.</p>
                    </div>
                </div>

                {[
                    {
                        label: "Current Password",
                        name: "current_password"
                    },
                    {
                        label: "New Password",
                        name: "new_password"
                    },
                    {
                        label: "Confirm New Password",
                        name: "confirm_password"
                    }
                ].map((field) => (
                    <div className="settings-field" key={field.name}>
                        <label>{field.label}</label>

                        <div className="password-input-wrapper">
                            <input
                                type={showPasswords ? "text" : "password"}
                                name={field.name}
                                value={passwords[field.name]}
                                onChange={handlePasswordChange}
                                placeholder={field.label}
                                autoComplete="off"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPasswords((prev) => !prev)
                                }
                                className="password-eye"
                                aria-label="Toggle password visibility"
                            >
                                {showPasswords ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>
                ))}

                <button
                    type="button"
                    className="settings-save-btn"
                    onClick={changePassword}
                    disabled={loading}
                >
                    <FaLock />
                    {loading ? "Please wait..." : "Update Password"}
                </button>
            </section>

            {/* NOTIFICATION SETTINGS */}
            <section className="settings-card">
                <div className="settings-card-heading">
                    <div className="settings-icon orange">
                        <FaBell />
                    </div>

                    <div>
                        <h2>Notifications</h2>
                        <p>Choose your notification preferences.</p>
                    </div>
                </div>

                {[
                    {
                        label: "Email Notifications",
                        description: "Receive account notifications by email.",
                        name: "email_notifications"
                    },
                    {
                        label: "Transaction Alerts",
                        description: "Receive alerts about banking transactions.",
                        name: "transaction_alerts"
                    },
                    {
                        label: "Security Alerts",
                        description: "Receive important account security alerts.",
                        name: "security_alerts"
                    }
                ].map((item) => (
                    <label className="settings-toggle-row" key={item.name}>
                        <div>
                            <strong>{item.label}</strong>
                            <p>{item.description}</p>
                        </div>

                        <input
                            type="checkbox"
                            name={item.name}
                            checked={notifications[item.name]}
                            onChange={handleNotificationChange}
                        />
                    </label>
                ))}

                <button
                    type="button"
                    className="settings-save-btn"
                    onClick={saveNotifications}
                >
                    <FaSave /> Save Preferences
                </button>
            </section>

            {/* SECURITY INFORMATION */}
            <section className="settings-card security-card">
                <div className="settings-card-heading">
                    <div className="settings-icon green">
                        <FaShieldAlt />
                    </div>

                    <div>
                        <h2>Security Information</h2>
                        <p>Administrator account security details.</p>
                    </div>
                </div>

                <div className="security-information">
                    <div>
                        <span>Account Role</span>
                        <strong>{admin.role || "Administrator"}</strong>
                    </div>

                    <div>
                        <span>Authentication</span>
                        <strong>JWT Protected</strong>
                    </div>

                    <div>
                        <span>Password Protection</span>
                        <strong>bcrypt Hashing</strong>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Settings;
