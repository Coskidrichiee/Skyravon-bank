const db = require("../config/db");

const getUserActivityNotifications = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        const limit = Math.min(
            Math.max(parseInt(req.query.limit, 10) || 20, 1),
            100
        );

        const [notifications] = await db.query(
            `
            SELECT *
            FROM (
                /* ACCOUNT CREATION */
                SELECT
                    CONCAT('account-', u.id) AS id,
                    'ACCOUNT_CREATED' AS type,
                    'Account created successfully' AS title,
                    CONCAT(
                        'Welcome to Skyravon Bank, ',
                        COALESCE(u.full_name, 'Customer'),
                        '. Your bank account has been created successfully.'
                    ) AS message,
                    NULL AS amount,
                    'NGN' AS currency,
                    NULL AS reference,
                    u.created_at
                FROM users u
                WHERE u.id = ?

                UNION ALL

                /* CREDIT AND DEBIT TRANSACTIONS */
                SELECT
                    CONCAT('transaction-', t.id) AS id,

                    CASE
                        WHEN t.type IN ('DEPOSIT', 'TRANSFER_IN')
                            THEN 'CREDIT'
                        WHEN t.type IN ('WITHDRAWAL', 'TRANSFER_OUT')
                            THEN 'DEBIT'
                        ELSE 'TRANSACTION'
                    END AS type,

                    CASE
                        WHEN t.type IN ('DEPOSIT', 'TRANSFER_IN')
                            THEN 'Credit alert'
                        WHEN t.type IN ('WITHDRAWAL', 'TRANSFER_OUT')
                            THEN 'Debit alert'
                        ELSE 'Transaction alert'
                    END AS title,

                    CASE
                        WHEN t.type IN ('DEPOSIT', 'TRANSFER_IN')
                            THEN CONCAT(
                                'Your account has been credited with ',
                                FORMAT(t.amount, 2),
                                '.'
                            )
                        WHEN t.type IN ('WITHDRAWAL', 'TRANSFER_OUT')
                            THEN CONCAT(
                                'Your account has been debited with ',
                                FORMAT(t.amount, 2),
                                '.'
                            )
                        ELSE CONCAT(
                            'A transaction of ',
                            FORMAT(t.amount, 2),
                            ' was recorded on your account.'
                        )
                    END AS message,

                    t.amount,
                    COALESCE(tr.currency, 'USD') AS currency,
                    t.reference,
                    t.created_at

                FROM transactions t
                LEFT JOIN transfers tr
                    ON tr.reference = t.reference

                WHERE t.user_id = ?
            ) AS activity

            ORDER BY activity.created_at DESC
            LIMIT ?
            `,
            [userId, userId, limit]
        );

        return res.status(200).json({
            success: true,
            message: "Notifications retrieved successfully.",
            count: notifications.length,
            notifications
        });

    } catch (error) {
        console.error("USER ACTIVITY NOTIFICATIONS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve notifications.",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined
        });
    }
};

module.exports = {
    getUserActivityNotifications
};