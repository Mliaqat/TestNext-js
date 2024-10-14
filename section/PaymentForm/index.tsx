// src/components/PaymentForm.tsx
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useState } from "react";

interface CardOption {
  id: string;
  brand: string;
  last4: string;
}

interface PaymentFormProps {
  cardOptions: CardOption[];
}

const PaymentForm: React.FC<PaymentFormProps> = ({ cardOptions }) => {
  const stripe = useStripe();
  const elements: any = useElements();
  const [selectedCard, setSelectedCard] = useState<string>("");
  const [cardNumber, setCardNumber] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [cvc, setCvc] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handlePayment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const cardElement: any = elements.getElement(CardElement);

    const { error, paymentMethod } = await stripe!.createPaymentMethod({
      type: "card",
      card: cardElement!,
    });

    if (error) {
      setError(error.message || "Payment failed.");
    } else {
      const response = await fetch("/api/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paymentMethodId: paymentMethod.id }),
      });

      const paymentResult = await response.json();
      if (paymentResult.error) {
        setError(paymentResult.error);
      } else {
        setSuccess("Payment successful!");
      }
    }
  };

  // Function to auto-fill test card details
  const fillTestCardDetails = () => {
    setCardNumber("4242 4242 4242 4242");
    setExpiryDate("12/25");
    setCvc("123");
  };

  return (
    <form onSubmit={handlePayment}>
      <h3>Select a Card</h3>
      <select
        onChange={(e) => setSelectedCard(e.target.value)}
        value={selectedCard}
      >
        <option value="">--Select a Card--</option>
        {cardOptions.map((card) => (
          <option key={card.id} value={card.id}>
            {card.brand} ending in {card.last4}
          </option>
        ))}
        <option value="test_card_visa" onClick={fillTestCardDetails}>
          Visa ending in 4242 (Test Card)
        </option>
      </select>

      <div>
        <label>
          Card Number:
          <input
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            placeholder="4242 4242 4242 4242"
            maxLength={19}
          />
        </label>
      </div>
      <div>
        <label>
          Expiration Date:
          <input
            type="text"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            placeholder="MM/YY"
            maxLength={5}
          />
        </label>
      </div>
      <div>
        <label>
          CVC:
          <input
            type="text"
            value={cvc}
            onChange={(e) => setCvc(e.target.value)}
            placeholder="123"
            maxLength={3}
          />
        </label>
      </div>

      <button type="submit" disabled={!stripe}>
        Pay
      </button>
      {error && <div>{error}</div>}
      {success && <div>{success}</div>}
    </form>
  );
};

export default PaymentForm;
