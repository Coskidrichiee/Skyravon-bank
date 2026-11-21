const db = require("../config/db");

// GET /api/admin/notifications/transfers
const getTransferNotifications = async (req, res) => {
    try {
        const adminId = req.admin.id;

        const [transfers] = await db.query(
            `SELECT
                t.id,
                t.user_id,
                t.amount,
                t.currency,
                t.bank,
                t.account_number,
                t.account_name,
                t.reference,
                t.status,
                t.created_at,
                u.full_name,
                CASE
                    WHEN r.id IS NULL THEN 0
                    ELSE 1
                END AS is_read
             FROM transfers t
             LEFT JOIN users u
                ON u.id = t.user_id
             LEFT JOIN admin_notification_reads r
                ON r.transfer_id = t.id
                AND r.admin_id = ?
                AND r.transfer_status = t.status
             WHERE t.status IN ('PENDING', 'APPROVED')
             ORDER BY t.created_at DESC
             LIMIT 30`,
            [adminId]
        );

        const notifications = transfers.map((item) => ({
            ...item,
            is_read: Number(item.is_read) === 1
        }));

        const unreadCount = notifications.filter(
            (item) => !item.is_read
        ).length;

        res.status(200).json({
            success: true,
            count: notifications.length,
            unreadCount,
            notifications
        });
    } catch (error) {
        console.error("Transfer notification error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to load transfer notifications."
        });
    }
};


// POST /api/admin/notifications/read
const markTransferNotificationAsRead = async (req, res) => {
    try {
        const adminId = req.admin.id;
        const { transfer_id, status } = req.body;

        if (!transfer_id || !["PENDING", "APPROVED"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "A valid transfer ID and status are required."
            });
        }

        const [result] = await db.query(
            `INSERT INTO admin_notification_reads
                (admin_id, transfer_id, transfer_status)
             SELECT ?, id, status
             FROM transfers
             WHERE id = ? AND status = ?
             ON DUPLICATE KEY UPDATE read_at = CURRENT_TIMESTAMP`,
            [adminId, transfer_id, status]
        );

        res.status(200).json({
            success: true,
            message: "Notification marked as read."
        });
    } catch (error) {
        console.error("Mark notification as read error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to mark notification as read."
        });
    }
};


// POST /api/admin/notifications/read-all
const markAllTransferNotificationsAsRead = async (req, res) => {
    try {
        const adminId = req.admin.id;

        await db.query(
            `INSERT INTO admin_notification_reads
                (admin_id, transfer_id, transfer_status)
             SELECT ?, t.id, t.status
             FROM transfers t
             WHERE t.status IN ('PENDING', 'APPROVED')
             ON DUPLICATE KEY UPDATE read_at = CURRENT_TIMESTAMP`,
            [adminId]
        );

        res.status(200).json({
            success: true,
            message: "All transfer notifications marked as read."
        });
    } catch (error) {
        console.error("Mark all notifications as read error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to mark all notifications as read."
        });
    }
};


module.exports = {
    getTransferNotifications,
    markTransferNotificationAsRead,
    markAllTransferNotificationsAsRead
};