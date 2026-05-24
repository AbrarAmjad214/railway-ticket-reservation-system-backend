const Coupon = require("../models/Coupon");

const calculateDiscount = (subtotal, discountPercentage) =>
  Math.round(subtotal * (discountPercentage / 100));

exports.validateCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ message: "Coupon code is required" });
    }

    const amount = Number(subtotal);
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid order amount" });
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase().trim(),
    });

    if (!coupon) {
      return res.status(404).json({ message: "Invalid coupon code" });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ message: "This coupon is no longer active" });
    }

    const discount = calculateDiscount(amount, coupon.discountPercentage);

    res.json({
      valid: true,
      code: coupon.code,
      discountPercentage: coupon.discountPercentage,
      discount,
      subtotal: amount,
      total: amount - discount,
      description: coupon.description,
    });
  } catch (error) {
    console.error("Validate coupon error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createCoupon = async (req, res) => {
  try {
    const { code, discountPercentage, description, isActive } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ message: "Coupon code is required" });
    }

    const percentage = Number(discountPercentage);
    if (!percentage || percentage < 1 || percentage > 100) {
      return res
        .status(400)
        .json({ message: "Discount must be between 1 and 100 percent" });
    }

    const normalizedCode = code.toUpperCase().trim();

    const existing = await Coupon.findOne({ code: normalizedCode });
    if (existing) {
      return res.status(400).json({ message: "Coupon code already exists" });
    }

    const coupon = await Coupon.create({
      code: normalizedCode,
      discountPercentage: percentage,
      description: description || "",
      isActive: isActive !== false,
    });

    res.status(201).json({
      message: "Coupon created successfully",
      coupon,
    });
  } catch (error) {
    console.error("Create coupon error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, discountPercentage, description, isActive } = req.body;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    if (code && code.trim()) {
      const normalizedCode = code.toUpperCase().trim();
      const duplicate = await Coupon.findOne({
        code: normalizedCode,
        _id: { $ne: id },
      });
      if (duplicate) {
        return res.status(400).json({ message: "Coupon code already exists" });
      }
      coupon.code = normalizedCode;
    }

    if (discountPercentage !== undefined) {
      const percentage = Number(discountPercentage);
      if (!percentage || percentage < 1 || percentage > 100) {
        return res
          .status(400)
          .json({ message: "Discount must be between 1 and 100 percent" });
      }
      coupon.discountPercentage = percentage;
    }

    if (description !== undefined) coupon.description = description;
    if (isActive !== undefined) coupon.isActive = isActive;

    await coupon.save();

    res.json({
      message: "Coupon updated successfully",
      coupon,
    });
  } catch (error) {
    console.error("Update coupon error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    res.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resolveCouponForPayment = async (code, subtotal) => {
  if (!code || !code.trim()) {
    return { discount: 0, coupon: null };
  }

  const coupon = await Coupon.findOne({
    code: code.toUpperCase().trim(),
  });

  if (!coupon) {
    throw new Error("Invalid coupon code");
  }

  if (!coupon.isActive) {
    throw new Error("This coupon is no longer active");
  }

  const discount = calculateDiscount(subtotal, coupon.discountPercentage);

  return {
    discount,
    coupon,
    discountPercentage: coupon.discountPercentage,
  };
};