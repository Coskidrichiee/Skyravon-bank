
import axios from "axios";

/* =========================================================
   BASE URL
========================================================= */

const API_BASE =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";

/* =========================================================
   AXIOS INSTANCE
========================================================= */

const API = axios.create({
    baseURL: API_BASE,
    timeout: 15000,
    headers: {
        "Content-Type": "application/json"
    }
});

/* =========================================================
   TOKEN HELPERS
========================================================= */

const getAdminToken = () =>
    localStorage.getItem("adminToken") ||
    localStorage.getItem("banking_admin_token");

const getUserToken = () =>
    localStorage.getItem("banking_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("userToken");

/* =========================================================
   ADMIN AXIOS INTERCEPTOR
========================================================= */

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

/* =========================================================
   ADMIN RESPONSE INTERCEPTOR
========================================================= */

API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn("Admin authentication failed.");
        }

        return Promise.reject(error);
    }
);

/* =========================================================
   GENERAL CUSTOMER REQUEST HELPER
========================================================= */

const request = async (endpoint, options = {}) => {
    const response = await fetch(
        `${API_BASE}/api${endpoint}`,
        {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            }
        }
    );

    let data;

    try {
        data = await response.json();
    } catch {
        data = {
            success: false,
            message: "Invalid server response."
        };
    }

    if (!response.ok) {
        throw new Error(
            data?.message ||
            `Request failed with status ${response.status}`
        );
    }

    return data;
};

/* =========================================================
   USER ACTIVITY NOTIFICATIONS
========================================================= */

export const getUserActivityNotifications = async (
    token,
    limit = 20
) => {
    const response = await fetch(
        `${API_BASE}/api/notifications/activity?limit=${limit}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Unable to load notifications."
        );
    }

    return data;
};

/* =========================================================
   USER AUTHENTICATION
========================================================= */

export const registerUser = async (userData) => {
    return request("/auth/register", {
        method: "POST",
        body: JSON.stringify(userData)
    });
};

export const loginUser = async (credentials) => {
    return request("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials)
    });
};

export const getCurrentUser = async (token) => {
    return request("/auth/me", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

/* =========================================================
   USER PROFILE
========================================================= */

export const getProfile = async (token) => {
    return request("/profile", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

export const updateProfile = async (token, userData) => {
    return request("/profile", {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(userData)
    });
};

/* =========================================================
   USER BANKING
========================================================= */

export const getBalance = async (token) => {
    return request("/bank/balance", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

export const depositMoney = async (token, amount) => {
    return request("/bank/deposit", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ amount })
    });
};

export const withdrawMoney = async (token, amount) => {
    return request("/bank/withdraw", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ amount })
    });
};

/* =========================================================
   DIRECT BANK TRANSFER
========================================================= */

export const transferMoney = async (token, transferData) => {
    return request("/bank/transfer", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(transferData)
    });
};

/* =========================================================
   USER TRANSFER REQUEST
========================================================= */

export const createTransferRequest = async (
    token,
    transferData
) => {
    return request("/transfers/create", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(transferData)
    });
};

/* =========================================================
   USER PENDING TRANSFERS
========================================================= */

export const getUserPendingTransfers = async (token) => {
    return request("/transfers/pending", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

/* =========================================================
   ADMIN LOGIN
========================================================= */

export const loginAdmin = async (credentials) => {
    const response = await API.post(
        "/api/admin/login",
        credentials
    );

    const data = response.data;

    if (data?.success && data?.token) {
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("banking_admin_token", data.token);

        if (data.admin) {
            localStorage.setItem(
                "admin",
                JSON.stringify(data.admin)
            );

            localStorage.setItem(
                "banking_admin",
                JSON.stringify(data.admin)
            );
        }
    }

    return data;
};

/* =========================================================
   CURRENT ADMIN
========================================================= */

export const getCurrentAdmin = async () => {
    const response = await API.get("/api/admin/me");
    return response.data;
};

/* =========================================================
   ADMIN LOGOUT
========================================================= */

export const logoutAdmin = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("banking_admin_token");
    localStorage.removeItem("admin");
    localStorage.removeItem("banking_admin");
};

/* =========================================================
   ADMIN DASHBOARD STATISTICS
========================================================= */

export const getDashboardStats = async () => {
    try {
        const response = await API.get(
            "/api/admin/dashboard",
            {
                params: {
                    _refresh: Date.now()
                }
            }
        );

        console.log(
            "ADMIN DASHBOARD STATISTICS:",
            response.data
        );

        return response.data;
    } catch (error) {
        console.error(
            "DASHBOARD STATISTICS ERROR:",
            error.response?.data || error.message
        );

        throw error;
    }
};

/* =========================================================
   ADMIN CUSTOMERS
========================================================= */

export const getCustomers = async () => {
    const response = await API.get("/api/admin/customers");
    return response.data;
};

/* =========================================================
   ADMIN ALL TRANSACTIONS
========================================================= */

export const getAdminAllTransactions = async () => {
    const response = await API.get(
        "/api/admin/transactions"
    );

    return response.data;
};

/* =========================================================
   BACKWARD-COMPATIBLE ADMIN TRANSACTIONS LIST
========================================================= */

export const getAdminTransactionsList = getAdminAllTransactions;

/* =========================================================
   ADMIN DASHBOARD RECENT TRANSACTIONS
========================================================= */

export const getAdminTransactions = async (
    token,
    limit = 10
) => {
    try {
        const adminToken = token || getAdminToken();

        if (!adminToken) {
            throw new Error("Admin authentication token is missing.");
        }

        const response = await API.get(
            "/api/admin/dashboard/transactions",
            {
                params: {
                    limit,
                    _refresh: Date.now()
                },
                headers: {
                    Authorization: `Bearer ${adminToken}`
                }
            }
        );

        console.log(
            "ADMIN RECENT TRANSACTIONS:",
            response.data
        );

        return response.data;
    } catch (error) {
        console.error(
            "ADMIN TRANSACTIONS ERROR:",
            error.response?.data || error.message
        );

        throw error;
    }
};

/* =========================================================
   CUSTOMER TRANSACTION HISTORY
========================================================= */

export const getTransactions = async (
    token,
    limit = 100
) => {
    const userToken = token || getUserToken();

    if (!userToken) {
        throw new Error(
            "Customer authentication token is missing."
        );
    }

    try {
        const data = await request(
            `/bank/transactions?limit=${encodeURIComponent(limit)}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${userToken}`
                }
            }
        );

        console.log(
            "CUSTOMER TRANSACTIONS:",
            data
        );

        return data;
    } catch (error) {
        console.error(
            "CUSTOMER TRANSACTIONS ERROR:",
            error.message
        );

        throw error;
    }
};

/* Backward-compatible customer function */
export const getUserTransactions = getTransactions;

/* =========================================================
   ADMIN DEPOSITS
========================================================= */

export const getDeposits = async () => {
    const response = await API.get("/api/admin/deposits");
    return response.data;
};

/* =========================================================
   ADMIN WITHDRAWALS
========================================================= */

export const getWithdrawals = async () => {
    const response = await API.get("/api/admin/withdrawals");
    return response.data;
};

/* =========================================================
   ADMIN ALL TRANSFERS
========================================================= */

export const getTransfers = async () => {
    const response = await API.get("/api/admin/transfers");
    return response.data;
};

/* =========================================================
   ADMIN DASHBOARD PENDING TRANSFERS
========================================================= */

export const getPendingTransfers = async (
    token,
    limit = 10
) => {
    try {
        const adminToken = token || getAdminToken();

        if (!adminToken) {
            throw new Error("Admin authentication token is missing.");
        }

        const response = await API.get(
            "/api/admin/dashboard/pending-transfers",
            {
                params: {
                    limit,
                    _refresh: Date.now()
                },
                headers: {
                    Authorization: `Bearer ${adminToken}`
                }
            }
        );

        const data = response.data;

        console.log(
            "ADMIN PENDING TRANSFERS RESPONSE:",
            data
        );

        return {
            ...data,
            count: Number(
                data?.count ??
                data?.transfers?.length ??
                0
            ),
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

/* =========================================================
   ADMIN APPROVE TRANSFER
========================================================= */

export const approveTransfer = async (
    token,
    id
) => {
    const adminToken = token || getAdminToken();

    if (!adminToken) {
        throw new Error("Admin authentication token is missing.");
    }

    return request(`/transfers/${id}/approve`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({})
    });
};

/* =========================================================
   ADMIN REJECT TRANSFER
========================================================= */

export const rejectTransfer = async (
    token,
    id,
    reason = ""
) => {
    const adminToken = token || getAdminToken();

    if (!adminToken) {
        throw new Error("Admin authentication token is missing.");
    }

    return request(`/transfers/${id}/reject`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
            reason
        })
    });
};

/* =========================================================
   PROFILE IMAGE UPLOAD
========================================================= */

export const uploadProfilePicture = async (
    token,
    file
) => {
    const formData = new FormData();

    formData.append("profilePicture", file);

    const response = await fetch(
        `${API_BASE}/api/profile/picture`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        }
    );

    let data;

    try {
        data = await response.json();
    } catch {
        data = {
            success: false,
            message: "Invalid server response."
        };
    }

    if (!response.ok) {
        throw new Error(
            data?.message ||
            "Failed to upload profile picture."
        );
    }

    return data;
};

/* =========================================================
   EXPORT API INSTANCE
========================================================= */

export default API;

