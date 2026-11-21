const db = require("../config/db");

const customerMiddleware = async (req, res, next) => {
    try {
        const [users] = await db.query(
            `SELECT id, full_name, email, status
             FROM users
             WHERE id = ? AND LOWER(email) = LOWER(?)
             LIMIT 1`,
            [req.user.id, req.user.email]
        );

        if (!users.length) {
            return res.status(403).json({
                success: false,
                message: "Customer account not found."
            });
        }

        const customer = users[0];

        if (
            customer.status &&
            String(customer.status).toUpperCase() !== "ACTIVE"
        ) {
            return res.status(403).json({
                success: false,
                message: "Your account is not active."
            });
        }

        req.customer = customer;
        next();

    } catch (error) {
        console.error("CUSTOMER AUTHORIZATION ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to verify customer account."
        });
    }
};

module.exports = customerMiddleware;