
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../config/db");

const router = express.Router();

/*
==================================================
ADMIN AUTHENTICATION MIDDLEWARE
==================================================
*/

const {
    requireAdmin
} = require("../middleware/adminAuthMiddleware");


/*
==================================================
ADMIN TRANSACTION CONTROLLER
==================================================
*/

const {
    getPendingTransactions,
    getAllTransactions,
    approveTransaction,
    rejectTransaction
} = require("../controllers/adminTransactionController");


/*
==================================================
ADMIN DASHBOARD ACTIVITY CONTROLLER
==================================================
*/

const {
    getRecentTransactions,
    getDashboardPendingTransfers
} = require("../controllers/adminDashboardActivityController");


/*
==================================================
ADMIN LOGIN
POST: /api/admin/login
==================================================
*/

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        const cleanEmail = String(email).trim().toLowerCase();

        console.log("Admin login attempt:", cleanEmail);

        const [admins] = await db.query(
            `
            SELECT
                id,
                full_name,
                email,
                password_hash,
                role,
                status,
                profile_picture
            FROM admins
            WHERE LOWER(email) = ?
            LIMIT 1
            `,
            [cleanEmail]
        );

        if (!admins || admins.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid admin credentials."
            });
        }

        const admin = admins[0];

        if (String(admin.status).toUpperCase() !== "ACTIVE") {
            return res.status(403).json({
                success: false,
                message: "Admin account has been disabled."
            });
        }

        const passwordMatches = await bcrypt.compare(
            String(password),
            admin.password_hash
        );

        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message: "Invalid admin credentials."
            });
        }

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is missing from .env");

            return res.status(500).json({
                success: false,
                message: "JWT_SECRET is not configured on the server."
            });
        }

        const token = jwt.sign(
            {
                id: admin.id,
                email: admin.email,
                role: admin.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "7d"
            }
        );

        return res.status(200).json({
            success: true,
            message: "Admin login successful.",
            token,
            admin: {
                id: admin.id,
                name: admin.full_name || "Administrator",
                email: admin.email,
                role: admin.role,
                status: admin.status,
                profile_picture: admin.profile_picture || null
            }
        });

    } catch (error) {
        console.error("ADMIN LOGIN ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Server error during admin login."
        });
    }
});


/*
==================================================
ADMIN DASHBOARD STATISTICS
GET: /api/admin/dashboard
==================================================
*/


router.get("/dashboard", requireAdmin, async (req, res) => {
    try {
        // Confirm which database the backend is querying
        const [databaseRows] = await db.query(`
            SELECT DATABASE() AS database_name
        `);

        const databaseName = databaseRows[0]?.database_name;

        // Retrieve all dashboard statistics
        const queries = await Promise.all([
            db.query(`SELECT COUNT(*) AS total FROM users`),

            db.query(`SELECT COUNT(*) AS total FROM transactions`),

            db.query(`
                SELECT COUNT(*) AS total
                FROM transfers
                WHERE UPPER(TRIM(status)) = 'PENDING'
            `),

            db.query(`
                SELECT COUNT(*) AS total
                FROM transfers
                WHERE UPPER(TRIM(status)) IN ('APPROVED', 'COMPLETED')
            `),

            db.query(`
                SELECT COALESCE(SUM(amount), 0) AS total
                FROM transactions
            `)
        ]);

        // mysql2 returns [rows, fields]
        const getCount = (result) =>
            Number(result[0]?.[0]?.total ?? 0);

        const users = getCount(queries[0]);
        const transactions = getCount(queries[1]);
        const pendingTransfers = getCount(queries[2]);
        const approvedTransfers = getCount(queries[3]);
        const transactionVolume = getCount(queries[4]);

        console.log("========== DASHBOARD DEBUG ==========");
        console.log("DATABASE:", databaseName);
        console.log("USERS:", users);
        console.log("TRANSACTIONS:", transactions);
        console.log("PENDING TRANSFERS:", pendingTransfers);
        console.log("APPROVED TRANSFERS:", approvedTransfers);
        console.log("TRANSACTION VOLUME:", transactionVolume);
        console.log("=====================================");

        const stats = [
            {
                id: "users",
                title: "Total Users",
                value: users,
                icon: "users",
                color: "#2563eb"
            },
            {
                id: "transactions",
                title: "Total Transactions",
                value: transactions,
                icon: "exchange",
                color: "#7c3aed"
            },
            {
                id: "pending",
                title: "Pending Transfers",
                value: pendingTransfers,
                icon: "clock",
                color: "#d97706"
            },
            {
                id: "approved",
                title: "Approved Transfers",
                value: approvedTransfers,
                icon: "wallet",
                color: "#16a34a"
            }
        ];

        return res.status(200).json({
            success: true,
            message: "Dashboard statistics retrieved successfully.",
            database: databaseName,
            stats,
            totals: {
                users,
                transactions,
                pendingTransfers,
                approvedTransfers,
                transactionVolume
            }
        });

    } catch (error) {
        console.error("ADMIN DASHBOARD STATISTICS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to load dashboard statistics.",
            error: error.message
        });
    }
});

/*
==================================================
ADMIN DASHBOARD RECENT TRANSACTIONS
GET: /api/admin/dashboard/transactions
==================================================
*/

router.get(
    "/dashboard/transactions",
    requireAdmin,
    getRecentTransactions
);


/*
==================================================
ADMIN DASHBOARD PENDING TRANSFERS
GET: /api/admin/dashboard/pending-transfers
==================================================
*/

router.get(
    "/dashboard/pending-transfers",
    requireAdmin,
    getDashboardPendingTransfers
);


/*
==================================================
ADMIN TRANSACTIONS
==================================================
*/

// GET /api/admin/transactions
router.get(
    "/transactions",
    requireAdmin,
    getAllTransactions
);

// GET /api/admin/transactions/pending
router.get(
    "/transactions/pending",
    requireAdmin,
    getPendingTransactions
);

// PUT /api/admin/transactions/:id/approve
router.put(
    "/transactions/:id/approve",
    requireAdmin,
    approveTransaction
);

// PUT /api/admin/transactions/:id/reject
router.put(
    "/transactions/:id/reject",
    requireAdmin,
    rejectTransaction
);


/*
==================================================
EXPORT ROUTER
==================================================
*/

module.exports = router;
