"use client";
import { useEffect, useState } from "react";
import { useRole } from "@/contexts/RoleContext";
import { getMyOrders, Order } from "@/services/orders";
import OrderPipeline from "@/components/OrderPipeline";
import Link from "next/link";

export default function OrdersPage() {
  const { role } = useRole();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getMyOrders(role).then(data => {
      if (isMounted) {
        setOrders(data);
        setLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, [role]);

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-ink">My Orders</h1>
        <span className="bg-green-soft text-green-deep px-3 py-1 rounded-full text-sm font-bold">
          {role} View
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 text-ink-3 font-semibold">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-line rounded-3xl p-12 text-center flex flex-col items-center gap-4 shadow-sm">
          <span className="text-4xl">📦</span>
          <h2 className="text-xl font-bold">No orders found</h2>
          <p className="text-ink-2">You haven't placed any {role} orders yet.</p>
          <Link href="/" className="mt-2 bg-green text-white px-6 py-2 rounded-full font-bold hover:bg-green-deep transition">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white border border-line rounded-3xl p-6 shadow-sm flex flex-col gap-6">
              
              {/* Order Header */}
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 border-b border-line pb-4">
                <div>
                  <div className="text-sm text-ink-3 font-semibold">Order ID</div>
                  <div className="font-bold text-lg">{order.id}</div>
                </div>
                <div>
                  <div className="text-sm text-ink-3 font-semibold">Placed On</div>
                  <div className="font-bold">{new Date(order.date).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-ink-3 font-semibold">Total</div>
                  <div className="font-bold text-lg text-green-deep">₹{order.total}</div>
                </div>
              </div>

              {/* Items Summary */}
              <div>
                <h4 className="font-bold text-sm mb-2 text-ink-2">Items</h4>
                <div className="flex flex-col gap-1">
                  {order.items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.name}</span>
                      <span className="font-semibold">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pipeline Tracker */}
              <div className="bg-green-mist/30 rounded-2xl p-6 border border-green-soft">
                <h4 className="font-bold text-sm mb-2">Delivery Status</h4>
                <OrderPipeline currentStatus={order.status} />
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
