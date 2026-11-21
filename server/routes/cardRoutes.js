
const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const customerMiddleware = require("../middleware/customerMiddleware");

const {
    getAllCards,
    assignCard,
    updateCardStatus,
    deleteCard,
    getMyCards
} = require("../controllers/cardController");


/* =========================================
   ADMIN CARD MANAGEMENT
========================================= */

// Get all customer cards
router.get(
    "/admin",
    authenticate,
    adminMiddleware,
    getAllCards
);

// Assign a card to a customer
router.post(
    "/admin",
    authenticate,
    adminMiddleware,
    assignCard
);

// Change card status
router.patch(
    "/admin/:id/status",
    authenticate,
    adminMiddleware,
    updateCardStatus
);

// Delete a card
router.delete(
    "/admin/:id",
    authenticate,
    adminMiddleware,
    deleteCard
);


/* =========================================
   CUSTOMER CARD MANAGEMENT
========================================= */

// Get cards belonging to logged-in customer
router.get(
    "/my-cards",
    authenticate,
    customerMiddleware,
    getMyCards
);

// Backward-compatible route for your previous frontend
router.get(
    "/my-card",
    authenticate,
    customerMiddleware,
    getMyCards
);


module.exports = router;
