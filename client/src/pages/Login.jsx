
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import "./Login.css";

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        if (error) setError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        const email = formData.email.trim();

        if (!email || !formData.password) {
            setError("Please enter your email address and password.");
            return;
        }

        try {
            setLoading(true);

            await login({
                email,
                password: formData.password,
            });

            navigate("/dashboard", { replace: true });
        } catch (err) {
            setError(
                err?.message || "Unable to sign in. Please check your details and try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="login-page">
            {/* Branding panel */}
            <section className="login-brand">
                <div className="login-brand-inner">
                    <Link to="/login" className="login-brand-logo">
                        <img
                            src="/Logo.png"
                            alt="Skyravon Logo"
                            className="login-brand-image"
                        />
                <div>
                            <strong>Skyravon</strong>
                            <small>BANK</small>
                        </div>
                    </Link>

                    <div className="login-brand-content">
                        <span className="login-brand-label">
                            BANKING MADE SIMPLE
                        </span>

                        <h1>
                            Your money.
                            <br />
                            Your future.
                            <br />
                            <span>Your control.</span>
                        </h1>

                        <p>
                            Experience a smarter way to manage your money.
                            Bank confidently, make transactions and stay
                            connected to your finances.
                        </p>

                        <div className="login-feature-list">
                            <div className="login-feature">
                                <span>✓</span>
                                <div>
                                    <strong>Secure Banking</strong>
                                    <small>Your account security matters.</small>
                                </div>
                            </div>

                            <div className="login-feature">
                                <span>↗</span>
                                <div>
                                    <strong>Easy Transactions</strong>
                                    <small>Manage your money with ease.</small>
                                </div>
                            </div>

                            <div className="login-feature">
                                <span>◷</span>
                                <div>
                                    <strong>Bank Anytime</strong>
                                    <small>Access your account when you need it.</small>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="login-brand-bottom">
                        <span>SKYRAVON BANK</span>
                        <span>SMARTER BANKING EXPERIENCE</span>
                    </div>
                </div>
            </section>

            {/* Login panel */}
            <section className="login-section">
                <div className="login-card">
                    <div className="login-mobile-brand">
                        <Link to="/login" className="login-brand-logo">
                            <img
                                src="/Logo.png"
                                alt="Skyravon Bank Logo"
                                className="login-brand-image"
                            />
                            <div>
                                <strong>Skyravon</strong>
                                <small>BANK</small>
                            </div>
                        </Link>
                    </div>

                    <div className="login-top-note">
                        <span className="login-lock-icon">♙</span>
                        <span>SECURE CUSTOMER LOGIN</span>
                    </div>

                    <div className="login-header">
                        <h2>Welcome back</h2>
                        <p>
                            Sign in to your Skyravon Bank account to continue.
                        </p>
                    </div>

                    {error && (
                        <div className="login-error" role="alert">
                            <span>!</span>
                            <p>{error}</p>
                        </div>
                    )}

                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>

                            <div className="input-wrapper">
                                <span className="input-icon">✉</span>

                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="name@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    autoComplete="email"
                                    autoFocus
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="password-label">
                                <label htmlFor="password">Password</label>

                                <Link to="/forgot-password">
                                    Forgot password?
                                </Link>
                            </div>

                            <div className="input-wrapper">
                                <span className="input-icon">♙</span>

                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    autoComplete="current-password"
                                    required
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword((previous) => !previous)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                        </div>

                        <div className="form-options">
                            <label className="remember-me">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(event) => setRememberMe(event.target.checked)}
                                />
                                <span className="custom-checkbox" />
                                <span>Remember me</span>
                            </label>

                            <span className="login-private-note">
                                Private device only
                            </span>
                        </div>

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="login-spinner" />
                                    Signing you in...
                                </>
                            ) : (
                                <>
                                    <span>Sign In to Account</span>
                                    <span className="button-arrow">→</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="login-divider">
                        <span>NEW TO SKYRAVON BANK?</span>
                    </div>

                    <Link to="/register" className="register-button">
                        Create an Account <span>→</span>
                    </Link>

                    <div className="login-security">
                        <span>🔒</span>
                        <p>
                            Your connection is private. Never share your
                            password or transaction PIN with anyone.
                        </p>
                    </div>

                    <footer className="login-footer">
                        <span>© {new Date().getFullYear()} Skyravon Bank</span>

                        <div>
                            <Link to="/privacy">Privacy</Link>
                            <Link to="/terms">Terms</Link>
                            <Link to="/support">Help</Link>
                        </div>
                    </footer>
                </div>
            </section>
        </main>
    );
}

export default Login;
