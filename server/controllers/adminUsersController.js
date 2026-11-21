const bcrypt = require("bcryptjs");

const pool = require("../config/db");

const {
    sendUserCreatedEmail
} = require("../utils/sendEmail");


// ======================================
// GET USERS
// ======================================

exports.getUsers = async(req,res)=>{

    try{

        const [users] = await pool.query(

            `
            SELECT 
            id,
            full_name,
            email,
            phone,
            account_number,
            balance,
            address,
            city,
            state,
            country,
            profile_picture,
            status,
            created_at

            FROM users

            ORDER BY id DESC
            `

        );

        res.json({

            success:true,

            users

        });

    }
    catch(error){

        console.log(error);

        res.status(500).json({

            success:false,

            message:"Failed to fetch users"

        });

    }

};



// ======================================
// GET SINGLE USER
// ======================================

exports.getUser = async(req,res)=>{

    try{

        const {id}=req.params;

        const [user] =
        await pool.query(

            "SELECT * FROM users WHERE id=?",
            [id]

        );

        if(user.length===0){

            return res.status(404).json({

                success:false,

                message:"User not found"

            });

        }

        res.json({

            success:true,

            user:user[0]

        });

    }
    catch(error){

        console.log(error);

        res.status(500).json({

            message:"Server error"

        });

    }

};



// ======================================
// CREATE USER
// ======================================

exports.createUser = async(req,res)=>{

    try{

        const {

            full_name,
            email,
            phone,
            password,
            balance,
            address,
            city,
            state,
            country,
            status

        }=req.body;


        // ======================================
        // REQUIRED FIELDS
        // ======================================

        if(
            !full_name ||
            !email ||
            !phone ||
            !password
        ){

            return res.status(400).json({

                success:false,

                message:"Required fields missing"

            });

        }


        // ======================================
        // CHECK EMAIL
        // ======================================

        const [emailCheck]=
        await pool.query(

            "SELECT id FROM users WHERE email=?",
            [email]

        );


        if(emailCheck.length){

            return res.status(400).json({

                success:false,

                message:"Email already exists"

            });

        }


        // ======================================
        // GENERATE ACCOUNT NUMBER
        // ======================================

        let account_number;


        while(true){

            account_number =
            Math.floor(
                1000000000 +
                Math.random()*9000000000
            ).toString();


            const [check]=
            await pool.query(

                "SELECT id FROM users WHERE account_number=?",
                [account_number]

            );


            if(check.length===0)
                break;

        }


        // ======================================
        // HASH PASSWORD
        // ======================================

        const password_hash =
        await bcrypt.hash(password,10);


        // ======================================
        // PROFILE PICTURE
        // ======================================

        let profile_picture=null;


        if(req.file){

            profile_picture =
            "/uploads/profiles/"+req.file.filename;

        }


        
        // ======================================
        // CREATE USER
        // ======================================

        const {
            transaction_pin
        } = req.body;

        // Validate transaction PIN
        if (
            !transaction_pin ||
            !/^\d{4}$/.test(String(transaction_pin))
        ) {
            return res.status(400).json({
                success: false,
                message: "Transaction PIN must contain exactly 4 digits."
            });
        }

        // Hash transaction PIN
        const transaction_pin_hash = await bcrypt.hash(
            String(transaction_pin),
            10
        );

        const [result] = await pool.query(
            `
            INSERT INTO users
            (
                full_name,
                email,
                phone,
                account_number,
                password_hash,
                balance,
                address,
                city,
                state,
                country,
                profile_picture,
                status,
                transaction_pin
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                full_name,
                email,
                phone,
                account_number,
                password_hash,
                balance || 0,
                address || "",
                city || "",
                state || "",
                country || "Nigeria",
                profile_picture,
                status || "active",
                transaction_pin_hash
            ]
        );


        // ======================================
        // SEND EMAIL ALERT
        // ======================================

        try{

            await sendUserCreatedEmail({

                email: email,

                full_name: full_name,

                account_number: account_number

            });

            console.log(
                `Account creation email sent to ${email}`
            );

        }
        catch(emailError){

            console.error(
                "User created, but email could not be sent:",
                emailError
            );

        }


        // ======================================
        // SUCCESS RESPONSE
        // ======================================

        res.status(201).json({

            success:true,

            message:
            "User created successfully. Account notification email sent.",

            id:result.insertId,

            account_number:account_number

        });


    }
    catch(error){

        console.log(error);


        res.status(500).json({

            success:false,

            message:"Server error"

        });

    }

};




 // ======================================
 // UPDATE USER
 // ======================================

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            full_name,
            email,
            phone,
            address,
            city,
            state,
            country,
            status,
            balance,
            transaction_pin
        } = req.body;

        // Check that the customer exists.
        const [existingUsers] = await pool.query(
            "SELECT id FROM users WHERE id = ?",
            [id]
        );

        if (existingUsers.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        // Validate a new transaction PIN, if provided.
        let hashedPin = null;

        if (
            transaction_pin !== undefined &&
            transaction_pin !== ""
        ) {
            if (!/^\d{4}$/.test(String(transaction_pin))) {
                return res.status(400).json({
                    success: false,
                    message: "Transaction PIN must contain exactly 4 digits."
                });
            }

            hashedPin = await bcrypt.hash(
                String(transaction_pin),
                10
            );
        }

        // Update customer details without overwriting the existing PIN.
        await pool.query(
            `
            UPDATE users SET
                full_name = ?,
                email = ?,
                phone = ?,
                address = ?,
                city = ?,
                state = ?,
                country = ?,
                status = ?,
                balance = ?,
                transaction_pin = COALESCE(?, transaction_pin)
            WHERE id = ?
            `,
            [
                full_name,
                email,
                phone,
                address || "",
                city || "",
                state || "",
                country || "Nigeria",
                status,
                balance,
                hashedPin,
                id
            ]
        );

        return res.json({
            success: true,
            message: hashedPin
                ? "Customer updated and transaction PIN changed successfully."
                : "Customer updated successfully."
        });

    } catch (error) {
        console.error("Update user error:", error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(400).json({
                success: false,
                message: "That email or phone number is already in use."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to update customer."
        });
    }
};

// ======================================
// DELETE USER
// ======================================

exports.deleteUser = async(req,res)=>{

    try{

        await pool.query(

            "DELETE FROM users WHERE id=?",

            [req.params.id]

        );


        res.json({

            success:true,

            message:"User deleted"

        });


    }
    catch(error){

        res.status(500).json({

            message:"Delete failed"

        });

    }

};



// ======================================
// BLOCK USER
// ======================================

exports.blockUser = async(req,res)=>{

    await pool.query(

        `
        UPDATE users
        SET status='blocked'
        WHERE id=?

        `,

        [req.params.id]

    );


    res.json({

        success:true,

        message:"User blocked"

    });

};



// ======================================
// UNBLOCK USER
// ======================================

exports.unblockUser = async(req,res)=>{

    await pool.query(

        `
        UPDATE users
        SET status='active'
        WHERE id=?

        `,

        [req.params.id]

    );


    res.json({

        success:true,

        message:"User activated"

    });

};