
import {
    NavLink,
    useLocation,
    useNavigate
} from "react-router-dom";

import {
    FaUniversity,
    FaChartPie,
    FaUsers,
    FaExchangeAlt,
    FaMoneyBillWave,
    FaCreditCard,
    FaUserShield,
    FaCog,
    FaSignOutAlt,
    FaTimes,
    FaShieldAlt
} from "react-icons/fa";

import "../css/sidebar.css";

function Sidebar({ open = false, closeSidebar = () => {} }) {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        {
            name: "Dashboard",
            icon: <FaChartPie />,
            path: "/admin/dashboard"
        },
        {
            name: "Users",
            icon: <FaUsers />,
            path: "/admin/users"
        },
        {
            name: "Transactions",
            icon: <FaExchangeAlt />,
            path: "/admin/transactions"
        },
        {
            name: "Deposits",
            icon: <FaMoneyBillWave />,
            path: "/admin/topup"
        },
        {
            name: "Cards",
            icon: <FaCreditCard />,
            path: "/admin/cards"
        },
        {
            name: "Administrators",
            icon: <FaUserShield />,
            path: "/admin/admins"
        },
        {
            name: "Settings",
            icon: <FaCog />,
            path: "/admin/settings"
        }
    ];

    const handleNavigation = () => {
        closeSidebar();
    };

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("banking_admin_token");
        localStorage.removeItem("admin");
        localStorage.removeItem("banking_admin");

        closeSidebar();

        navigate("/admin/login", { replace: true });
    };

    const isMenuActive = (path) => {
        if (path === "/admin/dashboard") {
            return location.pathname === path;
        }

        return (
            location.pathname === path ||
            location.pathname.startsWith(`${path}/`)
        );
    };

    return (
        <>
            <button
                type="button"
                className={`sidebar-overlay ${open ? "show" : ""}`}
                onClick={handleNavigation}
                aria-label="Close navigation menu"
                tabIndex={open ? 0 : -1}
            />

            <aside
                className={`admin-sidebar ${open ? "show" : ""}`}
                aria-label="Admin navigation"
                aria-hidden={!open && typeof window !== "undefined" &&
                    window.innerWidth <= 900}
            >
                <div className="sidebar-header">
                    <NavLink
                        to="/admin/dashboard"
                        className="sidebar-brand"
                        onClick={handleNavigation}
                    >
                        <div className="brand-icon">
                            <FaUniversity />
                        </div>

                        <div className="brand-text">
                            <h2>Skyravon Bank</h2>
                            <span>ADMINISTRATION</span>
                        </div>
                    </NavLink>

                    <button
                        type="button"
                        className="close-sidebar"
                        onClick={handleNavigation}
                        aria-label="Close sidebar"
                    >
                        <FaTimes />
                    </button>
                </div>

                <div className="sidebar-section-label">
                    MAIN MENU
                </div>

                <nav className="sidebar-menu" aria-label="Admin menu">
                    {menuItems.map((item) => {
                        const active = isMenuActive(item.path);

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={handleNavigation}
                                className={`sidebar-link ${active ? "active" : ""}`}
                                aria-current={active ? "page" : undefined}
                            >
                                <span className="menu-icon">
                                    {item.icon}
                                </span>

                                <span className="menu-label">
                                    {item.name}
                                </span>

                                {active && (
                                    <span className="active-indicator" />
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="sidebar-security">
                    <div className="security-icon">
                        <FaShieldAlt />
                    </div>

                    <div>
                        <strong>Secure Banking</strong>
                        <span>Protected admin workspace</span>
                    </div>
                </div>

                <div className="sidebar-footer">
                    <div className="admin-profile">
                        <div className="profile-avatar">A</div>

                        <div className="admin-profile-info">
                            <strong>Administrator</strong>
                            <small>Super Admin</small>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="logout-btn"
                        onClick={handleLogout}
                    >
                        <FaSignOutAlt />
                        <span>Sign out</span>
                    </button>

                    <div className="sidebar-version">
                        Skyravon Bank Admin Portal
                    </div>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;