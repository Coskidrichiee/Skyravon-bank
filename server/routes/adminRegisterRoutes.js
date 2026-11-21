
const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../config/db");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| ADMIN REGISTRATION
|--------------------------------------------------------------------------
| POST /api/admin/register
|
| Saves a new administrator into the admins table.
|--------------------------------------------------------------------------
*/

router.post("/register", async (req, res) => {
    try {
        const {
            full_name,
            email,
            password,
            registration_key
        } = req.body;

        // Validate required fields
        if (!full_name || !email || !password || !registration_key) {
            return res.status(400).json({
                success: false,
                message: "All registration fields are required."
            });
        }

        const cleanName = full_name.trim();
        const cleanEmail = email.trim().toLowerCase();
        const cleanKey = registration_key.trim();

        if (cleanName.length < 3) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid full name."
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 8 characters."
            });
        }

        // Verify registration key
        const authorizedKey = process.env.ADMIN_REGISTRATION_KEY;

        if (!authorizedKey || cleanKey !== authorizedKey) {
            return res.status(403).json({
                success: false,
                message: "Invalid administrator registration key."
            });
        }

        // Check whether email already exists
        const [existingAdmin] = await pool.execute(
            `SELECT id FROM admins WHERE email = ? LIMIT 1`,
            [cleanEmail]
        );

        if (existingAdmin.length > 0) {
            return res.status(409).json({
                success: false,
                message: "An administrator with this email already exists."
            });
        }

        // Encrypt password
        const passwordHash = await bcrypt.hash(password, 12);

        // Save administrator into MySQL
        const [result] = await pool.execute(
            `INSERT INTO admins
            (
                full_name,
                email,
                password_hash,
                role,
                profile_picture,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                cleanName,
                cleanEmail,
                passwordHash,
                "ADMIN",
                null,
                "ACTIVE"
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Administrator account created successfully.",
            admin: {
                id: result.insertId,
                full_name: cleanName,
                email: cleanEmail,
                role: "ADMIN",
                status: "ACTIVE"
            }
        });

    } catch (error) {
        console.error("Admin registration error:", error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "This administrator email is already registered."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Server error while creating administrator account."
        });
    }
});

module.exports = router;
