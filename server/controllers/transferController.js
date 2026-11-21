
const pool = require("../config/db");
const bcrypt = require("bcryptjs");

const {
    sendDebitAlertEmail,
    sendCreditAlertEmail
} =require("../utils/sendEmail");


/*
==================================================
CREATE TRANSFER REQUEST - USER
POST /api/transfers/create
==================================================
*/

exports.createTransferRequest = async (req, res) => {

    try {

        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User authentication required."
            });
        }

        const {
            country,
            bank,
            accountNumber,
            accountName,
            currency,
            amount,
            description,
            transactionPin,
            reference
        } = req.body;

        if (!country || !bank || !accountNumber || !accountName) {
            return res.status(400).json({
                success: false,
                message: "Complete all recipient account details."
            });
        }

        if (
            amount === undefined ||
            amount === null ||
            !Number.isFinite(Number(amount)) ||
            Number(amount) <= 0 ||
            Math.round(Number(amount) * 100) !== Number(amount) * 100
        ) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid transfer amount."
            });
        }

        if (!transactionPin) {
            return res.status(400).json({
                success: false,
                message: "Transaction PIN is required."
            });
        }

        if (!reference) {
            return res.status(400).json({
                success: false,
                message: "Transfer reference is required."
            });
        }

        const transferAmount = Number(amount);

        // Transfer fee: 15%.
        const calculatedFee = Number(
            (transferAmount * 0.15).toFixed(2)
        );

        const totalAmount = Number(
            (transferAmount + calculatedFee).toFixed(2)
        );

        // Get user.
        const [users] = await pool.query(
            `SELECT
                id,
                full_name,
                balance,
                transaction_pin
             FROM users
             WHERE id = ?
             LIMIT 1`,
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User account not found."
            });
        }

        const user = users[0];

        // Verify PIN.
        const storedPin = user.transaction_pin;

        if (!storedPin) {
            return res.status(400).json({
                success: false,
                message: "Transaction PIN has not been set for this account."
            });
        }

        const enteredPin = String(transactionPin);

        if (!/^\d{4}$/.test(enteredPin)) {
            return res.status(400).json({
                success: false,
                message: "Transaction PIN must contain exactly 4 digits."
            });
        }

        let pinMatches = false;

        if (
            typeof storedPin === "string" &&
            storedPin.startsWith("$2")
        ) {
            pinMatches = await bcrypt.compare(
                enteredPin,
                storedPin
            );
        } else {
            // Legacy plaintext PIN compatibility.
            pinMatches = enteredPin === String(storedPin);
        }

        if (!pinMatches) {
            return res.status(400).json({
                success: false,
                message: "Invalid transaction PIN."
            });
        }

        // Check balance.
        if (Number(user.balance || 0) < totalAmount) {
            return res.status(400).json({
                success: false,
                message: "Insufficient account balance for the transfer amount and fee."
            });
        }

        // Check duplicate reference.
        const [existingTransfers] = await pool.query(
            `SELECT id
             FROM transfers
             WHERE reference = ?
             LIMIT 1`,
            [reference]
        );

        if (existingTransfers.length > 0) {
            return res.status(409).json({
                success: false,
                message: "A transfer with this reference already exists."
            });
        }

        // Create pending transfer.
        // No balance is deducted until admin approval.
        const [result] = await pool.query(
            `INSERT INTO transfers
            (
                user_id,
                country,
                bank,
                account_number,
                account_name,
                currency,
                amount,
                fee,
                description,
                reference,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId,
                country,
                bank,
                accountNumber,
                accountName,
                currency || "USD",
                transferAmount,
                calculatedFee,
                description || "",
                reference,
                "PENDING"
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Transfer request submitted successfully and is awaiting admin approval.",
            transferId: result.insertId,
            reference,
            status: "PENDING",
            amount: transferAmount,
            fee: calculatedFee,
            total: totalAmount
        });

    } catch (error) {

        console.error("CREATE TRANSFER ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Server error while creating transfer."
        });
    }
};


/*
==================================================
GET USER'S OWN TRANSFERS
GET /api/transfers/my
==================================================
*/

exports.getUserTransfers = async (req, res) => {

    try {

        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User authentication required."
            });
        }

        const [transfers] = await pool.query(
            `SELECT
                id,
                country,
                bank,
                account_number,
                account_name,
                currency,
                amount,
                fee,
                description,
                reference,
                status,
                admin_note,
                approved_by,
                approved_at,
                created_at
             FROM transfers
             WHERE user_id = ?
             ORDER BY created_at DESC`,
            [userId]
        );

        return res.status(200).json({
            success: true,
            count: transfers.length,
            transfers
        });

    } catch (error) {

        console.error("GET USER TRANSFERS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to retrieve transfers."
        });
    }
};


/*
==================================================
GET PENDING TRANSFERS - ADMIN
GET /api/admin/transfers/pending
==================================================
*/

exports.getPendingTransfers = async (req, res) => {

    try {

        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: "Administrator authentication required."
            });
        }

        const [transfers] = await pool.query(
            `SELECT
                transfers.id,
                transfers.user_id,
                transfers.country,
                transfers.bank,
                transfers.account_number,
                transfers.account_name,
                transfers.currency,
                transfers.amount,
                transfers.fee,
                transfers.description,
                transfers.reference,
                transfers.status,
                transfers.admin_note,
                transfers.approved_by,
                transfers.approved_at,
                transfers.created_at,
                users.full_name,
                users.email,
                users.phone,
                users.account_number AS sender_account_number
             FROM transfers
             INNER JOIN users
                ON users.id = transfers.user_id
             WHERE transfers.status = 'PENDING'
             ORDER BY transfers.created_at DESC`
        );

        return res.status(200).json({
            success: true,
            count: transfers.length,
            transfers
        });

    } catch (error) {

        console.error("GET PENDING TRANSFERS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to retrieve pending transfers."
        });
    }
};


/*
==================================================
APPROVE TRANSFER - ADMIN
PUT /api/admin/transfers/:id/approve
==================================================
*/

exports.approveTransfer = async (req, res) => {

    let connection;
    let transactionStarted = false;

    try {

        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: "Administrator authentication required."
            });
        }

        const id = Number(req.params.id);

        if (!Number.isSafeInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid transfer ID."
            });
        }

        const adminId = req.admin.id;

        connection = await pool.getConnection();

        await connection.beginTransaction();
        transactionStarted = true;

        /*
        ==========================================
        LOCK TRANSFER
        ==========================================
        */

        const [transfers] = await connection.query(
            `SELECT *
             FROM transfers
             WHERE id = ?
             LIMIT 1
             FOR UPDATE`,
            [id]
        );

        if (transfers.length === 0) {
            await connection.rollback();
            transactionStarted = false;

            return res.status(404).json({
                success: false,
                message: "Transfer not found."
            });
        }

        const transfer = transfers[0];

        if (
            String(transfer.status).toUpperCase() !== "PENDING"
        ) {
            await connection.rollback();
            transactionStarted = false;

            return res.status(400).json({
                success: false,
                message: `Transfer is already ${transfer.status}.`
            });
        }

        /*
        ==========================================
        LOCK SENDER ACCOUNT
        ==========================================
        */

        const [users] = await connection.query(
            `SELECT
                id,
                full_name,
                email,
                account_number,
                balance
             FROM users
             WHERE id = ?
             LIMIT 1
             FOR UPDATE`,
            [transfer.user_id]
        );

        if (users.length === 0) {
            throw new Error("Sender account not found.");
        }

        const sender = users[0];

        /*
        ==========================================
        CALCULATE TRANSFER
        ==========================================
        */

        const transferAmount = Number(transfer.amount || 0);
        const transferFee = Number(transfer.fee || 0);

        if (
            !Number.isFinite(transferAmount) ||
            transferAmount <= 0 ||
            !Number.isFinite(transferFee) ||
            transferFee < 0
        ) {
            throw new Error("Invalid transfer amount or fee.");
        }

        const totalDebit = Number(
            (transferAmount + transferFee).toFixed(2)
        );

        const currentBalance = Number(sender.balance || 0);

        if (currentBalance < totalDebit) {
            await connection.rollback();
            transactionStarted = false;

            return res.status(400).json({
                success: false,
                message: "Sender has insufficient balance for the transfer amount and fee."
            });
        }

        const newBalance = Number(
            (currentBalance - totalDebit).toFixed(2)
        );

        /*
        ==========================================
        DEDUCT SENDER BALANCE
        ==========================================
        */

        await connection.query(
            `UPDATE users
             SET balance = ?
             WHERE id = ?`,
            [newBalance.toFixed(2), sender.id]
        );

        /*
        ==========================================
        INSERT SENDER TRANSACTION
        ==========================================
        */

        const [transactionResult] = await connection.query(
            `INSERT INTO transactions
            (
                user_id,
                type,
                amount,
                balance_after,
                reference,
                related_account,
                description,
                status,
                approved_by,
                approved_at
            )
            VALUES (?, 'TRANSFER_OUT', ?, ?, ?, ?, ?, 'COMPLETED', ?, CURRENT_TIMESTAMP)`,
            [
                sender.id,
                totalDebit.toFixed(2),
                newBalance.toFixed(2),
                transfer.reference,
                transfer.account_number,
                transfer.description ||
                    `Transfer to ${transfer.account_name}`,
                String(adminId)
            ]
        );

        /*
        ==========================================
        CHECK FOR INTERNAL RECIPIENT
        ==========================================

        If the recipient account exists in our own
        users table, credit that customer's account.

        External bank recipients are not credited
        through this internal database.
        ==========================================
        */

        let recipient = null;
        let recipientNewBalance = null;
        let recipientTransactionId = null;

        const [recipients] = await connection.query(
            `SELECT
                id,
                full_name,
                email,
                account_number,
                balance,
                status
             FROM users
             WHERE account_number = ?
               AND id <> ?
             LIMIT 1
             FOR UPDATE`,
            [
                transfer.account_number,
                sender.id
            ]
        );

        if (recipients.length > 0) {

            recipient = recipients[0];

            if (recipient.status !== "active") {
                throw new Error(
                    "The internal recipient account is not active."
                );
            }

            const recipientBalance = Number(
                recipient.balance || 0
            );

            recipientNewBalance = Number(
                (recipientBalance + transferAmount).toFixed(2)
            );

            // Credit recipient.
            await connection.query(
                `UPDATE users
                 SET balance = ?
                 WHERE id = ?`,
                [
                    recipientNewBalance.toFixed(2),
                    recipient.id
                ]
            );

            // Record incoming transfer.
            const [recipientTransaction] =
                await connection.query(
                    `INSERT INTO transactions
                    (
                        user_id,
                        type,
                        amount,
                        balance_after,
                        reference,
                        related_account,
                        description,
                        status,
                        approved_by,
                        approved_at
                    )
                    VALUES (?, 'TRANSFER_IN', ?, ?, ?, ?, ?, 'COMPLETED', ?, CURRENT_TIMESTAMP)`,
                    [
                        recipient.id,
                        transferAmount.toFixed(2),
                        recipientNewBalance.toFixed(2),
                        `${transfer.reference}-IN`,
                        sender.account_number,
                        `Transfer received from ${sender.full_name}`,
                        String(adminId)
                    ]
                );

            recipientTransactionId =
                recipientTransaction.insertId;
        }

        /*
        ==========================================
        UPDATE TRANSFER STATUS
        ==========================================
        */

        await connection.query(
            `UPDATE transfers
             SET
                status = 'APPROVED',
                approved_by = ?,
                approved_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [
                String(adminId),
                id
            ]
        );

        /*
        ==========================================
        COMMIT DATABASE TRANSACTION
        ==========================================
        */

        await connection.commit();
        transactionStarted = false;

        /*
        ==========================================
        SEND DEBIT EMAIL TO SENDER
        ==========================================
        */

        let debitEmailSent = false;
        let creditEmailSent = false;

        if (sender.email) {

            try {

                await sendDebitAlertEmail({
                    email: sender.email,
                    full_name: sender.full_name,
                    amount: totalDebit,
                    account_number: sender.account_number,
                    description:
                        `${transfer.description || "Bank transfer"} (Transfer amount: ${transferAmount}; Fee: ${transferFee})`,
                    reference: transfer.reference,
                    transaction_date: new Date(),
                    available_balance: newBalance,
                    currency: transfer.currency || "USD"
                });

                debitEmailSent = true;

            } catch (emailError) {

                console.error(
                    "SENDER DEBIT EMAIL ERROR:",
                    emailError
                );
            }

        } else {

            console.warn(
                "SENDER DEBIT EMAIL NOT SENT: Sender has no email address."
            );
        }

        /*
        ==========================================
        SEND CREDIT EMAIL TO INTERNAL RECIPIENT
        ==========================================
        */

        if (recipient && recipient.email) {

            try {

                await sendCreditAlertEmail({
                    email: recipient.email,
                    full_name: recipient.full_name,
                    amount: transferAmount,
                    account_number: recipient.account_number,
                    description:
                        `Transfer received from ${sender.full_name}`,
                    reference: transfer.reference,
                    transaction_date: new Date(),
                    available_balance: recipientNewBalance,
                    currency: transfer.currency || "USD"
                });

                creditEmailSent = true;

            } catch (emailError) {

                console.error(
                    "RECIPIENT CREDIT EMAIL ERROR:",
                    emailError
                );
            }

        }

        /*
        ==========================================
        SUCCESS RESPONSE
        ==========================================
        */

        return res.status(200).json({

            success: true,

            message:
                "Transfer approved successfully.",

            transferId: id,

            transactionId:
                transactionResult.insertId,

            recipientTransactionId,

            reference:
                transfer.reference,

            status:
                "APPROVED",

            amount:
                transferAmount,

            fee:
                transferFee,

            totalDebit,

            balanceAfter:
                newBalance,

            internalRecipientCredited:
                Boolean(recipient),

            recipientBalanceAfter:
                recipientNewBalance,

            emailNotifications: {
                debitEmailSent,
                creditEmailSent
            }

        });

    } catch (error) {

        if (connection && transactionStarted) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error(
                    "TRANSFER ROLLBACK ERROR:",
                    rollbackError
                );
            }
        }

        console.error(
            "APPROVE TRANSFER ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to approve transfer."
        });

    } finally {

        if (connection) {
            connection.release();
        }
    }
};


/*
==================================================
REJECT TRANSFER - ADMIN
PUT /api/admin/transfers/:id/reject
==================================================
*/

exports.rejectTransfer = async (req, res) => {

    let connection;

    try {

        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: "Administrator authentication required."
            });
        }

        const id = Number(req.params.id);
        const reason = String(req.body.reason || "").trim();

        if (!Number.isSafeInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid transfer ID."
            });
        }

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: "Rejection reason is required."
            });
        }

        connection = await pool.getConnection();

        await connection.beginTransaction();

        const [transfers] = await connection.query(
            `SELECT id, status
             FROM transfers
             WHERE id = ?
             LIMIT 1
             FOR UPDATE`,
            [id]
        );

        if (transfers.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Transfer not found."
            });
        }

        if (
            String(transfers[0].status).toUpperCase() !== "PENDING"
        ) {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: `Transfer is already ${transfers[0].status}.`
            });
        }

        await connection.query(
            `UPDATE transfers
             SET
                status = 'REJECTED',
                admin_note = ?
             WHERE id = ?`,
            [reason, id]
        );

        await connection.commit();

        return res.status(200).json({
            success: true,
            message: "Transfer rejected successfully.",
            transferId: id,
            status: "REJECTED"
        });

    } catch (error) {

        if (connection) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error(
                    "REJECT ROLLBACK ERROR:",
                    rollbackError
                );
            }
        }

        console.error("REJECT TRANSFER ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to reject transfer."
        });

    } finally {

        if (connection) {
            connection.release();
        }
    }
};


/*
==================================================
GET ALL TRANSFERS - ADMIN
GET /api/admin/transfers
==================================================
*/

exports.getAllTransfers = async (req, res) => {

    try {

        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: "Administrator authentication required."
            });
        }

        const [transfers] = await pool.query(
            `SELECT
                transfers.*,
                users.full_name,
                users.email,
                users.phone,
                users.account_number AS sender_account_number
             FROM transfers
             INNER JOIN users
                ON users.id = transfers.user_id
             ORDER BY transfers.created_at DESC`
        );

        return res.status(200).json({
            success: true,
            count: transfers.length,
            transfers
        });

    } catch (error) {

        console.error("GET ALL TRANSFERS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to retrieve transfers."
        });
    }
};
