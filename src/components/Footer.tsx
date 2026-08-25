import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-line mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row justify-between items-center gap-4 text-ink-3 text-sm">
        <div>&copy; {new Date().getFullYear()} Grocery Platform. All rights reserved.</div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-green-deep transition">About</a>
          <a href="#" className="hover:text-green-deep transition">Customer Support</a>
          <Link href="/login" className="hover:text-green-deep transition font-semibold">Retail Login</Link>
          <Link href="/wholesale-login" className="hover:text-green-deep transition font-semibold">Shop Partner Login</Link>
        </div>
      </div>
    </footer>
  );
}
