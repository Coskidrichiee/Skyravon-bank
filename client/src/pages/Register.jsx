
import { Link } from "react-router-dom";
import {
    FaBuilding,
    FaArrowLeft,
    FaPhoneAlt,
    FaShieldAlt,
    FaCheckCircle,
    FaUserCheck,
    FaIdCard,
    FaCreditCard,
    FaLock
} from "react-icons/fa";

import "./Register.css";

function Register() {
    const steps = [
        {
            number: "01",
            icon: <FaBuilding />,
            title: "Visit a Skyravon Bank branch",
            description:
                "Visit one of our branches to begin your account opening process with our banking team."
        },
        {
            number: "02",
            icon: <FaIdCard />,
            title: "Complete your verification",
            description:
                "Provide the required personal information and identification documents for verification."
        },
        {
            number: "03",
            icon: <FaCreditCard />,
            title: "Get your account details",
            description:
                "After successful account creation, our authorized staff will provide your account details and login information."
        }
    ];

    return (
        <div className="register-page">

            {/* LEFT BRANDING PANEL */}
            <aside className="register-brand">

                <div className="register-brand-top">
                    <img
                        src="/Logo.png"
                        alt="Skyravon Bank Logo"
                        className="register-brand-logo"
                    />

                    <span>Skyravon<strong>Bank</strong></span>
                </div>

                <div className="register-brand-content">

                    <span className="register-eyebrow">
                        BANK WITH CONFIDENCE
                    </span>

                    <h1>
                        Banking made
                        <span> simple.</span>
                    </h1>

                    <p className="register-brand-description">
                        Your financial journey deserves a secure,
                        convenient and reliable banking partner.
                        Welcome to a better banking experience.
                    </p>

                    <div className="register-features">

                        <div className="register-feature">
                            <div className="register-feature-icon">
                                <FaShieldAlt />
                            </div>

                            <div>
                                <strong>Security you can trust</strong>
                                <p>
                                    Your banking information deserves
                                    the highest level of protection.
                                </p>
                            </div>
                        </div>

                        <div className="register-feature">
                            <div className="register-feature-icon">
                                <FaUserCheck />
                            </div>

                            <div>
                                <strong>Personal assistance</strong>
                                <p>
                                    Our banking representatives are
                                    ready to guide you.
                                </p>
                            </div>
                        </div>

                        <div className="register-feature">
                            <div className="register-feature-icon">
                                <FaLock />
                            </div>

                            <div>
                                <strong>Banking with confidence</strong>
                                <p>
                                    Enjoy a secure and convenient
                                    account opening experience.
                                </p>
                            </div>
                        </div>

                    </div>

                </div>

                <div className="register-brand-footer">
                    <span>© {new Date().getFullYear()} Skyravon Bank</span>
                    <span>Secure Banking Experience</span>
                </div>

            </aside>


            {/* ACCOUNT OPENING SECTION */}
            <main className="register-section">

                <div className="register-card">

                    {/* MOBILE BRAND */}
                    <div className="register-mobile-logo">
                        <img
                            src="/Logo.png"
                            alt="Skyravon Bank Logo"
                            className="register-brand-logo"
                        />
                        <span>Skyravon <strong>Bank</strong></span>
                    </div>

                    {/* TOP NAVIGATION */}
                    <div className="register-top-navigation">
                        <span className="register-status">
                            <span className="status-dot"></span>
                            ACCOUNT SERVICES
                        </span>

                        <Link to="/login" className="register-top-login">
                            Sign in <FaArrowLeft />
                        </Link>
                    </div>

                    {/* HEADER */}
                    <div className="register-header">

                        <div className="account-notice-icon">
                            <FaBuilding />
                        </div>

                        <span className="register-section-label">
                            GET STARTED WITH US
                        </span>

                        <h2>
                            Open your Skyravon Bank account
                        </h2>

                        <p>
                            We're excited to welcome you. Here's how
                            you can get started with Skyravon Bank.
                        </p>

                    </div>

                    {/* ACCOUNT NOTICE */}
                    <div className="account-notice-message">

                        <div className="notice-heading">
                            <div className="notice-heading-icon">
                                <FaShieldAlt />
                            </div>

                            <div>
                                <span>ACCOUNT OPENING NOTICE</span>
                                <h3>Account creation is handled by our team</h3>
                            </div>
                        </div>

                        <p>
                            Online self-registration is currently
                            unavailable. For your security, all new
                            customer accounts are created and activated
                            by authorized Skyravon Bank representatives.
                        </p>

                        <p>
                            To open an account, kindly visit a Skyravon
                            Bank branch or contact our customer support
                            team for guidance.
                        </p>

                    </div>

                    {/* PROCESS */}
                    <div className="account-process">

                        <div className="account-process-heading">
                            <div>
                                <span>YOUR ACCOUNT JOURNEY</span>
                                <h3>Three simple steps</h3>
                            </div>

                            <span className="process-count">
                                03 STEPS
                            </span>
                        </div>

                        <div className="account-steps">

                            {steps.map((step) => (
                                <div className="account-step" key={step.number}>

                                    <div className="step-number">
                                        {step.number}
                                    </div>

                                    <div className="step-icon">
                                        {step.icon}
                                    </div>

                                    <div className="step-content">
                                        <strong>{step.title}</strong>
                                        <p>{step.description}</p>
                                    </div>

                                    <FaCheckCircle className="step-check" />

                                </div>
                            ))}

                        </div>

                    </div>

                    {/* SUPPORT BOX */}
                    <div className="account-contact-box">

                        <div className="account-contact-icon">
                            <FaPhoneAlt />
                        </div>

                        <div className="account-contact-content">
                            <span>NEED HELP?</span>
                            <strong>We're here to assist you</strong>

                            <p>
                                Contact our customer support team for
                                information about opening an account.
                            </p>
                        </div>

                    </div>

                    {/* ACTION */}
                    <Link
                        to="/login"
                        className="account-login-button"
                    >
                        <FaArrowLeft />
                        Back to Sign In
                    </Link>

                    {/* SECURITY FOOTER */}
                    <div className="register-security-text">
                        <FaShieldAlt />

                        <span>
                            Your security and privacy are important
                            to Skyravon Bank.
                        </span>
                    </div>

                </div>

            </main>

        </div>
    );
}

export default Register;
