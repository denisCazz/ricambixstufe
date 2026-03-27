import type { Metadata } from "next";
import Footer from "@/components/Footer";
import CheckoutClient from "./CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout | Ricambi X Stufe",
};

export default function CheckoutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1">
        <CheckoutClient />
      </main>
      <Footer />
    </div>
  );
}
