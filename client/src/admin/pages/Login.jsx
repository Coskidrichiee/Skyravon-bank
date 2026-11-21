

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginAdmin } from "../../services/api";

import {
    FaUniversity,
    FaEnvelope,
    FaLock,
    FaEye,
    FaEyeSlash,
    FaShieldAlt,
    FaArrowRight,
    FaSpinner,
    FaCheckCircle,
    FaUserShield,
    FaFingerprint
} from "react-icons/fa";

import "../css/login.css";

function Login() {
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        remember: false
    });

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));

        if (error) setError("");
        if (success) setSuccess("");
    };

    // Handle administrator login
    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        const email = formData.email.trim().toLowerCase();

        if (!email || !formData.password) {
            setError(
                "Please enter your email address and password."
            );
            return;
        }

        try {
            setLoading(true);

            const data = await loginAdmin({
                email,
                password: formData.password
            });

            if (!data?.success || !data?.token || !data?.admin) {
                throw new Error(
                    data?.message || "Admin login failed."
                );
            }

            // Save administrator authentication
            localStorage.setItem("adminToken", data.token);
            localStorage.setItem("banking_admin_token", data.token);

            localStorage.setItem(
                "admin",
                JSON.stringify(data.admin)
            );

            localStorage.setItem(
                "banking_admin",
                JSON.stringify(data.admin)
            );

            // Remember administrator preference
            if (formData.remember) {
                localStorage.setItem("rememberAdmin", "true");
            } else {
                localStorage.removeItem("rememberAdmin");
            }

            setSuccess(
                "Authentication successful. Redirecting..."
            );

            navigate("/admin/dashboard", {
                replace: true
            });

        } catch (err) {
            console.error("Admin login error:", err);

            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to connect to server. Please try again."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="admin-login-page">

            {/* BACKGROUND */}
            <div className="admin-login-background">
                <span className="login-orb login-orb-one"></span>
                <span className="login-orb login-orb-two"></span>
                <span className="login-grid-pattern"></span>
            </div>

            <div className="login-container">

                {/* LEFT BRANDING PANEL */}
                <section className="login-left">

                    <div className="admin-brand">

                        <div className="bank-logo">
                            <FaUniversity />
                        </div>

                        <div className="admin-brand-name">
                            <strong>Skyravon Bank</strong>
                            <span>ADMINISTRATION</span>
                        </div>

                    </div>

                    <div className="login-left-content">

                        <span className="admin-welcome-label">
                            <span className="welcome-dot"></span>
                            ADMINISTRATOR ACCESS
                        </span>

                        <h1>
                            Banking control.
                            <span> Simplified.</span>
                        </h1>

                        <p className="login-description">
                            Manage your banking operations from one
                            secure and intelligent administration
                            platform.
                        </p>

                        {/* ADMIN CAPABILITIES */}
                        <div className="admin-capabilities">

                            <div className="capability-item">

                                <div className="capability-icon">
                                    <FaUserShield />
                                </div>

                                <div>
                                    <strong>
                                        Customer Management
                                    </strong>

                                    <span>
                                        Manage customer accounts and
                                        banking profiles.
                                    </span>
                                </div>

                            </div>

                            <div className="capability-item">

                                <div className="capability-icon">
                                    <FaFingerprint />
                                </div>

                                <div>
                                    <strong>
                                        Transaction Control
                                    </strong>

                                    <span>
                                        Monitor deposits, withdrawals
                                        and transfers.
                                    </span>
                                </div>

                            </div>

                            <div className="capability-item">

                                <div className="capability-icon">
                                    <FaShieldAlt />
                                </div>

                                <div>
                                    <strong>
                                        Secure Administration
                                    </strong>

                                    <span>
                                        Access protected administrative
                                        banking operations.
                                    </span>
                                </div>

                            </div>

                        </div>

                        {/* SECURITY CARD */}
                        <div className="admin-security-card">

                            <div className="security-icon">
                                <FaShieldAlt />
                            </div>

                            <div>
                                <strong>
                                    Protected Admin Access
                                </strong>

                                <p>
                                    Sign in using your authorized
                                    administrator credentials.
                                </p>
                            </div>

                            <FaCheckCircle className="security-check" />

                        </div>

                    </div>

                    {/* LEFT FOOTER */}
                    <div className="login-left-footer">

                        <span>
                            © {new Date().getFullYear()} Skyravon Bank
                        </span>

                        <span>
                            Secure Banking Administration
                        </span>

                    </div>

                </section>

                {/* RIGHT LOGIN PANEL */}
                <section className="login-right">

                    <div className="login-form-wrapper">

                        {/* MOBILE BRAND */}
                        <div className="login-mobile-brand">

                            <div className="bank-logo">
                                <FaUniversity />
                            </div>

                            <div>
                                <strong>Skyravon Bank</strong>
                                <span>ADMIN PORTAL</span>
                            </div>

                        </div>

                        <div className="login-form-top">

                            <span className="login-form-badge">
                                <FaShieldAlt />
                                SECURE ADMIN PORTAL
                            </span>

                        </div>

                        {/* FORM TITLE */}
                        <div className="form-title">

                            <h2>Welcome back</h2>

                            <p>
                                Sign in to access your administration
                                dashboard.
                            </p>

                        </div>

                        {/* LOGIN FORM */}
                        <form
                            className="login-form"
                            onSubmit={handleSubmit}
                        >

                            {/* ERROR MESSAGE */}
                            {error && (
                                <div
                                    className="alert error"
                                    role="alert"
                                >
                                    <span className="alert-symbol">
                                        !
                                    </span>

                                    <span>{error}</span>
                                </div>
                            )}

                            {/* SUCCESS MESSAGE */}
                            {success && (
                                <div
                                    className="alert success"
                                    role="status"
                                >
                                    <FaCheckCircle />
                                    <span>{success}</span>
                                </div>
                            )}

                            {/* EMAIL */}
                            <div className="input-group">

                                <label htmlFor="admin-email">
                                    Email Address
                                </label>

                                <div className="input-box">

                                    <FaEnvelope className="input-icon" />

                                    <input
                                        id="admin-email"
                                        type="email"
                                        name="email"
                                        placeholder="Enter your admin email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        autoComplete="username"
                                        required
                                        disabled={loading}
                                    />

                                </div>

                            </div>

                            {/* PASSWORD */}
                            <div className="input-group">

                                <div className="password-label-row">

                                    <label htmlFor="admin-password">
                                        Password
                                    </label>

                                </div>

                                <div className="input-box">

                                    <FaLock className="input-icon" />

                                    <input
                                        id="admin-password"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        name="password"
                                        placeholder="Enter your password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        autoComplete="current-password"
                                        required
                                        disabled={loading}
                                    />

                                    <button
                                        type="button"
                                        className="password-btn"
                                        onClick={() =>
                                            setShowPassword(
                                                (prev) => !prev
                                            )
                                        }
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                        disabled={loading}
                                    >
                                        {showPassword
                                            ? <FaEyeSlash />
                                            : <FaEye />
                                        }
                                    </button>

                                </div>

                            </div>

                            {/* REMEMBER ME */}
                            <div className="remember-row">

                                <label className="remember-label">

                                    <input
                                        type="checkbox"
                                        name="remember"
                                        checked={formData.remember}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />

                                    <span className="custom-checkbox"></span>

                                    Remember me

                                </label>

                                <span className="admin-access-label">
                                    Authorized personnel only
                                </span>

                            </div>

                            {/* LOGIN BUTTON */}
                            <button
                                type="submit"
                                className="login-btn"
                                disabled={loading}
                            >

                                {loading ? (
                                    <>
                                        <FaSpinner className="spin" />
                                        Authenticating...
                                    </>
                                ) : (
                                    <>
                                        Sign In to Dashboard
                                        <FaArrowRight />
                                    </>
                                )}

                            </button>

                        </form>

                        {/* CREATE ADMIN ACCOUNT LINK */}
                        <div className="create-admin-link">

                            <span>
                                Need an administrator account?
                            </span>

                            <Link to="/admin/adminregister">
                                Create New Admin
                                <FaArrowRight />
                            </Link>

                        </div>

                        {/* DIVIDER */}
                        <div className="login-divider">

                            <span></span>

                            <p>SECURE ADMINISTRATION</p>

                            <span></span>

                        </div>

                        {/* SECURITY NOTE */}
                        <div className="login-security-note">

                            <FaLock />

                            <p>
                                This portal is restricted to authorized
                                Skyravon Bank administrators. Never share
                                your login credentials.
                            </p>

                        </div>

                    </div>

                    {/* RIGHT FOOTER */}
                    <div className="login-right-footer">

                        <span>
                            Skyravon Bank Admin Portal
                        </span>

                        <span>
                            Confidential Access
                        </span>

                    </div>

                </section>

            </div>

        </main>
    );
}

export default Login;
