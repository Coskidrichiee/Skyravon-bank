
const crypto = require("crypto");
const db = require("../config/db");

const validCardTypes = ["VISA", "MASTERCARD"];

const validStatuses = [
    "ACTIVE",
    "BLOCKED",
    "FROZEN",
    "PENDING"
];


/* =========================================
   GENERATE VIRTUAL CARD REFERENCE
   This is a demo identifier, not a real PAN.
========================================= */

const generateCardNumber = () => {
    return "RB" + crypto.randomInt(
        10000000000000,
        99999999999999
    ).toString();
};


/* =========================================
   MASK CARD NUMBER
========================================= */

const maskCardNumber = (cardNumber) => {
    const value = String(cardNumber || "");
    const lastFour = value.slice(-4);

    return `•••• •••• •••• ${lastFour}`;
};


/* =========================================
   FORMAT CARD RESPONSE
========================================= */

const formatCard = (card) => ({
    id: card.id,
    user_id: card.user_id,

    customer_name:
        card.customer_name || card.card_holder,

    customer_email:
        card.customer_email || null,

    card_holder: card.card_holder,

    // Never return the full stored card reference.
    card_number: maskCardNumber(card.card_number),

    last_four: String(card.card_number || "").slice(-4),

    card_type: card.card_type,

    expiry_month: card.expiry_month,
    expiry_year: card.expiry_year,

    status: card.status,

    created_at: card.created_at
});


/* =========================================
   ADMIN: GET ALL CARDS
   GET /api/cards/admin
========================================= */

const getAllCards = async (req, res) => {
    try {
        const [cards] = await db.query(
            `SELECT
                c.id,
                c.user_id,
                c.card_number,
                c.card_holder,
                c.card_type,
                c.expiry_month,
                c.expiry_year,
                c.status,
                c.created_at,
                u.full_name AS customer_name,
                u.email AS customer_email
             FROM cards c
             INNER JOIN users u ON u.id = c.user_id
             ORDER BY c.created_at DESC`
        );

        return res.status(200).json({
            success: true,
            total: cards.length,
            cards: cards.map(formatCard)
        });

    } catch (error) {
        console.error("GET ALL CARDS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve cards."
        });
    }
};


/* =========================================
   ADMIN: ASSIGN CARD
   POST /api/cards/admin
========================================= */

const assignCard = async (req, res) => {
    try {
        const {
            user_id,
            card_type,
            expiry_month,
            expiry_year
        } = req.body;

        if (
            !user_id ||
            !card_type ||
            !expiry_month ||
            !expiry_year
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Customer, card type and expiry date are required."
            });
        }

        const customerId = Number(user_id);
        const normalizedType = String(card_type).toUpperCase();

        const month = Number(expiry_month);
        const year = Number(expiry_year);

        if (
            !Number.isSafeInteger(customerId) ||
            customerId < 1
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid customer ID."
            });
        }

        if (!validCardTypes.includes(normalizedType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid card type."
            });
        }

        const currentYear = new Date().getFullYear();

        if (
            !Number.isInteger(month) ||
            month < 1 ||
            month > 12 ||
            !Number.isInteger(year) ||
            year < currentYear ||
            year > currentYear + 20
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid future expiry date."
            });
        }

        // Check whether the customer exists.
        const [users] = await db.query(
            `SELECT id, full_name, email
             FROM users
             WHERE id = ?
             LIMIT 1`,
            [customerId]
        );

        if (!users.length) {
            return res.status(404).json({
                success: false,
                message: "Customer not found."
            });
        }

        const customer = users[0];

        let insertedId = null;
        let attempts = 0;

        // Generate a unique internal card reference.
        while (attempts < 5 && !insertedId) {
            attempts++;

            const cardNumber = generateCardNumber();

            try {
                const [result] = await db.query(
                    `INSERT INTO cards (
                        user_id,
                        card_number,
                        card_holder,
                        card_type,
                        expiry_month,
                        expiry_year,
                        status
                    )
                    VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')`,
                    [
                        customer.id,
                        cardNumber,
                        customer.full_name,
                        normalizedType,
                        month,
                        year
                    ]
                );

                insertedId = result.insertId;

            } catch (error) {
                if (
                    error.code === "ER_DUP_ENTRY" &&
                    attempts < 5
                ) {
                    continue;
                }

                throw error;
            }
        }

        if (!insertedId) {
            return res.status(500).json({
                success: false,
                message: "Unable to generate a unique card reference."
            });
        }

        const [createdCards] = await db.query(
            `SELECT
                c.id,
                c.user_id,
                c.card_number,
                c.card_holder,
                c.card_type,
                c.expiry_month,
                c.expiry_year,
                c.status,
                c.created_at,
                u.full_name AS customer_name,
                u.email AS customer_email
             FROM cards c
             INNER JOIN users u ON u.id = c.user_id
             WHERE c.id = ?
             LIMIT 1`,
            [insertedId]
        );

        return res.status(201).json({
            success: true,
            message: "Virtual card assigned successfully.",
            card: formatCard(createdCards[0])
        });

    } catch (error) {
        console.error("ASSIGN CARD ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to assign card."
        });
    }
};


/* =========================================
   ADMIN: UPDATE CARD STATUS
   PATCH /api/cards/admin/:id/status
========================================= */

const updateCardStatus = async (req, res) => {
    try {
        const cardId = Number(req.params.id);
        const status = String(
            req.body.status || ""
        ).toUpperCase();

        if (
            !Number.isSafeInteger(cardId) ||
            cardId < 1
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid card ID."
            });
        }

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid card status."
            });
        }

        const [result] = await db.query(
            `UPDATE cards
             SET status = ?
             WHERE id = ?`,
            [status, cardId]
        );

        if (!result.affectedRows) {
            return res.status(404).json({
                success: false,
                message: "Card not found."
            });
        }

        const [cards] = await db.query(
            `SELECT
                c.id,
                c.user_id,
                c.card_number,
                c.card_holder,
                c.card_type,
                c.expiry_month,
                c.expiry_year,
                c.status,
                c.created_at,
                u.full_name AS customer_name,
                u.email AS customer_email
             FROM cards c
             INNER JOIN users u ON u.id = c.user_id
             WHERE c.id = ?
             LIMIT 1`,
            [cardId]
        );

        return res.status(200).json({
            success: true,
            message: `Card status updated to ${status}.`,
            card: formatCard(cards[0])
        });

    } catch (error) {
        console.error("UPDATE CARD STATUS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update card status."
        });
    }
};


/* =========================================
   ADMIN: DELETE CARD
   DELETE /api/cards/admin/:id
========================================= */

const deleteCard = async (req, res) => {
    try {
        const cardId = Number(req.params.id);

        if (
            !Number.isSafeInteger(cardId) ||
            cardId < 1
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid card ID."
            });
        }

        const [result] = await db.query(
            `DELETE FROM cards
             WHERE id = ?`,
            [cardId]
        );

        if (!result.affectedRows) {
            return res.status(404).json({
                success: false,
                message: "Card not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Card deleted successfully."
        });

    } catch (error) {
        console.error("DELETE CARD ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to delete card."
        });
    }
};


/* =========================================
   CUSTOMER: GET OWN CARDS
   GET /api/cards/my-card
   GET /api/cards/my-cards
========================================= */

const getMyCards = async (req, res) => {
    try {
        // customerMiddleware should populate req.customer.
        const customerId = req.customer?.id;

        if (!customerId) {
            return res.status(401).json({
                success: false,
                message: "Customer authentication required."
            });
        }

        const [cards] = await db.query(
            `SELECT
                id,
                user_id,
                card_number,
                card_holder,
                card_type,
                expiry_month,
                expiry_year,
                status,
                created_at
             FROM cards
             WHERE user_id = ?
             ORDER BY created_at DESC`,
            [customerId]
        );

        return res.status(200).json({
            success: true,
            total: cards.length,
            cards: cards.map(formatCard)
        });

    } catch (error) {
        console.error("GET CUSTOMER CARDS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve your cards."
        });
    }
};


module.exports = {
    getAllCards,
    assignCard,
    updateCardStatus,
    deleteCard,
    getMyCards
};
