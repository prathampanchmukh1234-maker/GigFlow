import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../App";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const { user, addOrder } = useApp();

  useEffect(() => {
    const pendingOrder = JSON.parse(localStorage.getItem("pendingOrder"));

    if (pendingOrder && user) {
      addOrder(pendingOrder);
      localStorage.removeItem("pendingOrder");
    }

    navigate("/orders");
  }, []);

  return <div>Payment Success...</div>;
}
