
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import {
    FaArrowLeft,
    FaSave,
    FaLock,
    FaUser,
    FaEnvelope,
    FaPhone,
    FaWallet,
    FaMapMarkerAlt,
    FaGlobe,
    FaCity,
    FaShieldAlt,
    FaCheckCircle,
    FaSpinner
} from "react-icons/fa";

import "../css/editUser.css";

const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

const API = `${API_BASE_URL}/api/admin/users`;

function EditUser() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        transaction_pin: "",
        balance: "0.00",
        address: "",
        city: "",
        state: "",
        country: "Nigeria",
        status: "active"
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await axios.get(`${API}/${id}`);
                const user = response.data.user;

                if (!user) {
                    throw new Error("Customer not found.");
                }

                setFormData({
                    full_name: user.full_name || "",
                    email: user.email || "",
                    phone: user.phone || "",
                    transaction_pin: "",
                    balance: String(user.balance ?? "0.00"),
                    address: user.address || "",
                    city: user.city || "",
                    state: user.state || "",
                    country: user.country || "Nigeria",
                    status: user.status || "active"
                });
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    err.message ||
                    "Unable to load customer information."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (
            !formData.full_name.trim() ||
            !formData.email.trim() ||
            !formData.phone.trim()
        ) {
            setError("Please complete the customer's name, email and phone number.");
            return;
        }

        const balance = Number(formData.balance);

        if (
            !Number.isFinite(balance) ||
            balance < 0 ||
            Math.round(balance * 100) !== balance * 100
        ) {
            setError("Please enter a valid, non-negative account balance with no more than two decimal places.");
            return;
        }

        if (
            formData.transaction_pin &&
            !/^\d{4}$/.test(formData.transaction_pin)
        ) {
            setError("Transaction PIN must contain exactly 4 digits.");
            return;
        }

        const confirmation = await Swal.fire({
            title: "Save customer changes?",
            text: "The customer's account information will be updated.",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes, save changes",
            cancelButtonText: "Review again",
            confirmButtonColor: "#2563eb",
            cancelButtonColor: "#64748b"
        });

        if (!confirmation.isConfirmed) return;

        try {
            setSaving(true);

            const payload = {
                full_name: formData.full_name.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                balance,
                address: formData.address.trim(),
                city: formData.city.trim(),
                state: formData.state.trim(),
                country: formData.country.trim(),
                status: formData.status
            };

            // Only send a new PIN when one has been entered.
            if (formData.transaction_pin) {
                payload.transaction_pin = formData.transaction_pin;
            }

            const response = await axios.put(`${API}/${id}`, payload);

            await Swal.fire({
                title: "Customer Updated!",
                text: response.data.message || "Customer information has been updated successfully.",
                icon: "success",
                confirmButtonColor: "#2563eb"
            });

            navigate("/admin/users");
        } catch (err) {
            const message =
                err.response?.data?.message ||
                "Failed to update customer information.";

            setError(message);

            Swal.fire({
                title: "Update Failed",
                text: message,
                icon: "error",
                confirmButtonColor: "#2563eb"
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="edit-user-loading">
                <FaSpinner className="loading-spinner" />
                <h3>Loading Customer</h3>
                <p>Please wait while we retrieve account information.</p>
            </div>
        );
    }

    if (error && !formData.full_name && !formData.email) {
        return (
            <div className="edit-user-error">
                <FaUser />
                <h2>Unable to Load Customer</h2>
                <p>{error}</p>
                <button onClick={() => navigate("/admin/users")}>
                    <FaArrowLeft /> Back to Users
                </button>
            </div>
        );
    }

    return (
        <div className="edit-user-page">

            {/* Page Header */}
            <div className="edit-user-header">
                <div className="edit-header-top">
                    <button
                        type="button"
                        className="edit-back-btn"
                        onClick={() => navigate("/admin/users")}
                    >
                        <FaArrowLeft />
                        <span>Back to Users</span>
                    </button>

                    <span className="edit-page-tag">
                        <FaShieldAlt /> Admin Panel
                    </span>
                </div>

                <div className="edit-heading">
                    <div>
                        <h1>Edit Customer</h1>
                        <p>
                            Manage and update customer account information
                            securely.
                        </p>
                    </div>
                </div>
            </div>

            {/* Profile Banner */}
            <div className="edit-profile-banner">
                <div className="edit-profile-icon">
                    <FaUser />
                </div>

                <div className="edit-profile-text">
                    <span>Customer Account</span>
                    <h2>{formData.full_name || "Customer Details"}</h2>
                    <p>{formData.email || "Update customer information below"}</p>
                </div>

                <div className={`edit-status-badge ${formData.status}`}>
                    <span className="status-dot"></span>
                    {formData.status}
                </div>
            </div>

            <form className="edit-user-form" onSubmit={handleSubmit}>

                {error && (
                    <div className="edit-error-message" role="alert">
                        {error}
                    </div>
                )}

                {/* Personal Information */}
                <section className="edit-form-section">
                    <div className="edit-section-heading">
                        <div className="edit-section-icon">
                            <FaUser />
                        </div>
                        <div>
                            <h3>Personal Information</h3>
                            <p>Update the customer's basic contact details.</p>
                        </div>
                    </div>

                    <div className="edit-form-grid">
                        <div className="edit-form-group">
                            <label>Full Name <span>*</span></label>
                            <div className="edit-input-wrapper">
                                <FaUser />
                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    placeholder="Enter full name"
                                    required
                                />
                            </div>
                        </div>

                        <div className="edit-form-group">
                            <label>Email Address <span>*</span></label>
                            <div className="edit-input-wrapper">
                                <FaEnvelope />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="customer@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="edit-form-group">
                            <label>Phone Number <span>*</span></label>
                            <div className="edit-input-wrapper">
                                <FaPhone />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Enter phone number"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Banking Information */}
                <section className="edit-form-section">
                    <div className="edit-section-heading">
                        <div className="edit-section-icon banking">
                            <FaWallet />
                        </div>
                        <div>
                            <h3>Banking Information</h3>
                            <p>Manage account balance and transaction settings.</p>
                        </div>
                    </div>

                    <div className="edit-form-grid">
                        <div className="edit-form-group">
                            <label>Account Balance</label>
                            <div className="edit-input-wrapper">
                                <FaWallet />
                                <input
                                    type="number"
                                    name="balance"
                                    value={formData.balance}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                            <small>Enter the customer's updated account balance.</small>
                        </div>

                        <div className="edit-form-group">
                            <label>Transaction PIN</label>
                            <div className="edit-input-wrapper">
                                <FaLock />
                                <input
                                    type="password"
                                    name="transaction_pin"
                                    value={formData.transaction_pin}
                                    onChange={(e) => {
                                        if (/^\d{0,4}$/.test(e.target.value)) {
                                            handleChange(e);
                                        }
                                    }}
                                    placeholder="Leave blank to keep current PIN"
                                    inputMode="numeric"
                                    maxLength={4}
                                    autoComplete="new-password"
                                />
                            </div>
                            <small>Enter a new 4-digit PIN only if you want to change it.</small>
                        </div>

                        <div className="edit-form-group">
                            <label>Account Status</label>
                            <div className="edit-input-wrapper select-wrapper">
                                <FaShieldAlt />
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                >
                                    <option value="active">Active</option>
                                    <option value="pending">Pending</option>
                                    <option value="blocked">Blocked</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Address Information */}
                <section className="edit-form-section">
                    <div className="edit-section-heading">
                        <div className="edit-section-icon location">
                            <FaMapMarkerAlt />
                        </div>
                        <div>
                            <h3>Address Information</h3>
                            <p>Update the customer's residential details.</p>
                        </div>
                    </div>

                    <div className="edit-form-grid">
                        <div className="edit-form-group full-width">
                            <label>Residential Address</label>
                            <div className="edit-input-wrapper">
                                <FaMapMarkerAlt />
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Enter residential address"
                                />
                            </div>
                        </div>

                        <div className="edit-form-group">
                            <label>City</label>
                            <div className="edit-input-wrapper">
                                <FaCity />
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    placeholder="Enter city"
                                />
                            </div>
                        </div>

                        <div className="edit-form-group">
                            <label>State</label>
                            <div className="edit-input-wrapper">
                                <FaMapMarkerAlt />
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    placeholder="Enter state"
                                />
                            </div>
                        </div>

                        <div className="edit-form-group">
                            <label>Country</label>
                            <div className="edit-input-wrapper">
                                <FaGlobe />
                                <input
                                    type="text"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    placeholder="Enter country"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer Actions */}
                <div className="edit-form-footer">
                    <div className="edit-security-note">
                        <FaCheckCircle />
                        <span>Customer information is managed securely.</span>
                    </div>

                    <div className="edit-form-actions">
                        <button
                            type="button"
                            className="edit-cancel-btn"
                            onClick={() => navigate("/admin/users")}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="edit-save-btn"
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <FaSpinner className="loading-spinner" />
                                    Saving Changes...
                                </>
                            ) : (
                                <>
                                    <FaSave />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default EditUser;
