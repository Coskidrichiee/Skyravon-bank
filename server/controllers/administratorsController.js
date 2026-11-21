
const db = require("../config/db");
const bcrypt = require("bcryptjs");

const VALID_ROLES = ["SUPER_ADMIN", "ADMIN", "MANAGER"];
const VALID_STATUSES = ["ACTIVE", "INACTIVE"];

/*
==================================================
GET ALL ADMINISTRATORS
GET /api/admin/admins
==================================================
*/

exports.getAdministrators = async (req, res) => {
    try {
        const [admins] = await db.query(`
            SELECT
                id,
                full_name,
                email,
                role,
                status,
                profile_picture,
                created_at,
                updated_at
            FROM admins
            ORDER BY created_at DESC
        `);

        return res.status(200).json({
            success: true,
            admins
        });

    } catch (error) {
        console.error("GET ADMINISTRATORS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve administrators."
        });
    }
};


/*
==================================================
CREATE ADMINISTRATOR
POST /api/admin/admins
==================================================
*/

exports.createAdministrator = async (req, res) => {
    try {
        const {
            full_name,
            email,
            password,
            role = "ADMIN",
            status = "ACTIVE"
        } = req.body;

        if (!full_name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Full name, email and password are required."
            });
        }

        const cleanName = String(full_name).trim();
        const cleanEmail = String(email).trim().toLowerCase();
        const cleanRole = String(role).toUpperCase();
        const cleanStatus = String(status).toUpperCase();

        if (!cleanName || cleanName.length > 150) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid administrator name."
            });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address."
            });
        }

        if (String(password).length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 8 characters."
            });
        }

        if (!VALID_ROLES.includes(cleanRole)) {
            return res.status(400).json({
                success: false,
                message: "Invalid administrator role."
            });
        }

        if (!VALID_STATUSES.includes(cleanStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid administrator status."
            });
        }

        const [existing] = await db.query(
            "SELECT id FROM admins WHERE email = ? LIMIT 1",
            [cleanEmail]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: "An administrator with this email already exists."
            });
        }

        const passwordHash = await bcrypt.hash(
            String(password),
            12
        );

        const [result] = await db.query(
            `INSERT INTO admins
                (full_name, email, password_hash, role, status)
             VALUES (?, ?, ?, ?, ?)`,
            [
                cleanName,
                cleanEmail,
                passwordHash,
                cleanRole,
                cleanStatus
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Administrator created successfully.",
            admin: {
                id: result.insertId,
                full_name: cleanName,
                email: cleanEmail,
                role: cleanRole,
                status: cleanStatus
            }
        });

    } catch (error) {
        console.error("CREATE ADMINISTRATOR ERROR:", error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "This email address is already registered."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to create administrator."
        });
    }
};


/*
==================================================
UPDATE ADMINISTRATOR
PUT /api/admin/admins/:id
==================================================
*/

exports.updateAdministrator = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isSafeInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid administrator ID."
            });
        }

        const {
            full_name,
            email,
            password,
            role,
            status
        } = req.body;

        const [admins] = await db.query(
            "SELECT * FROM admins WHERE id = ? LIMIT 1",
            [id]
        );

        if (!admins.length) {
            return res.status(404).json({
                success: false,
                message: "Administrator not found."
            });
        }

        const current = admins[0];

        const cleanName = full_name !== undefined
            ? String(full_name).trim()
            : current.full_name;

        const cleanEmail = email !== undefined
            ? String(email).trim().toLowerCase()
            : current.email;

        const cleanRole = role !== undefined
            ? String(role).toUpperCase()
            : current.role;

        const cleanStatus = status !== undefined
            ? String(status).toUpperCase()
            : current.status;

        if (!cleanName || cleanName.length > 150) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid administrator name."
            });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address."
            });
        }

        if (!VALID_ROLES.includes(cleanRole)) {
            return res.status(400).json({
                success: false,
                message: "Invalid administrator role."
            });
        }

        if (!VALID_STATUSES.includes(cleanStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid administrator status."
            });
        }

        if (
            password !== undefined &&
            password !== "" &&
            String(password).length < 8
        ) {
            return res.status(400).json({
                success: false,
                message: "New password must contain at least 8 characters."
            });
        }

        // Prevent a Super Admin from removing their own access.
        if (
            id === Number(req.admin.id) &&
            (
                cleanRole !== "SUPER_ADMIN" ||
                cleanStatus !== "ACTIVE"
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "You cannot remove or deactivate your own Super Admin account."
            });
        }

        // Prevent duplicate email addresses.
        const [duplicate] = await db.query(
            `SELECT id FROM admins
             WHERE email = ? AND id <> ?
             LIMIT 1`,
            [cleanEmail, id]
        );

        if (duplicate.length) {
            return res.status(409).json({
                success: false,
                message: "This email address is already in use."
            });
        }

        // Protect the last active Super Admin.
        if (
            current.role === "SUPER_ADMIN" &&
            (
                cleanRole !== "SUPER_ADMIN" ||
                cleanStatus !== "ACTIVE"
            )
        ) {
            const [count] = await db.query(
                `SELECT COUNT(*) AS total
                 FROM admins
                 WHERE role = 'SUPER_ADMIN'
                 AND status = 'ACTIVE'
                 AND id <> ?`,
                [id]
            );

            if (Number(count[0].total) === 0) {
                return res.status(400).json({
                    success: false,
                    message: "You cannot remove or deactivate the last active Super Admin."
                });
            }
        }

        let passwordHash = current.password_hash;

        if (password) {
            passwordHash = await bcrypt.hash(
                String(password),
                12
            );
        }

        await db.query(
            `UPDATE admins
             SET full_name = ?,
                 email = ?,
                 password_hash = ?,
                 role = ?,
                 status = ?
             WHERE id = ?`,
            [
                cleanName,
                cleanEmail,
                passwordHash,
                cleanRole,
                cleanStatus,
                id
            ]
        );

        return res.status(200).json({
            success: true,
            message: "Administrator updated successfully.",
            admin: {
                id,
                full_name: cleanName,
                email: cleanEmail,
                role: cleanRole,
                status: cleanStatus
            }
        });

    } catch (error) {
        console.error("UPDATE ADMINISTRATOR ERROR:", error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "This email address is already registered."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to update administrator."
        });
    }
};


/*
==================================================
DELETE ADMINISTRATOR
DELETE /api/admin/admins/:id
==================================================
*/

exports.deleteAdministrator = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isSafeInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid administrator ID."
            });
        }

        if (id === Number(req.admin.id)) {
            return res.status(400).json({
                success: false,
                message: "You cannot delete your own administrator account."
            });
        }

        const [admins] = await db.query(
            `SELECT id, role, status
             FROM admins
             WHERE id = ?
             LIMIT 1`,
            [id]
        );

        if (!admins.length) {
            return res.status(404).json({
                success: false,
                message: "Administrator not found."
            });
        }

        const target = admins[0];

        if (
            target.role === "SUPER_ADMIN" &&
            target.status === "ACTIVE"
        ) {
            const [count] = await db.query(
                `SELECT COUNT(*) AS total
                 FROM admins
                 WHERE role = 'SUPER_ADMIN'
                 AND status = 'ACTIVE'`
            );

            if (Number(count[0].total) <= 1) {
                return res.status(400).json({
                    success: false,
                    message: "You cannot delete the last active Super Admin."
                });
            }
        }

        await db.query(
            "DELETE FROM admins WHERE id = ?",
            [id]
        );

        return res.status(200).json({
            success: true,
            message: "Administrator deleted successfully."
        });

    } catch (error) {
        console.error("DELETE ADMINISTRATOR ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete administrator."
        });
    }
};
