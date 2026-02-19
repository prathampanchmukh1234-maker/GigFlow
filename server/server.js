require("dotenv").config();

const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");

const app = express();

// Use your Stripe Secret Key here
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Stripe server running");
});

// Create Checkout Session
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { title, price, forceTestCharge } = req.body;
    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      return res.status(400).json({ error: "Invalid price" });
    }

    const shouldForceTestCharge = forceTestCharge === true || forceTestCharge === "true";
    if (numericPrice === 0 && !shouldForceTestCharge) {
      return res.json({ free: true });
    }

    const amount = numericPrice === 0 ? 50 : Math.round(numericPrice * 100);
    if (amount < 50) {
      return res.status(400).json({ error: "Amount too small. Minimum is ₹0.50." });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: numericPrice === 0 ? `${title} (Free Gig Test Charge)` : title,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: "http://localhost:5173/payment-success",
      cancel_url: "http://localhost:5173/payment-cancel",
    });

    res.json({ id: session.id, url: session.url });
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({ error: err.raw?.message || err.message || "Stripe session failed" });
  }
});

// Start server
app.listen(4242, () => {
  console.log("Stripe server running on http://localhost:4242");
});
