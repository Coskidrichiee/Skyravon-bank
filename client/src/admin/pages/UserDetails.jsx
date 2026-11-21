
import { useCallback, useEffect, useState } from "react";

import {
    useParams,
    useNavigate
} from "react-router-dom";

import axios from "axios";
import Swal from "sweetalert2";

import {
    FaArrowLeft,
    FaUser,
    FaEnvelope,
    FaPhone,
    FaWallet,
    FaMapMarkerAlt,
    FaIdCard,
    FaLock,
    FaUnlock,
    FaTrash,
    FaEdit,
    FaCalendarAlt,
    FaCity,
    FaGlobe,
    FaSpinner,
    FaShieldAlt,
    FaCheckCircle,
    FaBan,
    FaUniversity,
    FaClock,
    FaUserCircle,
    FaCopy
} from "react-icons/fa";

import "../css/userDetails.css";

const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

const API = `${API_BASE_URL}/api/admin/users`;

function UserDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    const fetchUser = useCallback(async () => {
        try {
            setLoading(true);

            const response = await axios.get(`${API}/${id}`);

            setUser(response.data.user || null);
        } catch (error) {
            console.error("Fetch User Error:", error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const formatMoney = (amount) => {
        return Number(amount || 0).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const formatDate = (date) => {
        if (!date) return "Not available";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "Not available";
        }

        return parsedDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    };

    const copyToClipboard = async (value, label) => {
        if (!value) return;

        try {
            await navigator.clipboard.writeText(String(value));

            Swal.fire({
                toast: true,
                position: "top-end",
                icon: "success",
                title: `${label} copied`,
                showConfirmButton: false,
                timer: 1800
            });
        } catch (error) {
            console.error("Copy Error:", error);

            Swal.fire({
                icon: "error",
                title: "Copy Failed",
                text: "Unable to copy this information."
            });
        }
    };

    // BLOCK / UNBLOCK CUSTOMER
    const toggleUserStatus = async () => {
        if (!user || processing) return;

        const isBlocked = user.status?.toLowerCase() === "blocked";
        const action = isBlocked ? "unblock" : "block";

        const confirmation = await Swal.fire({
            title: isBlocked
                ? "Unblock this customer?"
                : "Block this customer?",

            text: isBlocked
                ? "This customer will regain access to their account."
                : "This customer will no longer be able to access their account.",

            icon: "warning",
            showCancelButton: true,
            confirmButtonText: isBlocked ? "Yes, Unblock" : "Yes, Block",
            confirmButtonColor: isBlocked ? "#159957" : "#dc3545",
            cancelButtonText: "Cancel",
            reverseButtons: true
        });

        if (!confirmation.isConfirmed) return;

        try {
            setProcessing(true);

            await axios.patch(`${API}/${id}/${action}`);

            await fetchUser();

            Swal.fire({
                icon: "success",
                title: isBlocked ? "Customer Unblocked" : "Customer Blocked",
                text: isBlocked
                    ? "Account access has been restored."
                    : "Account access has been restricted.",
                timer: 1800,
                showConfirmButton: false
            });
        } catch (error) {
            console.error("Status Update Error:", error);

            Swal.fire({
                icon: "error",
                title: "Operation Failed",
                text: error.response?.data?.message ||
                    "Unable to update customer status."
            });
        } finally {
            setProcessing(false);
        }
    };

    // DELETE CUSTOMER
    const deleteUser = async () => {
        if (processing) return;

        const confirmation = await Swal.fire({
            title: "Delete Customer?",
            text: "This action cannot be undone. Are you sure?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Delete Customer",
            confirmButtonColor: "#dc3545",
            cancelButtonText: "Keep Customer",
            reverseButtons: true
        });

        if (!confirmation.isConfirmed) return;

        try {
            setProcessing(true);

            await axios.delete(`${API}/${id}`);

            await Swal.fire({
                icon: "success",
                title: "Customer Deleted",
                text: "The customer has been successfully removed.",
                confirmButtonColor: "#2457e6"
            });

            navigate("/admin/users");
        } catch (error) {
            console.error("Delete Customer Error:", error);

            Swal.fire({
                icon: "error",
                title: "Delete Failed",
                text: error.response?.data?.message ||
                    "Unable to delete this customer."
            });
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="user-details-loading">
                <div className="details-loader">
                    <FaSpinner />
                </div>

                <h3>Loading Customer Profile</h3>
                <p>Please wait while we retrieve the account information.</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="user-details-error">
                <FaUserCircle />

                <h2>Customer Not Found</h2>

                <p>
                    We couldn't retrieve this customer's account information.
                </p>

                <button
                    className="back-btn"
                    onClick={() => navigate("/admin/users")}
                >
                    <FaArrowLeft />
                    Back to Customers
                </button>
            </div>
        );
    }

    const isBlocked = user.status?.toLowerCase() === "blocked";
    const isActive = user.status?.toLowerCase() === "active";

    const profilePicture = user.profile_picture
        ? user.profile_picture.startsWith("http")
            ? user.profile_picture
            : `${API_BASE_URL}${user.profile_picture.startsWith("/")
                ? ""
                : "/"
            }${user.profile_picture}`
        : null;

    return (
        <div className="user-details-page">

            {/* PAGE HEADER */}
            <div className="user-details-header">

                <div className="details-heading-left">
                    <button
                        className="back-btn"
                        onClick={() => navigate("/admin/users")}
                    >
                        <FaArrowLeft />
                        <span>Back to Users</span>
                    </button>

                    <div className="details-page-title">
                        <h2>Customer Profile</h2>
                        <p>View and manage customer banking information.</p>
                    </div>
                </div>

                <div className="profile-reference">
                    <span>Customer ID</span>
                    <strong>#{user.id}</strong>
                </div>

            </div>

            {/* PROFILE HERO */}
            <div className="profile-hero">

                <div className="profile-hero-main">

                    <div className="profile-image">
                        {profilePicture ? (
                            <img
                                src={profilePicture}
                                alt={user.full_name || "Customer"}
                                onError={(event) => {
                                    event.currentTarget.style.display = "none";
                                }}
                            />
                        ) : (
                            <div className="default-avatar">
                                {user.full_name?.charAt(0)?.toUpperCase() || <FaUser />}
                            </div>
                        )}

                        {isActive && (
                            <span className="avatar-online-indicator"></span>
                        )}
                    </div>

                    <div className="profile-content">

                        <span className="profile-label">
                            CUSTOMER ACCOUNT
                        </span>

                        <h1>{user.full_name || "Unnamed Customer"}</h1>

                        <p className="profile-email">
                            <FaEnvelope />
                            {user.email || "No email available"}
                        </p>

                        <div className="profile-meta">

                            <span className={`profile-status ${isActive ? "active" : isBlocked ? "blocked" : "pending"}`}>
                                {isActive ? <FaCheckCircle /> : isBlocked ? <FaBan /> : <FaClock />}
                                {user.status || "Unknown"}
                            </span>

                            <span className="profile-account">
                                <FaIdCard />
                                {user.account_number || "No account number"}
                            </span>

                        </div>

                    </div>

                </div>

                {/* PROFILE ACTIONS */}
                <div className="profile-actions">

                    <button
                        className="profile-action edit-btn"
                        onClick={() => navigate(`/admin/users/edit/${user.id}`)}
                        disabled={processing}
                    >
                        <FaEdit />
                        Edit Profile
                    </button>

                    <button
                        className={`profile-action ${isBlocked ? "unblock-btn" : "block-btn"}`}
                        onClick={toggleUserStatus}
                        disabled={processing}
                    >
                        {processing ? (
                            <FaSpinner className="button-spinner" />
                        ) : isBlocked ? (
                            <FaUnlock />
                        ) : (
                            <FaLock />
                        )}

                        {isBlocked ? "Unblock Account" : "Block Account"}
                    </button>

                    <button
                        className="profile-action delete-btn"
                        onClick={deleteUser}
                        disabled={processing}
                    >
                        <FaTrash />
                        Delete
                    </button>

                </div>

            </div>

            {/* ACCOUNT OVERVIEW */}
            <div className="overview-heading">
                <div>
                    <h3>Account Overview</h3>
                    <p>A summary of this customer's banking profile.</p>
                </div>
            </div>

            <div className="overview-grid">

                <div className="overview-card balance-overview">
                    <div className="overview-card-top">
                        <div className="overview-icon blue">
                            <FaWallet />
                        </div>
                        <span>ACCOUNT BALANCE</span>
                    </div>

                    <h2>${formatMoney(user.balance)}</h2>
                    <p>Current available balance</p>
                </div>

                <div className="overview-card">
                    <div className="overview-card-top">
                        <div className="overview-icon green">
                            <FaShieldAlt />
                        </div>
                        <span>ACCOUNT STATUS</span>
                    </div>

                    <h2 className="overview-status">
                        {user.status || "Unknown"}
                    </h2>
                    <p>Current account standing</p>
                </div>

                <div className="overview-card">
                    <div className="overview-card-top">
                        <div className="overview-icon purple">
                            <FaCalendarAlt />
                        </div>
                        <span>DATE JOINED</span>
                    </div>

                    <h2 className="overview-date">
                        {formatDate(user.created_at)}
                    </h2>
                    <p>Customer registration date</p>
                </div>

            </div>

            {/* PERSONAL INFORMATION */}
            <div className="details-section">

                <div className="section-heading">
                    <div className="section-heading-icon">
                        <FaUser />
                    </div>

                    <div>
                        <h3>Personal Information</h3>
                        <p>Customer's personal and contact details.</p>
                    </div>
                </div>

                <div className="details-grid">

                    <div className="detail-card">
                        <div className="detail-icon blue">
                            <FaUser />
                        </div>

                        <div className="detail-content">
                            <span>Full Name</span>
                            <h4>{user.full_name || "Not provided"}</h4>
                        </div>
                    </div>

                    <div className="detail-card">
                        <div className="detail-icon purple">
                            <FaEnvelope />
                        </div>

                        <div className="detail-content">
                            <span>Email Address</span>
                            <h4>{user.email || "Not provided"}</h4>
                        </div>
                    </div>

                    <div className="detail-card">
                        <div className="detail-icon green">
                            <FaPhone />
                        </div>

                        <div className="detail-content">
                            <span>Phone Number</span>
                            <h4>{user.phone || "Not provided"}</h4>
                        </div>
                    </div>

                </div>

            </div>

            {/* BANKING INFORMATION */}
            <div className="details-section">

                <div className="section-heading">
                    <div className="section-heading-icon">
                        <FaUniversity />
                    </div>

                    <div>
                        <h3>Banking Information</h3>
                        <p>Customer account and financial information.</p>
                    </div>
                </div>

                <div className="banking-details-grid">

                    <div className="banking-detail-item">
                        <span>Account Number</span>

                        <div className="copyable-value">
                            <strong>{user.account_number || "Not available"}</strong>

                            {user.account_number && (
                                <button
                                    onClick={() => copyToClipboard(user.account_number, "Account number")}
                                    title="Copy account number"
                                    aria-label="Copy account number"
                                >
                                    <FaCopy />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="banking-detail-item">
                        <span>Account Type</span>
                        <strong>{user.account_type || "Savings"}</strong>
                    </div>

                    <div className="banking-detail-item">
                        <span>Account Balance</span>
                        <strong className="banking-balance">
                            ${formatMoney(user.balance)}
                        </strong>
                    </div>

                    <div className="banking-detail-item">
                        <span>Account Status</span>
                        <strong className={isBlocked ? "blocked-text" : isActive ? "active-text" : ""}>
                            {user.status || "Unknown"}
                        </strong>
                    </div>

                </div>

            </div>

            {/* ADDRESS INFORMATION */}
            <div className="details-section address-section">

                <div className="section-heading">
                    <div className="section-heading-icon">
                        <FaMapMarkerAlt />
                    </div>

                    <div>
                        <h3>Address Information</h3>
                        <p>Registered residential or contact address.</p>
                    </div>
                </div>

                <div className="address-content">

                    <div className="address-main-icon">
                        <FaMapMarkerAlt />
                    </div>

                    <div className="address-details">

                        <h4>
                            {user.address || "No address provided"}
                        </h4>

                        <div className="address-meta">

                            <span>
                                <FaCity />
                                {user.city || "City not provided"}
                            </span>

                            <span>
                                <FaMapMarkerAlt />
                                {user.state || "State not provided"}
                            </span>

                            <span>
                                <FaGlobe />
                                {user.country || "Country not provided"}
                            </span>

                        </div>

                    </div>

                </div>

            </div>

            {/* ACCOUNT INFORMATION FOOTER */}
            <div className="account-footer">

                <div className="footer-icon">
                    <FaShieldAlt />
                </div>

                <div>
                    <strong>Account Security</strong>
                    <p>
                        Customer information is displayed for authorised
                        administration and account management.
                    </p>
                </div>

                <div className="footer-reference">
                    <span>Customer ID</span>
                    <strong>#{user.id}</strong>
                </div>

            </div>

        </div>
    );
}

export default UserDetails;
