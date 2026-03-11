import { useAuth } from "../AuthContext";
export default function PaymentSuccess() {
  const { user } = useAuth();
  return (
    <div style={{ padding: "30px" }}>
      <h2>Payment Successful ✅</h2>
      <p>Thank you for your payment.</p>
      <p>User: {user?.email}</p>
    </div>
  );
}