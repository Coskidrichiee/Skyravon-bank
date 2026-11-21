
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import "./Deposit.css";

function Deposit() {
    const { user } = useAuth();

    const [copied, setCopied] = useState(false);

    const balance = Number(user?.balance || 0);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2
        }).format(Number(amount || 0));
    };

    const copyAccountNumber = async () => {
        if (!user?.account_number) return;

        try {
            await navigator.clipboard.writeText(user.account_number);
            setCopied(true);

            setTimeout(() => {
                setCopied(false);
            }, 2000);
        } catch {
            alert("Unable to copy account number. Please copy it manually.");
        }
    };

    return (
        <div className="deposit-page">

            {/* HEADER */}
            <header className="deposit-header">

                <div className="deposit-header-left">

                    <Link to="/dashboard" className="deposit-back-btn">
                        ←
                    </Link>

                    <div>
                        <span className="deposit-breadcrumb">
                            BANKING / ACCOUNT SERVICES
                        </span>

                        <h1>Deposit Funds</h1>
                    </div>

                </div>

                <div className="deposit-user">

                    <div className="deposit-avatar">
                        {user?.profile_picture ? (
                            <img
                                src={`http://localhost:5000/uploads/profiles/${user.profile_picture}`}
                                alt="Profile"
                            />
                        ) : (
                            user?.full_name?.charAt(0)?.toUpperCase() || "U"
                        )}
                    </div>

                    <div className="deposit-user-info">
                        <strong>{user?.full_name || "Customer"}</strong>
                        <span>{user?.account_number || "No account number"}</span>
                    </div>

                </div>

            </header>

            <main className="deposit-content">

                {/* INTRO */}
                <section className="deposit-intro">

                    <div>
                        <span className="deposit-eyebrow">
                            <span className="deposit-live-dot"></span>
                            SECURE BANKING
                        </span>

                        <h2>Fund your  Skyravon Bank account.</h2>

                        <p>
                            Add money to your account through our approved
                            deposit channels and enjoy convenient banking.
                        </p>
                    </div>

                    <div className="deposit-intro-icon">
                        +
                    </div>

                </section>

                {/* MAIN LAYOUT */}
                <div className="deposit-layout">

                    {/* LEFT COLUMN */}
                    <section className="deposit-main-card">

                        {/* BALANCE CARD */}
                        <div className="deposit-balance-card">

                            <div className="deposit-balance-top">
                                <span>AVAILABLE ACCOUNT BALANCE</span>
                                <span className="deposit-balance-symbol">$</span>
                            </div>

                            <h2>{formatCurrency(balance)}</h2>

                            <div className="deposit-balance-bottom">
                                <div>
                                    <span>ACCOUNT HOLDER</span>
                                    <strong>{user?.full_name || "Customer"}</strong>
                                </div>

                                <div className="deposit-account-number">
                                    <span>ACCOUNT NUMBER</span>

                                    <strong>
                                        {user?.account_number || "----------"}
                                    </strong>
                                </div>
                            </div>

                        </div>

                        {/* ACCOUNT INFORMATION */}
                        <div className="deposit-account-info">

                            <div className="deposit-section-heading">
                                <div>
                                    <span className="deposit-section-label">
                                        ACCOUNT DETAILS
                                    </span>

                                    <h3>Your deposit account</h3>
                                </div>

                                <span className="deposit-account-icon">
                                    🏦
                                </span>
                            </div>

                            <p>
                                Use the account information below when making
                                an approved deposit into your  Skyravon Bank account.
                            </p>

                            <div className="deposit-account-row">
                                <div>
                                    <span>Account name</span>
                                    <strong>{user?.full_name || "Customer"}</strong>
                                </div>
                            </div>

                            <div className="deposit-account-row">
                                <div>
                                    <span>Account number</span>
                                    <strong>{user?.account_number || "Not available"}</strong>
                                </div>

                                <button
                                    type="button"
                                    className="deposit-copy-btn"
                                    onClick={copyAccountNumber}
                                    disabled={!user?.account_number}
                                >
                                    {copied ? "Copied ✓" : "Copy"}
                                </button>
                            </div>

                            <div className="deposit-account-row">
                                <div>
                                    <span>Bank</span>
                                    <strong> Skyravon Bank</strong>
                                </div>
                            </div>

                        </div>

                        {/* DEPOSIT NOTICE */}
                        <div className="deposit-notice">

                            <div className="deposit-notice-heading">
                                <div className="deposit-notice-icon">
                                    ℹ
                                </div>

                                <div>
                                    <h3>Cash deposit information</h3>
                                    <span>Important account notice</span>
                                </div>
                            </div>

                            <p>
                                Cash deposits cannot currently be completed
                                directly through the  Skyravon Bank application.
                                Please use one of our approved deposit channels.
                            </p>

                            <div className="deposit-methods">

                                <div className="deposit-method">
                                    <div className="deposit-method-icon">
                                        🏢
                                    </div>

                                    <div>
                                        <strong>Bank branch</strong>
                                        <span>
                                            Visit an authorised Richiee Bank branch.
                                        </span>
                                    </div>
                                </div>

                                <div className="deposit-method">
                                    <div className="deposit-method-icon">
                                        🏧
                                    </div>

                                    <div>
                                        <strong>Cash deposit ATM</strong>
                                        <span>
                                            Use an approved cash deposit ATM.
                                        </span>
                                    </div>
                                </div>

                                <div className="deposit-method">
                                    <div className="deposit-method-icon">
                                        👨‍💼
                                    </div>

                                    <div>
                                        <strong>Agent banking</strong>
                                        <span>
                                            Deposit through an approved  Skyravon Bank agent.
                                        </span>
                                    </div>
                                </div>

                                <div className="deposit-method">
                                    <div className="deposit-method-icon">
                                        🧾
                                    </div>

                                    <div>
                                        <strong>Keep your receipt</strong>
                                        <span>
                                            Retain your deposit receipt until your
                                            account is credited.
                                        </span>
                                    </div>
                                </div>

                            </div>

                        </div>

                    </section>

                    {/* RIGHT COLUMN */}
                    <aside className="deposit-sidebar">

                        <div className="deposit-security-card">

                            <div className="deposit-security-icon">
                                🛡️
                            </div>

                            <span className="deposit-side-label">
                                BANKING SECURITY
                            </span>

                            <h3>Your money deserves protection.</h3>

                            <p>
                                Always verify the receiving account details
                                before completing a deposit. Keep your transaction
                                receipt for reference.
                            </p>

                            <div className="deposit-security-status">
                                <span></span>
                                Account information available
                            </div>

                        </div>

                        <div className="deposit-info-card">

                            <div className="deposit-info-icon">
                                ⚡
                            </div>

                            <h3>Online deposits coming soon</h3>

                            <p>
                                Online deposit services may become available
                                through supported payment gateways and verified
                                banking channels in a future update.
                            </p>

                        </div>

                        <div className="deposit-help-card">

                            <span>NEED ASSISTANCE?</span>

                            <h3>We're here to help.</h3>

                            <p>
                                Contact customer support if you need assistance
                                with funding your account.
                            </p>

                            <Link to="/support">
                                Contact support →
                            </Link>

                        </div>

                    </aside>

                </div>

                {/* FOOTER */}
                <footer className="deposit-footer">

                    <p>
                        © {new Date().getFullYear()}  Skyravon Bank.
                        All rights reserved.
                    </p>

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

export default Deposit;
