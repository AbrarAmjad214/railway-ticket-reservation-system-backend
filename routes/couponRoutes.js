const express = require("express");
const router = express.Router();
const couponController = require("../controllers/couponController");
const { auth, adminAuth } = require("../middleware/auth");

router.post("/validate", auth, couponController.validateCoupon);

router.get("/admin/list", auth, adminAuth, couponController.getAllCoupons);
router.post("/admin", auth, adminAuth, couponController.createCoupon);
router.put("/admin/:id", auth, adminAuth, couponController.updateCoupon);
router.delete("/admin/:id", auth, adminAuth, couponController.deleteCoupon);

module.exports = router;