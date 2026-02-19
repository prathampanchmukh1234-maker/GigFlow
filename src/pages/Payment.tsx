import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../App";
import { supabase } from "../services/supabaseClient";

const paymentApiBaseUrl = import.meta.env.VITE_PAYMENT_API_URL || "http://localhost:4242";
const forceStripeForFreeGigs = import.meta.env.VITE_FORCE_STRIPE_FOR_FREE_GIGS === "true";

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, notify } = useApp();

  const { gig, price } = location.state || {};

  if (!gig) {
    return <div className="p-10">No payment data</div>;
  }

  const handlePay = async () => {
    try {
      if (!user) {
        navigate("/auth?mode=login");
        return;
      }

      // FREE GIG
      if (price === 0 && !forceStripeForFreeGigs) {
        const { error } = await supabase.from("orders").insert({
          gig_id: gig.id,
          client_id: user.id,
          seller_id: gig.sellerId,
          amount: 0,
          status: "PENDING",
          gig_title: gig.title
        });

        if (!error) {
          notify("Free order placed", "success");
          navigate("/orders");
        } else {
          notify("Failed to create order", "error");
        }

        return;
      }

      // PAID GIG -> STRIPE hosted checkout
      const pendingOrder = {
        id: "ord_" + Math.random().toString(36).substr(2, 9),
        clientId: user.id,
        gigId: gig.id,
        sellerId: gig.sellerId,
        status: "PENDING",
        amount: price,
        createdAt: new Date().toISOString(),
        gigTitle: gig.title,
      };
      localStorage.setItem("pendingOrder", JSON.stringify(pendingOrder));

      const response = await fetch(`${paymentApiBaseUrl}/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: gig.title,
          price,
          forceTestCharge: price === 0 && forceStripeForFreeGigs,
        }),
      });

      const session = await response.json();

      if (!response.ok) {
        throw new Error(session?.error || "Failed to create checkout session");
      }

      if (session?.free) {
        notify("Free order placed", "success");
        navigate("/orders");
        return;
      }

      if (!session?.url) {
        throw new Error("Checkout session was not created.");
      }

      window.location.assign(session.url);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Payment failed", "error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-10 rounded-2xl shadow-xl text-center">
        <h2 className="text-2xl font-bold mb-4">Payment</h2>
        <p className="mb-4">{gig.title}</p>
        <p className="text-xl font-bold mb-6">₹{price}</p>

        <button
          onClick={handlePay}
          className="px-8 py-3 bg-emerald-600 text-white rounded-xl"
        >
          Pay Now
        </button>
      </div>
    </div>
  );
}
