export interface Category {
  id: string;
  name: string;
  icon: string;
}

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

export const mockCategories: Category[] = [
  { id: "fv", name: "Fruits & Veggies", icon: "🥬" },
  { id: "dairy", name: "Dairy, Bread & Eggs", icon: "🥛" },
  { id: "staples", name: "Atta, Rice & Dal", icon: "🌾" },
  { id: "cooking", name: "Oil, Ghee & Masala", icon: "🛢️" },
  { id: "snacks", name: "Snacks & Namkeen", icon: "🍿" },
  { id: "drinks", name: "Cold Drinks", icon: "🥤" },
  { id: "instant", name: "Instant & Noodles", icon: "🍜" },
  { id: "bakery", name: "Bakery & Biscuits", icon: "🍪" },
  { id: "house", name: "Cleaning & Household", icon: "🧼" },
  { id: "personal", name: "Personal Care", icon: "🧴" },
];

const mockProducts: Product[] = [
  { id: "1", sku: "MILK-500", name: "Amul Taaza Toned Milk", unit: "500 ml", category: "dairy", cost: 22, retailPrice: 26, mrp: 26, stock: 45 },
  { id: "2", sku: "BREAD-WHT", name: "Harvest Gold White Bread", unit: "400 g", category: "bakery", cost: 30, retailPrice: 40, mrp: 40, stock: 12 },
  { id: "3", sku: "ONION-1KG", name: "Fresh Onion", unit: "1 kg", category: "fv", cost: 25, retailPrice: 35, mrp: 45, stock: 2 },
  { id: "4", sku: "MAGGI-140", name: "Maggi 2-Minute Noodles", unit: "140 g", category: "instant", cost: 24, retailPrice: 28, mrp: 28, stock: 100 },
  { id: "5", sku: "RICE-5KG", name: "India Gate Basmati Rice", unit: "5 kg", category: "staples", cost: 450, retailPrice: 520, mrp: 550, stock: 0 },
  { id: "6", sku: "COKE-750", name: "Coca Cola", unit: "750 ml", category: "drinks", cost: 32, retailPrice: 40, mrp: 40, stock: 8 },
  { id: "7", sku: "LAY-MAGIC", name: "Lays Magic Masala", unit: "50 g", category: "snacks", cost: 16, retailPrice: 20, mrp: 20, stock: 35 },
  { id: "8", sku: "SURF-1KG", name: "Surf Excel Matic", unit: "1 kg", category: "house", cost: 180, retailPrice: 220, mrp: 240, stock: 15 },
  { id: "9", sku: "EGG-6", name: "Farm Fresh Eggs", unit: "6 pcs", category: "dairy", cost: 40, retailPrice: 50, mrp: 55, stock: 22 },
  { id: "10", sku: "APPLE-K", name: "Kashmir Apples", unit: "1 kg", category: "fv", cost: 120, retailPrice: 160, mrp: 200, stock: 10 },
  { id: "11", sku: "OIL-1L", name: "Fortune Sunflower Oil", unit: "1 L", category: "cooking", cost: 130, retailPrice: 145, mrp: 160, stock: 20 },
  { id: "12", sku: "DAL-1KG", name: "Tata Sampann Toor Dal", unit: "1 kg", category: "staples", cost: 140, retailPrice: 165, mrp: 180, stock: 18 },
  { id: "13", sku: "SOAP-DOVE", name: "Dove Cream Beauty Bathing Bar", unit: "100 g", category: "personal", cost: 45, retailPrice: 55, mrp: 60, stock: 30 },
];

export async function getProducts(): Promise<Product[]> {
  return new Promise((resolve) => setTimeout(() => resolve(mockProducts), 100));
}

export async function getCategories(): Promise<Category[]> {
  return new Promise((resolve) => setTimeout(() => resolve(mockCategories), 100));
}
