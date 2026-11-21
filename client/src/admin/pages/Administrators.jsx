
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    FaUserShield,
    FaUserPlus,
    FaSearch,
    FaEdit,
    FaTrash,
    FaTimes,
    FaCheckCircle,
    FaExclamationCircle,
    FaSyncAlt,
    FaUsers,
    FaEnvelope,
    FaLock,
    FaToggleOn,
    FaToggleOff
} from "react-icons/fa";

import "../css/administrators.css";

const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

const ADMIN_API = `${API_BASE_URL}/api/admin/admins`;

const getAdminToken = () =>
    localStorage.getItem("banking_admin_token") ||
    localStorage.getItem("adminToken") ||
    localStorage.getItem("banking_token");

const emptyForm = {
    full_name: "",
    email: "",
    password: "",
    role: "admin",
    status: "active"
};

function Administrators() {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [form, setForm] = useState(emptyForm);

    const [message, setMessage] = useState({
        type: "",
        text: ""
    });

    const request = useCallback(async (url, options = {}) => {
        const token = getAdminToken();

        if (!token) {
            throw new Error("Admin session expired. Please sign in again.");
        }

        const response = await fetch(url, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                ...options.headers
            }
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok || data.success === false) {
            throw new Error(
                data.message || `Request failed (${response.status})`
            );
        }

        return data;
    }, []);

    const loadAdmins = useCallback(async () => {
        setLoading(true);

        try {
            const data = await request(ADMIN_API);

            const list = Array.isArray(data)
                ? data
                : data.admins || data.data || [];

            setAdmins(list);

        } catch (error) {
            setMessage({
                type: "error",
                text: error.message || "Unable to load administrators."
            });
        } finally {
            setLoading(false);
        }
    }, [request]);

    useEffect(() => {
        loadAdmins();
    }, [loadAdmins]);

    const filteredAdmins = useMemo(() => {
        const keyword = search.toLowerCase().trim();

        if (!keyword) return admins;

        return admins.filter((admin) =>
            `${admin.full_name || ""} ${admin.email || ""} ${admin.role || ""}`
                .toLowerCase()
                .includes(keyword)
        );
    }, [admins, search]);

    const activeCount = admins.filter(
        (admin) => admin.status === "active"
    ).length;

    const openCreateModal = () => {
        setEditingAdmin(null);
        setForm(emptyForm);
        setShowModal(true);
        setMessage({ type: "", text: "" });
    };

    const openEditModal = (admin) => {
        setEditingAdmin(admin);

        setForm({
            full_name: admin.full_name || "",
            email: admin.email || "",
            password: "",
            role: admin.role || "admin",
            status: admin.status || "active"
        });

        setShowModal(true);
        setMessage({ type: "", text: "" });
    };

    const closeModal = () => {
        if (saving) return;

        setShowModal(false);
        setEditingAdmin(null);
        setForm(emptyForm);
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!form.full_name.trim() || !form.email.trim()) {
            setMessage({
                type: "error",
                text: "Please complete all required fields."
            });
            return;
        }

        if (!editingAdmin && !form.password.trim()) {
            setMessage({
                type: "error",
                text: "Please enter a password for the new administrator."
            });
            return;
        }

        setSaving(true);
        setMessage({ type: "", text: "" });

        try {
            const payload = {
                full_name: form.full_name.trim(),
                email: form.email.trim(),
                role: form.role,
                status: form.status
            };

            if (form.password.trim()) {
                payload.password = form.password;
            }

            const url = editingAdmin
                ? `${ADMIN_API}/${editingAdmin.id}`
                : ADMIN_API;

            const data = await request(url, {
                method: editingAdmin ? "PUT" : "POST",
                body: JSON.stringify(payload)
            });

            setMessage({
                type: "success",
                text: data.message ||
                    (editingAdmin
                        ? "Administrator updated successfully."
                        : "Administrator created successfully.")
            });

            setShowModal(false);
            setEditingAdmin(null);
            setForm(emptyForm);

            await loadAdmins();

        } catch (error) {
            setMessage({
                type: "error",
                text: error.message || "Unable to save administrator."
            });
        } finally {
            setSaving(false);
        }
    };

    const toggleStatus = async (admin) => {
        const newStatus =
            admin.status === "active" ? "inactive" : "active";

        if (!window.confirm(
            `Are you sure you want to ${newStatus === "active" ? "activate" : "deactivate"} ${admin.full_name}?`
        )) {
            return;
        }

        try {
            await request(`${ADMIN_API}/${admin.id}`, {
                method: "PUT",
                body: JSON.stringify({
                    status: newStatus
                })
            });

            setMessage({
                type: "success",
                text: `Administrator ${newStatus === "active" ? "activated" : "deactivated"} successfully.`
            });

            await loadAdmins();

        } catch (error) {
            setMessage({
                type: "error",
                text: error.message || "Unable to update administrator status."
            });
        }
    };

    const deleteAdmin = async (admin) => {
        if (!window.confirm(
            `Are you sure you want to delete ${admin.full_name}? This action cannot be undone.`
        )) {
            return;
        }

        try {
            await request(`${ADMIN_API}/${admin.id}`, {
                method: "DELETE"
            });

            setMessage({
                type: "success",
                text: "Administrator deleted successfully."
            });

            await loadAdmins();

        } catch (error) {
            setMessage({
                type: "error",
                text: error.message || "Unable to delete administrator."
            });
        }
    };

    return (
        <div className="administrators-page">

            {/* HEADER */}

            <div className="administrators-header">
                <div>
                    <span className="administrators-eyebrow">
                        <FaUserShield />
                        SKYRAVON BANK ADMINISTRATION
                    </span>

                    <h1>Administrators</h1>

                    <p>
                        Manage administrator accounts, access and permissions
                        across your banking platform.
                    </p>
                </div>

                <div className="administrators-header-icon">
                    <FaUserShield />
                </div>
            </div>

            {/* NOTIFICATIONS */}

            {message.text && (
                <div className={`administrators-message ${message.type}`}>
                    {message.type === "success"
                        ? <FaCheckCircle />
                        : <FaExclamationCircle />
                    }

                    <span>{message.text}</span>

                    <button
                        type="button"
                        onClick={() => setMessage({ type: "", text: "" })}
                        aria-label="Close notification"
                    >
                        <FaTimes />
                    </button>
                </div>
            )}

            {/* STATISTICS */}

            <div className="administrators-stats">

                <div className="administrator-stat-card">
                    <div className="administrator-stat-icon blue">
                        <FaUsers />
                    </div>

                    <div>
                        <span>Total Administrators</span>
                        <h3>{admins.length}</h3>
                    </div>
                </div>

                <div className="administrator-stat-card">
                    <div className="administrator-stat-icon green">
                        <FaCheckCircle />
                    </div>

                    <div>
                        <span>Active Administrators</span>
                        <h3>{activeCount}</h3>
                    </div>
                </div>

                <div className="administrator-stat-card">
                    <div className="administrator-stat-icon orange">
                        <FaExclamationCircle />
                    </div>

                    <div>
                        <span>Inactive Administrators</span>
                        <h3>{admins.length - activeCount}</h3>
                    </div>
                </div>

            </div>

            {/* MAIN PANEL */}

            <section className="administrators-panel">

                <div className="administrators-toolbar">

                    <div>
                        <h2>Administrator Accounts</h2>
                        <p>View and manage registered administrators.</p>
                    </div>

                    <button
                        type="button"
                        className="administrator-add-btn"
                        onClick={openCreateModal}
                    >
                        <FaUserPlus />
                        Add Administrator
                    </button>

                </div>

                {/* SEARCH */}

                <div className="administrators-search-row">

                    <div className="administrators-search">
                        <FaSearch />

                        <input
                            type="search"
                            placeholder="Search by name, email or role..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                    </div>

                    <button
                        type="button"
                        className="administrator-refresh-btn"
                        onClick={loadAdmins}
                        disabled={loading}
                    >
                        <FaSyncAlt className={loading ? "spinning" : ""} />
                        Refresh
                    </button>

                </div>

                {/* TABLE */}

                <div className="administrators-table-wrapper">

                    <table className="administrators-table">

                        <thead>
                            <tr>
                                <th>Administrator</th>
                                <th>Email Address</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>

                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="administrator-empty">
                                        <FaSyncAlt className="spinning" />
                                        <p>Loading administrators...</p>
                                    </td>
                                </tr>
                            ) : filteredAdmins.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="administrator-empty">
                                        <FaUserShield />
                                        <p>
                                            {search
                                                ? "No matching administrators found."
                                                : "No administrators found."}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredAdmins.map((admin) => (
                                    <tr key={admin.id}>

                                        <td>
                                            <div className="administrator-user">

                                                <div className="administrator-avatar">
                                                    {(admin.full_name || "A")
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>

                                                <div>
                                                    <strong>
                                                        {admin.full_name || "Unnamed Admin"}
                                                    </strong>

                                                    <span>
                                                        ID: {admin.id}
                                                    </span>
                                                </div>

                                            </div>
                                        </td>

                                        <td>
                                            <div className="administrator-email">
                                                <FaEnvelope />
                                                {admin.email}
                                            </div>
                                        </td>

                                        <td>
                                            <span className="administrator-role">
                                                <FaUserShield />
                                                {admin.role || "admin"}
                                            </span>
                                        </td>

                                        <td>
                                            <span className={`administrator-status ${admin.status === "active" ? "active" : "inactive"}`}>
                                                <span className="status-dot"></span>
                                                {admin.status || "inactive"}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="administrator-actions">

                                                <button
                                                    type="button"
                                                    className="administrator-action edit"
                                                    title="Edit administrator"
                                                    onClick={() => openEditModal(admin)}
                                                >
                                                    <FaEdit />
                                                </button>

                                                <button
                                                    type="button"
                                                    className="administrator-action toggle"
                                                    title={admin.status === "active" ? "Deactivate administrator" : "Activate administrator"}
                                                    onClick={() => toggleStatus(admin)}
                                                >
                                                    {admin.status === "active"
                                                        ? <FaToggleOn />
                                                        : <FaToggleOff />
                                                    }
                                                </button>

                                                <button
                                                    type="button"
                                                    className="administrator-action delete"
                                                    title="Delete administrator"
                                                    onClick={() => deleteAdmin(admin)}
                                                >
                                                    <FaTrash />
                                                </button>

                                            </div>
                                        </td>

                                    </tr>
                                ))
                            )}

                        </tbody>

                    </table>

                </div>

                <div className="administrators-table-footer">
                    Showing {filteredAdmins.length} of {admins.length} administrators
                </div>

            </section>

            {/* CREATE / EDIT MODAL */}

            {showModal && (
                <div
                    className="administrator-modal-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeModal();
                        }
                    }}
                >

                    <div className="administrator-modal">

                        <div className="administrator-modal-header">

                            <div className="administrator-modal-title-icon">
                                {editingAdmin
                                    ? <FaEdit />
                                    : <FaUserPlus />
                                }
                            </div>

                            <div>
                                <h2>
                                    {editingAdmin
                                        ? "Edit Administrator"
                                        : "Add Administrator"}
                                </h2>

                                <p>
                                    {editingAdmin
                                        ? "Update administrator account details."
                                        : "Create a new administrator account."}
                                </p>
                            </div>

                            <button
                                type="button"
                                className="administrator-modal-close"
                                onClick={closeModal}
                                disabled={saving}
                            >
                                <FaTimes />
                            </button>

                        </div>

                        <form onSubmit={handleSubmit}>

                            <div className="administrator-modal-body">

                                <div className="administrator-form-field">
                                    <label htmlFor="admin-name">
                                        Full Name
                                    </label>

                                    <input
                                        id="admin-name"
                                        type="text"
                                        name="full_name"
                                        placeholder="Enter full name"
                                        value={form.full_name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="administrator-form-field">
                                    <label htmlFor="admin-email">
                                        Email Address
                                    </label>

                                    <input
                                        id="admin-email"
                                        type="email"
                                        name="email"
                                        placeholder="admin@example.com"
                                        value={form.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="administrator-form-field">
                                    <label htmlFor="admin-password">
                                        {editingAdmin
                                            ? "New Password (Optional)"
                                            : "Password"}
                                    </label>

                                    <div className="administrator-password-input">
                                        <FaLock />

                                        <input
                                            id="admin-password"
                                            type="password"
                                            name="password"
                                            placeholder={
                                                editingAdmin
                                                    ? "Leave blank to keep current password"
                                                    : "Enter a secure password"
                                            }
                                            value={form.password}
                                            onChange={handleChange}
                                            required={!editingAdmin}
                                            minLength={8}
                                            autoComplete="new-password"
                                        />
                                    </div>
                                </div>

                                <div className="administrator-form-row">

                                    <div className="administrator-form-field">
                                        <label htmlFor="admin-role">
                                            Role
                                        </label>

                                        <select
                                            id="admin-role"
                                            name="role"
                                            value={form.role}
                                            onChange={handleChange}
                                        >
                                            <option value="admin">Admin</option>
                                            <option value="super_admin">Super Admin</option>
                                        </select>
                                    </div>

                                    <div className="administrator-form-field">
                                        <label htmlFor="admin-status">
                                            Account Status
                                        </label>

                                        <select
                                            id="admin-status"
                                            name="status"
                                            value={form.status}
                                            onChange={handleChange}
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>

                                </div>

                            </div>

                            <div className="administrator-modal-footer">

                                <button
                                    type="button"
                                    className="administrator-modal-cancel"
                                    onClick={closeModal}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="administrator-modal-save"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingAdmin
                                            ? "Save Changes"
                                            : "Create Administrator"
                                    }
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
}

export default Administrators;
