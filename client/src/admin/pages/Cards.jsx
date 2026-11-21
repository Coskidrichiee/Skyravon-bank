
import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
    FaCreditCard,
    FaUser,
    FaLock,
    FaCheckCircle,
    FaSnowflake,
    FaShieldAlt,
    FaWifi,
    FaPlus,
    FaBan,
    FaSyncAlt,
    FaTrash,
    FaTimes,
    FaEye,
    FaExclamationCircle,
    FaArrowRight
} from "react-icons/fa";

import "../css/adminCards.css";

const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

const CARD_API = `${API_BASE_URL}/api/cards`;

const getAdminToken = () =>
    localStorage.getItem("banking_admin_token") ||
    localStorage.getItem("adminToken") ||
    localStorage.getItem("banking_token");

const formatExpiry = (month, year) =>
    `${String(month).padStart(2, "0")}/${String(year).slice(-2)}`;

const formatDate = (date) => {
    if (!date) return "Not available";

    const parsed = new Date(date);

    return Number.isNaN(parsed.getTime())
        ? "Not available"
        : parsed.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
};

const getStatusClass = (status) =>
    String(status || "PENDING").toLowerCase();

function Cards() {
    const navigate = useNavigate();

    const [cards, setCards] = useState([]);
    const [selectedCardId, setSelectedCardId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState(null);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [message, setMessage] = useState({
        type: "",
        text: ""
    });

    // ==========================
    // API REQUEST
    // ==========================

    const request = useCallback(async (url, options = {}) => {
        const token = getAdminToken();

        if (!token) {
            throw new Error(
                "Admin token not found. Please sign in again."
            );
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

    // ==========================
    // LOAD CARDS
    // ==========================

    const loadCards = useCallback(async () => {
        const data = await request(`${CARD_API}/admin`);

        const list = Array.isArray(data.cards)
            ? data.cards
            : [];

        setCards(list);

        setSelectedCardId((current) => {
            if (
                current &&
                list.some(
                    (card) => String(card.id) === String(current)
                )
            ) {
                return current;
            }

            return list.length ? list[0].id : null;
        });

        return list;
    }, [request]);

    // ==========================
    // LOAD PAGE
    // ==========================

    const loadPage = useCallback(async () => {
        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            await loadCards();
        } catch (error) {
            setMessage({
                type: "error",
                text: error.message ||
                    "Unable to load card information."
            });
        } finally {
            setLoading(false);
        }
    }, [loadCards]);

    useEffect(() => {
        loadPage();
    }, [loadPage]);

    // ==========================
    // SELECTED CARD
    // ==========================

    const selectedCard = useMemo(
        () =>
            cards.find(
                (card) =>
                    String(card.id) === String(selectedCardId)
            ) || null,
        [cards, selectedCardId]
    );

    // ==========================
    // SEARCH AND FILTER
    // ==========================

    const filteredCards = useMemo(() => {
        const term = search.trim().toLowerCase();

        return cards.filter((card) => {
            const matchesSearch =
                !term ||
                String(card.customer_name || "")
                    .toLowerCase()
                    .includes(term) ||
                String(card.card_holder || "")
                    .toLowerCase()
                    .includes(term) ||
                String(card.customer_email || "")
                    .toLowerCase()
                    .includes(term) ||
                String(card.last_four || "").includes(term) ||
                String(card.card_type || "")
                    .toLowerCase()
                    .includes(term);

            const matchesStatus =
                statusFilter === "ALL" ||
                String(card.status).toUpperCase() === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [cards, search, statusFilter]);

    // ==========================
    // STATISTICS
    // ==========================

    const stats = useMemo(() => ({
        total: cards.length,

        active: cards.filter(
            (card) => String(card.status).toUpperCase() === "ACTIVE"
        ).length,

        blocked: cards.filter(
            (card) => String(card.status).toUpperCase() === "BLOCKED"
        ).length,

        frozen: cards.filter(
            (card) => String(card.status).toUpperCase() === "FROZEN"
        ).length

    }), [cards]);

    // ==========================
    // UPDATE CARD STATUS
    // ==========================

    const updateStatus = async (card, status) => {
        if (!card) return;

        const actionText = status.toLowerCase();

        const confirmed = window.confirm(
            `Are you sure you want to ${actionText} this card belonging to ${
                card.card_holder || card.customer_name
            }?`
        );

        if (!confirmed) return;

        setActionId(card.id);
        setMessage({ type: "", text: "" });

        try {
            const data = await request(
                `${CARD_API}/admin/${card.id}/status`,
                {
                    method: "PATCH",
                    body: JSON.stringify({ status })
                }
            );

            setCards((current) =>
                current.map((item) =>
                    String(item.id) === String(card.id)
                        ? { ...item, ...data.card }
                        : item
                )
            );

            setMessage({
                type: "success",
                text: data.message || "Card status updated successfully."
            });

        } catch (error) {
            setMessage({
                type: "error",
                text: error.message || "Unable to update card."
            });
        } finally {
            setActionId(null);
        }
    };

    // ==========================
    // DELETE CARD
    // ==========================

    const deleteCard = async (card) => {
        if (!card) return;

        const confirmed = window.confirm(
            `Permanently delete the card ending in ${
                card.last_four || "****"
            }? This cannot be undone.`
        );

        if (!confirmed) return;

        setActionId(card.id);
        setMessage({ type: "", text: "" });

        try {
            const data = await request(
                `${CARD_API}/admin/${card.id}`,
                { method: "DELETE" }
            );

            setCards((current) =>
                current.filter(
                    (item) => String(item.id) !== String(card.id)
                )
            );

            setSelectedCardId((current) =>
                String(current) === String(card.id) ? null : current
            );

            setMessage({
                type: "success",
                text: data.message || "Card deleted successfully."
            });

        } catch (error) {
            setMessage({
                type: "error",
                text: error.message || "Unable to delete card."
            });
        } finally {
            setActionId(null);
        }
    };

    // ==========================
    // DISPLAY NAME
    // ==========================

    const displayName = (card) =>
        card?.card_holder ||
        card?.customer_name ||
        "CUSTOMER";

    // ==========================
    // PAGE
    // ==========================

    return (
        <div className="admin-cards-page">

            {/* PAGE HEADER */}

            <div className="cards-page-header">

                <div>
                    <span className="cards-header-label">
                        <FaShieldAlt />
                        SKYRAVON BANK ADMINISTRATION
                    </span>

                    <h1>Card Management</h1>

                    <p>
                        Manage customer virtual cards and monitor card status.
                    </p>
                </div>

                <div className="cards-header-actions">

                    <button
                        type="button"
                        className="cards-refresh-btn"
                        onClick={loadPage}
                        disabled={loading}
                    >
                        <FaSyncAlt
                            className={loading ? "cards-spinning" : ""}
                        />
                        Refresh
                    </button>

                    <button
                        type="button"
                        className="cards-add-btn"
                        onClick={() => navigate("/admin/create-card")}
                    >
                        <FaPlus />
                        Assign Card
                    </button>

                    <div className="cards-header-icon">
                        <FaCreditCard />
                    </div>

                </div>
            </div>

            {/* NOTIFICATIONS */}

            {message.text && (
                <div className={`cards-message ${message.type}`}>

                    {message.type === "success"
                        ? <FaCheckCircle />
                        : <FaExclamationCircle />
                    }

                    <span>{message.text}</span>

                    <button
                        type="button"
                        onClick={() =>
                            setMessage({ type: "", text: "" })
                        }
                        aria-label="Dismiss message"
                    >
                        <FaTimes />
                    </button>

                </div>
            )}

            {/* STATISTICS */}

            <div className="cards-stats-grid">

                <div className="cards-stat-card">
                    <div className="cards-stat-icon blue">
                        <FaCreditCard />
                    </div>
                    <div>
                        <span>Total Cards</span>
                        <h3>{stats.total.toLocaleString()}</h3>
                        <small>Cards in database</small>
                    </div>
                </div>

                <div className="cards-stat-card">
                    <div className="cards-stat-icon green">
                        <FaCheckCircle />
                    </div>
                    <div>
                        <span>Active Cards</span>
                        <h3>{stats.active.toLocaleString()}</h3>
                        <small>Currently active</small>
                    </div>
                </div>

                <div className="cards-stat-card">
                    <div className="cards-stat-icon red">
                        <FaBan />
                    </div>
                    <div>
                        <span>Blocked Cards</span>
                        <h3>{stats.blocked.toLocaleString()}</h3>
                        <small>Restricted cards</small>
                    </div>
                </div>

                <div className="cards-stat-card">
                    <div className="cards-stat-icon orange">
                        <FaSnowflake />
                    </div>
                    <div>
                        <span>Frozen Cards</span>
                        <h3>{stats.frozen.toLocaleString()}</h3>
                        <small>Temporarily frozen</small>
                    </div>
                </div>

            </div>

            {/* CUSTOMER CARD LIST */}

            <section className="cards-preview-panel cards-list-panel">

                <div className="cards-section-heading">

                    <div>
                        <h2>Customer Cards</h2>
                        <p>
                            Select a card to view its details and manage its status.
                        </p>
                    </div>

                    <span className="cards-record-count">
                        {filteredCards.length} records
                    </span>

                </div>

                {/* SEARCH */}

                <div className="cards-filters">

                    <input
                        type="search"
                        placeholder="Search customer, email or last four digits..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />

                    <select
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(event.target.value)
                        }
                    >
                        <option value="ALL">All statuses</option>
                        <option value="ACTIVE">Active</option>
                        <option value="BLOCKED">Blocked</option>
                        <option value="FROZEN">Frozen</option>
                        <option value="PENDING">Pending</option>
                    </select>

                </div>

                {/* LOADING */}

                {loading ? (

                    <div className="cards-empty-state">
                        <FaSyncAlt className="cards-spinning" />
                        <p>Loading customer cards...</p>
                    </div>

                ) : filteredCards.length === 0 ? (

                    <div className="cards-empty-state">
                        <FaCreditCard />
                        <h3>No cards found</h3>
                        <p>
                            Assign a card to a customer to see it listed here.
                        </p>
                    </div>

                ) : (

                    <div className="cards-records-grid">

                        {filteredCards.map((card) => (

                            <button
                                type="button"
                                key={card.id}
                                className={`cards-record-card ${
                                    String(selectedCardId) === String(card.id)
                                        ? "selected"
                                        : ""
                                }`}
                                onClick={() => setSelectedCardId(card.id)}
                            >

                                <span className="cards-record-icon">
                                    <FaCreditCard />
                                </span>

                                <span className="cards-record-main">
                                    <strong>
                                        {card.customer_name ||
                                            card.card_holder ||
                                            "Customer"}
                                    </strong>

                                    <small>
                                        {card.customer_email || "Customer"}
                                    </small>

                                    <small>
                                        •••• {card.last_four || "****"}
                                        {" · "}
                                        {card.card_type}
                                    </small>
                                </span>

                                <span
                                    className={`cards-status ${getStatusClass(
                                        card.status
                                    )}`}
                                >
                                    {card.status}
                                </span>

                                <FaEye className="cards-record-eye" />

                            </button>

                        ))}

                    </div>

                )}

            </section>

            {/* SELECTED CARD DETAILS */}

            {selectedCard && (

                <div className="cards-main-grid cards-selected-grid">

                    {/* CARD PREVIEW */}

                    <section className="cards-preview-panel">

                        <div className="cards-section-heading">

                            <div>
                                <h2>Selected Card</h2>
                                <p>
                                    Virtual card record for{" "}
                                    {displayName(selectedCard)}
                                </p>
                            </div>

                            <span
                                className={`cards-status ${getStatusClass(
                                    selectedCard.status
                                )}`}
                            >
                                {selectedCard.status}
                            </span>

                        </div>

                        <div
                            className={`richiee-bank-card card-status-${getStatusClass(
                                selectedCard.status
                            )}`}
                        >

                            <div className="bank-card-top">

                                <div className="bank-card-brand">

                                    <div className="bank-card-logo">
                                        <FaCreditCard />
                                    </div>

                                    <div>
                                        <h3>SKYRAVON</h3>
                                        <span>ONLINE BANKING</span>
                                    </div>

                                </div>

                                <FaWifi className="bank-card-contactless" />

                            </div>

                            <div className="bank-card-chip">
                                <div className="chip-grid">
                                    {Array.from(
                                        { length: 6 },
                                        (_, index) => (
                                            <span key={index}></span>
                                        )
                                    )}
                                </div>
                            </div>

                            <div className="bank-card-number">
                                <span>••••</span>
                                <span>••••</span>
                                <span>••••</span>
                                <span>{selectedCard.last_four || "****"}</span>
                            </div>

                            <div className="bank-card-bottom">

                                <div>
                                    <span>CARDHOLDER</span>
                                    <h4>
                                        {displayName(selectedCard).toUpperCase()}
                                    </h4>
                                </div>

                                <div className="bank-card-expiry">
                                    <span>EXPIRES</span>
                                    <h4>
                                        {formatExpiry(
                                            selectedCard.expiry_month,
                                            selectedCard.expiry_year
                                        )}
                                    </h4>
                                </div>

                                <div className="bank-card-visa">
                                    {selectedCard.card_type === "MASTERCARD"
                                        ? "mastercard"
                                        : "VISA"}
                                </div>

                            </div>

                        </div>

                        <div className="cards-preview-footer">

                            <div>
                                <span>Card Type</span>
                                <strong>
                                    {selectedCard.card_type} Virtual
                                </strong>
                            </div>

                            <div>
                                <span>Last Four Digits</span>
                                <strong>
                                    •••• {selectedCard.last_four || "****"}
                                </strong>
                            </div>

                            <div>
                                <span>Card Status</span>
                                <strong
                                    className={`card-status-text ${getStatusClass(
                                        selectedCard.status
                                    )}`}
                                >
                                    {selectedCard.status}
                                </strong>
                            </div>

                        </div>

                    </section>

                    {/* CARD INFORMATION */}

                    <section className="cards-information-panel">

                        <div className="cards-section-heading">

                            <div>
                                <h2>Card Information</h2>
                                <p>Database-backed card details</p>
                            </div>

                            <FaShieldAlt className="cards-info-heading-icon" />

                        </div>

                        <div className="card-info-item">
                            <span>Cardholder</span>
                            <strong>{displayName(selectedCard)}</strong>
                        </div>

                        <div className="card-info-item">
                            <span>Customer Email</span>
                            <strong>
                                {selectedCard.customer_email || "Not available"}
                            </strong>
                        </div>

                        <div className="card-info-item">
                            <span>Card Reference</span>
                            <strong>
                                •••• {selectedCard.last_four || "****"}
                            </strong>
                        </div>

                        <div className="card-info-item">
                            <span>Card Network Label</span>
                            <strong>{selectedCard.card_type}</strong>
                        </div>

                        <div className="card-info-item">
                            <span>Expiry Date</span>
                            <strong>
                                {formatExpiry(
                                    selectedCard.expiry_month,
                                    selectedCard.expiry_year
                                )}
                            </strong>
                        </div>

                        <div className="card-info-item">
                            <span>Date Assigned</span>
                            <strong>
                                {formatDate(selectedCard.created_at)}
                            </strong>
                        </div>

                        <div className="card-info-item">
                            <span>Status</span>
                            <span
                                className={`cards-status ${getStatusClass(
                                    selectedCard.status
                                )}`}
                            >
                                {selectedCard.status}
                            </span>
                        </div>

                        <div className="cards-info-notice">
                            <FaShieldAlt />
                            <span>
                                Only the card reference's last four digits
                                are displayed. This is an internal virtual
                                card record.
                            </span>
                        </div>

                    </section>

                </div>

            )}

            {/* CARD ACTIONS */}

            {selectedCard && (

                <section className="cards-actions-section">

                    <div className="cards-section-title">
                        <h2>Manage Selected Card</h2>
                        <p>
                            Choose an operation for{" "}
                            {displayName(selectedCard)}'s card.
                        </p>
                    </div>

                    <div className="cards-actions-grid">

                        <div className="cards-action-card">
                            <div className="cards-action-icon green">
                                <FaCheckCircle />
                            </div>

                            <h3>Activate Card</h3>
                            <p>Restore access to this card.</p>

                            <button
                                type="button"
                                disabled={
                                    actionId === selectedCard.id ||
                                    selectedCard.status === "ACTIVE"
                                }
                                onClick={() =>
                                    updateStatus(selectedCard, "ACTIVE")
                                }
                            >
                                Activate <FaArrowRight />
                            </button>
                        </div>

                        <div className="cards-action-card">
                            <div className="cards-action-icon red">
                                <FaLock />
                            </div>

                            <h3>Block Card</h3>
                            <p>Restrict this card until further action.</p>

                            <button
                                type="button"
                                disabled={
                                    actionId === selectedCard.id ||
                                    selectedCard.status === "BLOCKED"
                                }
                                onClick={() =>
                                    updateStatus(selectedCard, "BLOCKED")
                                }
                            >
                                Block Card <FaArrowRight />
                            </button>
                        </div>

                        <div className="cards-action-card">
                            <div className="cards-action-icon purple">
                                <FaSnowflake />
                            </div>

                            <h3>Freeze Card</h3>
                            <p>Temporarily suspend this card.</p>

                            <button
                                type="button"
                                disabled={
                                    actionId === selectedCard.id ||
                                    selectedCard.status === "FROZEN"
                                }
                                onClick={() =>
                                    updateStatus(selectedCard, "FROZEN")
                                }
                            >
                                Freeze Card <FaArrowRight />
                            </button>
                        </div>

                        <div className="cards-action-card">
                            <div className="cards-action-icon red">
                                <FaTrash />
                            </div>

                            <h3>Delete Card</h3>
                            <p>Permanently remove this card record.</p>

                            <button
                                type="button"
                                className="cards-delete-action"
                                disabled={actionId === selectedCard.id}
                                onClick={() => deleteCard(selectedCard)}
                            >
                                Delete Card <FaArrowRight />
                            </button>
                        </div>

                    </div>

                </section>

            )}

            {/* EMPTY DATABASE NOTICE */}

            {!loading && cards.length === 0 && (

                <div className="cards-first-card-note">
                    <FaUser />
                    <span>
                        No cards have been assigned yet. Use{" "}
                        <strong>Assign Card</strong> to create the first
                        customer card.
                    </span>
                </div>

            )}

        </div>
    );
}

export default Cards;
