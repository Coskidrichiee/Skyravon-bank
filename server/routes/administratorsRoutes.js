
const express = require("express");
const router = express.Router();

const {
    getAdministrators,
    createAdministrator,
    updateAdministrator,
    deleteAdministrator
} = require("../controllers/administratorsController");

const {
    requireAdmin,
    requireSuperAdmin
} = require("../middleware/adminAuthMiddleware");

const {
    getTransferNotifications,
    markTransferNotificationAsRead,
    markAllTransferNotificationsAsRead
} = require("../controllers/adminNotificationsController");

const {
    getDashboardStats
} = require("../controllers/adminDashboardController");

const {
    getRecentTransactions,
    getDashboardPendingTransfers
} = require("../controllers/adminDashboardActivityController");


// All endpoints require a valid administrator session.
router.use(requireAdmin);

// List administrators.
router.get("/admins", getAdministrators);

// Only Super Admins can create, edit or delete accounts.
router.post("/admins", requireSuperAdmin, createAdministrator);
router.put("/admins/:id", requireSuperAdmin, updateAdministrator);
router.delete("/admins/:id", requireSuperAdmin, deleteAdministrator);
router.get(
    "/notifications/transfers",
    getTransferNotifications
);

router.post(
    "/notifications/read",
    markTransferNotificationAsRead
);

router.post(
    "/notifications/read-all",
    markAllTransferNotificationsAsRead
);

router.get("/dashboard", getDashboardStats);

router.get("/dashboard/transactions", getRecentTransactions);

router.get("/dashboard/pending-transfers", getDashboardPendingTransfers);

module.exports = router;
