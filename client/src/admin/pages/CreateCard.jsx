
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaArrowLeft,
    FaCreditCard,
    FaUser,
    FaShieldAlt,
    FaCheckCircle,
    FaExclamationCircle,
    FaPlus
} from "react-icons/fa";

import "../css/createCards.css";

const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

const CARD_API = `${API_BASE_URL}/api/cards`;
const USERS_API = `${API_BASE_URL}/api/admin/users`;

const getAdminToken = () =>
    localStorage.getItem("banking_admin_token") ||
    localStorage.getItem("adminToken") ||
    localStorage.getItem("banking_token");

function CreateCard() {
    const navigate = useNavigate();

    const currentYear = new Date().getFullYear();

    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [message, setMessage] = useState({
        type: "",
        text: ""
    });

    const [form, setForm] = useState({
        user_id: "",
        card_type: "VISA",
        expiry_month: "12",
        expiry_year: String(currentYear + 3)
    });

    const request = useCallback(async (url, options = {}) => {
        const token = getAdminToken();

        if (!token) {
            throw new Error("Admin session not found. Please sign in again.");
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

    const loadUsers = useCallback(async () => {
        setLoadingUsers(true);
        setMessage({ type: "", text: "" });

        try {
            const data = await request(USERS_API);

            const customerList = Array.isArray(data)
                ? data
                : data.users || data.data || [];

            setUsers(customerList);
        } catch (error) {
            setMessage({
                type: "error",
                text: error.message || "Unable to load customers."
            });
        } finally {
            setLoadingUsers(false);
        }
    }, [request]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!form.user_id) {
            setMessage({
                type: "error",
                text: "Please select a customer."
            });
            return;
        }

        setSubmitting(true);
        setMessage({ type: "", text: "" });

        try {
            const data = await request(`${CARD_API}/admin`, {
                method: "POST",
                body: JSON.stringify({
                    user_id: Number(form.user_id),
                    card_type: form.card_type,
                    expiry_month: Number(form.expiry_month),
                    expiry_year: Number(form.expiry_year)
                })
            });

            setMessage({
                type: "success",
                text: data.message || "Customer card created successfully."
            });

            // Give the success message a moment to display.
            setTimeout(() => {
                navigate("/admin/cards", {
                    state: {
                        message: "Customer card created successfully.",
                        cardId: data.card?.id || null
                    }
                });
            }, 900);

        } catch (error) {
            setMessage({
                type: "error",
                text: error.message || "Unable to create customer card."
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="admin-cards-page create-card-page">

            <div className="cards-page-header">
                <div>
                    <span className="cards-header-label">
                        <FaShieldAlt /> RICHIEE BANK ADMINISTRATION
                    </span>

                    <h1>Create Customer Card</h1>

                    <p>
                        Assign a virtual banking card to an existing customer.
                    </p>
                </div>

                <div className="cards-header-icon">
                    <FaCreditCard />
                </div>
            </div>

            <button
                type="button"
                className="create-card-back-btn"
                onClick={() => navigate("/admin/cards")}
            >
                <FaArrowLeft /> Back to Card Management
            </button>

            {message.text && (
                <div className={`cards-message ${message.type}`}>
                    {message.type === "success"
                        ? <FaCheckCircle />
                        : <FaExclamationCircle />
                    }

                    <span>{message.text}</span>
                </div>
            )}

            <div className="create-card-layout">

                <section className="cards-preview-panel create-card-form-panel">

                    <div className="cards-section-heading">
                        <div>
                            <h2><FaPlus /> Card Details</h2>
                            <p>Complete the information below to assign a card.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>

                        <div className="create-card-field">
                            <label htmlFor="customer">
                                <FaUser /> Select Customer
                            </label>

                            <select
                                id="customer"
                                name="user_id"
                                value={form.user_id}
                                onChange={handleChange}
                                required
                                disabled={loadingUsers || !users.length}
                            >
                                <option value="">
                                    {loadingUsers
                                        ? "Loading customers..."
                                        : users.length
                                            ? "Choose a customer"
                                            : "No customers available"}
                                </option>

                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.full_name} — {user.email}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="create-card-field">
                            <label htmlFor="card-type">
                                <FaCreditCard /> Card Network Label
                            </label>

                            <select
                                id="card-type"
                                name="card_type"
                                value={form.card_type}
                                onChange={handleChange}
                                required
                            >
                                <option value="VISA">Visa</option>
                                <option value="MASTERCARD">Mastercard</option>
                            </select>
                        </div>

                        <div className="create-card-two-columns">

                            <div className="create-card-field">
                                <label htmlFor="expiry-month">
                                    Expiry Month
                                </label>

                                <select
                                    id="expiry-month"
                                    name="expiry_month"
                                    value={form.expiry_month}
                                    onChange={handleChange}
                                    required
                                >
                                    {Array.from(
                                        { length: 12 },
                                        (_, index) => (
                                            <option
                                                key={index + 1}
                                                value={index + 1}
                                            >
                                                {String(index + 1).padStart(2, "0")}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            <div className="create-card-field">
                                <label htmlFor="expiry-year">
                                    Expiry Year
                                </label>

                                <input
                                    id="expiry-year"
                                    type="number"
                                    name="expiry_year"
                                    min={currentYear + 1}
                                    max={currentYear + 20}
                                    value={form.expiry_year}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                        </div>

                        <div className="create-card-notice">
                            <FaShieldAlt />
                            <p>
                                This operation creates an internal virtual card
                                record for the selected customer. It does not
                                issue a payment-network card.
                            </p>
                        </div>

                        <div className="create-card-buttons">

                            <button
                                type="button"
                                className="create-card-cancel-btn"
                                onClick={() => navigate("/admin/cards")}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="create-card-submit-btn"
                                disabled={submitting || loadingUsers || !users.length}
                            >
                                {submitting
                                    ? "Creating Card..."
                                    : "Create Customer Card"
                                }

                                {!submitting && <FaPlus />}
                            </button>

                        </div>

                    </form>
                </section>

                <aside className="create-card-side-panel">
                    <div className="create-card-side-icon">
                        <FaCreditCard />
                    </div>

                    <h2>Richiee Bank Cards</h2>

                    <p>
                        Assign and manage virtual cards for your registered
                        customers from one secure administration area.
                    </p>

                    <div className="create-card-feature">
                        <FaCheckCircle />
                        <span>Customer-linked card records</span>
                    </div>

                    <div className="create-card-feature">
                        <FaCheckCircle />
                        <span>Visa and Mastercard labels</span>
                    </div>

                    <div className="create-card-feature">
                        <FaCheckCircle />
                        <span>Card expiry management</span>
                    </div>

                    <div className="create-card-feature">
                        <FaCheckCircle />
                        <span>Activate, block and freeze controls</span>
                    </div>
                </aside>

            </div>
        </div>
    );
}

export default CreateCard;
