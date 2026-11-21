
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowLeft,
    UserRound,
    Mail,
    Phone,
    MapPin,
    Building2,
    Camera,
    ShieldCheck,
    Wallet,
    Copy,
    Check,
    Save,
    LockKeyhole,
    RefreshCw,
    CircleCheck,
    AlertCircle,
    ChevronRight,
    Globe,
    CreditCard
} from "lucide-react";

import { useAuth } from "../context/useAuth";

import {
    getProfile,
    updateProfile,
    uploadProfilePicture
} from "../services/api";

import "./Profile.css";

function Profile() {
    const { user, token } = useAuth();

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        country: "United States"
    });

    const [profilePicture, setProfilePicture] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingPicture, setUploadingPicture] = useState(false);

    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);

    const apiBase = (
        import.meta.env.VITE_API_URL || "http://localhost:5000"
    ).replace(/\/$/, "");

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2
        }).format(Number(amount || 0));
    };

    const getPictureUrl = (picture) => {
        if (!picture) return "";

        if (
            picture.startsWith("http://") ||
            picture.startsWith("https://") ||
            picture.startsWith("data:")
        ) {
            return picture;
        }

        return `${apiBase}/uploads/profiles/${picture}`;
    };

    const loadProfile = async () => {
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await getProfile(token);

            if (response?.success && response.user) {
                const profile = response.user;

                setFormData({
                    fullName: profile.full_name || "",
                    email: profile.email || "",
                    phone: profile.phone || "",
                    address: profile.address || "",
                    city: profile.city || "",
                    state: profile.state || "",
                    country: profile.country || "United States"
                });

                setProfilePicture(
                    getPictureUrl(profile.profile_picture)
                );
            } else {
                setError(
                    response?.message || "Unable to retrieve your profile."
                );
            }
        } catch (err) {
            console.error("Profile loading error:", err);
            setError(err.message || "Unable to load your profile.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, [token]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData(previous => ({
            ...previous,
            [name]: value
        }));

        setSuccess("");
        setError("");
    };

    const handleProfilePictureChange = async (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setError("Please select a valid image file.");
            event.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("Your profile picture must not exceed 5MB.");
            event.target.value = "";
            return;
        }

        try {
            setUploadingPicture(true);
            setError("");
            setSuccess("");

            const response = await uploadProfilePicture(token, file);

            if (response?.success) {
                const updatedPicture =
                    response.user?.profile_picture ||
                    response.profile_picture ||
                    response.filename;

                if (updatedPicture) {
                    setProfilePicture(getPictureUrl(updatedPicture));
                }

                setSuccess("Your profile picture has been updated.");

                // Reload from the server to obtain the saved profile image.
                await loadProfile();
            } else {
                setError(
                    response?.message || "Unable to upload your picture."
                );
            }
        } catch (err) {
            console.error("Picture upload error:", err);
            setError(
                err.message || "Unable to upload your profile picture."
            );
        } finally {
            setUploadingPicture(false);
            event.target.value = "";
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setSuccess("");
        setError("");

        if (!formData.fullName.trim()) {
            setError("Full name is required.");
            return;
        }

        if (!formData.phone.trim()) {
            setError("Phone number is required.");
            return;
        }

        try {
            setSaving(true);

            const response = await updateProfile(token, {
                fullName: formData.fullName.trim(),
                phone: formData.phone.trim(),
                address: formData.address.trim(),
                city: formData.city.trim(),
                state: formData.state.trim(),
                country: formData.country.trim()
            });

            if (response?.success) {
                setSuccess("Your profile has been updated successfully.");

                if (response.user) {
                    setFormData(previous => ({
                        ...previous,
                        fullName:
                            response.user.full_name ?? previous.fullName,
                        phone:
                            response.user.phone ?? previous.phone,
                        address:
                            response.user.address ?? previous.address,
                        city:
                            response.user.city ?? previous.city,
                        state:
                            response.user.state ?? previous.state,
                        country:
                            response.user.country ?? previous.country
                    }));
                }
            } else {
                setError(
                    response?.message || "Unable to update your profile."
                );
            }
        } catch (err) {
            console.error("Profile update error:", err);
            setError(err.message || "Unable to update your profile.");
        } finally {
            setSaving(false);
        }
    };

    const copyAccountNumber = async () => {
        if (!user?.account_number) return;

        try {
            await navigator.clipboard.writeText(user.account_number);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Unable to copy account number:", err);
            setError("Unable to copy account number.");
        }
    };

    const userInitial =
        formData.fullName?.charAt(0)?.toUpperCase() ||
        user?.full_name?.charAt(0)?.toUpperCase() ||
        "U";

    const accountStatus = String(user?.status || "ACTIVE").toUpperCase();

    const statusIsActive = accountStatus === "ACTIVE";

    if (loading) {
        return (
            <div className="profile-loading">
                <div className="profile-spinner" />
                <h3>Loading your profile</h3>
                <p>Please wait while we retrieve your account information.</p>
            </div>
        );
    }

    return (
        <div className="profile-page">

            {/* HEADER */}
            <header className="profile-header">
                <div className="profile-header-inner">

                    <Link
                        to="/dashboard"
                        className="profile-back-button"
                        aria-label="Back to dashboard"
                    >
                        <ArrowLeft size={19} />
                    </Link>

                    <Link to="/dashboard" className="profile-brand">
                        <div className="profile-brand-icon">
                            <Wallet size={21} />
                        </div>
                        <span>Skyravon<span>Bank</span></span>
                    </Link>

                    <div className="profile-header-right">
                        <ShieldCheck size={17} />
                        <span>Secure Banking</span>
                    </div>

                </div>
            </header>

            <main className="profile-content">

                {/* BREADCRUMB */}
                <div className="profile-breadcrumb">
                    <Link to="/dashboard">Dashboard</Link>
                    <ChevronRight size={14} />
                    <span>My Profile</span>
                </div>

                {/* PAGE INTRO */}
                <section className="profile-page-intro">
                    <div>
                        <span className="profile-eyebrow">
                            ACCOUNT MANAGEMENT
                        </span>

                        <h1>My Profile</h1>

                        <p>
                            Manage your personal information and
                            Skyravon Bank account details.
                        </p>
                    </div>

                    <div className="profile-intro-security">
                        <ShieldCheck size={18} />
                        Your information is protected
                    </div>
                </section>

                {/* ALERTS */}
                {success && (
                    <div className="profile-alert success" role="status">
                        <CircleCheck size={19} />
                        <span>{success}</span>
                        <button
                            type="button"
                            onClick={() => setSuccess("")}
                            aria-label="Dismiss success message"
                        >
                            ×
                        </button>
                    </div>
                )}

                {error && (
                    <div className="profile-alert error" role="alert">
                        <AlertCircle size={19} />
                        <span>{error}</span>
                        <button
                            type="button"
                            onClick={() => setError("")}
                            aria-label="Dismiss error message"
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* PROFILE HERO */}
                <section className="profile-hero">

                    <div className="profile-hero-main">

                        <div className="profile-avatar-wrapper">

                            {profilePicture ? (
                                <img
                                    src={profilePicture}
                                    alt={formData.fullName || "Customer"}
                                    className="profile-avatar-image"
                                    onError={() => setProfilePicture("")}
                                />
                            ) : (
                                <div className="profile-avatar">
                                    {userInitial}
                                </div>
                            )}

                            <label
                                htmlFor="profilePicture"
                                className={`profile-picture-upload ${
                                    uploadingPicture ? "uploading" : ""
                                }`}
                                title="Change profile picture"
                            >
                                {uploadingPicture
                                    ? <RefreshCw size={15} />
                                    : <Camera size={16} />}
                            </label>

                            <input
                                id="profilePicture"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleProfilePictureChange}
                                disabled={uploadingPicture}
                                hidden
                            />

                        </div>

                        <div className="profile-hero-info">
                            <span className="profile-customer-label">
                                PERSONAL BANKING CUSTOMER
                            </span>

                            <h2>{formData.fullName || "Customer"}</h2>

                            <p>{formData.email || "No email address"}</p>

                            <div className="profile-customer-meta">
                                <span>
                                    <CreditCard size={14} />
                                    {user?.account_number || "Account unavailable"}
                                </span>
                                <span>
                                    <Globe size={14} />
                                    {formData.country}
                                </span>
                            </div>
                        </div>

                    </div>

                    <div className={`profile-status ${
                        statusIsActive ? "active" : "inactive"
                    }`}>
                        <span />
                        {statusIsActive ? "Active Account" : accountStatus}
                    </div>

                </section>

                {/* MAIN GRID */}
                <div className="profile-grid">

                    {/* PERSONAL INFORMATION */}
                    <section className="profile-card profile-personal-card">

                        <div className="profile-card-header">
                            <div className="profile-card-heading-icon">
                                <UserRound size={20} />
                            </div>

                            <div>
                                <h3>Personal Information</h3>
                                <p>
                                    Keep your personal information up to date.
                                </p>
                            </div>
                        </div>

                        <form
                            className="profile-form"
                            onSubmit={handleSubmit}
                        >

                            <div className="profile-form-section-title">
                                <span>PERSONAL DETAILS</span>
                                <div />
                            </div>

                            <div className="profile-form-grid">

                                <div className="profile-form-group">
                                    <label htmlFor="fullName">
                                        Full Name
                                    </label>

                                    <div className="profile-input-wrapper">
                                        <UserRound size={17} />
                                        <input
                                            id="fullName"
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            placeholder="Enter your full name"
                                            autoComplete="name"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="profile-form-group">
                                    <label htmlFor="email">
                                        Email Address
                                    </label>

                                    <div className="profile-input-wrapper disabled">
                                        <Mail size={17} />
                                        <input
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            readOnly
                                            disabled
                                        />
                                        <LockKeyhole size={14} />
                                    </div>

                                    <small>Email cannot be changed here.</small>
                                </div>

                                <div className="profile-form-group">
                                    <label htmlFor="phone">
                                        Phone Number
                                    </label>

                                    <div className="profile-input-wrapper">
                                        <Phone size={17} />
                                        <input
                                            id="phone"
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="Enter your phone number"
                                            autoComplete="tel"
                                            required
                                        />
                                    </div>
                                </div>

                            </div>

                            <div className="profile-form-section-title address-title">
                                <span>ADDRESS INFORMATION</span>
                                <div />
                            </div>

                            <div className="profile-form-grid">

                                <div className="profile-form-group full-width">
                                    <label htmlFor="address">
                                        Residential Address
                                    </label>

                                    <div className="profile-input-wrapper">
                                        <MapPin size={17} />
                                        <input
                                            id="address"
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            placeholder="Enter your residential address"
                                            autoComplete="street-address"
                                        />
                                    </div>
                                </div>

                                <div className="profile-form-group">
                                    <label htmlFor="city">City</label>

                                    <div className="profile-input-wrapper">
                                        <Building2 size={17} />
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

                                <div className="profile-form-group">
                                    <label htmlFor="state">State</label>

                                    <div className="profile-input-wrapper">
                                        <MapPin size={17} />
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

                                <div className="profile-form-group">
                                    <label htmlFor="country">Country</label>

                                    <div className="profile-input-wrapper">
                                        <Globe size={17} />

                                        <select
                                            id="country"
                                            name="country"
                                            value={formData.country}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select Country</option>
                                            <option value="Afghanistan">Afghanistan</option>
                                            <option value="Albania">Albania</option>
                                            <option value="Algeria">Algeria</option>
                                            <option value="Andorra">Andorra</option>
                                            <option value="Angola">Angola</option>
                                            <option value="Antigua and Barbuda">Antigua and Barbuda</option>
                                            <option value="Argentina">Argentina</option>
                                            <option value="Armenia">Armenia</option>
                                            <option value="Australia">Australia</option>
                                            <option value="Austria">Austria</option>
                                            <option value="Azerbaijan">Azerbaijan</option>
                                            <option value="Bahamas">Bahamas</option>
                                            <option value="Bahrain">Bahrain</option>
                                            <option value="Bangladesh">Bangladesh</option>
                                            <option value="Barbados">Barbados</option>
                                            <option value="Belarus">Belarus</option>
                                            <option value="Belgium">Belgium</option>
                                            <option value="Belize">Belize</option>
                                            <option value="Benin">Benin</option>
                                            <option value="Bhutan">Bhutan</option>
                                            <option value="Bolivia">Bolivia</option>
                                            <option value="Bosnia and Herzegovina">Bosnia and Herzegovina</option>
                                            <option value="Botswana">Botswana</option>
                                            <option value="Brazil">Brazil</option>
                                            <option value="Brunei">Brunei</option>
                                            <option value="Bulgaria">Bulgaria</option>
                                            <option value="Burkina Faso">Burkina Faso</option>
                                            <option value="Burundi">Burundi</option>
                                            <option value="Cabo Verde">Cabo Verde</option>
                                            <option value="Cambodia">Cambodia</option>
                                            <option value="Cameroon">Cameroon</option>
                                            <option value="Canada">Canada</option>
                                            <option value="Central African Republic">Central African Republic</option>
                                            <option value="Chad">Chad</option>
                                            <option value="Chile">Chile</option>
                                            <option value="China">China</option>
                                            <option value="Colombia">Colombia</option>
                                            <option value="Comoros">Comoros</option>
                                            <option value="Congo">Congo</option>
                                            <option value="Costa Rica">Costa Rica</option>
                                            <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                                            <option value="Croatia">Croatia</option>
                                            <option value="Cuba">Cuba</option>
                                            <option value="Cyprus">Cyprus</option>
                                            <option value="Czechia">Czechia</option>
                                            <option value="Democratic Republic of the Congo">Democratic Republic of the Congo</option>
                                            <option value="Denmark">Denmark</option>
                                            <option value="Djibouti">Djibouti</option>
                                            <option value="Dominica">Dominica</option>
                                            <option value="Dominican Republic">Dominican Republic</option>
                                            <option value="Ecuador">Ecuador</option>
                                            <option value="Egypt">Egypt</option>
                                            <option value="El Salvador">El Salvador</option>
                                            <option value="Equatorial Guinea">Equatorial Guinea</option>
                                            <option value="Eritrea">Eritrea</option>
                                            <option value="Estonia">Estonia</option>
                                            <option value="Eswatini">Eswatini</option>
                                            <option value="Ethiopia">Ethiopia</option>
                                            <option value="Fiji">Fiji</option>
                                            <option value="Finland">Finland</option>
                                            <option value="France">France</option>
                                            <option value="Gabon">Gabon</option>
                                            <option value="Gambia">Gambia</option>
                                            <option value="Georgia">Georgia</option>
                                            <option value="Germany">Germany</option>
                                            <option value="Ghana">Ghana</option>
                                            <option value="Greece">Greece</option>
                                            <option value="Grenada">Grenada</option>
                                            <option value="Guatemala">Guatemala</option>
                                            <option value="Guinea">Guinea</option>
                                            <option value="Guinea-Bissau">Guinea-Bissau</option>
                                            <option value="Guyana">Guyana</option>
                                            <option value="Haiti">Haiti</option>
                                            <option value="Honduras">Honduras</option>
                                            <option value="Hungary">Hungary</option>
                                            <option value="Iceland">Iceland</option>
                                            <option value="India">India</option>
                                            <option value="Indonesia">Indonesia</option>
                                            <option value="Iran">Iran</option>
                                            <option value="Iraq">Iraq</option>
                                            <option value="Ireland">Ireland</option>
                                            <option value="Israel">Israel</option>
                                            <option value="Italy">Italy</option>
                                            <option value="Jamaica">Jamaica</option>
                                            <option value="Japan">Japan</option>
                                            <option value="Jordan">Jordan</option>
                                            <option value="Kazakhstan">Kazakhstan</option>
                                            <option value="Kenya">Kenya</option>
                                            <option value="Kiribati">Kiribati</option>
                                            <option value="Kuwait">Kuwait</option>
                                            <option value="Kyrgyzstan">Kyrgyzstan</option>
                                            <option value="Laos">Laos</option>
                                            <option value="Latvia">Latvia</option>
                                            <option value="Lebanon">Lebanon</option>
                                            <option value="Lesotho">Lesotho</option>
                                            <option value="Liberia">Liberia</option>
                                            <option value="Libya">Libya</option>
                                            <option value="Liechtenstein">Liechtenstein</option>
                                            <option value="Lithuania">Lithuania</option>
                                            <option value="Luxembourg">Luxembourg</option>
                                            <option value="Madagascar">Madagascar</option>
                                            <option value="Malawi">Malawi</option>
                                            <option value="Malaysia">Malaysia</option>
                                            <option value="Maldives">Maldives</option>
                                            <option value="Mali">Mali</option>
                                            <option value="Malta">Malta</option>
                                            <option value="Marshall Islands">Marshall Islands</option>
                                            <option value="Mauritania">Mauritania</option>
                                            <option value="Mauritius">Mauritius</option>
                                            <option value="Mexico">Mexico</option>
                                            <option value="Micronesia">Micronesia</option>
                                            <option value="Moldova">Moldova</option>
                                            <option value="Monaco">Monaco</option>
                                            <option value="Mongolia">Mongolia</option>
                                            <option value="Montenegro">Montenegro</option>
                                            <option value="Morocco">Morocco</option>
                                            <option value="Mozambique">Mozambique</option>
                                            <option value="Myanmar">Myanmar</option>
                                            <option value="Namibia">Namibia</option>
                                            <option value="Nauru">Nauru</option>
                                            <option value="Nepal">Nepal</option>
                                            <option value="Netherlands">Netherlands</option>
                                            <option value="New Zealand">New Zealand</option>
                                            <option value="Nicaragua">Nicaragua</option>
                                            <option value="Niger">Niger</option>
                                            <option value="Nigeria">Nigeria</option>
                                            <option value="North Korea">North Korea</option>
                                            <option value="North Macedonia">North Macedonia</option>
                                            <option value="Norway">Norway</option>
                                            <option value="Oman">Oman</option>
                                            <option value="Pakistan">Pakistan</option>
                                            <option value="Palau">Palau</option>
                                            <option value="Palestine">Palestine</option>
                                            <option value="Panama">Panama</option>
                                            <option value="Papua New Guinea">Papua New Guinea</option>
                                            <option value="Paraguay">Paraguay</option>
                                            <option value="Peru">Peru</option>
                                            <option value="Philippines">Philippines</option>
                                            <option value="Poland">Poland</option>
                                            <option value="Portugal">Portugal</option>
                                            <option value="Qatar">Qatar</option>
                                            <option value="Romania">Romania</option>
                                            <option value="Russia">Russia</option>
                                            <option value="Rwanda">Rwanda</option>
                                            <option value="Saint Kitts and Nevis">Saint Kitts and Nevis</option>
                                            <option value="Saint Lucia">Saint Lucia</option>
                                            <option value="Saint Vincent and the Grenadines">Saint Vincent and the Grenadines</option>
                                            <option value="Samoa">Samoa</option>
                                            <option value="San Marino">San Marino</option>
                                            <option value="Sao Tome and Principe">Sao Tome and Principe</option>
                                            <option value="Saudi Arabia">Saudi Arabia</option>
                                            <option value="Senegal">Senegal</option>
                                            <option value="Serbia">Serbia</option>
                                            <option value="Seychelles">Seychelles</option>
                                            <option value="Sierra Leone">Sierra Leone</option>
                                            <option value="Singapore">Singapore</option>
                                            <option value="Slovakia">Slovakia</option>
                                            <option value="Slovenia">Slovenia</option>
                                            <option value="Solomon Islands">Solomon Islands</option>
                                            <option value="Somalia">Somalia</option>
                                            <option value="South Africa">South Africa</option>
                                            <option value="South Korea">South Korea</option>
                                            <option value="South Sudan">South Sudan</option>
                                            <option value="Spain">Spain</option>
                                            <option value="Sri Lanka">Sri Lanka</option>
                                            <option value="Sudan">Sudan</option>
                                            <option value="Suriname">Suriname</option>
                                            <option value="Sweden">Sweden</option>
                                            <option value="Switzerland">Switzerland</option>
                                            <option value="Syria">Syria</option>
                                            <option value="Tajikistan">Tajikistan</option>
                                            <option value="Tanzania">Tanzania</option>
                                            <option value="Thailand">Thailand</option>
                                            <option value="Timor-Leste">Timor-Leste</option>
                                            <option value="Togo">Togo</option>
                                            <option value="Tonga">Tonga</option>
                                            <option value="Trinidad and Tobago">Trinidad and Tobago</option>
                                            <option value="Tunisia">Tunisia</option>
                                            <option value="Turkey">Turkey</option>
                                            <option value="Turkmenistan">Turkmenistan</option>
                                            <option value="Tuvalu">Tuvalu</option>
                                            <option value="Uganda">Uganda</option>
                                            <option value="Ukraine">Ukraine</option>
                                            <option value="United Arab Emirates">United Arab Emirates</option>
                                            <option value="United Kingdom">United Kingdom</option>
                                            <option value="United States">United States</option>
                                            <option value="Uruguay">Uruguay</option>
                                            <option value="Uzbekistan">Uzbekistan</option>
                                            <option value="Vanuatu">Vanuatu</option>
                                            <option value="Vatican City">Vatican City</option>
                                            <option value="Venezuela">Venezuela</option>
                                            <option value="Vietnam">Vietnam</option>
                                            <option value="Yemen">Yemen</option>
                                            <option value="Zambia">Zambia</option>
                                            <option value="Zimbabwe">Zimbabwe</option>

                                        </select>
                                    </div>
                                </div>

                            </div>

                            <div className="profile-form-actions">
                                <button
                                    type="submit"
                                    className="save-profile-button"
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <>
                                            <RefreshCw size={17} className="profile-spin" />
                                            Saving changes...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={17} />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>

                        </form>

                    </section>

                    {/* SIDEBAR */}
                    <aside className="profile-side-column">

                        {/* ACCOUNT DETAILS */}
                        <section className="profile-card account-details-card">

                            <div className="profile-card-header">
                                <div className="profile-card-heading-icon blue">
                                    <Wallet size={20} />
                                </div>

                                <div>
                                    <h3>Account Details</h3>
                                    <p>Your banking information.</p>
                                </div>
                            </div>

                            <div className="profile-balance-card">
                                <span>Available Balance</span>

                                <strong>
                                    {formatCurrency(user?.balance)}
                                </strong>

                                <div>
                                    <Wallet size={15} />
                                    Skyravon Bank Account
                                </div>
                            </div>

                            <div className="account-details-list">

                                <div className="account-detail-item">
                                    <div>
                                        <span>Account Number</span>
                                        <strong>
                                            {user?.account_number || "Unavailable"}
                                        </strong>
                                    </div>

                                    <button
                                        type="button"
                                        className="copy-account-button"
                                        onClick={copyAccountNumber}
                                        disabled={!user?.account_number}
                                        aria-label="Copy account number"
                                    >
                                        {copied
                                            ? <Check size={16} />
                                            : <Copy size={16} />}
                                    </button>
                                </div>

                                <div className="account-detail-item">
                                    <div>
                                        <span>Account Holder</span>
                                        <strong>
                                            {user?.full_name || formData.fullName}
                                        </strong>
                                    </div>
                                </div>

                                <div className="account-detail-item">
                                    <div>
                                        <span>Account Status</span>
                                        <strong className={
                                            statusIsActive ? "active-text" : "inactive-text"
                                        }>
                                            {statusIsActive ? "Active" : accountStatus}
                                        </strong>
                                    </div>
                                </div>

                                <div className="account-detail-item">
                                    <div>
                                        <span>Country</span>
                                        <strong>{formData.country}</strong>
                                    </div>
                                </div>

                            </div>

                        </section>

                        {/* SECURITY CARD */}
                        <section className="profile-security-card">
                            <div className="profile-security-icon">
                                <ShieldCheck size={23} />
                            </div>

                            <h3>Your security matters</h3>

                            <p>
                                Skyravon Bank takes your account security
                                seriously. Keep your login details and
                                transaction PIN private.
                            </p>

                            <div className="profile-security-divider" />

                            <div className="profile-security-feature">
                                <LockKeyhole size={16} />
                                Secure account information
                            </div>

                            <div className="profile-security-feature">
                                <ShieldCheck size={16} />
                                Protected banking access
                            </div>
                        </section>

                        {/* SUPPORT CARD */}
                        <section className="profile-support-card">
                            <div>
                                <h3>Need assistance?</h3>
                                <p>Our support team is available to help.</p>
                            </div>

                            <Link to="/support">
                                Contact Support
                                <ChevronRight size={16} />
                            </Link>
                        </section>

                    </aside>

                </div>

                {/* FOOTER */}
                <footer className="profile-footer">
                    <span>
                        © {new Date().getFullYear()} Skyravon Bank. All rights reserved.
                    </span>

                    <div>
                        <Link to="/dashboard">Dashboard</Link>
                        <Link to="/support">Support</Link>
                    </div>
                </footer>

            </main>
        </div>
    );
}

export default Profile;
