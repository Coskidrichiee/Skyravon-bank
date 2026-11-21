

import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  FaUsers,
  FaMoneyBillWave,
  FaExchangeAlt,
  FaWallet,
  FaCheckCircle,
  FaClock,
  FaCreditCard,
  FaUserPlus,
  FaArrowRight,
  FaChartLine,
  FaSyncAlt,
  FaExclamationCircle,
  FaShieldAlt,
  FaUniversity,
  FaTimes,
  FaCalendarAlt
} from "react-icons/fa";

import StatCard from "../components/StatCard";
import AdminLayout from "../components/AdminLayout";

import "../css/dashboard.css";
import "../css/admin.css";

import {
  getDashboardStats,
  getAdminTransactions,
  getPendingTransfers,
  approveTransfer,
  rejectTransfer
} from "../../services/api";

function Dashboard() {
  // Always use the administrator's separate authentication session.
  const getAdminToken = () =>
    localStorage.getItem("adminToken") ||
    localStorage.getItem("banking_admin_token");

  const [adminToken, setAdminToken] = useState(() => getAdminToken());

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [pendingTransfers, setPendingTransfers] = useState([]);
  const [pendingTransferCount, setPendingTransferCount] = useState(0);

  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [loadingPending, setLoadingPending] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [pageError, setPageError] = useState("");

  const formatAmount = (amount, currency = "USD") => {
    const value = Number(amount ?? 0);

    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency || "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(Number.isFinite(value) ? value : 0);
    } catch {
      return `${currency || "USD"} ${
        Number.isFinite(value) ? value.toLocaleString() : "0.00"
      }`;
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "—";

    return parsedDate.toLocaleString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // LOAD DASHBOARD STATISTICS
  const loadDashboardStats = useCallback(async () => {
    const response = await getDashboardStats();

    console.log("ADMIN DASHBOARD STATS RESPONSE:", response);

    if (response?.success && Array.isArray(response.stats)) {
      setStats(response.stats);

      const pendingStat = response.stats.find((item) =>
        String(item.title || "")
          .toLowerCase()
          .includes("pending transfer")
      );

      const pendingCount =
        response.totals?.pendingTransfers ??
        pendingStat?.value;

      if (pendingCount !== undefined && pendingCount !== null) {
        setPendingTransferCount(Number(pendingCount) || 0);
      }
    } else {
      console.error("Unexpected dashboard statistics response:", response);
    }

    return response;
  }, []);

  // LOAD RECENT TRANSACTIONS
  const loadTransactions = useCallback(async () => {
    const currentToken = getAdminToken();

    if (!currentToken) {
      setTransactions([]);
      setLoadingTransactions(false);
      return;
    }

    setLoadingTransactions(true);

    try {
      const response = await getAdminTransactions(currentToken, 10);

      console.log("ADMIN TRANSACTIONS RESPONSE:", response);

      setTransactions(
        response?.success && Array.isArray(response.transactions)
          ? response.transactions
          : []
      );
    } catch (error) {
      console.error("Failed to load transactions:", error);
      console.error("Transactions API error:", error?.response?.data);
      setTransactions([]);
    } finally {
      setLoadingTransactions(false);
    }
  }, []);

  // LOAD PENDING TRANSFERS
  const loadPendingTransfers = useCallback(async () => {
    const currentToken = getAdminToken();

    console.log("DASHBOARD ADMIN TOKEN FOUND:", Boolean(currentToken));

    if (!currentToken) {
      setPendingTransfers([]);
      setPendingTransferCount(0);
      setLoadingPending(false);
      return;
    }

    setLoadingPending(true);

    try {
      const response = await getPendingTransfers(currentToken, 10);

      console.log("ADMIN PENDING TRANSFERS RESPONSE:", response);

      if (response?.success && Array.isArray(response.transfers)) {
        setPendingTransfers(response.transfers);

        const count = Number(
          response.count ?? response.transfers.length
        );

        setPendingTransferCount(
          Number.isFinite(count) ? count : response.transfers.length
        );

        console.log("PENDING TRANSFER COUNT:", count);
      } else {
        console.error("Unexpected pending transfer response:", response);
        setPendingTransfers([]);
        setPendingTransferCount(0);
      }
    } catch (error) {
      console.error("PENDING TRANSFERS API ERROR:", error);
      console.error("SERVER RESPONSE:", error?.response?.data);

      setPendingTransfers([]);
      setPendingTransferCount(0);
    } finally {
      setLoadingPending(false);
    }
  }, []);

  // REFRESH COMPLETE DASHBOARD
  const refreshDashboard = useCallback(async () => {
    const currentToken = getAdminToken();

    setAdminToken(currentToken);

    if (!currentToken) {
      setLoading(false);
      setLoadingTransactions(false);
      setLoadingPending(false);
      setPageError("Administrator authentication is required. Please sign in again.");
      return;
    }

    setPageError("");
    setLoading(true);

    const results = await Promise.allSettled([
      loadDashboardStats(),
      loadTransactions(),
      loadPendingTransfers()
    ]);

    console.log("DASHBOARD REQUEST RESULTS:", results);

    const failedRequests = results.filter(
      (result) => result.status === "rejected"
    );

    if (failedRequests.length === results.length) {
      setPageError(
        "Dashboard information could not be loaded. Please try again."
      );
    }

    setLoading(false);
  }, [loadDashboardStats, loadTransactions, loadPendingTransfers]);

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  // APPROVE TRANSFER
  const handleApproveTransfer = async (transferId) => {
    if (!transferId || actionLoading !== null) return;

    const currentToken = getAdminToken();

    if (!currentToken) {
      window.alert("Administrator session expired. Please sign in again.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to approve this transfer?"
    );

    if (!confirmed) return;

    setActionLoading(transferId);

    try {
      const response = await approveTransfer(currentToken, transferId);

      if (!response?.success) {
        window.alert(
          response?.message || "Unable to approve this transfer."
        );
        return;
      }

      window.alert(
        response.message || "Transfer approved successfully."
      );

      await refreshDashboard();
    } catch (error) {
      console.error("Approve transfer error:", error);

      window.alert(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to approve this transfer."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // REJECT TRANSFER
  const handleRejectTransfer = async (transferId) => {
    if (!transferId || actionLoading !== null) return;

    const currentToken = getAdminToken();

    if (!currentToken) {
      window.alert("Administrator session expired. Please sign in again.");
      return;
    }

    const reason = window.prompt(
      "Enter the reason for rejecting this transfer:"
    );

    if (reason === null || !reason.trim()) return;

    setActionLoading(transferId);

    try {
      const response = await rejectTransfer(
        currentToken,
        transferId,
        reason.trim()
      );

      if (!response?.success) {
        window.alert(
          response?.message || "Unable to reject this transfer."
        );
        return;
      }

      window.alert(
        response.message || "Transfer rejected successfully."
      );

      await refreshDashboard();
    } catch (error) {
      console.error("Reject transfer error:", error);

      window.alert(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to reject this transfer."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // STATISTIC ICONS
  const getStatIcon = (icon) => {
    const icons = {
      users: <FaUsers />,
      wallet: <FaWallet />,
      clock: <FaClock />,
      exchange: <FaExchangeAlt />,
      transactions: <FaExchangeAlt />,
      money: <FaMoneyBillWave />,
      creditcard: <FaCreditCard />
    };

    return icons[String(icon || "").toLowerCase()] || <FaChartLine />;
  };

  // FALLBACK STATISTICS
  const fallbackStats = [
    {
      title: "Total Transactions",
      value: transactions.length,
      icon: <FaExchangeAlt />,
      color: "blue"
    },
    {
      title: "Pending Transfers",
      value: pendingTransferCount,
      icon: <FaClock />,
      color: "orange"
    },
    {
      title: "Approved Transfers",
      value: "—",
      icon: <FaCheckCircle />,
      color: "green"
    },
    {
      title: "Recent Transaction Volume",
      value: formatAmount(
        transactions.reduce(
          (total, item) => total + Number(item.amount || 0),
          0
        )
      ),
      icon: <FaMoneyBillWave />,
      color: "purple"
    }
  ];

  const statusClass = (status) =>
    String(status || "PENDING")
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "");

  // DISPLAY STATISTICS
  const displayStats = stats.length
    ? stats.map((item, index) => {
        const title = String(item.title || "").toLowerCase();

        if (
          title.includes("pending") &&
          title.includes("transfer")
        ) {
          return {
            ...item,
            value: pendingTransferCount,
            icon: <FaClock />,
            color: item.color || "orange"
          };
        }

        return {
          ...item,
          icon: getStatIcon(item.icon)
        };
      })
    : fallbackStats;

  return (
    <AdminLayout
      title="Dashboard"
      subtitle="Welcome to Skyravon Bank"
    >
      <div className="admin-dashboard">
        <div className="dashboard-content">

          {/* WELCOME SECTION */}
          <section className="dashboard-welcome">
            <div className="welcome-content">
              <div className="welcome-label">
                <span className="welcome-dot" />
                BANKING OVERVIEW
              </div>

              <h1>Welcome back, Administrator</h1>

              <p>
                Here's what's happening with your banking operations today.
                Stay in control of your financial platform.
              </p>

              <div className="welcome-security">
                <FaShieldAlt />
                <span>Secure administrator workspace</span>
              </div>
            </div>

            <div className="welcome-actions">
              <div className="welcome-date">
                <FaCalendarAlt />
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric"
                })}
              </div>

              <button
                type="button"
                className="dashboard-refresh"
                onClick={refreshDashboard}
                disabled={loading}
              >
                <FaSyncAlt className={loading ? "spin" : ""} />
                {loading ? "Refreshing..." : "Refresh dashboard"}
              </button>
            </div>

            <div className="welcome-decoration">
              <div className="welcome-circle circle-one" />
              <div className="welcome-circle circle-two" />
              <FaUniversity className="welcome-bank-icon" />
            </div>
          </section>

          {/* ERROR NOTIFICATION */}
          {pageError && (
            <div className="dashboard-alert" role="alert">
              <FaExclamationCircle />
              <span>{pageError}</span>

              <button
                type="button"
                onClick={refreshDashboard}
              >
                Try again
              </button>
            </div>
          )}

          {/* STATISTICS */}
          <section className="dashboard-stat-section">
            <div className="section-heading">
              <div>
                <span className="section-kicker">PERFORMANCE</span>
                <h2>Banking at a glance</h2>
                <p>
                  Monitor your platform's key financial indicators.
                </p>
              </div>

              <span className="live-indicator">
                <span />
                Dashboard overview
              </span>
            </div>

            <div className="stats-grid">
              {displayStats.map((item, index) => {
                const isPendingTransfer = String(item.title || "")
                  .toLowerCase()
                  .includes("pending transfer");

                return (
                  <StatCard
                    key={item.id || item.title || index}
                    title={item.title}
                    value={item.value}
                    icon={item.icon}
                    color={item.color || "blue"}
                    loading={isPendingTransfer && loadingPending}
                  />
                );
              })}
            </div>
          </section>

          {/* QUICK ACTIONS */}
          <section className="quick-actions">
            <div className="section-heading">
              <div>
                <span className="section-kicker">MANAGEMENT TOOLS</span>
                <h2>Quick actions</h2>
                <p>
                  Access frequently used administration tools.
                </p>
              </div>
            </div>

            <div className="quick-grid">
              <Link to="/admin/users/add" className="quick-card">
                <span className="quick-icon users">
                  <FaUserPlus />
                </span>
                <span className="quick-card-copy">
                  <strong>Add a user</strong>
                  <small>Create a customer account</small>
                </span>
                <FaArrowRight className="quick-arrow" />
              </Link>

              <Link to="/admin/topup" className="quick-card">
                <span className="quick-icon topup">
                  <FaMoneyBillWave />
                </span>
                <span className="quick-card-copy">
                  <strong>Top up account</strong>
                  <small>Add funds to a customer wallet</small>
                </span>
                <FaArrowRight className="quick-arrow" />
              </Link>

              <Link to="/admin/transfers" className="quick-card">
                <span className="quick-icon transfers">
                  <FaExchangeAlt />
                </span>
                <span className="quick-card-copy">
                  <strong>Transfers</strong>
                  <small>Review transfer activity</small>
                </span>
                <FaArrowRight className="quick-arrow" />
              </Link>

              <Link to="/admin/cards" className="quick-card">
                <span className="quick-icon cards">
                  <FaCreditCard />
                </span>
                <span className="quick-card-copy">
                  <strong>Manage cards</strong>
                  <small>View customer cards</small>
                </span>
                <FaArrowRight className="quick-arrow" />
              </Link>
            </div>
          </section>

          {/* MAIN DASHBOARD CONTENT */}
          <section className="dashboard-grid">

            {/* RECENT TRANSACTIONS */}
            <article className="dashboard-card transactions-card">
              <div className="card-header">
                <div>
                  <span className="section-kicker">ACCOUNT ACTIVITY</span>
                  <h3>Recent transactions</h3>
                  <p className="card-subtitle">
                    Latest transactions across your banking platform.
                  </p>
                </div>

                <Link to="/admin/transactions" className="card-link">
                  View all <FaArrowRight />
                </Link>
              </div>

              <div className="table-responsive">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>CUSTOMER</th>
                      <th>AMOUNT</th>
                      <th>TYPE</th>
                      <th>STATUS</th>
                      <th>DATE</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loadingTransactions ? (
                      <tr>
                        <td colSpan="5" className="table-message">
                          <FaSyncAlt className="spin" />
                          Loading transactions...
                        </td>
                      </tr>
                    ) : transactions.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="table-message">
                          <FaExchangeAlt />
                          No transactions found.
                        </td>
                      </tr>
                    ) : (
                      transactions.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <div className="customer-cell">
                              <span className="customer-avatar">
                                {String(
                                  item.full_name ||
                                  item.account_name ||
                                  "U"
                                ).trim().charAt(0).toUpperCase()}
                              </span>

                              <span>
                                <strong>
                                  {item.full_name ||
                                    item.account_name ||
                                    "Unknown user"}
                                </strong>
                                <small>
                                  {item.reference ||
                                    `Transaction #${item.id}`}
                                </small>
                              </span>
                            </div>
                          </td>

                          <td className="amount-cell">
                            {formatAmount(
                              item.amount,
                              item.currency || "USD"
                            )}
                          </td>

                          <td>
                            <span className="transaction-type">
                              {String(item.type || "TRANSFER").replaceAll("_", " ")}
                            </span>
                          </td>

                          <td>
                            <span className={`transaction-status ${statusClass(item.status)}`}>
                              {item.status || "PENDING"}
                            </span>
                          </td>

                          <td className="date-cell">
                            {formatDate(item.created_at)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="table-bottom">
                <span>
                  Showing {transactions.length} recent transactions
                </span>
                <Link to="/admin/transactions">
                  Transaction history <FaArrowRight />
                </Link>
              </div>
            </article>

            {/* PENDING TRANSFERS */}
            <article className="dashboard-card pending-card">
              <div className="card-header">
                <div>
                  <span className="section-kicker">ACTION REQUIRED</span>
                  <h3>Pending transfers</h3>
                  <p className="card-subtitle">
                    Review and process customer transfer requests.
                  </p>
                </div>

                <Link to="/admin/transfers" className="card-link">
                  View all <FaArrowRight />
                </Link>
              </div>

              <div className="pending-summary">
                <div>
                  <span className="pending-summary-icon">
                    <FaClock />
                  </span>
                  <div>
                    <strong>{pendingTransferCount}</strong>
                    <small>Awaiting review</small>
                  </div>
                </div>

                <span className="pending-summary-label">Pending</span>
              </div>

              <div className="pending-transactions">
                {loadingPending ? (
                  <div className="pending-empty">
                    <FaSyncAlt className="spin" />
                    Loading pending transfers...
                  </div>
                ) : pendingTransfers.length === 0 ? (
                  <div className="pending-empty">
                    <span className="empty-check">
                      <FaCheckCircle />
                    </span>

                    <strong>
                      {pendingTransferCount > 0
                        ? "Pending transfers found"
                        : "All caught up!"}
                    </strong>

                    <p>
                      {pendingTransferCount > 0
                        ? "The pending count was retrieved, but the transfer records could not be displayed. Please refresh or view all transfers."
                        : "There are no pending transfers requiring your attention."}
                    </p>
                  </div>
                ) : (
                  pendingTransfers.slice(0, 5).map((transfer) => (
                    <div className="pending-item" key={transfer.id}>
                      <div className="pending-item-top">
                        <div className="pending-user">
                          <div className="pending-customer-avatar">
                            {String(
                              transfer.full_name ||
                              transfer.account_name ||
                              "U"
                            ).trim().charAt(0).toUpperCase()}
                          </div>

                          <div className="pending-user-details">
                            <strong>
                              {transfer.full_name ||
                                transfer.account_name ||
                                "Unknown user"}
                            </strong>

                            <p>
                              {transfer.account_name ||
                                "Recipient details unavailable"}
                            </p>

                            <small>
                              {transfer.bank || "Bank unavailable"}
                              {" · "}
                              {transfer.account_number || "No account number"}
                            </small>
                          </div>
                        </div>

                        <div className="pending-transfer-right">
                          <h4>
                            {formatAmount(
                              transfer.amount,
                              transfer.currency || "USD"
                            )}
                          </h4>

                          <small>
                            Fee: {formatAmount(
                              transfer.fee || 0,
                              transfer.currency || "USD"
                            )}
                          </small>

                          <span className={`transaction-status ${statusClass(transfer.status)}`}>
                            {transfer.status || "PENDING"}
                          </span>
                        </div>
                      </div>

                      <div className="pending-transfer-meta">
                        <span>Ref: {transfer.reference || "—"}</span>
                        <span>{formatDate(transfer.created_at)}</span>
                      </div>

                      <div className="pending-buttons">
                        <button
                          type="button"
                          className="approve"
                          disabled={actionLoading !== null}
                          onClick={() => handleApproveTransfer(transfer.id)}
                        >
                          <FaCheckCircle />
                          {actionLoading === transfer.id
                            ? "Processing..."
                            : "Approve transfer"}
                        </button>

                        <button
                          type="button"
                          className="reject"
                          disabled={actionLoading !== null}
                          onClick={() => handleRejectTransfer(transfer.id)}
                          aria-label="Reject transfer"
                        >
                          {actionLoading === transfer.id
                            ? <FaSyncAlt className="spin" />
                            : <FaTimes />}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </article>
          </section>

          {/* FOOTER */}
          <footer className="dashboard-footer">
            <div>
              <FaShieldAlt />
              <span>Skyravon Bank secure administration</span>
            </div>
            <span>Banking management dashboard</span>
          </footer>

        </div>
      </div>
    </AdminLayout>
  );
}

export default Dashboard;
