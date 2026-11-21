
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import {
    ArrowLeft,
    ArrowDownToLine,
    ShieldCheck,
    Building2,
    CreditCard,
    MapPin,
    Headphones,
    ChevronRight,
    Wallet,
    Info,
    Clock,
    LockKeyhole
} from "lucide-react";

import "./Withdraw.css";

function Withdraw() {
    const { user } = useAuth();

    const balance = Number(user?.balance || 0);

    const formatCurrency = (amount) =>
        new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
            minimumFractionDigits: 2
        }).format(amount);

    const accountNumber = user?.account_number || "Not available";
    const accountName =
        user?.full_name ||
        user?.name ||
        "Account Holder";

    return (
        <div className="withdraw-page">

            <header className="withdraw-header">
                <Link to="/dashboard" className="withdraw-back">
                    <ArrowLeft size={20} />
                </Link>

                <div className="withdraw-header-title">
                    <span>SKYRAVON BANK</span>
                    <h1>Withdraw Funds</h1>
                </div>

                <div className="withdraw-header-icon">
                    <Wallet size={21} />
                </div>
            </header>

            <main className="withdraw-container">

                <section className="withdraw-intro">
                    <div>
                        <span className="withdraw-eyebrow">
                            ACCOUNT SERVICES
                        </span>

                        <h2>Access your money with ease.</h2>

                        <p>
                            View your available balance and learn how to
                            securely withdraw cash from your account.
                        </p>
                    </div>

                    <div className="withdraw-intro-icon">
                        <ArrowDownToLine size={38} />
                    </div>
                </section>

                <div className="withdraw-layout">

                    <div className="withdraw-main-column">

                        <section className="withdraw-balance-card">

                            <div className="withdraw-balance-top">
                                <span>
                                    <Wallet size={17} />
                                    Available Balance
                                </span>

                                <span className="withdraw-status">
                                    <span></span>
                                    Active
                                </span>
                            </div>

                            <h2>{formatCurrency(balance)}</h2>

                            <div className="withdraw-balance-bottom">
                                <div>
                                    <span>ACCOUNT HOLDER</span>
                                    <strong>{accountName}</strong>
                                </div>

                                <div>
                                    <span>ACCOUNT NUMBER</span>
                                    <strong>{accountNumber}</strong>
                                </div>
                            </div>

                            <div className="withdraw-card-decoration"></div>

                        </section>

                        <section className="withdraw-info-card">

                            <div className="withdraw-section-heading">
                                <div className="withdraw-heading-icon">
                                    <Info size={20} />
                                </div>

                                <div>
                                    <h3>Cash Withdrawal Information</h3>
                                    <p>
                                        Important information about accessing
                                        your funds.
                                    </p>
                                </div>
                            </div>

                            <div className="withdraw-alert">

                                <div className="withdraw-alert-icon">
                                    <Building2 size={23} />
                                </div>

                                <div>
                                    <strong>
                                        In-app cash withdrawal unavailable
                                    </strong>

                                    <p>
                                        Cash withdrawals cannot currently be
                                        processed directly through the
                                        Skyravon Bank mobile or online banking
                                        platform.
                                    </p>
                                </div>

                            </div>

                            <h4 className="withdraw-method-title">
                                How to withdraw your money
                            </h4>

                            <div className="withdraw-methods">

                                <div className="withdraw-method">
                                    <div className="method-icon">
                                        <Building2 size={21} />
                                    </div>

                                    <div>
                                        <strong>Visit a Bank Branch</strong>
                                        <p>
                                            Visit a Skyravon Bank branch for
                                            assistance with cash withdrawal.
                                        </p>
                                    </div>

                                    <ChevronRight size={18} />
                                </div>

                                <div className="withdraw-method">
                                    <div className="method-icon">
                                        <CreditCard size={21} />
                                    </div>

                                    <div>
                                        <strong>Use an ATM</strong>
                                        <p>
                                            Withdraw cash using your debit
                                            card at an authorized ATM.
                                        </p>
                                    </div>

                                    <ChevronRight size={18} />
                                </div>

                                <div className="withdraw-method">
                                    <div className="method-icon">
                                        <MapPin size={21} />
                                    </div>

                                    <div>
                                        <strong>Partner ATM Network</strong>
                                        <p>
                                            You may also use supported partner
                                            ATMs where available.
                                        </p>
                                    </div>

                                    <ChevronRight size={18} />
                                </div>

                            </div>

                            <div className="withdraw-reminder">
                                <ShieldCheck size={21} />

                                <div>
                                    <strong>Keep your account secure</strong>
                                    <p>
                                        Carry your debit card or valid
                                        identification. Never share your
                                        PIN, password or OTP with anyone.
                                    </p>
                                </div>
                            </div>

                        </section>

                    </div>

                    <aside className="withdraw-sidebar">

                        <section className="withdraw-security-card">

                            <div className="security-icon">
                                <LockKeyhole size={24} />
                            </div>

                            <h3>Your security matters</h3>

                            <p>
                                 Skyravon Bank prioritizes the safety of your
                                funds. Physical withdrawals require
                                verification through authorized channels.
                            </p>

                            <div className="security-feature">
                                <ShieldCheck size={17} />
                                Secure transactions
                            </div>

                            <div className="security-feature">
                                <LockKeyhole size={17} />
                                Account protection
                            </div>

                        </section>

                        <section className="withdraw-help-card">

                            <div className="help-icon">
                                <Headphones size={23} />
                            </div>

                            <h3>Need assistance?</h3>

                            <p>
                                Our customer support team is available to
                                help with withdrawal enquiries.
                            </p>

                            <Link
                                to="/support"
                                className="withdraw-support-link"
                            >
                                Contact Support
                                <ChevronRight size={17} />
                            </Link>

                        </section>

                        <section className="withdraw-processing-card">

                            <Clock size={19} />

                            <div>
                                <strong>Withdrawal availability</strong>
                                <p>
                                    Branch and ATM withdrawals are subject
                                    to their operating hours and applicable
                                    transaction limits.
                                </p>
                            </div>

                        </section>

                    </aside>

                </div>

                <footer className="withdraw-footer">

                    <div>
                        <p>Banking made simple, secure and convenient.</p>
                        <strong>SKYRAVON BANK</strong>
                    </div>

                    <div className="withdraw-footer-links">
                        <Link to="/privacy">Privacy</Link>
                        <Link to="/terms">Terms</Link>
                        <Link to="/support">Support</Link>
                    </div>

                </footer>

            </main>
        </div>
    );
}

export default Withdraw;
