import Link from "next/link";
import { brand } from "@/lib/config";

export default function HomePage() {
  return (
    <main className="shell home-shell">
      <section className="brand-card">
        <div className="brand-mark">NK</div>
        <p className="eyebrow">{brand.name}</p>
        <h1>{brand.product}</h1>
        <p>A simple emergency profile linked to a permanent NFC tag.</p>
        <div className="stack">
          <Link className="button button-primary" href="/login">Manage my emergency profile</Link>
          <Link className="button button-secondary" href="/admin">Seller admin</Link>
        </div>
        <p className="fine-print">This service is not a medical device and is not medically certified. In an emergency, contact the appropriate emergency service.</p>
      </section>
    </main>
  );
}
