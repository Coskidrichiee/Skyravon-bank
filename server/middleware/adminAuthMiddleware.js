
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const requireAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        const token = authHeader.split(" ")[1];

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                success: false,
                message: "JWT_SECRET is not configured."
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const [admins] = await db.query(
            `SELECT id, full_name, email, role, status
             FROM admins
             WHERE id = ?
             LIMIT 1`,
            [decoded.id]
        );

        if (!admins.length || admins[0].status !== "ACTIVE") {
            return res.status(401).json({
                success: false,
                message: "Administrator account is unavailable."
            });
        }

        req.admin = admins[0];
        next();

    } catch (error) {
        console.error("ADMIN AUTH ERROR:", error);

        return res.status(401).json({
            success: false,
            message: "Invalid or expired admin session."
        });
    }
};

const requireSuperAdmin = (req, res, next) => {
    if (!req.admin || req.admin.role !== "SUPER_ADMIN") {
        return res.status(403).json({
            success: false,
            message: "Only a Super Admin can perform this action."
        });
    }

    next();
};

module.exports = {
    requireAdmin,
    requireSuperAdmin
};
