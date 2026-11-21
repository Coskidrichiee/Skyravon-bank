
const db = require("../config/db");

const getDashboardStats = async (req, res) => {
    try {
        // 1. CUSTOMER STATISTICS
        const [[userStats]] = await db.query(`
            SELECT
                COUNT(*) AS total_customers,
                COALESCE(SUM(balance), 0) AS total_balance,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_customers,
                SUM(CASE WHEN status = 'blocked' THEN 1 ELSE 0 END) AS blocked_customers
            FROM users
        `);

        // 2. TRANSACTION STATISTICS
        const [[transactionStats]] = await db.query(`
            SELECT
                COUNT(*) AS total_transactions,
                COALESCE(SUM(amount), 0) AS transaction_volume,
                SUM(CASE WHEN type = 'DEPOSIT' THEN 1 ELSE 0 END) AS total_deposits,
                SUM(CASE WHEN type = 'WITHDRAWAL' THEN 1 ELSE 0 END) AS total_withdrawals,
                SUM(CASE WHEN type = 'TRANSFER_IN' THEN 1 ELSE 0 END) AS total_transfer_in,
                SUM(CASE WHEN type = 'TRANSFER_OUT' THEN 1 ELSE 0 END) AS total_transfer_out,
                COALESCE(SUM(CASE WHEN type = 'DEPOSIT' THEN amount ELSE 0 END), 0) AS deposit_volume,
                COALESCE(SUM(CASE WHEN type = 'WITHDRAWAL' THEN amount ELSE 0 END), 0) AS withdrawal_volume
            FROM transactions
        `);

        // 3. TRANSFER STATISTICS
        const [[transferStats]] = await db.query(`
            SELECT
                COUNT(*) AS total_transfers,
                SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) AS pending_transfers,
                SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) AS approved_transfers,
                SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed_transfers,
                SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) AS rejected_transfers,
                COALESCE(SUM(CASE WHEN status IN ('APPROVED', 'COMPLETED') THEN amount ELSE 0 END), 0) AS approved_transfer_volume
            FROM transfers
        `);

        // 4. FORMAT DASHBOARD STATISTICS
        const stats = [
            {
                id: "customers",
                title: "Total Customers",
                value: Number(userStats.total_customers || 0),
                icon: "users",
                color: "#2563eb",
                subtitle: `${Number(userStats.active_customers || 0).toLocaleString()} active customers`
            },
            {
                id: "balance",
                title: "Total Account Balance",
                value: Number(userStats.total_balance || 0),
                icon: "wallet",
                color: "#16a34a",
                subtitle: "Combined customer balances"
            },
            {
                id: "transactions",
                title: "Total Transactions",
                value: Number(transactionStats.total_transactions || 0),
                icon: "transactions",
                color: "#7c3aed",
                subtitle: "All recorded transactions"
            },
            {
                id: "volume",
                title: "Transaction Volume",
                value: Number(transactionStats.transaction_volume || 0),
                icon: "money",
                color: "#0891b2",
                subtitle: "Total recorded transaction value"
            },
            {
                id: "pending",
                title: "Pending Transfers",
                value: Number(transferStats.pending_transfers || 0),
                icon: "clock",
                color: "#d97706",
                subtitle: "Awaiting administrator approval"
            },
            {
                id: "approved",
                title: "Approved Transfers",
                value: Number(transferStats.approved_transfers || 0),
                icon: "exchange",
                color: "#16a34a",
                subtitle: "Approved transfer requests"
            },
            {
                id: "deposits",
                title: "Total Deposits",
                value: Number(transactionStats.total_deposits || 0),
                icon: "money",
                color: "#0d9488",
                subtitle: `Volume: ${Number(transactionStats.deposit_volume || 0).toLocaleString()}`
            },
            {
                id: "withdrawals",
                title: "Total Withdrawals",
                value: Number(transactionStats.total_withdrawals || 0),
                icon: "wallet",
                color: "#dc2626",
                subtitle: `Volume: ${Number(transactionStats.withdrawal_volume || 0).toLocaleString()}`
            }
        ];

        return res.status(200).json({
            success: true,
            message: "Dashboard statistics retrieved successfully.",
            stats,
            summary: {
                customers: userStats,
                transactions: transactionStats,
                transfers: transferStats
            }
        });

    } catch (error) {
        console.error("Dashboard statistics error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve dashboard statistics.",
            error: process.env.NODE_ENV === "development"
                ? error.message
                : undefined
        });
    }
};

module.exports = {
    getDashboardStats
};
