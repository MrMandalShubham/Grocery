export interface Product {
  id: string;
  sku: string;
  name: string;
  unit: string;
  category: string;
  cost: number;
  retailPrice: number;
  mrp: number;
  stock: number;
}

const mockProducts: Product[] = [
  { id: "1", sku: "MILK-500", name: "Amul Taaza Toned Milk", unit: "500 ml", category: "Dairy", cost: 22, retailPrice: 26, mrp: 26, stock: 45 },
  { id: "2", sku: "BREAD-WHT", name: "Harvest Gold White Bread", unit: "400 g", category: "Bakery", cost: 30, retailPrice: 40, mrp: 40, stock: 12 },
  { id: "3", sku: "ONION-1KG", name: "Fresh Onion", unit: "1 kg", category: "Vegetables", cost: 25, retailPrice: 35, mrp: 45, stock: 2 },
  { id: "4", sku: "MAGGI-140", name: "Maggi 2-Minute Noodles", unit: "140 g", category: "Snacks", cost: 24, retailPrice: 28, mrp: 28, stock: 100 },
  { id: "5", sku: "RICE-5KG", name: "India Gate Basmati Rice", unit: "5 kg", category: "Staples", cost: 450, retailPrice: 520, mrp: 550, stock: 0 },
  { id: "6", sku: "COKE-750", name: "Coca Cola", unit: "750 ml", category: "Beverages", cost: 32, retailPrice: 40, mrp: 40, stock: 8 },
];

export async function getProducts(): Promise<Product[]> {
  // Simulate network delay
  return new Promise((resolve) => setTimeout(() => resolve(mockProducts), 300));
}
