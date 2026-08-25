export type OrderStatus = "placed" | "packed" | "out_for_delivery" | "delivered";

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  date: string;
  total: number;
  status: OrderStatus;
  items: OrderItem[];
  type: "B2C" | "B2B";
}

const mockOrders: Order[] = [
  {
    id: "ORD-928374",
    date: "2026-08-25T10:30:00Z",
    total: 320,
    status: "out_for_delivery",
    type: "B2C",
    items: [
      { id: "1", name: "Amul Taaza Toned Milk", quantity: 2, price: 26 },
      { id: "2", name: "Harvest Gold White Bread", quantity: 1, price: 40 },
    ]
  },
  {
    id: "ORD-102938",
    date: "2026-08-24T14:15:00Z",
    total: 1450,
    status: "delivered",
    type: "B2B",
    items: [
      { id: "4", name: "Maggi 2-Minute Noodles", quantity: 50, price: 28 }
    ]
  },
  {
    id: "ORD-564738",
    date: "2026-08-25T15:45:00Z",
    total: 85,
    status: "placed",
    type: "B2C",
    items: [
      { id: "3", name: "Fresh Onion", quantity: 2, price: 35 }
    ]
  }
];

export async function getMyOrders(role: "B2C" | "B2B"): Promise<Order[]> {
  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // Filter mock orders based on the current role view for demonstration
      resolve(mockOrders.filter(o => o.type === role));
    }, 400);
  });
}
