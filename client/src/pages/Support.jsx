
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Support.css";

const faqs = [
    {
        question: "I forgot my transaction PIN",
        answer:
            "For your security, contact customer support to request assistance with resetting your transaction PIN. Never share your current PIN or verification code with anyone.",
    },
    {
        question: "My transfer failed. What should I do?",
        answer:
            "Check your transaction history first. If your account was debited but the beneficiary was not credited, contact support with your transaction reference. Avoid repeating the transfer until its status is confirmed.",
    },
    {
        question: "My card is blocked",
        answer:
            "Contact customer support immediately for assistance. Never share your card PIN, CVV or one-time password with anyone claiming to be a bank representative.",
    },
    {
        question: "How can I update my personal information?",
        answer:
            "Visit your Profile page to review and update the personal information available for editing. Some changes may require additional verification.",
    },
    {
        question: "How do I check my account balance?",
        answer:
            "Log in to your Skyravon Bank dashboard to view your available account balance and recent account activity.",
    },
];

function Support() {
    const [activeFaq, setActiveFaq] = useState(0);

    // Load Skyravon Bank Tawk.to Customer Support
    useEffect(() => {
        window.Tawk_API = window.Tawk_API || {};
        window.Tawk_LoadStart = new Date();

        // Prevent duplicate script loading
        if (document.getElementById("tawkto-script")) {
            return;
        }

        const script = document.createElement("script");

        script.id = "tawkto-script";
        script.async = true;
        script.src =
            "https://embed.tawk.to/6b028f44cc54b13cd956b690/1k80vv90o";
        script.charset = "UTF-8";
        script.setAttribute("crossorigin", "*");

        const firstScript = document.getElementsByTagName("script")[0];

        if (firstScript?.parentNode) {
            firstScript.parentNode.insertBefore(script, firstScript);
        } else {
            document.head.appendChild(script);
        }

        // Keep Tawk.to loaded during SPA navigation
        return () => {};
    }, []);

    // Open Skyravon Bank live customer chat
    const openCustomerCareChat = () => {
        if (window.Tawk_API?.maximize) {
            window.Tawk_API.maximize();
        } else {
            // Chat widget may still be loading
            console.log("Skyravon customer chat is loading. Please try again shortly.");
        }
    };

    const toggleFaq = (index) => {
        setActiveFaq((current) =>
            current === index ? null : index
        );
    };

    return (
        <div className="support-page">

            {/* Header */}
            <header className="support-header">
                <div className="support-header-left">
                    <Link
                        to="/dashboard"
                        className="support-back-button"
                    >
                        ←
                    </Link>

                    <div>
                        <span className="support-breadcrumb">
                            SKYRAVON BANK / HELP CENTRE
                        </span>

                        <h1>Customer Support</h1>
                    </div>
                </div>

                <Link
                    to="/dashboard"
                    className="support-dashboard-link"
                >
                    <span>⌂</span> Dashboard
                </Link>
            </header>

            <main className="support-container">

                {/* Hero */}
                <section className="support-hero">
                    <div className="support-hero-content">

                        <span className="support-eyebrow">
                            WE'RE HERE TO HELP
                        </span>

                        <h2>
                            How can we help
                            <br />
                            <span>you today?</span>
                        </h2>

                        <p>
                            Have a question about your account, a transaction
                            or our banking services? Our customer care team
                            is available to assist you.
                        </p>

                        <button
                            type="button"
                            className="support-hero-button"
                            onClick={openCustomerCareChat}
                        >
                            Chat with Customer Care
                            <span>→</span>
                        </button>
                    </div>

                    <div className="support-hero-visual">
                        <div className="support-hero-circle">
                            <span>☏</span>
                        </div>

                        <div className="support-floating-card">
                            <span className="support-online-dot" />

                            <div>
                                <strong>Customer Care</strong>
                                <small>We're here to assist you</small>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Contact heading */}
                <section
                    className="support-section-heading"
                    id="contact-options"
                >
                    <div>
                        <span>GET IN TOUCH</span>

                        <h2>We're just a message away</h2>

                        <p>
                            Choose your preferred way to reach Skyravon Bank.
                        </p>
                    </div>
                </section>

                {/* Contact cards */}
                <section className="support-contact-grid">

                    {/* Phone */}
                    <a
                        href="tel:+421950207351"
                        className="support-contact-card"
                    >
                        <div className="support-contact-icon blue">
                            ☎
                        </div>

                        <span className="support-contact-label">
                            CALL US
                        </span>

                        <h3>Phone Support</h3>

                        <p>+421 950 207 351</p>

                        <span className="support-contact-action">
                            Call now <span>↗</span>
                        </span>
                    </a>

                    {/* Email */}
                    <a
                        href="mailto:skyravoncustomercare@gmail.com"
                        className="support-contact-card"
                    >
                        <div className="support-contact-icon purple">
                            ✉
                        </div>

                        <span className="support-contact-label">
                            EMAIL US
                        </span>

                        <h3>Email Support</h3>

                        <p>
                            skyravoncustomercare@gmail.com
                        </p>

                        <span className="support-contact-action">
                            Send an email <span>↗</span>
                        </span>
                    </a>

                    {/* Live Chat */}
                    <button
                        type="button"
                        className="support-contact-card support-chat-card"
                        onClick={openCustomerCareChat}
                    >
                        <div className="support-contact-icon green">
                            ◉
                        </div>

                        <span className="support-contact-label">
                            LIVE ASSISTANCE
                        </span>

                        <h3>Live Chat</h3>

                        <p>
                            Speak directly with our customer care team.
                        </p>

                        <span className="support-contact-action">
                            Start chatting <span>↗</span>
                        </span>
                    </button>

                    {/* Branch */}
                    <div className="support-contact-card">
                        <div className="support-contact-icon orange">
                            ⌖
                        </div>

                        <span className="support-contact-label">
                            IN-PERSON HELP
                        </span>

                        <h3>Visit a Branch</h3>

                        <p>
                            Get assistance with account enquiries.
                        </p>

                        <span className="support-contact-action unavailable">
                            Branch details not listed
                        </span>
                    </div>

                </section>

                {/* Support hours */}
                <section className="support-hours-banner">
                    <div className="support-hours-icon">
                        ◷
                    </div>

                    <div>
                        <strong>Customer Care Support</strong>

                        <p>
                            Connect with our team through live chat.
                        </p>
                    </div>

                    <span className="support-hours-status">
                        <span />
                        Live chat availability
                    </span>
                </section>

                {/* FAQs */}
                <section className="support-faq-section">

                    <div className="support-faq-heading">
                        <div>
                            <span>HELP & INFORMATION</span>

                            <h2>Frequently Asked Questions</h2>

                            <p>
                                Find answers to some common banking questions.
                            </p>
                        </div>

                        <div className="support-faq-symbol">
                            ?
                        </div>
                    </div>

                    <div className="support-faq-list">
                        {faqs.map((faq, index) => (
                            <div
                                className={`support-faq-item ${
                                    activeFaq === index ? "open" : ""
                                }`}
                                key={faq.question}
                            >
                                <button
                                    type="button"
                                    className="support-faq-question"
                                    aria-expanded={activeFaq === index}
                                    onClick={() => toggleFaq(index)}
                                >
                                    <span>{faq.question}</span>

                                    <span className="support-faq-chevron">
                                        {activeFaq === index ? "−" : "+"}
                                    </span>
                                </button>

                                {activeFaq === index && (
                                    <div className="support-faq-answer">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                </section>

                {/* Security notice */}
                <section className="support-security-notice">
                    <div className="support-security-icon">
                        🔐
                    </div>

                    <div>
                        <strong>Stay safe while banking</strong>

                        <p>
                            Skyravon Bank will never ask you to disclose your
                            password, transaction PIN, CVV or one-time
                            verification code. Keep your banking information
                            private and report suspicious activity immediately.
                        </p>
                    </div>
                </section>

                {/* Bottom CTA */}
                <section className="support-bottom-cta">
                    <div>
                        <h2>Still need assistance?</h2>

                        <p>
                            Our customer care team is ready to assist you.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openCustomerCareChat}
                    >
                        Chat with us <span>→</span>
                    </button>
                </section>

                {/* Footer */}
                <footer className="support-footer">
                    <span>
                        © {new Date().getFullYear()} Skyravon Bank.
                        All rights reserved.
                    </span>

                    <div>
                        <Link to="/privacy">Privacy</Link>
                        <Link to="/terms">Terms</Link>
                        <Link to="/dashboard">Dashboard</Link>
                    </div>
                </footer>

            </main>
        </div>
    );
}

export default Support;
