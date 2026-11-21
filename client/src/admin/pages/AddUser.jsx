

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
    FaArrowLeft,
    FaSave,
    FaUpload,
    FaUser,
    FaEnvelope,
    FaPhone,
    FaLock,
    FaMapMarkerAlt,
    FaUniversity,
    FaMoneyBillWave,
    FaIdCard,
    FaWallet,
    FaGlobeAfrica
} from "react-icons/fa";

import "../css/addUser.css";

const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

function AddUser() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [preview, setPreview] = useState(null);
    const [profilePicture, setProfilePicture] = useState(null);

    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        password: "",
        transaction_pin: "",
        balance: "0.00",
        address: "",
        city: "",
        state: "",
        country: "Nigeria",
        status: "active"
    });

    // Release temporary image preview URLs when they change or component unmounts.
    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: ""
        }));

        setMessage("");
    };

    const handleImage = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setErrors((prev) => ({
                ...prev,
                profile_picture: "Please select a valid image."
            }));

            e.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setErrors((prev) => ({
                ...prev,
                profile_picture: "Image must not exceed 5 MB."
            }));

            e.target.value = "";
            return;
        }

        setErrors((prev) => ({
            ...prev,
            profile_picture: ""
        }));

        setProfilePicture(file);
        setPreview(URL.createObjectURL(file));
    };

    const validate = () => {
        const validationErrors = {};

        const email = formData.email.trim();
        const phone = formData.phone.trim();
        const balance = Number(formData.balance);

        if (!formData.full_name.trim()) {
            validationErrors.full_name = "Full name is required.";
        }

        if (!email) {
            validationErrors.email = "Email is required.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            validationErrors.email = "Enter a valid email address.";
        }

        if (!phone) {
            validationErrors.phone = "Phone number is required.";
        }

        if (!formData.password) {
            validationErrors.password = "Password is required.";
        } else if (formData.password.length < 6) {
            validationErrors.password =
                "Password must be at least 6 characters.";
        }

        if (!/^\d{4}$/.test(formData.transaction_pin)) {
            validationErrors.transaction_pin =
                "Transaction PIN must contain exactly 4 digits.";
        }

        if (
            formData.balance.trim() === "" ||
            !Number.isFinite(balance) ||
            balance < 0 ||
            Math.round(balance * 100) !== balance * 100
        ) {
            validationErrors.balance =
                "Enter a valid non-negative balance with up to 2 decimal places.";
        }

        if (!formData.country.trim()) {
            validationErrors.country = "Country is required.";
        }

        setErrors(validationErrors);

        return Object.keys(validationErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setMessageType("");

        if (!validate()) return;

        try {
            setLoading(true);

            const data = new FormData();

            Object.entries(formData).forEach(([key, value]) => {
                data.append(key, value);
            });

            if (profilePicture) {
                data.append("profile_picture", profilePicture);
            }

            const response = await axios.post(
                `${API_BASE_URL}/api/admin/users`,
                data
            );

            setMessage(
                response.data?.message ||
                "Customer created successfully."
            );

            setMessageType("success");

            alert(
                response.data?.message ||
                "Customer created successfully."
            );

            navigate("/admin/users");
        } catch (error) {
            const serverMessage =
                error.response?.data?.message ||
                error.message ||
                "Unable to create customer. Please try again.";

            setMessage(serverMessage);
            setMessageType("error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-user-page">

            {/* PAGE HEADER */}

            <div className="page-header">

                <button
                    type="button"
                    className="back-btn"
                    onClick={() => navigate("/admin/users")}
                >
                    <FaArrowLeft />
                    Back to Users
                </button>

                <div className="page-heading">
                    <h1>Add New Users</h1>
                    <p>
                        Create and configure a new Richiee Bank customer
                        account.
                    </p>
                </div>

            </div>

            {/* CUSTOMER FORM */}

            <form
                className="add-user-form"
                onSubmit={handleSubmit}
                noValidate
            >

                {message && (
                    <div
                        role="alert"
                        className={`form-message ${messageType}`}
                    >
                        {message}
                    </div>
                )}

                {/* PROFILE PICTURE */}

                <div className="profile-upload">

                    <div className="profile-preview">
                        {preview ? (
                            <img
                                src={preview}
                                alt="Customer profile preview"
                            />
                        ) : (
                            <FaUser />
                        )}
                    </div>

                    <p className="upload-description">
                        Upload a customer profile picture (maximum 5 MB).
                    </p>

                    <label className="upload-btn">
                        <FaUpload />
                        Choose Profile Picture

                        <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={handleImage}
                        />
                    </label>

                    {errors.profile_picture && (
                        <small className="error">
                            {errors.profile_picture}
                        </small>
                    )}

                </div>

                {/* PERSONAL INFORMATION */}

                <section className="form-section">

                    <div className="form-section-header">
                        <div className="form-section-icon">
                            <FaUser />
                        </div>

                        <div>
                            <h2>Personal Information</h2>
                            <p>Basic details about the customer.</p>
                        </div>
                    </div>

                    <div className="form-grid">

                        <div className="form-group">
                            <label htmlFor="full_name">
                                Full Name <span className="required-mark">*</span>
                            </label>

                            <div className="input-box">
                                <FaUser />
                                <input
                                    id="full_name"
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    placeholder="Enter customer's full name"
                                    autoComplete="name"
                                    required
                                />
                            </div>

                            {errors.full_name && (
                                <small>{errors.full_name}</small>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">
                                Email Address <span className="required-mark">*</span>
                            </label>

                            <div className="input-box">
                                <FaEnvelope />
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="customer@email.com"
                                    autoComplete="email"
                                    required
                                />
                            </div>

                            {errors.email && (
                                <small>{errors.email}</small>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="phone">
                                Phone Number <span className="required-mark">*</span>
                            </label>

                            <div className="input-box">
                                <FaPhone />
                                <input
                                    id="phone"
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="08012345678"
                                    autoComplete="tel"
                                    required
                                />
                            </div>

                            {errors.phone && (
                                <small>{errors.phone}</small>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">
                                Login Password <span className="required-mark">*</span>
                            </label>

                            <div className="input-box">
                                <FaLock />
                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Minimum 6 characters"
                                    autoComplete="new-password"
                                    minLength={6}
                                    required
                                />
                            </div>

                            {errors.password && (
                                <small>{errors.password}</small>
                            )}
                        </div>

                    </div>
                </section>

                {/* BANKING INFORMATION */}

                <section className="form-section">

                    <div className="form-section-header">
                        <div className="form-section-icon">
                            <FaWallet />
                        </div>

                        <div>
                            <h2>Banking Information</h2>
                            <p>Configure the customer's initial account settings.</p>
                        </div>
                    </div>

                    <div className="form-grid">

                        <div className="form-group">
                            <label htmlFor="transaction_pin">
                                Transaction PIN <span className="required-mark">*</span>
                            </label>

                            <div className="input-box">
                                <FaLock />
                                <input
                                    id="transaction_pin"
                                    type="password"
                                    name="transaction_pin"
                                    value={formData.transaction_pin}
                                    onChange={(e) => {
                                        const value = e.target.value;

                                        if (/^\d{0,4}$/.test(value)) {
                                            handleChange(e);
                                        }
                                    }}
                                    placeholder="Enter 4-digit PIN"
                                    inputMode="numeric"
                                    maxLength={4}
                                    autoComplete="off"
                                    required
                                />
                            </div>

                            {errors.transaction_pin && (
                                <small>{errors.transaction_pin}</small>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="balance">
                                Opening Balance (₦) <span className="required-mark">*</span>
                            </label>

                            <div className="input-box">
                                <FaMoneyBillWave />
                                <input
                                    id="balance"
                                    type="number"
                                    name="balance"
                                    value={formData.balance}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>

                            {errors.balance && (
                                <small>{errors.balance}</small>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="status">
                                Account Status
                            </label>

                            <select
                                id="status"
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
                </section>

                {/* ADDRESS INFORMATION */}

                <section className="form-section">

                    <div className="form-section-header">
                        <div className="form-section-icon">
                            <FaMapMarkerAlt />
                        </div>

                        <div>
                            <h2>Address Information</h2>
                            <p>Customer's residential and location details.</p>
                        </div>
                    </div>

                    <div className="form-grid">

                        <div className="form-group full-width">
                            <label htmlFor="address">
                                Residential Address
                            </label>

                            <div className="input-box">
                                <FaMapMarkerAlt />
                                <input
                                    id="address"
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Enter residential address"
                                    autoComplete="street-address"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="city">City</label>

                            <div className="input-box">
                                <FaMapMarkerAlt />
                                <input
                                    id="city"
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    placeholder="Enter city"
                                    autoComplete="address-level2"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="state">State</label>

                            <div className="input-box">
                                <FaUniversity />
                                <input
                                    id="state"
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    placeholder="Enter state"
                                    autoComplete="address-level1"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="country">
                                Country <span className="required-mark">*</span>
                            </label>

                            <div className="input-box">
                                <FaGlobeAfrica />
                                <input
                                    id="country"
                                    type="text"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    placeholder="Enter country"
                                    autoComplete="country-name"
                                    required
                                />
                            </div>

                            {errors.country && (
                                <small>{errors.country}</small>
                            )}
                        </div>

                    </div>
                </section>

                {/* FORM ACTIONS */}

                <div className="form-actions">

                    <button
                        type="button"
                        className="cancel-btn"
                        onClick={() => navigate("/admin/users")}
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="save-btn"
                        disabled={loading}
                    >
                        <FaSave />
                        {loading ? "Creating Customer..." : "Create Customer"}
                    </button>

                </div>

            </form>
        </div>
    );
}

export default AddUser;
