"use client";

import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

// Replace with your actual Stripe publishable key
const stripePromise = loadStripe(
  "pk_test_51PEIVu09nVlnnHZQmddoCsZTGCMKNEmnIsuNVldXTsZna8uciswIVh9xJfBaJSqDHxWmT0ICAM4SifHDqlj400GVAPey8A"
);

const PaymentForm = () => {
  const [cardNumber, setCardNumber] = useState("4242424242424242"); // Stripe test card
  const [cardExpiry, setCardExpiry] = useState("12/34"); // Test expiry
  const [cardCvc, setCardCvc] = useState("123"); // Test CVC
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const stripe = await stripePromise;

    // Create a token using the static card details
    const { error: tokenError, token } = await stripe.createToken({
      card: {
        number: cardNumber,
        exp_month: parseInt(cardExpiry.split("/")[0]), // '12'
        exp_year: parseInt(cardExpiry.split("/")[1]), // '34'
        cvc: cardCvc,
      },
    });

    if (tokenError) {
      setError(tokenError.message);
      setLoading(false);
    } else {
      console.log("Received Stripe Token:", token);
      // Here you can send the token to your backend
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Card Number</label>
        <input
          type="text"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Expiration Date (MM/YYYY)</label>
        <input
          type="text"
          value={cardExpiry}
          onChange={(e) => setCardExpiry(e.target.value)}
          placeholder="MM/YY"
          required
        />
      </div>
      <div>
        <label>CVC</label>
        <input
          type="text"
          value={cardCvc}
          onChange={(e) => setCardCvc(e.target.value)}
          required
        />
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? "Processing..." : "Pay"}
      </button>
    </form>
  );
};

export default PaymentForm;
