
import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
    timeout: 15000,
    headers: {
        "Content-Type": "application/json"
    }
});

// =======================================
// ADMIN TOKEN
// =======================================

const getAdminToken = () =>
    localStorage.getItem("adminToken") ||
    localStorage.getItem("banking_admin_token");

API.interceptors.request.use(
    (config) => {
        const token = getAdminToken();

        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// =======================================
// ADMIN LOGIN
// =======================================

export const loginAdmin = async (credentials) => {
    const { data } = await API.post("/api/admin/login", credentials);

    if (data?.success && data?.token) {
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("banking_admin_token", data.token);

        if (data.admin) {
            localStorage.setItem("admin", JSON.stringify(data.admin));
            localStorage.setItem("banking_admin", JSON.stringify(data.admin));
        }
    }

    return data;
};

// =======================================
// CURRENT ADMIN
// =======================================

export const getCurrentAdmin = async () => {
    const { data } = await API.get("/api/admin/me");
    return data;
};

// =======================================
// LOGOUT
// =======================================

export const logoutAdmin = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("banking_admin_token");
    localStorage.removeItem("admin");
    localStorage.removeItem("banking_admin");
};

// =======================================
// DASHBOARD STATISTICS
// =======================================

export const getDashboardStats = async () => {
    try {
        const { data } = await API.get("/api/admin/dashboard", {
            params: { _refresh: Date.now() }
        });

        console.log("ADMIN DASHBOARD RESPONSE:", data);
        return data;
    } catch (error) {
        console.error(
            "ADMIN DASHBOARD API ERROR:",
            error.response?.data || error.message
        );
        throw error;
    }
};

// =======================================
// DASHBOARD RECENT TRANSACTIONS
// =======================================

export const getAdminTransactions = async (token, limit = 10) => {
    try {
        const { data } = await API.get(
            "/api/admin/dashboard/transactions",
            {
                params: { limit, _refresh: Date.now() },
                headers: token
                    ? { Authorization: `Bearer ${token}` }
                    : {}
            }
        );

        return data;
    } catch (error) {
        console.error(
            "ADMIN TRANSACTIONS API ERROR:",
            error.response?.data || error.message
        );
        throw error;
    }
};

// =======================================
// DASHBOARD PENDING TRANSFERS
// =======================================

export const getPendingTransfers = async (token, limit = 10) => {
    try {
        const { data } = await API.get(
            "/api/admin/dashboard/pending-transfers",
            {
                params: { limit, _refresh: Date.now() },
                headers: token
                    ? { Authorization: `Bearer ${token}` }
                    : {}
            }
        );

        console.log("ADMIN PENDING TRANSFERS RESPONSE:", data);

        return {
            ...data,
            count: Number(data?.count ?? data?.transfers?.length ?? 0),
            transfers: Array.isArray(data?.transfers)
                ? data.transfers
                : []
        };
    } catch (error) {
        console.error(
            "PENDING TRANSFERS API ERROR:",
            error.response?.data || error.message
        );
        throw error;
    }
};

// =======================================
// CUSTOMERS
// =======================================

export const getCustomers = async () => {
    const { data } = await API.get("/api/admin/customers");
    return data;
};

// =======================================
// TRANSACTIONS
// =======================================

export const getTransactions = async () => {
    const { data } = await API.get("/api/admin/transactions");
    return data;
};

// =======================================
// DEPOSITS
// =======================================

export const getDeposits = async () => {
    const { data } = await API.get("/api/admin/deposits");
    return data;
};

// =======================================
// WITHDRAWALS
// =======================================

export const getWithdrawals = async () => {
    const { data } = await API.get("/api/admin/withdrawals");
    return data;
};

// =======================================
// ALL TRANSFERS
// =======================================

export const getTransfers = async () => {
    const { data } = await API.get("/api/admin/transfers");
    return data;
};

// =======================================
// APPROVE TRANSFER
// =======================================

export const approveTransfer = async (token, id) => {
    const { data } = await API.put(
        `/api/admin/transfers/${id}/approve`,
        {},
        {
            headers: token
                ? { Authorization: `Bearer ${token}` }
                : {}
        }
    );

    return data;
};

// =======================================
// REJECT TRANSFER
// =======================================

export const rejectTransfer = async (token, id, reason = "") => {
    const { data } = await API.put(
        `/api/admin/transfers/${id}/reject`,
        { reason },
        {
            headers: token
                ? { Authorization: `Bearer ${token}` }
                : {}
        }
    );

    return data;
};

export default API;
