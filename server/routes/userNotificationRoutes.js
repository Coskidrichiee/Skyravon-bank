
const express = require("express");
const router = express.Router();

// Import authenticate directly because authMiddleware exports the function directly.
const authenticate = require("../middleware/authMiddleware");

const {
    getUserActivityNotifications
} = require("../controllers/userActivityNotificationsController");

router.get(
    "/activity",
    authenticate,
    getUserActivityNotifications
);

module.exports = router;
