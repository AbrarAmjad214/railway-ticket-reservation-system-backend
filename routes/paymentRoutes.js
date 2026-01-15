const express = require("express");
const router = express.Router();
const {
  createCheckoutSession,
  verifySession,
} = require("../controllers/paymentController");

router.post("/create-checkout-session", createCheckoutSession);
router.get("/verify-session", verifySession);

module.exports = router;
