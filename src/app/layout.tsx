import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { RoleProvider } from "@/contexts/RoleContext";
import { CartProvider } from "@/contexts/CartContext";
import CartDrawer from "@/components/CartDrawer";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "GenG (General Grocery)",
  description: "Your daily groceries, delivered in minutes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink font-sans">
        <RoleProvider>
          <CartProvider>
            <Header />
            <main className="flex-grow max-w-7xl mx-auto w-full px-4 pt-8 pb-24 md:pb-8">
              {children}
            </main>
            <Footer />
            <BottomNav />
            <CartDrawer />
          </CartProvider>
        </RoleProvider>
      </body>
    </html>
  );
}

