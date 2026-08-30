"use client";
import { useCart } from "@/contexts/CartContext";
import { useRole } from "@/contexts/RoleContext";
import { useState } from "react";
import Link from "next/link";

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart();
  const { role, user } = useRole();
  const [orderStatus, setOrderStatus] = useState<"idle" | "processing" | "success">("idle");
  const [orderId, setOrderId] = useState<string | null>(null);

  if (items.length === 0 && orderStatus === "idle") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <h2 className="text-2xl font-bold">Your cart is empty</h2>
        <Link href="/" className="bg-green text-white px-6 py-2 rounded-full font-bold">
          Go Shopping
        </Link>
      </div>
    );
  }

  if (orderStatus === "success") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 bg-green-mist rounded-3xl p-12 text-center">
        <span className="text-6xl">🎉</span>
        <h2 className="text-3xl font-extrabold text-green-deep">Order Placed Successfully!</h2>
        <p className="text-ink-2">Your order ID is <span className="font-bold text-ink">{orderId}</span></p>
        <p className="text-ink-3">You will receive an update shortly.</p>
        <Link href="/" className="mt-4 bg-green text-white px-8 py-3 rounded-full font-bold shadow-md hover:bg-green-deep transition">
          Back to Home
        </Link>
      </div>
    );
  }

  const handlePayment = async () => {
    if (!user) {
      alert("Please log in to place an order.");
      window.location.href = "/login";
      return;
    }

    setOrderStatus("processing");
    try {
      const { supabase } = await import("@/lib/supabase");
      
      // 1. Create the Order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          status: "PAID",
          total_amount: cartTotal,
          final_amount: cartTotal,
          payment_method: role === "B2B" ? "SHOP_CREDIT" : "RAZORPAY",
        })
        .select()
        .single();
        
      if (orderError) throw orderError;

      // 2. Create the Order Items
      const orderItemsToInsert = items.map(item => ({
        order_id: orderData.id,
        external_product_id: item.id,
        sku: item.sku,
        name: item.name,
        price_at_purchase: role === "B2B" ? (item.wholesalePrice ?? item.retailPrice ?? 0) : (item.retailPrice ?? 0),
        quantity: item.quantity
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItemsToInsert);

      if (itemsError) throw itemsError;

      // 3. Reserve Inventory in the external system securely via Server Action
      const { reserveOrderInventory } = await import("@/app/actions");
      const inventoryItems = items.map(item => ({ sku: item.sku, quantity: item.quantity }));
      await reserveOrderInventory(orderData.id, inventoryItems);

      // Use the last segment of the UUID as a readable order ID
      setOrderId(`ORD-${orderData.id.split("-")[0].toUpperCase()}`);
      clearCart();
      setOrderStatus("success");
    } catch (err: any) {
      console.error(err);
      alert("Failed to place order: " + err.message);
      setOrderStatus("idle");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Left Column: Form & Details */}
      <div className="md:col-span-2 flex flex-col gap-8">
        <div className="bg-white border border-line rounded-3xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-6">Delivery Details</h2>
          <form className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="First Name" className="border border-line rounded-lg px-4 py-3 focus:outline-none focus:border-green transition" />
              <input type="text" placeholder="Last Name" className="border border-line rounded-lg px-4 py-3 focus:outline-none focus:border-green transition" />
            </div>
            <input type="tel" placeholder="Phone Number" className="border border-line rounded-lg px-4 py-3 focus:outline-none focus:border-green transition" />
            <textarea placeholder="Delivery Address" rows={3} className="border border-line rounded-lg px-4 py-3 focus:outline-none focus:border-green transition"></textarea>
          </form>
        </div>

        <div className="bg-white border border-line rounded-3xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-6">Payment Method</h2>
          {role === "B2B" ? (
            <div className="bg-green-soft border border-green-deep/20 rounded-xl p-4 flex items-center gap-4">
              <div className="w-6 h-6 rounded-full bg-green text-white flex items-center justify-center font-bold text-xs">✓</div>
              <div className="flex flex-col">
                <span className="font-bold">Shop Credit Wallet</span>
                <span className="text-sm text-green-ink">Available Balance: ₹50,000</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="border border-green rounded-xl p-4 flex items-center gap-4 cursor-pointer bg-green-mist/30">
                <input type="radio" checked readOnly className="accent-green" />
                <span className="font-bold">Pay via Razorpay (UPI, Cards, Wallets)</span>
              </div>
              <div className="border border-line rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:bg-cream transition">
                <input type="radio" disabled className="accent-green" />
                <span className="font-bold text-ink-3">Cash on Delivery</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Order Summary */}
      <div className="flex flex-col gap-4">
        <div className="bg-white border border-line rounded-3xl p-6 shadow-sm sticky top-24">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          <div className="flex flex-col gap-3 mb-6">
            {items.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-ink-2">{item.quantity}x {item.name}</span>
                <span className="font-bold">
                  ₹{item.quantity * (role === "B2B" ? (item.wholesalePrice ?? item.retailPrice ?? 0) : (item.retailPrice ?? 0))}
                </span>
              </div>
            ))}
          </div>
          
          <div className="border-t border-line pt-4 flex flex-col gap-2 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-ink-3">Subtotal</span>
              <span className="font-bold">₹{cartTotal}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-3">Delivery Fee</span>
              <span className="font-bold text-green-deep">FREE</span>
            </div>
            <div className="flex justify-between text-lg font-extrabold mt-2">
              <span>Total</span>
              <span>₹{cartTotal}</span>
            </div>
          </div>

          <button 
            onClick={handlePayment}
            disabled={orderStatus === "processing"}
            className={`w-full py-4 rounded-xl font-bold text-lg transition shadow-md ${orderStatus === 'processing' ? 'bg-line text-ink-3 cursor-not-allowed' : 'bg-green text-white hover:bg-green-deep'}`}
          >
            {orderStatus === "processing" ? "Processing..." : (role === "B2B" ? "Place B2B Order" : "Pay & Place Order")}
          </button>
        </div>
      </div>
    </div>
  );
}
