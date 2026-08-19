import Link from "next/link";

export default function TagNotFound() {
  return (
    <main className="shell"><section className="card"><p className="eyebrow">Nate&apos;s Krafts · Emergency NFC</p><h1>Tag not recognised</h1><p>This emergency tag URL is not valid. Check that the NFC tag or printed URL has not been damaged.</p><Link className="button button-secondary" href="/">Home</Link></section></main>
  );
}
