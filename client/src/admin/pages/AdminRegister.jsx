
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
    FaUniversity,
    FaUser,
    FaEnvelope,
    FaLock,
    FaEye,
    FaEyeSlash,
    FaArrowRight,
    FaSpinner,
    FaShieldAlt,
    FaCheckCircle
} from "react-icons/fa";

import "../css/login.css";
import "../css/admin-register.css";

function AdminRegister() {
    const navigate = useNavigate();

    // STATES
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        password: "",
        confirm_password: "",
        registration_key: ""
    });

    // HANDLE INPUT CHANGES
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        if (error) setError("");
        if (success) setSuccess("");
    };

    // HANDLE ADMIN REGISTRATION
    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        const full_name = formData.full_name.trim();
        const email = formData.email.trim().toLowerCase();
        const registration_key = formData.registration_key.trim();

        // Validate required fields
        if (
            !full_name ||
            !email ||
            !formData.password ||
            !formData.confirm_password ||
            !registration_key
        ) {
            setError("Please complete all required fields.");
            return;
        }

        // Validate full name
        if (full_name.length < 3) {
            setError("Please enter a valid full name.");
            return;
        }

        // Validate password
        if (formData.password.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        // Confirm password
        if (formData.password !== formData.confirm_password) {
            setError("Your passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            // BACKEND API URL
            const API_URL = (
                import.meta.env.VITE_API_URL ||
                "http://localhost:5000"
            ).replace(/\/+$/, "");

            // SEND REGISTRATION REQUEST
            const response = await fetch(
                `${API_URL}/api/admin/register`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        full_name,
                        email,
                        password: formData.password,
                        registration_key
                    })
                }
            );

            // PROCESS SERVER RESPONSE
            const data = await response.json();

            if (!response.ok || !data?.success) {
                throw new Error(
                    data?.message ||
                    "Unable to create administrator account."
                );
            }

            // SUCCESS MESSAGE
            setSuccess(
                "Administrator account created successfully. Redirecting to login..."
            );

            // CLEAR FORM
            setFormData({
                full_name: "",
                email: "",
                password: "",
                confirm_password: "",
                registration_key: ""
            });

            // REDIRECT TO ADMIN LOGIN
            setTimeout(() => {
                navigate("/admin/login", {
                    replace: true
                });
            }, 1800);

        } catch (err) {
            console.error("Admin registration error:", err);

            setError(
                err.message ||
                "Unable to connect to the server. Please try again."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="admin-login-page admin-register-page">

            {/* BACKGROUND */}
            <div className="admin-login-background">

                <span className="login-orb login-orb-one"></span>

                <span className="login-orb login-orb-two"></span>

                <span className="login-grid-pattern"></span>

            </div>

            <div className="admin-register-container">

                {/* LEFT BRANDING PANEL */}
                <section className="admin-register-brand">

                    <div className="admin-brand">

                        <div className="bank-logo">
                            <FaUniversity />
                        </div>

                        <div className="admin-brand-name">

                            <strong>Skyravon Bank</strong>

                            <span>ADMINISTRATION</span>

                        </div>

                    </div>

                    <div className="register-brand-content">

                        <span className="admin-welcome-label">

                            <span className="welcome-dot"></span>

                            ADMINISTRATOR REGISTRATION

                        </span>

                        <h1>
                            Expand your
                            <span> administration team.</span>
                        </h1>

                        <p>
                            Create an authorized administrator account
                            to help manage and oversee banking operations.
                        </p>

                        {/* SECURITY CARD */}
                        <div className="admin-security-card">

                            <div className="security-icon">
                                <FaShieldAlt />
                            </div>

                            <div>

                                <strong>Secure Registration</strong>

                                <p>
                                    Administrator registration requires
                                    an authorized registration key.
                                </p>

                            </div>

                        </div>

                    </div>

                    {/* LEFT FOOTER */}
                    <div className="login-left-footer">

                        © {new Date().getFullYear()} Skyravon Bank

                    </div>

                </section>

                {/* RIGHT REGISTRATION PANEL */}
                <section className="admin-register-form-section">

                    <div className="admin-register-form-wrapper">

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

                        {/* TOP BADGE */}
                        <div className="login-form-top">

                            <span className="login-form-badge">

                                <FaShieldAlt />

                                SECURE ADMIN PORTAL

                            </span>

                        </div>

                        {/* FORM TITLE */}
                        <div className="form-title">

                            <h2>Create Admin Account</h2>

                            <p>
                                Enter your details to register a new
                                administrator account.
                            </p>

                        </div>

                        {/* REGISTRATION FORM */}
                        <form
                            className="login-form admin-register-form"
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

                            {/* FULL NAME */}
                            <div className="input-group">

                                <label htmlFor="admin-full-name">
                                    Full Name
                                </label>

                                <div className="input-box">

                                    <FaUser className="input-icon" />

                                    <input
                                        id="admin-full-name"
                                        type="text"
                                        name="full_name"
                                        placeholder="Enter your full name"
                                        value={formData.full_name}
                                        onChange={handleChange}
                                        autoComplete="name"
                                        maxLength={150}
                                        required
                                        disabled={loading}
                                    />

                                </div>

                            </div>

                            {/* EMAIL ADDRESS */}
                            <div className="input-group">

                                <label htmlFor="admin-register-email">
                                    Email Address
                                </label>

                                <div className="input-box">

                                    <FaEnvelope className="input-icon" />

                                    <input
                                        id="admin-register-email"
                                        type="email"
                                        name="email"
                                        placeholder="Enter your email address"
                                        value={formData.email}
                                        onChange={handleChange}
                                        autoComplete="email"
                                        maxLength={150}
                                        required
                                        disabled={loading}
                                    />

                                </div>

                            </div>

                            {/* PASSWORD */}
                            <div className="input-group">

                                <label htmlFor="admin-register-password">
                                    Password
                                </label>

                                <div className="input-box">

                                    <FaLock className="input-icon" />

                                    <input
                                        id="admin-register-password"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        name="password"
                                        placeholder="Create a password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        autoComplete="new-password"
                                        minLength={8}
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

                            {/* CONFIRM PASSWORD */}
                            <div className="input-group">

                                <label htmlFor="admin-confirm-password">
                                    Confirm Password
                                </label>

                                <div className="input-box">

                                    <FaLock className="input-icon" />

                                    <input
                                        id="admin-confirm-password"
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        name="confirm_password"
                                        placeholder="Confirm your password"
                                        value={formData.confirm_password}
                                        onChange={handleChange}
                                        autoComplete="new-password"
                                        required
                                        disabled={loading}
                                    />

                                    <button
                                        type="button"
                                        className="password-btn"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                (prev) => !prev
                                            )
                                        }
                                        aria-label={
                                            showConfirmPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                        disabled={loading}
                                    >

                                        {showConfirmPassword
                                            ? <FaEyeSlash />
                                            : <FaEye />
                                        }

                                    </button>

                                </div>

                            </div>

                            {/* REGISTRATION KEY */}
                            <div className="input-group">

                                <label htmlFor="admin-registration-key">
                                    Authorized Registration Key
                                </label>

                                <div className="input-box">

                                    <FaShieldAlt className="input-icon" />

                                    <input
                                        id="admin-registration-key"
                                        type="password"
                                        name="registration_key"
                                        placeholder="Enter registration key"
                                        value={formData.registration_key}
                                        onChange={handleChange}
                                        autoComplete="off"
                                        required
                                        disabled={loading}
                                    />

                                </div>

                                <small className="register-field-hint">

                                    Obtain this key from the authorized
                                    system administrator.

                                </small>

                            </div>

                            {/* SUBMIT BUTTON */}
                            <button
                                type="submit"
                                className="login-btn"
                                disabled={loading}
                            >

                                {loading ? (

                                    <>
                                        <FaSpinner className="spin" />
                                        Creating Account...
                                    </>

                                ) : (

                                    <>
                                        Create Admin Account
                                        <FaArrowRight />
                                    </>

                                )}

                            </button>

                        </form>

                        {/* LOGIN LINK */}
                        <div className="admin-register-login-link">

                            <span>
                                Already have an admin account?
                            </span>

                            <Link to="/admin/login">
                                Sign In
                            </Link>

                        </div>

                        {/* SECURITY NOTE */}
                        <div className="login-security-note">

                            <FaLock />

                            <p>
                                Keep your administrator credentials and
                                registration key confidential.
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

export default AdminRegister;

