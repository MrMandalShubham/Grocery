"use client";
import { useCart } from "@/contexts/CartContext";
import { useRole } from "@/contexts/RoleContext";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { DeliveryContext } from "@/app/actions";

type Form = {
  firstName: string;
  lastName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  pincode: string;
  instructions: string;
};

const EMPTY: Form = {
  firstName: "", lastName: "", phone: "",
  line1: "", line2: "", city: "", pincode: "", instructions: "",
};

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart();
  const { role, user } = useRole();
  const [orderStatus, setOrderStatus] = useState<"idle" | "processing" | "success">("idle");
  const [orderId, setOrderId] = useState<string | null>(null);

  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<string[]>([]);

  // Where this order is going, and which shop it comes from. Both were
  // already decided when the customer picked their location; until now
  // only the shop survived.
  const [geo, setGeo] = useState<DeliveryContext>({
    locationCode: null, lat: null, lng: null,
  });

  useEffect(() => {
    let alive = true;
    import("@/app/actions")
      .then(({ getDeliveryContext }) => getDeliveryContext())
      .then((ctx) => { if (alive) setGeo(ctx); })
      .catch(() => { /* validation reports it below */ });
    return () => { alive = false; };
  }, []);

  const set =
    (key: keyof Form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

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

  /**
   * Refuse at the door.
   *
   * An order without a deliverable address is refused by the logistics
   * system and has to be corrected here anyway — so catch it while the
   * customer is still on the page and can simply type it in.
   */
  function validate(): string[] {
    const e: string[] = [];

    if (!form.firstName.trim()) e.push("First name is required.");
    if (!/^\+?[0-9]{10,13}$/.test(form.phone.replace(/[\s-]/g, "")))
      e.push("Enter a valid phone number — the delivery rider will call it.");
    if (!form.line1.trim()) e.push("Flat, house or building is required.");
    if (!form.city.trim()) e.push("City is required.");
    if (!/^[0-9]{6}$/.test(form.pincode.trim())) e.push("Enter a 6-digit pincode.");

    // The one nobody can type around. Anyone who chose their location
    // before this feature existed has a shop but no pin.
    if (!geo.locationCode)
      e.push("Choose your delivery location using the pin at the top of the page.");
    else if (geo.lat === null || geo.lng === null)
      e.push("Set your delivery location on the map again so we can find your door.");

    return e;
  }

  const handlePayment = async () => {
    if (!user) {
      alert("Please log in to place an order.");
      window.location.href = "/login";
      return;
    }

    const problems = validate();
    if (problems.length) {
      setErrors(problems);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setErrors([]);
    setOrderStatus("processing");

    let createdOrderId: string | null = null;

    try {
      const { supabase } = await import("@/lib/supabase");

      // 1. Create the Order, carrying everything a delivery needs.
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          status: "PAID",
          total_amount: cartTotal,
          final_amount: cartTotal,
          payment_method: role === "B2B" ? "SHOP_CREDIT" : "RAZORPAY",

          fulfilment_location_code: geo.locationCode,

          delivery_recipient_name: `${form.firstName} ${form.lastName}`.trim(),
          delivery_phone: form.phone.replace(/[\s-]/g, ""),
          delivery_line1: form.line1.trim(),
          delivery_line2: form.line2.trim() || null,
          delivery_city: form.city.trim(),
          delivery_pincode: form.pincode.trim(),
          delivery_lat: geo.lat,
          delivery_lng: geo.lng,
          delivery_instructions: form.instructions.trim() || null,
        })
        .select()
        .single();

      if (orderError) throw orderError;
      createdOrderId = orderData.id;

      // 2. Create the Order Items, keeping the rows so each line can be
      //    matched back to the stock hold the reserve call places.
      const orderItemsToInsert = items.map(item => ({
        order_id: orderData.id,
        external_product_id: item.id,
        sku: item.sku,
        name: item.name,
        price_at_purchase: role === "B2B" ? (item.wholesalePrice ?? item.retailPrice ?? 0) : (item.retailPrice ?? 0),
        quantity: item.quantity
      }));

      const { data: itemRows, error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItemsToInsert)
        .select();

      if (itemsError) throw itemsError;

      // 3. Reserve Inventory in the external system securely via Server Action
      const { reserveOrderInventory } = await import("@/app/actions");
      const inventoryItems = items.map(item => ({ sku: item.sku, quantity: item.quantity }));
      const reservation = await reserveOrderInventory(orderData.id, inventoryItems);

      // 4. Keep the reservation ids — ALL of them.
      //
      // Inventory fills a lot-tracked line FEFO, so one line can come
      // back as several holds: 10 units as 4 from the lot expiring
      // Friday and 6 from the one expiring Monday. Keying a Map by sku
      // would silently keep the last and lose the rest, and a hold
      // nothing recorded is a hold nothing confirms and nothing tells
      // logistics about.
      //
      // Today every product has one lot so nothing splits. The code is
      // written for the day receiving books a second one.
      const holdsBySku = new Map<string, string[]>();
      for (const line of (reservation?.items ?? []) as
             { sku: string; reservation_id?: string | null }[]) {
        if (!line.reservation_id) continue;
        const ids = holdsBySku.get(line.sku) ?? [];
        ids.push(line.reservation_id);
        holdsBySku.set(line.sku, ids);
      }

      if (holdsBySku.size > 0) {
        await Promise.all(
          ((itemRows ?? []) as { id: string; sku: string }[])
            .filter((row) => holdsBySku.has(row.sku))
            .map((row) => {
              const ids = holdsBySku.get(row.sku) as string[];
              return supabase
                .from("order_items")
                .update({
                  // The first is the FEFO-soonest lot. Kept in the old
                  // single column because the logistics payload reads it.
                  reservation_id: ids[0],
                  reservation_ids: ids,
                })
                .eq("id", row.id);
            }));
      }

      // 5. Confirm the holds, so they stop expiring.
      //
      // Until this call existed every hold lapsed 30 minutes after
      // checkout, mid-delivery, and the commit that followed became a
      // stock incident with the parcel already handed over. Reported,
      // never thrown — see confirmOrderInventory.
      const allHolds = [...holdsBySku.values()].flat();
      if (allHolds.length > 0) {
        const { confirmOrderInventory } = await import("@/app/actions");
        const { failed } = await confirmOrderInventory(orderData.id, allHolds);
        const lost = new Set(failed.map((f) => f.id));

        // Stamp only the lines whose holds ALL confirmed. A line with
        // one hold still ticking is not confirmed, and leaving it
        // unstamped is what puts it in front of the reconcile sweep.
        const done = ((itemRows ?? []) as { id: string; sku: string }[])
          .filter((row) => {
            const ids = holdsBySku.get(row.sku);
            return ids?.length && ids.every((id) => !lost.has(id));
          })
          .map((row) => row.id);

        if (done.length > 0) {
          await supabase
            .from("order_items")
            .update({ reservation_confirmed_at: new Date().toISOString() })
            .in("id", done);
        }
      }

      // 6. Hand it to logistics. Never throws — see notifyLogistics.
      const { notifyLogistics } = await import("@/app/actions");
      await notifyLogistics(orderData.id);

      setOrderId(`ORD-${orderData.id.split("-")[0].toUpperCase()}`);
      clearCart();
      setOrderStatus("success");
    } catch (err: unknown) {
      console.error(err);

      // The order row may already exist while nothing is held. Mark it,
      // rather than leaving an order that says PAID and can never be
      // fulfilled.
      if (createdOrderId) {
        try {
          const { supabase } = await import("@/lib/supabase");
          await supabase.from("orders")
            .update({ status: "FAILED" })
            .eq("id", createdOrderId);
        } catch (markErr) {
          console.error("Could not mark the order FAILED", markErr);
        }
      }

      const message = err instanceof Error ? err.message : "Something went wrong.";
      setErrors([`Could not place the order: ${message}`]);
      setOrderStatus("idle");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const field =
    "border border-line rounded-lg px-4 py-3 focus:outline-none focus:border-green transition";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Left Column: Form & Details */}
      <div className="md:col-span-2 flex flex-col gap-8">
        {errors.length > 0 && (
          <div className="bg-[#fff1f0] border border-[#ffccc7] rounded-2xl p-5">
            <h3 className="font-bold text-[#a8071a] mb-2">Please check the following</h3>
            <ul className="list-disc pl-5 text-sm text-[#a8071a] flex flex-col gap-1">
              {errors.map((e) => <li key={e}>{e}</li>)}
            </ul>
          </div>
        )}

        <div className="bg-white border border-line rounded-3xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-6">Delivery Details</h2>
          <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text" name="firstName" autoComplete="given-name"
                value={form.firstName} onChange={set("firstName")}
                placeholder="First Name" className={field}
              />
              <input
                type="text" name="lastName" autoComplete="family-name"
                value={form.lastName} onChange={set("lastName")}
                placeholder="Last Name" className={field}
              />
            </div>

            <input
              type="tel" name="phone" autoComplete="tel" inputMode="tel"
              value={form.phone} onChange={set("phone")}
              placeholder="Phone Number" className={field}
            />

            <input
              type="text" name="line1" autoComplete="address-line1"
              value={form.line1} onChange={set("line1")}
              placeholder="Flat / House / Building" className={field}
            />
            <input
              type="text" name="line2" autoComplete="address-line2"
              value={form.line2} onChange={set("line2")}
              placeholder="Area / Landmark (optional)" className={field}
            />

            <div className="grid grid-cols-2 gap-4">
              <input
                type="text" name="city" autoComplete="address-level2"
                value={form.city} onChange={set("city")}
                placeholder="City" className={field}
              />
              <input
                type="text" name="pincode" autoComplete="postal-code" inputMode="numeric"
                maxLength={6}
                value={form.pincode} onChange={set("pincode")}
                placeholder="Pincode" className={field}
              />
            </div>

            <textarea
              name="instructions" rows={2}
              value={form.instructions} onChange={set("instructions")}
              placeholder="Delivery instructions (optional) — e.g. call on arrival, lift is out of service"
              className={field}
            />

            <p className="text-xs text-ink-3">
              {geo.lat !== null && geo.lng !== null ? (
                <>📍 We&apos;ll deliver to the location you pinned. Change it using the pin at the top of the page.</>
              ) : (
                <>📍 No delivery location set — please pick one using the pin at the top of the page.</>
              )}
            </p>
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
