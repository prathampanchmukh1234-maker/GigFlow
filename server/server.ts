import express from "express";
import cors from "cors";
import Stripe from "stripe";

const app = express();
const PORT = 5000;

// Put your Stripe Secret Key here
const stripe = new Stripe("process.env.STRIPE_SECRET_KEY", {
  apiVersion: "2023-10-16",
});

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Stripe server running");
});

/**
 * CREATE CHECKOUT SESSION
 */
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { title, price, forceTestCharge } = req.body;
    const numericPrice = Number(price);
    const shouldForceTestCharge = forceTestCharge === true || forceTestCharge === "true";

    console.log("Creating session for:", title, numericPrice, "forceTestCharge:", shouldForceTestCharge);

    // If price is 0 → no Stripe needed
    if (numericPrice === 0 && !shouldForceTestCharge) {
      return res.json({ free: true });
    }

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      return res.status(400).json({ error: "Invalid price" });
    }

    const amount = numericPrice === 0 ? 50 : Math.round(numericPrice * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
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

  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({ error: "Stripe failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Stripe server running at http://localhost:${PORT}`);
});
