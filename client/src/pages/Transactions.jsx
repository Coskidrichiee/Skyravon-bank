
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowDownLeft,
    ArrowUpRight,
    ArrowLeft,
    Search,
    Wallet,
    ArrowDownToLine,
    ArrowUpFromLine,
    ArrowLeftRight,
    ShieldCheck,
    CalendarDays,
    Copy,
    RefreshCw,
    ReceiptText,
    ChevronRight,
    CircleHelp,
    Clock3,
    TrendingUp,
    TrendingDown,
    X
} from "lucide-react";

import { useAuth } from "../context/useAuth";
import { getTransactions } from "../services/api";
import "./Transactions.css";

function Transactions() {
    const { user, token } = useAuth();

    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("ALL");
    const [search, setSearch] = useState("");
    const [copied, setCopied] = useState("");

    const formatCurrency = (amount) =>
        new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2
        }).format(Number(amount || 0));

    const formatDate = (date) => {
        if (!date) return "Date unavailable";

        const parsed = new Date(date);
        if (Number.isNaN(parsed.getTime())) return "Date unavailable";

        return new Intl.DateTimeFormat("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }).format(parsed);
    };

    const formatTime = (date) => {
        if (!date) return "";

        const parsed = new Date(date);
        if (Number.isNaN(parsed.getTime())) return "";

        return new Intl.DateTimeFormat("en-US", {
            hour: "2-digit",
            minute: "2-digit"
        }).format(parsed);
    };

    const loadTransactions = async () => {
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await getTransactions(token, 100);

            if (response?.success) {
                setTransactions(response.transactions || []);
            } else {
                setError(response?.message || "Unable to load transactions.");
            }
        } catch (err) {
            console.error("Transactions error:", err);
            setError(err.message || "Unable to load transactions.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTransactions();
    }, [token]);

    const getTransactionTitle = (transaction) => {
        switch (transaction.type) {
            case "DEPOSIT": return "Deposit";
            case "WITHDRAWAL": return "Withdrawal";
            case "TRANSFER_IN": return "Money received";
            case "TRANSFER_OUT": return "Money transfer";
            default: return transaction.type || "Transaction";
        }
    };

    const getTransactionIcon = (type) => {
        switch (type) {
            case "DEPOSIT": return <ArrowDownToLine size={19} />;
            case "WITHDRAWAL": return <ArrowUpFromLine size={19} />;
            case "TRANSFER_IN": return <ArrowDownLeft size={19} />;
            case "TRANSFER_OUT": return <ArrowUpRight size={19} />;
            default: return <ReceiptText size={19} />;
        }
    };

    const getTransactionDirection = (type) =>
        ["DEPOSIT", "TRANSFER_IN"].includes(type) ? "in" :
        ["WITHDRAWAL", "TRANSFER_OUT"].includes(type) ? "out" : "neutral";

    const getStatus = (transaction) => {
        const status = String(transaction.status || "COMPLETED").toUpperCase();

        if (["SUCCESS", "COMPLETED", "APPROVED"].includes(status)) {
            return { label: "Successful", className: "success" };
        }

        if (["PENDING", "PROCESSING"].includes(status)) {
            return { label: "Pending", className: "pending" };
        }

        if (["FAILED", "REJECTED", "CANCELLED"].includes(status)) {
            return { label: status.charAt(0) + status.slice(1).toLowerCase(), className: "failed" };
        }

        return { label: status, className: "neutral" };
    };

    const filteredTransactions = useMemo(() => {
        return transactions.filter((transaction) => {
            const matchesFilter =
                filter === "ALL" ||
                (filter === "TRANSFERS"
                    ? ["TRANSFER_IN", "TRANSFER_OUT"].includes(transaction.type)
                    : transaction.type === filter);

            const searchableText = [
                transaction.type,
                transaction.reference,
                transaction.description,
                transaction.related_account,
                transaction.status
            ].filter(Boolean).join(" ").toLowerCase();

            return matchesFilter && searchableText.includes(search.trim().toLowerCase());
        });
    }, [transactions, filter, search]);

    const totalIn = transactions
        .filter(t => ["DEPOSIT", "TRANSFER_IN"].includes(t.type))
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const totalOut = transactions
        .filter(t => ["WITHDRAWAL", "TRANSFER_OUT"].includes(t.type))
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const copyReference = async (reference) => {
        if (!reference) return;

        try {
            await navigator.clipboard.writeText(reference);
            setCopied(reference);
            setTimeout(() => setCopied(""), 1800);
        } catch (err) {
            console.error("Unable to copy reference:", err);
        }
    };

    const firstName = user?.full_name?.split(" ")[0] || "Customer";

    const profileImage = user?.profile_picture
        ? (user.profile_picture.startsWith("http")
            ? user.profile_picture
            : `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/uploads/profiles/${user.profile_picture}`)
        : null;

    return (
        <div className="transactions-page">

            <header className="transactions-header">
                <div className="transactions-header-inner">
                    <Link to="/dashboard" className="transactions-back">
                        <ArrowLeft size={19} />
                    </Link>

                    <Link to="/dashboard" className="transactions-brand">
                        <div className="transactions-brand-icon">
                            <Wallet size={21} />
                        </div>
                        <span>Skyravon<span>Bank</span></span>
                    </Link>

                    <div className="transactions-header-right">
                        <div className="transactions-user-avatar">
                            {profileImage ? (
                                <img src={profileImage} alt="Profile" />
                            ) : (
                                firstName.charAt(0).toUpperCase()
                            )}
                        </div>

                        <div className="transactions-user-info">
                            <strong>{user?.full_name || "Customer"}</strong>
                            <span>{user?.account_number || "Bank customer"}</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="transactions-content">

                <div className="transactions-breadcrumb">
                    <Link to="/dashboard">Dashboard</Link>
                    <ChevronRight size={15} />
                    <span>Transactions</span>
                </div>

                <section className="transactions-intro">
                    <div>
                        <span className="transactions-eyebrow">ACCOUNT MANAGEMENT</span>
                        <h1>Transaction history</h1>
                        <p>
                            Hello {firstName}, monitor your account activity
                            and keep track of your money.
                        </p>
                    </div>

                    <button
                        className="transactions-refresh"
                        onClick={loadTransactions}
                        disabled={loading}
                    >
                        <RefreshCw size={16} className={loading ? "refresh-spinning" : ""} />
                        Refresh
                    </button>
                </section>

                <section className="transactions-summary">

                    <article className="transaction-stat-card">
                        <div className="transaction-stat-top">
                            <span>Total transactions</span>
                            <div className="stat-icon purple">
                                <ReceiptText size={20} />
                            </div>
                        </div>
                        <h2>{transactions.length.toLocaleString("en-US")}</h2>
                        <p>All recorded activities</p>
                    </article>

                    <article className="transaction-stat-card">
                        <div className="transaction-stat-top">
                            <span>Total money received</span>
                            <div className="stat-icon green">
                                <TrendingUp size={20} />
                            </div>
                        </div>
                        <h2>{formatCurrency(totalIn)}</h2>
                        <p><ArrowDownLeft size={14} /> Money into your account</p>
                    </article>

                    <article className="transaction-stat-card">
                        <div className="transaction-stat-top">
                            <span>Total money sent</span>
                            <div className="stat-icon orange">
                                <TrendingDown size={20} />
                            </div>
                        </div>
                        <h2>{formatCurrency(totalOut)}</h2>
                        <p><ArrowUpRight size={14} /> Money out of your account</p>
                    </article>

                </section>

                <section className="transactions-panel">

                    <div className="transactions-panel-heading">
                        <div>
                            <h2>All transactions</h2>
                            <p>Review your recent banking activities.</p>
                        </div>

                        <span className="transaction-count">
                            {filteredTransactions.length} records
                        </span>
                    </div>

                    <div className="transactions-controls">
                        <div className="transactions-search">
                            <Search size={18} />
                            <input
                                type="search"
                                placeholder="Search by description or reference..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                            {search && (
                                <button onClick={() => setSearch("")} aria-label="Clear search">
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        <div className="transactions-filters">
                            {[
                                ["ALL", "All"],
                                ["DEPOSIT", "Deposits"],
                                ["WITHDRAWAL", "Withdrawals"],
                                ["TRANSFERS", "Transfers"]
                            ].map(([value, label]) => (
                                <button
                                    key={value}
                                    className={filter === value ? "active" : ""}
                                    onClick={() => setFilter(value)}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="transactions-state">
                            <div className="transaction-spinner" />
                            <h3>Loading transactions</h3>
                            <p>Please wait while we retrieve your account activity.</p>
                        </div>
                    ) : error ? (
                        <div className="transactions-state">
                            <div className="transactions-state-icon error">
                                <CircleHelp size={27} />
                            </div>
                            <h3>Unable to load transactions</h3>
                            <p>{error}</p>
                            <button className="transactions-primary-button" onClick={loadTransactions}>
                                <RefreshCw size={16} /> Try again
                            </button>
                        </div>
                    ) : filteredTransactions.length === 0 ? (
                        <div className="transactions-state">
                            <div className="transactions-state-icon">
                                <ReceiptText size={28} />
                            </div>
                            <h3>No transactions found</h3>
                            <p>
                                {search || filter !== "ALL"
                                    ? "Try changing your search or filter."
                                    : "Your banking activities will appear here when transactions are recorded."}
                            </p>
                            {(search || filter !== "ALL") && (
                                <button
                                    className="transactions-clear-button"
                                    onClick={() => {
                                        setSearch("");
                                        setFilter("ALL");
                                    }}
                                >
                                    Clear filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="transactions-table-heading">
                                <span>TRANSACTION DETAILS</span>
                                <span>REFERENCE</span>
                                <span>DATE</span>
                                <span>STATUS</span>
                                <span>AMOUNT</span>
                            </div>

                            <div className="transactions-list">
                                {filteredTransactions.map((transaction, index) => {
                                    const direction = getTransactionDirection(transaction.type);
                                    const status = getStatus(transaction);
                                    const incoming = direction === "in";

                                    return (
                                        <article
                                            className="transaction-item"
                                            key={transaction.id || transaction.reference || index}
                                        >
                                            <div className={`transaction-item-icon ${direction}`}>
                                                {getTransactionIcon(transaction.type)}
                                            </div>

                                            <div className="transaction-item-details">
                                                <strong>{getTransactionTitle(transaction)}</strong>
                                                <span>{transaction.description || "Banking transaction"}</span>
                                                {transaction.related_account && (
                                                    <small>Account: {transaction.related_account}</small>
                                                )}
                                            </div>

                                            <div className="transaction-item-reference">
                                                <span className="mobile-field-label">REFERENCE</span>
                                                <div>
                                                    <strong>{transaction.reference || "N/A"}</strong>
                                                    {transaction.reference && (
                                                        <button
                                                            onClick={() => copyReference(transaction.reference)}
                                                            title="Copy reference"
                                                            aria-label="Copy transaction reference"
                                                        >
                                                            {copied === transaction.reference
                                                                ? <span className="copied-label">Copied</span>
                                                                : <Copy size={14} />}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="transaction-item-date">
                                                <span className="mobile-field-label">DATE</span>
                                                <strong>{formatDate(transaction.created_at)}</strong>
                                                <span>{formatTime(transaction.created_at)}</span>
                                            </div>

                                            <div className="transaction-item-status">
                                                <span className="mobile-field-label">STATUS</span>
                                                <span className={`transaction-status ${status.className}`}>
                                                    <span />
                                                    {status.label}
                                                </span>
                                            </div>

                                            <div className={`transaction-item-amount ${direction}`}>
                                                <span className="mobile-field-label">AMOUNT</span>
                                                <strong>
                                                    {incoming ? "+" : direction === "out" ? "-" : ""}
                                                    {formatCurrency(transaction.amount)}
                                                </strong>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </section>

                <section className="transactions-security">
                    <div className="security-icon">
                        <ShieldCheck size={23} />
                    </div>
                    <div>
                        <strong>Your banking security matters</strong>
                        <p>
                            Never share your password, transaction PIN or
                            verification codes with anyone.
                        </p>
                    </div>
                    <ShieldCheck className="security-watermark" size={70} />
                </section>

                <footer className="transactions-footer">
                    <span>© {new Date().getFullYear()} Skyravon Bank. All rights reserved.</span>
                    <div>
                        <Link to="/dashboard">Dashboard</Link>
                        <Link to="/profile">Profile</Link>
                        <Link to="/support">Support</Link>
                    </div>
                </footer>

            </main>
        </div>
    );
}

export default Transactions;
