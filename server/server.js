
const express = require("express");
const cors = require("cors");
const path = require("path");

require("dotenv").config();

const {
    testDatabaseConnection
} = require("./config/db");

const authRoutes =
    require("./routes/authRoutes");

const profileRoutes =
    require("./routes/profileRoutes");

const bankRoutes =
    require("./routes/bankRoutes");

const errorHandler =
    require("./middleware/errorMiddleware");

const adminRoutes =
    require("./routes/adminRoutes");

const adminUsersRoutes =
    require("./routes/adminUsersRoutes");

const transferRoutes =
    require("./routes/transferRoutes");

const cardRoutes =
    require("./routes/cardRoutes");

const administratorsRoutes =
    require("./routes/administratorsRoutes");

const userNotificationRoutes =
    require("./routes/userNotificationRoutes");

const adminRegisterRoutes =
    require("./routes/adminRegisterRoutes");

const app = express();

const PORT = process.env.PORT || 5000;


/* =========================================
   CORS
========================================= */

const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    process.env.CLIENT_URL
].filter(Boolean);

app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests without an origin, such as Postman.
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(
                new Error("Not allowed by CORS")
            );
        },

        methods: [
            "GET",
            "POST",
            "PUT",
            "DELETE",
            "PATCH",
            "OPTIONS"
        ],

        allowedHeaders: [
            "Content-Type",
            "Authorization"
        ]
    })
);


/* =========================================
   BODY PARSING
========================================= */

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);


/* =========================================
   STATIC UPLOADS
========================================= */

app.use(
    "/uploads",
    express.static(
        path.join(__dirname, "uploads")
    )
);


/* =========================================
   API HEALTH CHECK
========================================= */

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Richiee Banking API is running",
        version: "1.0.0"
    });
});


/* =========================================
   PUBLIC AUTHENTICATION ROUTES
========================================= */

app.use(
    "/api/auth",
    authRoutes
);


/* =========================================
   PUBLIC ADMIN REGISTRATION
========================================= */

// IMPORTANT:
// Keep this BEFORE the other admin route mounts.
// Registration must be accessible without an admin JWT.

app.use(
    "/api/admin",
    adminRegisterRoutes
);


/* =========================================
   PROFILE ROUTES
========================================= */

app.use(
    "/api/profile",
    profileRoutes
);


/* =========================================
   BANK ROUTES
========================================= */

app.use(
    "/api/bank",
    bankRoutes
);


/* =========================================
   ADMIN ROUTES
========================================= */

// Keep your existing authentication protection
// inside these route files.

app.use(
    "/api/admin",
    adminRoutes
);

app.use(
    "/api/admin",
    adminUsersRoutes
);

app.use(
    "/api/admin",
    administratorsRoutes
);


/* =========================================
   TRANSFER ROUTES
========================================= */

app.use(
    "/api/transfers",
    transferRoutes
);


/* =========================================
   CARD ROUTES
========================================= */

app.use(
    "/api/cards",
    cardRoutes
);


/* =========================================
   NOTIFICATION ROUTES
========================================= */

app.use(
    "/api/notifications",
    userNotificationRoutes
);


/* =========================================
   404 HANDLER
========================================= */

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API route not found"
    });
});


/* =========================================
   GLOBAL ERROR HANDLER
========================================= */

app.use(errorHandler);


/* =========================================
   START SERVER
========================================= */

const startServer = async () => {
    try {
        await testDatabaseConnection();

       app.listen(PORT, "0.0.0.0", () => {
    console.log(`Skyravon Bank API running on port ${PORT}`);
    console.log("Admin registration route: POST /api/admin/register");
});

    } catch (error) {
        console.error(
            "Failed to start server:",
            error
        );

        process.exit(1);
    }
};

startServer();
