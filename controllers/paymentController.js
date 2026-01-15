const Stripe = require("stripe");
const dotenv = require("dotenv");
dotenv.config();

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is missing in environment variables");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = async (req, res) => {
  try {
    const { bus, from, to, date, selectedSeats, pricing } = req.body;

    if (!bus?.operator || !bus?.price || !selectedSeats?.length) {
      return res.status(400).json({ message: "Invalid booking payload" });
    }

    const lineItems = [
      {
        price_data: {
          currency: "pkr", // change to usd if Stripe account doesn't support PKR
          product_data: {
            name: `${bus.operator} (${from} → ${to})`,
            description: `Travel Date: ${date} | Seats: ${selectedSeats
              .map((s) => s.number)
              .join(", ")}`,
          },
          unit_amount: pricing.total * 100, // smallest unit
        },
        quantity: 1,
      },
    ];

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,
      metadata: {
        from,
        to,
        date,
        seats: selectedSeats.map((s) => s.number).join(", "),
        operator: bus.operator,
      },
    });

    return res.status(200).json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    console.error("Stripe error:", error);
    return res.status(500).json({
      success: false,
      message: "Stripe session creation failed",
    });
  }
};

const verifySession = async (req, res) => {
  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({ message: "Session ID is required" });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    return res.json({
      success: true,
      status: session.payment_status,
      amount: session.amount_total / 100,
      currency: session.currency,
      metadata: session.metadata,
    });
  } catch (error) {
    console.error("Stripe verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify session",
    });
  }
};

module.exports = {
  createCheckoutSession,
  verifySession,
};
