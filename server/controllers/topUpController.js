
const crypto = require("crypto");
const pool = require("../config/db");

const {
    sendUserCreatedEmail
} = require("../utils/sendEmail");

async function topUpUser(req, res) {
    const userId = Number(req.body.userId);
    const amount = Number(req.body.amount);

    if (
        !Number.isSafeInteger(userId) ||
        userId <= 0 ||
        !Number.isFinite(amount) ||
        amount <= 0 ||
        Math.round(amount * 100) !== amount * 100
    ) {
        return res.status(400).json({
            message: "Select a valid customer and enter a valid positive amount."
        });
    }

    let connection;
    let transactionStarted = false;
    let customer = null;
    let balanceAfter = null;
    let reference = null;

    try {
        connection = await pool.getConnection();

        await connection.beginTransaction();
        transactionStarted = true;

        // Get customer and lock account.
        const [users] = await connection.query(
            `SELECT
                id,
                full_name,
                email,
                account_number,
                balance,
                status
             FROM users
             WHERE id = ?
             FOR UPDATE`,
            [userId]
        );

        if (users.length === 0) {
            await connection.rollback();
            transactionStarted = false;

            return res.status(404).json({
                message: "Customer not found."
            });
        }

        customer = users[0];

        if (customer.status !== "active") {
            await connection.rollback();
            transactionStarted = false;

            return res.status(400).json({
                message: "Only active customer accounts can receive top-ups."
            });
        }

        // Update balance.
        await connection.query(
            `UPDATE users
             SET balance = balance + ?
             WHERE id = ?`,
            [amount.toFixed(2), userId]
        );

        // Retrieve updated balance.
        const [updatedUsers] = await connection.query(
            `SELECT balance
             FROM users
             WHERE id = ?`,
            [userId]
        );

        balanceAfter = updatedUsers[0].balance;

        // Generate transaction reference.
        reference =
            `TOPUP-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

        // Record deposit.
        await connection.query(
            `INSERT INTO transactions
            (
                user_id,
                type,
                amount,
                balance_after,
                reference,
                description,
                status,
                approved_by,
                approved_at
            )
            VALUES (?, 'DEPOSIT', ?, ?, ?, ?, 'COMPLETED', ?, NOW())`,
            [
                userId,
                amount.toFixed(2),
                balanceAfter,
                reference,
                "Admin account top-up",
                req.admin?.email || "Admin"
            ]
        );

        // Commit before attempting to send email.
        await connection.commit();
        transactionStarted = false;

        // Send credit notification.
        // Email failure must not reverse the completed top-up.
        let emailSent = false;

        if (customer.email) {
            try {
                await sendCreditAlertEmail({
                    email: customer.email,
                    full_name: customer.full_name,
                    amount,
                    account_number: customer.account_number,
                    description: "Admin account top-up",
                    reference,
                    transaction_date: new Date(),
                    available_balance: balanceAfter,
                    currency: "USD"
                });

                emailSent = true;

            } catch (emailError) {
                console.error(
                    "TOP-UP CREDIT EMAIL ERROR:",
                    emailError
                );
            }
        } else {
            console.warn(
                "TOP-UP CREDIT EMAIL NOT SENT: Customer has no email address."
            );
        }

        return res.status(201).json({
            success: true,
            message: "Account topped up successfully.",
            reference,
            emailSent,
            user: {
                id: customer.id,
                full_name: customer.full_name,
                email: customer.email,
                account_number: customer.account_number,
                balance: balanceAfter
            },
            amount: amount.toFixed(2)
        });

    } catch (error) {

        if (connection && transactionStarted) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error(
                    "Top-up rollback failed:",
                    rollbackError
                );
            }
        }

        console.error("Top-up error:", error);

        return res.status(500).json({
            success: false,
            message: "Top-up failed. Please verify the account balance and transaction history before retrying."
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
}

module.exports = {
    topUpUser
};
