
import {
    useCallback,
    useEffect,
    useRef,
    useState
} from "react";

import { Link, useNavigate } from "react-router-dom";

import {
    FaBell,
    FaTimes,
    FaArrowDown,
    FaArrowUp,
    FaUserPlus,
    FaSyncAlt,
    FaWallet,
    FaExchangeAlt,
    FaHistory,
    FaCreditCard,
    FaUser,
    FaCog,
    FaHeadset,
    FaSignOutAlt,
    FaEye,
    FaEyeSlash,
    FaShieldAlt,
    FaArrowRight,
    FaPlus,
    FaGlobe,
    FaChartLine,
    FaRegCreditCard
} from "react-icons/fa";

import { useAuth } from "../context/useAuth";

import {
    getBalance,
    getUserActivityNotifications
} from "../services/api";

import "./Dashboard.css";
import "./DashboardModern.css";


function Dashboard() {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();

    const API_BASE =
        import.meta.env.VITE_API_URL || "http://localhost:5000";

    const [balance, setBalance] = useState(
        Number(user?.balance || 0)
    );

    const [loadingBalance, setLoadingBalance] = useState(true);
    const [showBalance, setShowBalance] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Notifications
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [loadingNotifications, setLoadingNotifications] = useState(false);
    const [notificationError, setNotificationError] = useState("");

    const notificationRef = useRef(null);

    const notificationStorageKey =
        `userNotificationsLastSeen_${user?.id || user?.account_number || "customer"}`;

    const [lastSeen, setLastSeen] = useState(() => {
        return Number(
            localStorage.getItem(notificationStorageKey) || 0
        );
    });

    // Bank cards
    const [cards, setCards] = useState([]);
    const [loadingCards, setLoadingCards] = useState(true);
    const [cardError, setCardError] = useState("");
    const [showCardNumbers, setShowCardNumbers] = useState({});

    const userInitial =
        user?.full_name?.charAt(0)?.toUpperCase() || "U";

    const firstName =
        user?.full_name?.trim()?.split(/\s+/)[0] || "Customer";

    const today = new Intl.DateTimeFormat(
        user?.locale || "en-US",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    ).format(new Date());


    /* =========================================
       BALANCE
    ========================================= */

    useEffect(() => {
        let active = true;

        const loadBalance = async () => {
            if (!token) {
                setLoadingBalance(false);
                return;
            }

            try {
                const response = await getBalance(token);

                if (active && response?.success) {
                    setBalance(Number(response.balance || 0));
                }
            } catch (error) {
                console.error("Balance error:", error);
            } finally {
                if (active) setLoadingBalance(false);
            }
        };

        loadBalance();

        return () => {
            active = false;
        };
    }, [token]);


    /* =========================================
       NOTIFICATIONS
    ========================================= */

    const loadNotifications = useCallback(async () => {
        if (!token) return;

        try {
            setLoadingNotifications(true);
            setNotificationError("");

            const response = await getUserActivityNotifications(
                token,
                30
            );

            if (response?.success) {
                setNotifications(response.notifications || []);
            } else {
                setNotificationError(
                    response?.message || "Unable to load notifications."
                );
            }
        } catch (error) {
            console.error("Notification error:", error);

            setNotificationError(
                error.message || "Unable to load notifications."
            );
        } finally {
            setLoadingNotifications(false);
        }
    }, [token]);


    useEffect(() => {
        if (!token) return;

        loadNotifications();

        const interval = setInterval(loadNotifications, 30000);

        return () => clearInterval(interval);
    }, [token, loadNotifications]);


    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                notificationRef.current &&
                !notificationRef.current.contains(event.target)
            ) {
                setShowNotifications(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );
        };
    }, []);


    const unreadCount = notifications.filter((item) => {
        const timestamp = new Date(item.created_at).getTime();

        return Number.isFinite(timestamp) && timestamp > lastSeen;
    }).length;


    const markNotificationsAsRead = () => {
        const now = Date.now();

        localStorage.setItem(
            notificationStorageKey,
            String(now)
        );

        setLastSeen(now);
    };


    const toggleNotifications = () => {
        const next = !showNotifications;

        setShowNotifications(next);

        if (next) {
            markNotificationsAsRead();
            loadNotifications();
        }
    };


    const getNotificationIcon = (type) => {
        switch (type) {
            case "CREDIT":
                return <FaArrowDown />;

            case "DEBIT":
                return <FaArrowUp />;

            case "ACCOUNT_CREATED":
                return <FaUserPlus />;

            default:
                return <FaBell />;
        }
    };


    const formatNotificationDate = (date) => {
        if (!date) return "";

        const parsed = new Date(date);

        if (Number.isNaN(parsed.getTime())) return "";

        return new Intl.DateTimeFormat("en-US", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
        }).format(parsed);
    };


    const formatNotificationAmount = (amount, currency) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency || "USD",
            minimumFractionDigits: 2
        }).format(Number(amount || 0));
    };


    /* =========================================
       BANK CARDS
    ========================================= */

    const loadCards = useCallback(async () => {
        if (!token) {
            setLoadingCards(false);
            return;
        }

        try {
            setLoadingCards(true);
            setCardError("");

            const response = await fetch(
                `${API_BASE}/api/cards/my-cards`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Unable to load your cards."
                );
            }

            setCards(data.cards || []);

        } catch (error) {
            console.error("Card loading error:", error);

            setCardError(
                error.message || "Unable to load your bank cards."
            );

        } finally {
            setLoadingCards(false);
        }
    }, [token, API_BASE]);


    useEffect(() => {
        loadCards();
    }, [loadCards]);


    const toggleCardNumber = (cardId) => {
        setShowCardNumbers((previous) => ({
            ...previous,
            [cardId]: !previous[cardId]
        }));
    };


    const formatCardNumber = (number, visible = false) => {
        const digits = String(number || "").replace(/\s/g, "");

        if (!digits) return "•••• •••• •••• ••••";

        if (visible) {
            return digits.replace(/(.{4})/g, "$1 ").trim();
        }

        return `•••• •••• •••• ${digits.slice(-4)}`;
    };


    const formatCardExpiry = (month, year) => {
        return `${String(month).padStart(2, "0")}/${String(year).slice(-2)}`;
    };


    const getCardStatus = (status) => {
        switch (String(status || "").toUpperCase()) {
            case "ACTIVE":
                return "active";

            case "BLOCKED":
                return "blocked";

            case "FROZEN":
                return "frozen";

            case "PENDING":
                return "pending";

            default:
                return "pending";
        }
    };


    /* =========================================
       CURRENCY
    ========================================= */

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2
        }).format(Number(amount || 0));
    };


    /* =========================================
       SIDEBAR AND LOGOUT
    ========================================= */

    const closeSidebar = () => setSidebarOpen(false);

    const handleLogout = () => {
        closeSidebar();
        logout();

        navigate("/login", {
            replace: true
        });
    };


    /* =========================================
       ACCOUNT STATUS
    ========================================= */

    const accountIsActive =
        String(user?.status || "active").toLowerCase() === "active";


    return (
        <div className="dashboard-page modern-dashboard">

            {sidebarOpen && (
                <div
                    className="dashboard-overlay modern-overlay"
                    onClick={closeSidebar}
                />
            )}


            {/* SIDEBAR */}

            <aside
                className={`dashboard-sidebar modern-sidebar ${
                    sidebarOpen ? "sidebar-open" : ""
                }`}
            >
                <div className="modern-sidebar-inner">

                    <div className="modern-brand">
                        <img
                            src="/Logo.png"
                            alt="Skyravon Bank Logo"
                            className="modern-brand-logo"
                        />

                        <div>
                            <h2>Skyravon<span> Bank</span></h2>
                            <small>Digital Banking</small>
                        </div>
                    </div>

                    <button
                        className="mobile-sidebar-close modern-close"
                        onClick={closeSidebar}
                        aria-label="Close menu"
                    >
                        <FaTimes />
                    </button>


                    <div className="modern-nav-group">
                        <span className="modern-nav-label">WORKSPACE</span>

                        <nav className="dashboard-nav modern-nav">

                            <Link
                                to="/dashboard"
                                className="nav-link modern-nav-link active"
                                onClick={closeSidebar}
                            >
                                <FaWallet />
                                <span>Overview</span>
                            </Link>

                            <Link
                                to="/transfer"
                                className="nav-link modern-nav-link"
                                onClick={closeSidebar}
                            >
                                <FaExchangeAlt />
                                <span>Transfers</span>
                            </Link>

                            <Link
                                to="/deposit"
                                className="nav-link modern-nav-link"
                                onClick={closeSidebar}
                            >
                                <FaPlus />
                                <span>Add Money</span>
                            </Link>

                            <Link
                                to="/withdraw"
                                className="nav-link modern-nav-link"
                                onClick={closeSidebar}
                            >
                                <FaArrowUp />
                                <span>Withdraw</span>
                            </Link>

                            <Link
                                to="/transactions"
                                className="nav-link modern-nav-link"
                                onClick={closeSidebar}
                            >
                                <FaHistory />
                                <span>Transactions</span>
                            </Link>

                        </nav>
                    </div>


                    <div className="modern-nav-group modern-account-nav">
                        <span className="modern-nav-label">PREFERENCES</span>

                        <nav className="dashboard-nav modern-nav">

                            <Link
                                to="/profile"
                                className="nav-link modern-nav-link"
                                onClick={closeSidebar}
                            >
                                <FaUser />
                                <span>My Profile</span>
                            </Link>

                            <Link
                                to="/settings"
                                className="nav-link modern-nav-link"
                                onClick={closeSidebar}
                            >
                                <FaCog />
                                <span>Settings</span>
                            </Link>

                        </nav>
                    </div>


                    <div className="modern-sidebar-bottom">

                        <div className="modern-help-card">
                            <div className="modern-help-icon">
                                <FaHeadset />
                            </div>

                            <div>
                                <strong>Need assistance?</strong>
                                <p>We're here to help you.</p>

                                <Link
                                    to="/support"
                                    onClick={closeSidebar}
                                >
                                    Contact support <FaArrowRight />
                                </Link>
                            </div>
                        </div>

                        <button
                            className="modern-logout"
                            onClick={handleLogout}
                        >
                            <FaSignOutAlt />
                            <span>Sign out</span>
                        </button>

                        <div className="modern-sidebar-footer">
                            <FaShieldAlt />
                            <span>Secure banking experience</span>
                        </div>

                    </div>

                </div>
            </aside>


            {/* MAIN AREA */}

            <main className="dashboard-main modern-main">

                {/* TOPBAR */}

                <header className="dashboard-topbar modern-topbar">

                    <button
                        className="mobile-menu-button modern-menu-button"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Open menu"
                    >
                        <span />
                        <span />
                        <span />
                    </button>

                    <div className="modern-page-heading">
                        <span>PERSONAL BANKING</span>
                        <h1>Overview</h1>
                    </div>


                    <div className="topbar-right modern-topbar-right">

                        <div
                            className="customer-notification-wrapper"
                            ref={notificationRef}
                        >
                            <button
                                className={`notification-button modern-notification-button ${
                                    showNotifications ? "notification-active" : ""
                                }`}
                                onClick={toggleNotifications}
                                aria-label="Notifications"
                                aria-expanded={showNotifications}
                            >
                                <FaBell />

                                {unreadCount > 0 && (
                                    <span className="notification-count">
                                        {unreadCount > 99 ? "99+" : unreadCount}
                                    </span>
                                )}
                            </button>


                            {showNotifications && (
                                <div className="customer-notification-panel modern-notification-panel">

                                    <div className="customer-notification-header">
                                        <div>
                                            <h3>Notifications</h3>
                                            <p>
                                                {unreadCount
                                                    ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
                                                    : "You're all caught up"}
                                            </p>
                                        </div>

                                        <div className="notification-header-actions">
                                            <button
                                                type="button"
                                                onClick={loadNotifications}
                                                disabled={loadingNotifications}
                                                aria-label="Refresh"
                                            >
                                                <FaSyncAlt />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setShowNotifications(false)}
                                                aria-label="Close"
                                            >
                                                <FaTimes />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="customer-notification-types">
                                        <span className="credit-label">Credit</span>
                                        <span className="debit-label">Debit</span>
                                        <span className="account-label">Account</span>
                                    </div>

                                    <div className="customer-notification-list">

                                        {loadingNotifications && !notifications.length ? (
                                            <div className="notification-empty">
                                                <div className="notification-loading-spinner" />
                                                <p>Loading notifications...</p>
                                            </div>
                                        ) : notificationError ? (
                                            <div className="notification-empty">
                                                <FaBell />
                                                <p>{notificationError}</p>

                                                <button
                                                    type="button"
                                                    onClick={loadNotifications}
                                                >
                                                    Try again
                                                </button>
                                            </div>
                                        ) : !notifications.length ? (
                                            <div className="notification-empty">
                                                <FaBell />
                                                <strong>No notifications yet</strong>
                                                <p>Your account activity will appear here.</p>
                                            </div>
                                        ) : (
                                            notifications.map((item) => (
                                                <div
                                                    className={`customer-notification-item ${
                                                        item.type === "CREDIT"
                                                            ? "credit-notification"
                                                            : item.type === "DEBIT"
                                                            ? "debit-notification"
                                                            : item.type === "ACCOUNT_CREATED"
                                                            ? "account-notification"
                                                            : ""
                                                    }`}
                                                    key={item.id}
                                                >
                                                    <div className="customer-notification-icon">
                                                        {getNotificationIcon(item.type)}
                                                    </div>

                                                    <div className="customer-notification-body">
                                                        <div className="customer-notification-title">
                                                            <strong>{item.title}</strong>
                                                            <span>
                                                                {formatNotificationDate(item.created_at)}
                                                            </span>
                                                        </div>

                                                        <p>{item.message}</p>

                                                        {item.amount !== null &&
                                                            item.amount !== undefined && (
                                                                <strong className="notification-amount">
                                                                    {item.type === "CREDIT" ? "+" : item.type === "DEBIT" ? "-" : ""}
                                                                    {formatNotificationAmount(
                                                                        item.amount,
                                                                        item.currency
                                                                    )}
                                                                </strong>
                                                            )}

                                                        {item.reference && (
                                                            <small>Ref: {item.reference}</small>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}

                                    </div>

                                    <div className="customer-notification-footer">
                                        <span>Auto-refreshes every 30 seconds</span>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowNotifications(false);
                                                navigate("/transactions");
                                            }}
                                        >
                                            View activity
                                        </button>
                                    </div>

                                </div>
                            )}
                        </div>


                        <div className="modern-topbar-divider" />


                        <Link to="/profile" className="modern-user-menu">

                            <div className="modern-user-avatar">
                                {user?.profile_picture ? (
                                    <img
                                        src={`${API_BASE}/uploads/profiles/${user.profile_picture}`}
                                        alt={user?.full_name || "Profile"}
                                    />
                                ) : (
                                    userInitial
                                )}
                            </div>

                            <div className="modern-user-details">
                                <strong>{user?.full_name || "Customer"}</strong>
                                <span>Personal Account</span>
                            </div>

                        </Link>

                    </div>

                </header>


                {/* CONTENT */}

                <div className="dashboard-content modern-content">

                    {/* WELCOME */}

                    <section className="modern-welcome">

                        <div>
                            <span className="modern-welcome-date">
                                {today}
                            </span>

                            <h2>
                                Good day, {firstName}
                                <span className="welcome-wave"> ✨</span>
                            </h2>

                            <p>
                                Here's an overview of your finances and account activity.
                            </p>
                        </div>

                        <div className="modern-account-status">
                            <span className={accountIsActive ? "status-dot active" : "status-dot inactive"} />
                            {accountIsActive ? "Account active" : "Account status"}
                        </div>

                    </section>


                    {/* OVERVIEW GRID */}

                    <section className="modern-overview-grid">

                        <div className="modern-balance-card">

                            <div className="modern-balance-pattern" />
                            <div className="modern-balance-glow" />

                            <div className="modern-balance-top">
                                <div>
                                    <span>YOUR TOTAL BALANCE</span>

                                    <div className="modern-balance-label">
                                        Available balance

                                        <button
                                            type="button"
                                            onClick={() => setShowBalance(!showBalance)}
                                            aria-label="Toggle balance visibility"
                                        >
                                            {showBalance ? <FaEye /> : <FaEyeSlash />}
                                        </button>
                                    </div>
                                </div>

                                <div className="modern-balance-icon">
                                    <FaWallet />
                                </div>
                            </div>


                            <div className="modern-balance-value">
                                {loadingBalance
                                    ? "Loading..."
                                    : showBalance
                                    ? formatCurrency(balance)
                                    : "$ ••••••••"}
                            </div>


                            <div className="modern-balance-bottom">
                                <div>
                                    <span>ACCOUNT NUMBER</span>
                                    <strong>
                                        {user?.account_number || "Not available"}
                                    </strong>
                                </div>

                                <div className="modern-balance-card-brand">
                                    <span>Skyravon</span>
                                    <strong>BANK</strong>
                                </div>
                            </div>

                        </div>


                        {/* QUICK ACTIONS */}

                        <div className="modern-quick-card">

                            <div className="modern-section-heading">
                                <div>
                                    <h3>Quick actions</h3>
                                    <p>What would you like to do?</p>
                                </div>
                            </div>

                            <div className="modern-quick-grid">

                                <Link to="/transfer" className="modern-quick-action">
                                    <span className="quick-icon transfer">
                                        <FaExchangeAlt />
                                    </span>
                                    <strong>Transfer</strong>
                                    <small>Send money</small>
                                </Link>

                                <Link to="/deposit" className="modern-quick-action">
                                    <span className="quick-icon deposit">
                                        <FaPlus />
                                    </span>
                                    <strong>Add money</strong>
                                    <small>Fund account</small>
                                </Link>

                                <Link to="/withdraw" className="modern-quick-action">
                                    <span className="quick-icon withdraw">
                                        <FaArrowUp />
                                    </span>
                                    <strong>Withdraw</strong>
                                    <small>Cash out</small>
                                </Link>

                                <Link to="/transactions" className="modern-quick-action">
                                    <span className="quick-icon history">
                                        <FaHistory />
                                    </span>
                                    <strong>History</strong>
                                    <small>View activity</small>
                                </Link>

                            </div>

                        </div>

                    </section>


                    {/* =========================================
                        MY BANK CARDS
                    ========================================= */}

                    <section className="modern-section modern-cards-section">

                        <div className="modern-section-heading modern-account-heading">
                            <div>
                                <h3>My Cards</h3>
                                <p>Manage your Richiee Bank payment cards.</p>
                            </div>

                            <button
                                type="button"
                                className="modern-card-refresh"
                                onClick={loadCards}
                                disabled={loadingCards}
                            >
                                <FaSyncAlt className={loadingCards ? "refresh-spinning" : ""} />
                                Refresh cards
                            </button>
                        </div>


                        {loadingCards ? (
                            <div className="modern-cards-loading">
                                <div className="notification-loading-spinner" />
                                <p>Loading your cards...</p>
                            </div>
                        ) : cardError ? (
                            <div className="modern-cards-empty">
                                <FaRegCreditCard />
                                <strong>Unable to load cards</strong>
                                <p>{cardError}</p>

                                <button type="button" onClick={loadCards}>
                                    Try again
                                </button>
                            </div>
                        ) : cards.length === 0 ? (
                            <div className="modern-cards-empty">
                                <div className="modern-empty-card-icon">
                                    <FaCreditCard />
                                </div>

                                <strong>No bank cards available</strong>

                                <p>
                                    Your Skyravon Bank cards will appear here
                                    once they have been issued to your account.
                                </p>
                            </div>
                        ) : (
                            <div className="modern-cards-grid">

                                {cards.map((card) => {
                                    const cardType = String(
                                        card.card_type || "VISA"
                                    ).toUpperCase();

                                    const status = getCardStatus(card.status);

                                    const numberVisible =
                                        Boolean(showCardNumbers[card.id]);

                                    return (
                                        <article
                                            className={`modern-bank-card ${
                                                cardType === "MASTERCARD"
                                                    ? "mastercard-design"
                                                    : "visa-design"
                                            }`}
                                            key={card.id}
                                        >

                                            <div className="modern-card-decoration modern-card-decoration-one" />
                                            <div className="modern-card-decoration modern-card-decoration-two" />

                                            <div className="modern-card-top">

                                                <div className="modern-card-brand">
                                                    <img
                                                        src="/Logo.png"
                                                        alt="Skyravon Bank Logo"
                                                        className="modern-card-brand-icon"
                                                    />

                                                    <div>
                                                        <strong>Skyravon Bank</strong>
                                                        <span>PAYMENT CARD</span>
                                                    </div>
                                                </div>

                                                <div className="modern-card-network">
                                                    {cardType === "MASTERCARD" ? (
                                                        <div className="mastercard-logo">
                                                            <span />
                                                            <span />
                                                        </div>
                                                    ) : (
                                                        <strong>VISA</strong>
                                                    )}
                                                </div>

                                            </div>


                                            <div className="modern-card-chip">
                                                <svg
                                                    viewBox="0 0 48 36"
                                                    width="43"
                                                    height="33"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <rect
                                                        x="1"
                                                        y="1"
                                                        width="46"
                                                        height="34"
                                                        rx="6"
                                                        fill="#D9C58B"
                                                        stroke="#F7E7B5"
                                                    />

                                                    <path
                                                        d="M16 1V35M32 1V35M1 12H47M1 24H47"
                                                        stroke="#A68B4D"
                                                        strokeWidth="1.3"
                                                    />

                                                    <path
                                                        d="M16 12H32V24H16V12Z"
                                                        stroke="#A68B4D"
                                                    />
                                                </svg>
                                            </div>


                                            <div className="modern-card-number-row">

                                                <span className="modern-card-number">
                                                    {formatCardNumber(
                                                        card.card_number,
                                                        numberVisible
                                                    )}
                                                </span>

                                                <button
                                                    type="button"
                                                    className="modern-card-eye"
                                                    onClick={() => toggleCardNumber(card.id)}
                                                    title={
                                                        numberVisible
                                                            ? "Hide card number"
                                                            : "Show card number"
                                                    }
                                                >
                                                    {numberVisible
                                                        ? <FaEyeSlash />
                                                        : <FaEye />
                                                    }
                                                </button>

                                            </div>


                                            <div className="modern-card-bottom">

                                                <div className="modern-card-holder">
                                                    <span>CARD HOLDER</span>

                                                    <strong>
                                                        {card.card_holder || user?.full_name || "CARD HOLDER"}
                                                    </strong>
                                                </div>

                                                <div className="modern-card-expiry">
                                                    <span>EXPIRES</span>

                                                    <strong>
                                                        {formatCardExpiry(
                                                            card.expiry_month,
                                                            card.expiry_year
                                                        )}
                                                    </strong>
                                                </div>

                                            </div>


                                            <div className="modern-card-status-row">

                                                <span className={`modern-card-status ${status}`}>
                                                    <span />
                                                    {String(card.status || "PENDING").toUpperCase()}
                                                </span>

                                                <span className="modern-card-secure">
                                                    <FaShieldAlt /> SECURE
                                                </span>

                                            </div>

                                        </article>
                                    );
                                })}

                            </div>
                        )}

                    </section>


                    {/* ACCOUNT INFORMATION */}

                    <section className="modern-section">

                        <div className="modern-section-heading modern-account-heading">
                            <div>
                                <h3>Account information</h3>
                                <p>Your Skyravon Bank account details</p>
                            </div>

                            <Link to="/profile" className="modern-text-link">
                                Manage profile <FaArrowRight />
                            </Link>
                        </div>


                        <div className="modern-info-grid">

                            <div className="modern-info-card">
                                <div className="modern-info-icon blue">
                                    <FaCreditCard />
                                </div>

                                <div>
                                    <span>Account number</span>
                                    <strong>{user?.account_number || "Not available"}</strong>
                                </div>
                            </div>


                            <div className="modern-info-card">
                                <div className="modern-info-icon purple">
                                    <FaUser />
                                </div>

                                <div>
                                    <span>Account holder</span>
                                    <strong>{user?.full_name || "Customer"}</strong>
                                </div>
                            </div>


                            <div className="modern-info-card">
                                <div className="modern-info-icon green">
                                    <FaGlobe />
                                </div>

                                <div>
                                    <span>Country</span>
                                    <strong>{user?.country || "Nigeria"}</strong>
                                </div>
                            </div>


                            <div className="modern-info-card">
                                <div className="modern-info-icon orange">
                                    <FaChartLine />
                                </div>

                                <div>
                                    <span>Account type</span>
                                    <strong>Personal account</strong>
                                </div>
                            </div>

                        </div>

                    </section>


                    {/* SECURITY BANNER */}

                    <section className="modern-security-banner">

                        <div className="modern-security-icon">
                            <FaShieldAlt />
                        </div>

                        <div className="modern-security-text">
                            <strong>Your security matters</strong>
                            <p>
                                Never share your password, PIN or verification codes with anyone.
                            </p>
                        </div>

                        <Link to="/settings">
                            Security settings <FaArrowRight />
                        </Link>

                    </section>


                    {/* FOOTER */}

                    <footer className="modern-footer">
                        <span>
                            © {new Date().getFullYear()} Skyravon Bank. All rights reserved.
                        </span>

                        <div>
                            <Link to="/privacy">Privacy</Link>
                            <Link to="/terms">Terms</Link>
                            <Link to="/support">Support</Link>
                        </div>
                    </footer>

                </div>

            </main>

        </div>
    );
}

export default Dashboard;

