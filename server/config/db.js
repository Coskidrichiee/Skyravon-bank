
const mysql = require("mysql2/promise");
require("dotenv").config();

// Enable SSL only when an Aiven CA certificate is configured.
const sslCa = process.env.DB_SSL_CA_BASE64
    ? Buffer.from(process.env.DB_SSL_CA_BASE64, "base64").toString("utf8")
    : process.env.DB_SSL_CA;

const ssl = sslCa
    ? {
        ca: sslCa.replace(/\\n/g, "\n"),
        rejectUnauthorized: true
    }
    : undefined;

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "banking_app",
    port: Number(process.env.DB_PORT) || 3306,

    ...(ssl ? { ssl } : {}),

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const testDatabaseConnection = async () => {
    try {
        const connection = await pool.getConnection();

        console.log("==========================================");
        console.log("DATABASE CONNECTED");
        console.log("Database:", process.env.DB_NAME);
        console.log("Host:", process.env.DB_HOST);
        console.log("==========================================");

        connection.release();
        return true;

    } catch (error) {
        console.error("==========================================");
        console.error("DATABASE CONNECTION ERROR");
        console.error("Message:", error.message);
        console.error("==========================================");

        throw error;
    }
};

module.exports = pool;
module.exports.testDatabaseConnection = testDatabaseConnection;
