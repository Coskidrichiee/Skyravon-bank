
import React, { useEffect, useMemo, useState } from "react";
import "../css/adminTopUp.css";

const API_BASE =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

const QUICK_AMOUNTS = [5000, 10000, 25000, 50000, 100000];

function TopUp() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedUser, setSelectedUser] = useState("");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [recentTopUps, setRecentTopUps] = useState([]);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const token =
        localStorage.getItem("banking_admin_token") ||
        localStorage.getItem("adminToken");

    const formatMoney = (value) =>
        new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2
        }).format(Number(value || 0));

    const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    const selectedCustomer = useMemo(
        () =>
            users.find(
                (user) => String(user.id) === String(selectedUser)
            ),
        [users, selectedUser]
    );

    const filteredUsers = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) return users;

        return users.filter((user) =>
            [
                user.full_name,
                user.name,
                user.email,
                user.phone,
                user.account_number
            ]
                .filter(Boolean)
                .some((value) =>
                    String(value).toLowerCase().includes(query)
                )
        );
    }, [users, search]);

    const numericAmount = Number(amount);
    const currentBalance = Number(selectedCustomer?.balance || 0);
    const estimatedBalance = currentBalance + numericAmount;

    // LOAD CUSTOMERS
    const loadUsers = async () => {
        try {
            setLoadingUsers(true);

            const response = await fetch(
                `${API_BASE}/api/admin/users`,
                {
                    method: "GET",
                    headers
                }
            );

            const data = await response.json();

            if (!response.ok || data.success === false) {
                throw new Error(
                    data.message || "Unable to load customers."
                );
            }

            const customerList = Array.isArray(data)
                ? data
                : data.users || data.customers || [];

            setUsers(customerList);

        } catch (error) {
            console.error("Customer loading error:", error);
            setMessage(error.message);
            setMessageType("error");
        } finally {
            setLoadingUsers(false);
        }
    };

    useEffect(() => {
        loadUsers();
        // Load customers when this page mounts.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // SELECT QUICK AMOUNT
    const chooseAmount = (value) => {
        setAmount(String(value));
    };

    // OPEN CONFIRMATION
    const handleSubmit = (event) => {
        event.preventDefault();

        setMessage("");
        setMessageType("");

        if (!selectedUser) {
            setMessage("Please select a customer account.");
            setMessageType("error");
            return;
        }

        if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
            setMessage("Please enter a valid top-up amount.");
            setMessageType("error");
            return;
        }

        if (!token) {
            setMessage("Your admin session has expired. Please log in again.");
            setMessageType("error");
            return;
        }

        setShowConfirmation(true);
    };

    // PROCESS TOP-UP
    const confirmTopUp = async () => {
        if (!selectedCustomer || loading) return;

        try {
            setLoading(true);
            setMessage("");
            setMessageType("");

            const response = await fetch(
                `${API_BASE}/api/admin/top-up`,
                {
                    method: "POST",
                    headers,
                    body: JSON.stringify({
                        userId: Number(selectedUser),
                        amount: numericAmount
                    })
                }
            );

            const data = await response.json();

            if (!response.ok || data.success === false) {
                throw new Error(
                    data.message || "Unable to process this top-up."
                );
            }

            const updatedBalance = Number(
                data.newBalance ??
                data.balance ??
                (currentBalance + numericAmount)
            );

            setUsers((previousUsers) =>
                previousUsers.map((user) =>
                    String(user.id) === String(selectedUser)
                        ? { ...user, balance: updatedBalance }
                        : user
                )
            );

            setRecentTopUps((previous) => [
                {
                    id: data.transaction?.id || Date.now(),
                    customer:
                        selectedCustomer.full_name ||
                        selectedCustomer.name ||
                        "Customer",
                    email: selectedCustomer.email || "",
                    amount: numericAmount,
                    balance: updatedBalance,
                    reference:
                        data.transaction?.reference ||
                        data.reference ||
                        "Processed",
                    date: new Date().toLocaleString()
                },
                ...previous
            ]);

            setMessage(
                data.message || "Account successfully credited."
            );
            setMessageType("success");

            setAmount("");
            setShowConfirmation(false);

        } catch (error) {
            console.error("Top-up processing error:", error);
            setMessage(error.message || "Top-up failed.");
            setMessageType("error");
            setShowConfirmation(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rb-topup">

            {/* PAGE HEADER */}
            <div className="rb-topup-header">
                <div>
                    <div className="rb-breadcrumb">
                        Admin Dashboard <span>/</span> Account Funding
                    </div>

                    <h1>Account Top-Up</h1>

                    <p>
                        Credit customer accounts securely and manage
                        account funding.
                    </p>
                </div>

                <button
                    type="button"
                    className="rb-refresh-button"
                    onClick={loadUsers}
                    disabled={loadingUsers}
                >
                    <span>↻</span>
                    {loadingUsers ? "Refreshing..." : "Refresh"}
                </button>
            </div>

            {/* NOTIFICATION */}
            {message && (
                <div className={`rb-alert ${messageType}`}>
                    <span>
                        {messageType === "success" ? "✓" : "!"}
                    </span>
                    {message}
                    <button
                        type="button"
                        onClick={() => setMessage("")}
                        aria-label="Close message"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* TOP SUMMARY */}
            <div className="rb-topup-overview">

                <div className="rb-overview-card">
                    <div className="rb-overview-icon blue">♙</div>
                    <div>
                        <span>Registered Customers</span>
                        <strong>
                            {loadingUsers ? "..." : users.length}
                        </strong>
                        <small>Customer accounts</small>
                    </div>
                </div>

                <div className="rb-overview-card">
                    <div className="rb-overview-icon green">$</div>
                    <div>
                        <span>Top-Ups This Session</span>
                        <strong>{recentTopUps.length}</strong>
                        <small>Successfully processed here</small>
                    </div>
                </div>

                <div className="rb-overview-card">
                    <div className="rb-overview-icon purple">↗</div>
                    <div>
                        <span>Last Top-Up</span>
                        <strong>
                            {recentTopUps.length
                                ? formatMoney(recentTopUps[0].amount)
                                : "—"}
                        </strong>
                        <small>Current session activity</small>
                    </div>
                </div>

            </div>

            {/* MAIN CONTENT */}
            <div className="rb-topup-main">

                {/* FUNDING FORM */}
                <section className="rb-funding-card">

                    <div className="rb-section-heading">
                        <div>
                            <span className="rb-section-label">
                                ACCOUNT MANAGEMENT
                            </span>
                            <h2>Credit an Account</h2>
                            <p>
                                Choose a customer and specify the amount
                                to deposit.
                            </p>
                        </div>

                        <div className="rb-heading-icon">$</div>
                    </div>

                    <form onSubmit={handleSubmit}>

                        {/* CUSTOMER SEARCH */}
                        <div className="rb-form-group">
                            <label htmlFor="customer-search">
                                Find Customer
                            </label>

                            <div className="rb-search-box">
                                <span>⌕</span>
                                <input
                                    id="customer-search"
                                    type="search"
                                    placeholder="Search name, email or phone number"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                />
                            </div>
                        </div>

                        {/* CUSTOMER SELECT */}
                        <div className="rb-form-group">
                            <label htmlFor="customer-select">
                                Select Customer Account
                            </label>

                            <select
                                id="customer-select"
                                value={selectedUser}
                                onChange={(event) =>
                                    setSelectedUser(event.target.value)
                                }
                                disabled={loadingUsers}
                                required
                            >
                                <option value="">
                                    {loadingUsers
                                        ? "Loading customer accounts..."
                                        : "Choose a customer"}
                                </option>

                                {filteredUsers.map((user) => (
                                    <option
                                        key={user.id}
                                        value={user.id}
                                    >
                                        {user.full_name ||
                                            user.name ||
                                            "Customer"}{" "}
                                        — {user.email}
                                    </option>
                                ))}
                            </select>

                            {!loadingUsers &&
                                filteredUsers.length === 0 && (
                                    <small className="rb-field-hint">
                                        No customers match your search.
                                    </small>
                                )}
                        </div>

                        {/* CUSTOMER PROFILE */}
                        {selectedCustomer && (
                            <div className="rb-customer-panel">

                                <div className="rb-customer-avatar">
                                    {(selectedCustomer.full_name ||
                                        selectedCustomer.name ||
                                        "C")
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>

                                <div className="rb-customer-details">
                                    <span>SELECTED CUSTOMER</span>
                                    <strong>
                                        {selectedCustomer.full_name ||
                                            selectedCustomer.name ||
                                            "Customer"}
                                    </strong>
                                    <small>
                                        {selectedCustomer.email}
                                    </small>
                                    {selectedCustomer.phone && (
                                        <small>
                                            {selectedCustomer.phone}
                                        </small>
                                    )}
                                </div>

                                <div className="rb-customer-balance">
                                    <span>Available Balance</span>
                                    <strong>
                                        {formatMoney(currentBalance)}
                                    </strong>
                                </div>

                            </div>
                        )}

                        {/* AMOUNT */}
                        <div className="rb-form-group rb-amount-group">
                            <label htmlFor="topup-amount">
                                Amount to Credit
                            </label>

                            <div className="rb-amount-input">
                                <span>$</span>
                                <input
                                    id="topup-amount"
                                    type="number"
                                    min="1"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(event) =>
                                        setAmount(event.target.value)
                                    }
                                    required
                                />
                                <small>USD</small>
                            </div>
                        </div>

                        {/* QUICK AMOUNTS */}
                        <div className="rb-quick-amounts">
                            <span>Quick amount</span>

                            <div>
                                {QUICK_AMOUNTS.map((value) => (
                                    <button
                                        type="button"
                                        key={value}
                                        className={
                                            Number(amount) === value
                                                ? "active"
                                                : ""
                                        }
                                        onClick={() => chooseAmount(value)}
                                    >
                                        ${value.toLocaleString("en-US")}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* BALANCE PREVIEW */}
                        {selectedCustomer &&
                            Number.isFinite(numericAmount) &&
                            numericAmount > 0 && (
                                <div className="rb-balance-preview">
                                    <div>
                                        <span>Current Balance</span>
                                        <strong>
                                            {formatMoney(currentBalance)}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Top-Up Amount</span>
                                        <strong className="rb-credit-value">
                                            +{formatMoney(numericAmount)}
                                        </strong>
                                    </div>

                                    <div className="rb-preview-total">
                                        <span>Estimated New Balance</span>
                                        <strong>
                                            {formatMoney(estimatedBalance)}
                                        </strong>
                                    </div>
                                </div>
                            )}

                        {/* SUBMIT */}
                        <button
                            type="submit"
                            className="rb-submit-button"
                            disabled={
                                loading ||
                                loadingUsers ||
                                !selectedUser ||
                                !amount ||
                                numericAmount <= 0
                            }
                        >
                            {loading
                                ? "Processing..."
                                : "Continue to Confirmation"}
                            <span>→</span>
                        </button>

                        <div className="rb-secure-note">
                            <span>♢</span>
                            Only authorized administrators can credit
                            customer accounts.
                        </div>

                    </form>
                </section>

                {/* RIGHT SIDEBAR */}
                <aside className="rb-topup-sidebar">

                    <div className="rb-funding-info">

                        <div className="rb-info-icon">$</div>

                        <span className="rb-section-label">
                            SKYRAVON BANK
                        </span>

                        <h2>Account Funding</h2>

                        <p>
                            Manage customer account credits from one
                            secure administration workspace.
                        </p>

                        <div className="rb-info-divider" />

                        <div className="rb-info-row">
                            <span>Transaction Type</span>
                            <strong>Account Credit</strong>
                        </div>

                        <div className="rb-info-row">
                            <span>Currency</span>
                            <strong>USD — Dollar</strong>
                        </div>

                        <div className="rb-info-row">
                            <span>Processing</span>
                            <strong>Admin initiated</strong>
                        </div>

                        <div className="rb-info-row">
                            <span>Transaction Record</span>
                            <strong>Backend dependent</strong>
                        </div>

                    </div>

                    <div className="rb-security-card">
                        <div className="rb-security-icon">✓</div>
                        <div>
                            <strong>Security Reminder</strong>
                            <p>
                                Always verify the customer's identity
                                and account details before confirming
                                a credit transaction.
                            </p>
                        </div>
                    </div>

                </aside>

            </div>

            {/* RECENT ACTIVITY */}
            <section className="rb-history-card">

                <div className="rb-history-heading">
                    <div>
                        <span className="rb-section-label">
                            TRANSACTION ACTIVITY
                        </span>
                        <h2>Recent Top-Ups</h2>
                        <p>
                            Top-ups processed during this page session.
                        </p>
                    </div>

                    <span className="rb-history-count">
                        {recentTopUps.length} records
                    </span>
                </div>

                <div className="rb-table-scroll">
                    <table className="rb-history-table">
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Reference</th>
                                <th>Amount</th>
                                <th>New Balance</th>
                                <th>Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {recentTopUps.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="rb-empty-history"
                                    >
                                        <div className="rb-empty-icon">↗</div>
                                        <strong>No top-up activity yet</strong>
                                        <span>
                                            Completed top-ups will appear here
                                            during this session.
                                        </span>
                                    </td>
                                </tr>
                            ) : (
                                recentTopUps.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            <div className="rb-table-customer">
                                                <div>
                                                    {item.customer
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>
                                                <span>
                                                    <strong>
                                                        {item.customer}
                                                    </strong>
                                                    <small>{item.email}</small>
                                                </span>
                                            </div>
                                        </td>

                                        <td className="rb-reference">
                                            {item.reference}
                                        </td>

                                        <td className="rb-credit-value">
                                            +{formatMoney(item.amount)}
                                        </td>

                                        <td>
                                            {formatMoney(item.balance)}
                                        </td>

                                        <td>{item.date}</td>

                                        <td>
                                            <span className="rb-status-success">
                                                Successful
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

            </section>

            {/* CONFIRMATION MODAL */}
            {showConfirmation && selectedCustomer && (
                <div
                    className="rb-modal-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && !loading) {
                            setShowConfirmation(false);
                        }
                    }}
                >
                    <div
                        className="rb-confirm-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="rb-confirm-title"
                    >
                        <div className="rb-confirm-icon">$</div>

                        <h2 id="rb-confirm-title">
                            Confirm Account Credit
                        </h2>

                        <p>
                            Please review the transaction details
                            before proceeding.
                        </p>

                        <div className="rb-confirm-details">
                            <div>
                                <span>Customer</span>
                                <strong>
                                    {selectedCustomer.full_name ||
                                        selectedCustomer.name}
                                </strong>
                            </div>

                            <div>
                                <span>Customer Email</span>
                                <strong>{selectedCustomer.email}</strong>
                            </div>

                            <div>
                                <span>Credit Amount</span>
                                <strong className="rb-credit-value">
                                    {formatMoney(numericAmount)}
                                </strong>
                            </div>

                            <div>
                                <span>Estimated New Balance</span>
                                <strong>
                                    {formatMoney(estimatedBalance)}
                                </strong>
                            </div>
                        </div>

                        <div className="rb-confirm-actions">
                            <button
                                type="button"
                                className="rb-cancel-button"
                                disabled={loading}
                                onClick={() =>
                                    setShowConfirmation(false)
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="rb-confirm-button"
                                disabled={loading}
                                onClick={confirmTopUp}
                            >
                                {loading
                                    ? "Processing..."
                                    : "Confirm Top-Up"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default TopUp;
