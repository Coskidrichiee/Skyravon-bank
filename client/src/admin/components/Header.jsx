import { useCallback, useEffect, useState } from "react";

import {
    FaBell,
    FaSearch,
    FaCheck,
    FaCheckDouble,
    FaExchangeAlt,
    FaTimes,
    FaBars,
    FaSyncAlt,
    FaShieldAlt
} from "react-icons/fa";

import "../css/Header.css";

const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

const getToken = () =>
    localStorage.getItem("banking_admin_token") ||
    localStorage.getItem("adminToken") ||
    localStorage.getItem("banking_token");

const formatAmount = (amount, currency = "USD") => {
    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount)) return amount;

    try {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency || "USD",
            maximumFractionDigits: 2
        }).format(numericAmount);
    } catch {
        return `${currency || "USD"} ${numericAmount.toLocaleString("en-US")}`;
    }
};

const formatDate = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "";

    return parsedDate.toLocaleString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
};

export default function Header({
    title = "Dashboard",
    subtitle = "Welcome to your banking workspace",
    onMenuClick = () => {}
}) {
    const [notifications, setNotifications] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notificationLoading, setNotificationLoading] = useState(false);
    const [notificationError, setNotificationError] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const unreadCount = notifications.filter(
        (item) => !item.is_read
    ).length;

    const loadNotifications = useCallback(async () => {
        try {
            const token = getToken();

            if (!token) {
                setNotificationError("Admin authentication required.");
                return;
            }

            setNotificationLoading(true);

            const response = await fetch(
                `${API_BASE_URL}/api/admin/notifications/transfers`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to load notifications."
                );
            }

            setNotifications(data.notifications || []);
            setNotificationError("");
        } catch (error) {
            setNotificationError(error.message);
        } finally {
            setNotificationLoading(false);
        }
    }, []);

    useEffect(() => {
        loadNotifications();

        const interval = setInterval(loadNotifications, 30000);

        return () => clearInterval(interval);
    }, [loadNotifications]);

    const markAsRead = async (item) => {
        try {
            setActionLoading(true);

            const token = getToken();

            const response = await fetch(
                `${API_BASE_URL}/api/admin/notifications/read`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        transfer_id: item.id,
                        status: item.status
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to mark notification as read."
                );
            }

            await loadNotifications();
        } catch (error) {
            setNotificationError(error.message);
        } finally {
            setActionLoading(false);
        }
    };

    const markAllAsRead = async () => {
        try {
            setActionLoading(true);

            const token = getToken();

            const response = await fetch(
                `${API_BASE_URL}/api/admin/notifications/read-all`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to mark all as read."
                );
            }

            await loadNotifications();
        } catch (error) {
            setNotificationError(error.message);
        } finally {
            setActionLoading(false);
        }
    };

    const filteredNotifications = notifications.filter((item) => {
        const search = searchTerm.trim().toLowerCase();

        if (!search) return true;

        return [
            item.full_name,
            item.account_name,
            item.bank,
            item.account_number,
            item.status
        ].some((value) =>
            String(value || "").toLowerCase().includes(search)
        );
    });

    return (
        <header className="admin-header">

            <div className="admin-header-left">

                {/* Mobile sidebar toggle */}
                <button
                    type="button"
                    className="header-menu-btn"
                    onClick={onMenuClick}
                    aria-label="Open navigation menu"
                >
                    <FaBars />
                </button>

                <div className="header-page-info">
                    <span className="header-subtitle">
                        {subtitle}
                    </span>

                    <h1>{title}</h1>
                </div>

            </div>

            <div className="admin-header-right">

                {/* Search */}
                <div className={`admin-search ${searchOpen ? "search-expanded" : ""}`}>
                    <FaSearch className="search-icon" />

                    <input
                        type="text"
                        placeholder="Search notifications..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    {searchTerm && (
                        <button
                            type="button"
                            className="search-clear"
                            onClick={() => setSearchTerm("")}
                            aria-label="Clear search"
                        >
                            <FaTimes />
                        </button>
                    )}
                </div>

                <button
                    type="button"
                    className="mobile-search-btn"
                    onClick={() => setSearchOpen((previous) => !previous)}
                    aria-label="Toggle search"
                >
                    <FaSearch />
                </button>

                {/* Notifications */}
                <div className="admin-notification-wrapper">

                    <button
                        type="button"
                        className={`notification-btn ${
                            dropdownOpen ? "active" : ""
                        }`}
                        onClick={() =>
                            setDropdownOpen((previous) => !previous)
                        }
                        aria-label={`${unreadCount} unread notifications`}
                        aria-expanded={dropdownOpen}
                    >
                        <FaBell />

                        {unreadCount > 0 && (
                            <span className="notification-badge">
                                {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                        )}
                    </button>

                    {dropdownOpen && (
                        <div className="notification-dropdown">

                            <div className="notification-dropdown-header">
                                <div>
                                    <h3>Notifications</h3>
                                    <p>
                                        {unreadCount} unread transfer
                                        {unreadCount !== 1 ? "s" : ""}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="notification-close"
                                    onClick={() => setDropdownOpen(false)}
                                    aria-label="Close notifications"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="notification-toolbar">
                                <span>Recent activity</span>

                                <button
                                    type="button"
                                    onClick={loadNotifications}
                                    disabled={notificationLoading}
                                    aria-label="Refresh notifications"
                                >
                                    <FaSyncAlt className={
                                        notificationLoading ? "refresh-spin" : ""
                                    } />
                                </button>
                            </div>

                            <div className="notification-actions">
                                <button
                                    type="button"
                                    onClick={markAllAsRead}
                                    disabled={
                                        unreadCount === 0 || actionLoading
                                    }
                                >
                                    <FaCheckDouble />
                                    {actionLoading
                                        ? "Please wait..."
                                        : "Mark all as read"}
                                </button>
                            </div>

                            <div className="notification-list">

                                {notificationLoading &&
                                    notifications.length === 0 && (
                                        <div className="notification-empty">
                                            Loading notifications...
                                        </div>
                                    )}

                                {notificationError && (
                                    <div className="notification-empty notification-error">
                                        {notificationError}

                                        <button
                                            type="button"
                                            onClick={loadNotifications}
                                        >
                                            Try again
                                        </button>
                                    </div>
                                )}

                                {!notificationLoading &&
                                    !notificationError &&
                                    filteredNotifications.length === 0 && (
                                        <div className="notification-empty">
                                            <FaBell />

                                            <strong>
                                                {searchTerm
                                                    ? "No matching notifications"
                                                    : "No transfer notifications"}
                                            </strong>

                                            <span>
                                                {searchTerm
                                                    ? "Try another search term."
                                                    : "Pending and approved transfers will appear here."}
                                            </span>
                                        </div>
                                    )}

                                {filteredNotifications.map((item) => {
                                    const isPending =
                                        item.status === "PENDING";

                                    return (
                                        <div
                                            key={`${item.id}:${item.status}`}
                                            className={`notification-item ${
                                                item.is_read ? "read" : "unread"
                                            }`}
                                        >
                                            <div className="notification-item-top">

                                                <div
                                                    className={`notification-type-icon ${
                                                        isPending
                                                            ? "pending"
                                                            : "approved"
                                                    }`}
                                                >
                                                    <FaExchangeAlt />
                                                </div>

                                                <div className="notification-content">

                                                    <div className="notification-title-row">
                                                        <strong>
                                                            {isPending
                                                                ? "Transfer Pending"
                                                                : "Transfer Approved"}
                                                        </strong>

                                                        <span
                                                            className={`notification-status ${
                                                                isPending
                                                                    ? "pending"
                                                                    : "approved"
                                                            }`}
                                                        >
                                                            {item.status}
                                                        </span>
                                                    </div>

                                                    <p className="notification-customer">
                                                        {item.full_name ||
                                                            item.account_name ||
                                                            "Bank Customer"}
                                                    </p>

                                                    <strong className="notification-amount">
                                                        {formatAmount(
                                                            item.amount,
                                                            item.currency
                                                        )}
                                                    </strong>

                                                    <p className="notification-details">
                                                        {item.bank || "Bank"} · ****
                                                        {String(
                                                            item.account_number || ""
                                                        ).slice(-4)}
                                                    </p>

                                                    <p className="notification-date">
                                                        {formatDate(item.created_at)}
                                                    </p>
                                                </div>
                                            </div>

                                            {!item.is_read ? (
                                                <button
                                                    type="button"
                                                    className="mark-read-btn"
                                                    onClick={() => markAsRead(item)}
                                                    disabled={actionLoading}
                                                >
                                                    <FaCheck />
                                                    Mark as read
                                                </button>
                                            ) : (
                                                <span className="notification-read-label">
                                                    <FaCheck />
                                                    Read
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="notification-dropdown-footer">
                                Showing {filteredNotifications.length} of{" "}
                                {notifications.length} transfers
                            </div>
                        </div>
                    )}
                </div>

                {/* Admin profile */}
                <div className="header-admin-profile">
                    <div className="admin-avatar">A</div>

                    <div className="header-admin-info">
                        <strong>Administrator</strong>
                        <small>
                            <FaShieldAlt />
                            Super Admin
                        </small>
                    </div>
                </div>

            </div>
        </header>
    );
}