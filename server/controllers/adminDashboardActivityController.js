
const db = require("../config/db");

/**
 * GET /api/admin/dashboard/transactions
 * Retrieve recent transactions with customer details.
 */
const getRecentTransactions = async (req, res) => {
    try {
        const limit = Math.min(
            Math.max(parseInt(req.query.limit, 10) || 10, 1),
            100
        );

        const [transactions] = await db.query(
            `
            SELECT
                t.id,
                t.user_id,
                u.full_name,
                t.amount,
                t.type,
                t.status,
                t.reference,
                t.related_account,
                t.description,
                t.created_at,
                tr.currency
            FROM transactions t
            LEFT JOIN users u ON u.id = t.user_id
            LEFT JOIN transfers tr ON tr.reference = t.reference
            ORDER BY t.created_at DESC, t.id DESC
            LIMIT ?
            `,
            [limit]
        );

        return res.status(200).json({
            success: true,
            message: "Recent transactions retrieved successfully.",
            count: transactions.length,
            transactions
        });

    } catch (error) {
        console.error("Recent transactions error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve recent transactions.",
            error: process.env.NODE_ENV === "development"
                ? error.message
                : undefined
        });
    }
};


/**
 * GET /api/admin/dashboard/pending-transfers
 * Retrieve pending transfers and their TOTAL count.
 */
const getDashboardPendingTransfers = async (req, res) => {
    try {
        const limit = Math.min(
            Math.max(parseInt(req.query.limit, 10) || 10, 1),
            100
        );

        // Retrieve the total number of pending transfers.
        const [countRows] = await db.query(
            `
            SELECT COUNT(*) AS total
            FROM transfers
            WHERE UPPER(TRIM(status)) = 'PENDING'
            `
        );

        // Retrieve the transfers displayed on the dashboard.
        const [transfers] = await db.query(
            `
            SELECT
                tr.id,
                tr.user_id,
                u.full_name,
                tr.country,
                tr.bank,
                tr.account_number,
                tr.account_name,
                tr.currency,
                tr.amount,
                tr.fee,
                tr.description,
                tr.reference,
                tr.status,
                tr.admin_note,
                tr.created_at
            FROM transfers tr
            LEFT JOIN users u ON u.id = tr.user_id
            WHERE UPPER(TRIM(tr.status)) = 'PENDING'
            ORDER BY tr.created_at ASC, tr.id ASC
            LIMIT ?
            `,
            [limit]
        );

        const total = Number(countRows[0]?.total || 0);

        console.log("==================================");
        console.log("ADMIN PENDING TRANSFERS API");
        console.log("TOTAL PENDING TRANSFERS:", total);
        console.log("TRANSFERS RETURNED:", transfers.length);
        console.log("==================================");

        return res.status(200).json({
            success: true,
            message: "Pending transfers retrieved successfully.",
            count: total,
            transfers
        });

    } catch (error) {
        console.error("PENDING TRANSFERS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve pending transfers.",
            error: process.env.NODE_ENV === "development"
                ? error.message
                : undefined
        });
    }
};


module.exports = {
    getRecentTransactions,
    getDashboardPendingTransfers
};


