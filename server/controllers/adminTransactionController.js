const pool = require("../config/db");
const nodemailer = require("nodemailer");

// =====================================================
// EMAIL CONFIGURATION
// =====================================================

const mailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// =====================================================
// HTML ESCAPING
// =====================================================

const escapeHtml = (value) => {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
};

// =====================================================
// SEND TRANSFER DEBIT EMAIL
// =====================================================

const sendTransferDebitAlert = async ({
    email,
    fullName,
    accountNumber,
    amount,
    reference,
    balance
}) => {
    try {
        if (!email) {
            console.error("Debit alert skipped: customer email not found.");
            return false;
        }

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            console.error("Debit alert skipped: email credentials are missing.");
            return false;
        }

        const formattedAmount = Number(amount).toLocaleString("en-NG", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        const formattedBalance = Number(balance).toLocaleString("en-NG", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        const safeName = escapeHtml(fullName || "Valued Customer");
        const safeAccount = escapeHtml(accountNumber || "N/A");
        const safeReference = escapeHtml(reference || "N/A");

        const info = await mailTransporter.sendMail({
            from: `"Richiee Bank" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Richiee Bank - Successful Transfer Debit Alert",

            text: `
Dear ${fullName || "Valued Customer"},

Your transfer has been approved successfully.

Amount Debited: ${formattedAmount}
Account Number: ${accountNumber || "N/A"}
Transaction Reference: ${reference || "N/A"}
Transaction Date: ${new Date().toLocaleString("en-NG")}
Transaction Status: SUCCESSFUL
Available Balance: ${formattedBalance}

Thank you for banking with Richiee Bank.
            `,

            html: `
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:20px auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">

                    <div style="background:#123c78;color:white;padding:25px;">
                        <h2 style="margin:0;">RICHIEE BANK</h2>
                        <p>Transaction Notification</p>
                    </div>

                    <div style="padding:25px;color:#333;">
                        <h3>Dear ${safeName},</h3>

                        <p>
                            Your transfer has been approved successfully
                            and your account has been debited.
                        </p>

                        <div style="background:#f4f7fb;padding:20px;border-radius:8px;">

                            <h3 style="color:#123c78;">Debit Transaction Details</h3>

                            <p><strong>Transaction Type:</strong> Transfer Debit</p>
                            <p><strong>Amount Debited:</strong> ${formattedAmount}</p>
                            <p><strong>Account Number:</strong> ${safeAccount}</p>
                            <p><strong>Reference:</strong> ${safeReference}</p>
                            <p><strong>Date:</strong> ${new Date().toLocaleString("en-NG")}</p>

                            <p>
                                <strong>Status:</strong>
                                <span style="color:green;font-weight:bold;">SUCCESSFUL</span>
                            </p>

                            <hr style="border:0;border-top:1px solid #ddd;">

                            <p>
                                <strong>Available Balance:</strong>
                                ${formattedBalance}
                            </p>
                        </div>

                        <p>Thank you for banking with Richiee Bank.</p>

                        <p style="font-size:12px;color:#777;">
                            This is an automated notification. Please do not reply.
                        </p>
                    </div>
                </div>
            `
        });

        console.log(
            "Debit alert email sent:",
            info.messageId,
            "to:",
            email
        );

        return true;

    } catch (error) {
        console.error("Transfer debit email failed:", error.message);
        return false;
    }
};

// =====================================================
// GET ADMIN IDENTITY
// =====================================================

const getAdminIdentity = (req) => {
    return String(
        req.admin?.email ||
        req.admin?.username ||
        req.admin?.name ||
        req.admin?.id ||
        "ADMIN"
    );
};

// =====================================================
// GET PENDING TRANSACTIONS
// =====================================================

const getPendingTransactions = async (req, res, next) => {
    try {
        const [rows] = await pool.execute(`
            SELECT
                t.id,
                t.user_id,
                t.type,
                t.amount,
                t.balance_after,
                t.reference,
                t.related_account,
                t.description,
                t.created_at,
                t.status,
                t.approved_by,
                t.approved_at,
                u.full_name,
                u.account_number
            FROM transactions t
            INNER JOIN users u ON u.id = t.user_id
            WHERE t.status = 'PENDING'
            ORDER BY t.created_at DESC
        `);

        return res.status(200).json({
            success: true,
            transactions: rows
        });

    } catch (error) {
        console.error("Get pending transactions error:", error);
        next(error);
    }
};

// =====================================================
// GET ALL TRANSACTIONS
// =====================================================

const getAllTransactions = async (req, res, next) => {
    try {
        let limit = Number(req.query.limit) || 100;

        if (!Number.isInteger(limit) || limit <= 0) {
            limit = 100;
        }

        limit = Math.min(limit, 500);

        const [rows] = await pool.execute(
            `
            SELECT
                t.id,
                t.user_id,
                t.type,
                t.amount,
                t.balance_after,
                t.reference,
                t.related_account,
                t.description,
                t.created_at,
                t.status,
                t.approved_by,
                t.approved_at,
                u.full_name,
                u.account_number
            FROM transactions t
            INNER JOIN users u ON u.id = t.user_id
            ORDER BY t.created_at DESC
            LIMIT ${limit}
            `
        );

        return res.status(200).json({
            success: true,
            count: rows.length,
            transactions: rows
        });

    } catch (error) {
        console.error("Get all transactions error:", error);
        next(error);
    }
};

// =====================================================
// APPROVE TRANSACTION
// =====================================================

const approveTransaction = async (req, res, next) => {
    const transactionId = Number(req.params.id);

    if (!Number.isInteger(transactionId) || transactionId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid transaction ID."
        });
    }

    let connection;

    try {
        connection = await pool.getConnection();

        await connection.beginTransaction();

        // Lock transaction
        const [transactionRows] = await connection.execute(
            `
            SELECT *
            FROM transactions
            WHERE id = ?
            FOR UPDATE
            `,
            [transactionId]
        );

        const transaction = transactionRows[0];

        if (!transaction) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Transaction not found."
            });
        }

        if (transaction.status === "APPROVED") {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "This transaction has already been approved."
            });
        }

        if (transaction.status === "REJECTED") {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "A rejected transaction cannot be approved."
            });
        }

        if (transaction.status !== "PENDING") {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "Only pending transactions can be approved."
            });
        }

        const adminIdentity = getAdminIdentity(req);

        // =============================================
        // DEPOSIT
        // =============================================

        if (transaction.type === "DEPOSIT") {
            const [users] = await connection.execute(
                `
                SELECT id, balance
                FROM users
                WHERE id = ?
                FOR UPDATE
                `,
                [transaction.user_id]
            );

            const user = users[0];

            if (!user) {
                await connection.rollback();

                return res.status(404).json({
                    success: false,
                    message: "User account not found."
                });
            }

            const currentBalance = Number(user.balance);
            const amount = Number(transaction.amount);

            if (!Number.isFinite(amount) || amount <= 0) {
                await connection.rollback();

                return res.status(400).json({
                    success: false,
                    message: "Invalid transaction amount."
                });
            }

            const newBalance = currentBalance + amount;

            await connection.execute(
                `UPDATE users SET balance = ? WHERE id = ?`,
                [newBalance, user.id]
            );

            await connection.execute(
                `
                UPDATE transactions
                SET balance_after = ?,
                    status = 'APPROVED',
                    approved_by = ?,
                    approved_at = CURRENT_TIMESTAMP
                WHERE id = ?
                `,
                [newBalance, adminIdentity, transaction.id]
            );

            await connection.commit();

            return res.status(200).json({
                success: true,
                message: "Deposit approved successfully.",
                reference: transaction.reference,
                amount,
                balance: newBalance,
                status: "APPROVED"
            });
        }

        // =============================================
        // WITHDRAWAL
        // =============================================

        if (transaction.type === "WITHDRAWAL") {
            const [users] = await connection.execute(
                `
                SELECT id, balance
                FROM users
                WHERE id = ?
                FOR UPDATE
                `,
                [transaction.user_id]
            );

            const user = users[0];

            if (!user) {
                await connection.rollback();

                return res.status(404).json({
                    success: false,
                    message: "User account not found."
                });
            }

            const currentBalance = Number(user.balance);
            const amount = Number(transaction.amount);

            if (!Number.isFinite(amount) || amount <= 0) {
                await connection.rollback();

                return res.status(400).json({
                    success: false,
                    message: "Invalid transaction amount."
                });
            }

            if (currentBalance < amount) {
                await connection.rollback();

                return res.status(400).json({
                    success: false,
                    message: "Insufficient balance. Withdrawal cannot be approved."
                });
            }

            const newBalance = currentBalance - amount;

            await connection.execute(
                `UPDATE users SET balance = ? WHERE id = ?`,
                [newBalance, user.id]
            );

            await connection.execute(
                `
                UPDATE transactions
                SET balance_after = ?,
                    status = 'APPROVED',
                    approved_by = ?,
                    approved_at = CURRENT_TIMESTAMP
                WHERE id = ?
                `,
                [newBalance, adminIdentity, transaction.id]
            );

            await connection.commit();

            return res.status(200).json({
                success: true,
                message: "Withdrawal approved successfully.",
                reference: transaction.reference,
                amount,
                balance: newBalance,
                status: "APPROVED"
            });
        }

        // =============================================
        // TRANSFER OUT
        // =============================================

        if (transaction.type === "TRANSFER_OUT") {
            const inReference = `${transaction.reference}-IN`;

            const [transferRows] = await connection.execute(
                `
                SELECT *
                FROM transactions
                WHERE reference = ?
                AND type = 'TRANSFER_IN'
                FOR UPDATE
                `,
                [inReference]
            );

            const transferIn = transferRows[0];

            if (!transferIn) {
                await connection.rollback();

                return res.status(404).json({
                    success: false,
                    message: "Matching transfer transaction was not found."
                });
            }

            if (transferIn.status !== "PENDING") {
                await connection.rollback();

                return res.status(400).json({
                    success: false,
                    message: "Matching transfer is no longer pending."
                });
            }

            const senderId = Number(transaction.user_id);
            const receiverId = Number(transferIn.user_id);

            if (!senderId || !receiverId || senderId === receiverId) {
                await connection.rollback();

                return res.status(400).json({
                    success: false,
                    message: "Invalid transfer accounts."
                });
            }

            // Lock both accounts in ID order
            const firstId = Math.min(senderId, receiverId);
            const secondId = Math.max(senderId, receiverId);

            const [users] = await connection.execute(
                `
                SELECT
                    id,
                    account_number,
                    balance,
                    full_name,
                    email
                FROM users
                WHERE id IN (?, ?)
                ORDER BY id
                FOR UPDATE
                `,
                [firstId, secondId]
            );

            const sender = users.find(
                user => Number(user.id) === senderId
            );

            const receiver = users.find(
                user => Number(user.id) === receiverId
            );

            if (!sender || !receiver) {
                await connection.rollback();

                return res.status(404).json({
                    success: false,
                    message: "Unable to locate transfer accounts."
                });
            }

            const amount = Number(transaction.amount);

            if (!Number.isFinite(amount) || amount <= 0) {
                await connection.rollback();

                return res.status(400).json({
                    success: false,
                    message: "Invalid transfer amount."
                });
            }

            const senderBalance = Number(sender.balance);
            const receiverBalance = Number(receiver.balance);

            if (senderBalance < amount) {
                await connection.rollback();

                return res.status(400).json({
                    success: false,
                    message: "Insufficient sender balance. Transfer cannot be approved."
                });
            }

            const senderNewBalance = senderBalance - amount;
            const receiverNewBalance = receiverBalance + amount;

            // Debit sender
            await connection.execute(
                `UPDATE users SET balance = ? WHERE id = ?`,
                [senderNewBalance, sender.id]
            );

            // Credit receiver
            await connection.execute(
                `UPDATE users SET balance = ? WHERE id = ?`,
                [receiverNewBalance, receiver.id]
            );

            // Approve outgoing transaction
            await connection.execute(
                `
                UPDATE transactions
                SET balance_after = ?,
                    status = 'APPROVED',
                    approved_by = ?,
                    approved_at = CURRENT_TIMESTAMP
                WHERE id = ?
                `,
                [senderNewBalance, adminIdentity, transaction.id]
            );

            // Approve incoming transaction
            await connection.execute(
                `
                UPDATE transactions
                SET balance_after = ?,
                    status = 'APPROVED',
                    approved_by = ?,
                    approved_at = CURRENT_TIMESTAMP
                WHERE id = ?
                `,
                [receiverNewBalance, adminIdentity, transferIn.id]
            );

            // Commit before sending the email
            await connection.commit();

            // Send debit alert to registered sender email
            const emailSent = await sendTransferDebitAlert({
                email: sender.email,
                fullName: sender.full_name,
                accountNumber: sender.account_number,
                amount,
                reference: transaction.reference,
                balance: senderNewBalance
            });

            return res.status(200).json({
                success: true,
                message: emailSent
                    ? "Transfer approved successfully. Debit alert email sent."
                    : "Transfer approved successfully, but email delivery failed.",
                reference: transaction.reference,
                amount,
                emailSent,
                sender: {
                    accountNumber: sender.account_number,
                    balance: senderNewBalance
                },
                receiver: {
                    accountNumber: receiver.account_number,
                    balance: receiverNewBalance
                },
                status: "APPROVED"
            });
        }

        await connection.rollback();

        return res.status(400).json({
            success: false,
            message: "Unsupported transaction type."
        });

    } catch (error) {
        if (connection) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error("Rollback error:", rollbackError);
            }
        }

        console.error("Approve transaction error:", error);
        return next(error);

    } finally {
        if (connection) {
            connection.release();
        }
    }
};

// =====================================================
// REJECT TRANSACTION
// =====================================================

const rejectTransaction = async (req, res, next) => {
    const transactionId = Number(req.params.id);

    if (!Number.isInteger(transactionId) || transactionId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid transaction ID."
        });
    }

    let connection;

    try {
        connection = await pool.getConnection();

        await connection.beginTransaction();

        const [rows] = await connection.execute(
            `
            SELECT *
            FROM transactions
            WHERE id = ?
            FOR UPDATE
            `,
            [transactionId]
        );

        const transaction = rows[0];

        if (!transaction) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Transaction not found."
            });
        }

        if (transaction.status === "APPROVED") {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "An approved transaction cannot be rejected."
            });
        }

        if (transaction.status === "REJECTED") {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "This transaction has already been rejected."
            });
        }

        if (transaction.status !== "PENDING") {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "Only pending transactions can be rejected."
            });
        }

        const adminIdentity = getAdminIdentity(req);

        if (
            transaction.type !== "TRANSFER_OUT" &&
            transaction.type !== "TRANSFER_IN"
        ) {
            await connection.execute(
                `
                UPDATE transactions
                SET status = 'REJECTED',
                    approved_by = ?,
                    approved_at = CURRENT_TIMESTAMP
                WHERE id = ?
                `,
                [adminIdentity, transaction.id]
            );

            await connection.commit();

            return res.status(200).json({
                success: true,
                message: "Transaction rejected successfully.",
                reference: transaction.reference,
                status: "REJECTED"
            });
        }

        let transferOut = transaction;
        let transferIn = null;

        if (transaction.type === "TRANSFER_OUT") {
            const [rowsIn] = await connection.execute(
                `
                SELECT *
                FROM transactions
                WHERE reference = ?
                AND type = 'TRANSFER_IN'
                FOR UPDATE
                `,
                [`${transaction.reference}-IN`]
            );

            transferIn = rowsIn[0];

        } else {
            transferIn = transaction;

            const reference = String(transaction.reference || "");

            const baseReference = reference.endsWith("-IN")
                ? reference.slice(0, -3)
                : null;

            if (!baseReference) {
                await connection.rollback();

                return res.status(400).json({
                    success: false,
                    message: "Invalid transfer reference."
                });
            }

            const [rowsOut] = await connection.execute(
                `
                SELECT *
                FROM transactions
                WHERE reference = ?
                AND type = 'TRANSFER_OUT'
                FOR UPDATE
                `,
                [baseReference]
            );

            transferOut = rowsOut[0];
        }

        if (!transferOut || !transferIn) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Matching transfer transaction not found."
            });
        }

        if (
            transferOut.status !== "PENDING" ||
            transferIn.status !== "PENDING"
        ) {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "The transfer is no longer pending."
            });
        }

        await connection.execute(
            `
            UPDATE transactions
            SET status = 'REJECTED',
                approved_by = ?,
                approved_at = CURRENT_TIMESTAMP
            WHERE id IN (?, ?)
            `,
            [adminIdentity, transferOut.id, transferIn.id]
        );

        await connection.commit();

        return res.status(200).json({
            success: true,
            message: "Transfer rejected successfully.",
            reference: transferOut.reference,
            status: "REJECTED"
        });

    } catch (error) {
        if (connection) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error("Rollback error:", rollbackError);
            }
        }

        console.error("Reject transaction error:", error);
        return next(error);

    } finally {
        if (connection) {
            connection.release();
        }
    }
};

// =====================================================
// EXPORT CONTROLLERS
// =====================================================

module.exports = {
    getPendingTransactions,
    getAllTransactions,
    approveTransaction,
    rejectTransaction
};
