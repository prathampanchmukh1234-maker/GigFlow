import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export async function POST(request) {
  try {
    const { title, price, forceTestCharge } = (await request.json()) || {};
    const numericPrice = Number(price);
    const shouldForceTestCharge = forceTestCharge === true || forceTestCharge === "true";

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      return json({ error: "Invalid price" }, 400);
    }

    if (numericPrice === 0 && !shouldForceTestCharge) {
      return json({ free: true }, 200);
    }

    const amount = numericPrice === 0 ? 50 : Math.round(numericPrice * 100);
    if (amount < 50) {
      return json({ error: "Amount too small. Minimum is ₹0.50." }, 400);
    }

    const origin = request.headers.get("origin");
    const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
    const forwardedHost =
      request.headers.get("x-forwarded-host") || request.headers.get("host");
    const baseUrl = origin || (forwardedHost ? `${forwardedProto}://${forwardedHost}` : null);

    if (!baseUrl) {
      return json({ error: "Unable to determine request origin." }, 400);
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
      success_url: `${baseUrl}/payment-success`,
      cancel_url: `${baseUrl}/payment`,
    });

    return json({ id: session.id, url: session.url }, 200);
  } catch (err) {
    const message = err?.raw?.message || err?.message || "Stripe session failed";
    return json({ error: message }, err?.statusCode || 500);
  }
}
