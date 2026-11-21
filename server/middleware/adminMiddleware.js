const jwt = require("jsonwebtoken");
const db = require("../config/db");

const adminMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Admin authentication token is required."
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        if (!decoded.id || !decoded.email) {
            return res.status(403).json({
                success: false,
                message: "Invalid administrator credentials."
            });
        }

        const [admins] = await db.query(
            `SELECT id, full_name, email, role, status
             FROM admins
             WHERE id = ? AND LOWER(email) = LOWER(?)
             LIMIT 1`,
            [decoded.id, decoded.email]
        );

        if (!admins.length) {
            return res.status(403).json({
                success: false,
                message: "Administrator access required."
            });
        }

        const admin = admins[0];

        if (
            admin.status &&
            String(admin.status).toUpperCase() !== "ACTIVE"
        ) {
            return res.status(403).json({
                success: false,
                message: "Administrator account is disabled."
            });
        }

        req.admin = admin;
        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired admin token."
        });
    }
};

module.exports = adminMiddleware;