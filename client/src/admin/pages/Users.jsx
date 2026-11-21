
import { useEffect, useState, useCallback } from "react";
import axios from "axios";

import {
    FaUserPlus,
    FaSearch,
    FaEdit,
    FaTrash,
    FaEye,
    FaUsers,
    FaSyncAlt,
    FaWallet,
    FaUserCheck
} from "react-icons/fa";

import { Link, useNavigate } from "react-router-dom";
import "../css/users.css";

const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const fetchUsers = useCallback(async () => {
        try {
            setError("");

            const response = await axios.get(
                `${API_BASE_URL}/api/admin/users`
            );

            setUsers(response.data.users || []);
        } catch (err) {
            console.error("Users Error:", err);
            setError(
                err.response?.data?.message ||
                "Unable to load customers. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const deleteUser = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this customer? This action cannot be undone."
        );

        if (!confirmed) return;

        try {
            setDeletingId(id);

            await axios.delete(
                `${API_BASE_URL}/api/admin/users/${id}`
            );

            setUsers((previousUsers) =>
                previousUsers.filter((user) => user.id !== id)
            );
        } catch (err) {
            console.error("Delete User Error:", err);

            window.alert(
                err.response?.data?.message ||
                "Unable to delete customer. Please try again."
            );
        } finally {
            setDeletingId(null);
        }
    };

    const filteredUsers = users.filter((user) => {
        const searchTerm = search.toLowerCase().trim();

        return [
            user.full_name,
            user.email,
            user.account_number,
            user.phone
        ].some((value) =>
            String(value || "").toLowerCase().includes(searchTerm)
        );
    });

    const activeUsers = users.filter(
        (user) => user.status?.toLowerCase() === "active"
    ).length;

    const totalBalance = users.reduce(
        (total, user) => total + Number(user.balance || 0),
        0
    );

    const formatBalance = (balance) =>
        Number(balance || 0).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

    if (loading) {
        return (
            <div className="users-loading">
                <div className="users-spinner"></div>
                <p>Loading customers...</p>
            </div>
        );
    }

    return (
        <div className="users-page">

            {/* PAGE HEADER */}
            <div className="users-header">
                <div className="users-heading">
                    <span className="users-eyebrow">
                        CUSTOMER MANAGEMENT
                    </span>

                    <h1>Users Management</h1>

                    <p>
                        Manage, monitor and maintain all Skyravon Bank customers.
                    </p>
                </div>

                <Link
                    to="/admin/users/add"
                    className="add-user-btn"
                >
                    <FaUserPlus />
                    <span>Add New Customer</span>
                </Link>
            </div>

            {/* STATISTICS */}
            <div className="users-stats">

                <div className="user-stat-card">
                    <div className="user-stat-icon blue">
                        <FaUsers />
                    </div>

                    <div>
                        <span>Total Customers</span>
                        <h3>{users.length.toLocaleString()}</h3>
                    </div>
                </div>

                <div className="user-stat-card">
                    <div className="user-stat-icon green">
                        <FaUserCheck />
                    </div>

                    <div>
                        <span>Active Customers</span>
                        <h3>{activeUsers.toLocaleString()}</h3>
                    </div>
                </div>

                <div className="user-stat-card">
                    <div className="user-stat-icon purple">
                        <FaWallet />
                    </div>

                    <div>
                        <span>Total Customer Balances</span>
                        <h3>${formatBalance(totalBalance)}</h3>
                    </div>
                </div>

            </div>

            {/* CUSTOMER TABLE CARD */}
            <div className="users-card">

                <div className="users-card-header">
                    <div>
                        <h2>All Customers</h2>
                        <p>
                            {filteredUsers.length} customer(s) found
                        </p>
                    </div>

                    <button
                        type="button"
                        className="refresh-users-btn"
                        onClick={fetchUsers}
                        title="Refresh customers"
                    >
                        <FaSyncAlt />
                        <span>Refresh</span>
                    </button>
                </div>

                {/* SEARCH */}
                <div className="users-toolbar">
                    <div className="search-box">
                        <FaSearch />

                        <input
                            type="search"
                            placeholder="Search by name, email, phone or account number..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        {search && (
                            <button
                                type="button"
                                className="clear-search"
                                onClick={() => setSearch("")}
                                aria-label="Clear search"
                            >
                                ×
                            </button>
                        )}
                    </div>
                </div>

                {/* ERROR */}
                {error && (
                    <div className="users-error">
                        <span>{error}</span>

                        <button
                            type="button"
                            onClick={fetchUsers}
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* TABLE */}
                <div className="table-responsive">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Customer</th>
                                <th>Email Address</th>
                                <th>Account Number</th>
                                <th>Account Balance</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user, index) => (
                                    <tr key={user.id}>
                                        <td className="user-number">
                                            {index + 1}
                                        </td>

                                        <td>
                                            <div className="customer-info">
                                                <div className="customer-avatar">
                                                    {user.full_name
                                                        ?.trim()
                                                        ?.charAt(0)
                                                        ?.toUpperCase() || "U"}
                                                </div>

                                                <div className="customer-name">
                                                    <strong>
                                                        {user.full_name || "Unnamed Customer"}
                                                    </strong>
                                                    <span>Customer</span>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="user-email">
                                            {user.email || "—"}
                                        </td>

                                        <td>
                                            <span className="account-number">
                                                {user.account_number || "—"}
                                            </span>
                                        </td>

                                        <td className="user-balance">
                                            ${formatBalance(user.balance)}
                                        </td>

                                        <td>
                                            <span
                                                className={`user-status ${
                                                    user.status?.toLowerCase() === "active"
                                                        ? "active"
                                                        : "inactive"
                                                }`}
                                            >
                                                <span className="status-dot"></span>
                                                {user.status || "Unknown"}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="action-buttons">

                                                <button
                                                    type="button"
                                                    className="action-btn view"
                                                    title="View Customer"
                                                    aria-label="View customer"
                                                    onClick={() =>
                                                        navigate(`/admin/users/${user.id}`)
                                                    }
                                                >
                                                    <FaEye />
                                                </button>

                                                <button
                                                    type="button"
                                                    className="action-btn edit"
                                                    title="Edit Customer"
                                                    aria-label="Edit customer"
                                                    onClick={() =>
                                                        navigate(`/admin/users/edit/${user.id}`)
                                                    }
                                                >
                                                    <FaEdit />
                                                </button>

                                                <button
                                                    type="button"
                                                    className="action-btn delete"
                                                    title="Delete Customer"
                                                    aria-label="Delete customer"
                                                    disabled={deletingId === user.id}
                                                    onClick={() => deleteUser(user.id)}
                                                >
                                                    {deletingId === user.id
                                                        ? "..."
                                                        : <FaTrash />
                                                    }
                                                </button>

                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="empty-users">
                                        <div className="empty-users-content">
                                            <FaUsers />
                                            <h3>No customers found</h3>
                                            <p>
                                                {search
                                                    ? "Try another search term."
                                                    : "Customers will appear here once they are added."
                                                }
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="users-table-footer">
                    Showing {filteredUsers.length} of {users.length} customers
                </div>

            </div>
        </div>
    );
}

export default Users;
