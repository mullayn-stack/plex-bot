import Link from "next/link";
import { sendMagicLink } from "./actions";

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : "/account";
  const sent = params.sent === "1";
  const error = typeof params.error === "string";

  return (
    <main className="shell">
      <section className="card auth-card">
        <p className="eyebrow">Nate&apos;s Krafts · Emergency NFC</p>
        <h1>Secure owner access</h1>
        {sent ? (
          <div className="notice success"><strong>Check your email.</strong><br />Tap the secure sign-in link to continue. You can close this page.</div>
        ) : (
          <>
            <p>Enter your email address. We&apos;ll send a one-time secure sign-in link, so there is no password to remember or PIN printed on your tag.</p>
            {error && <div className="notice danger">That sign-in attempt did not work. Please request a new link.</div>}
            <form action={sendMagicLink} className="form-stack">
              <input type="hidden" name="next" value={next} />
              <label>Email address<input name="email" type="email" inputMode="email" autoComplete="email" required maxLength={254} /></label>
              <button className="button button-primary" type="submit">Email me a secure sign-in link</button>
            </form>
          </>
        )}
        <Link className="text-link" href="/">Back to home</Link>
      </section>
    </main>
  );
}
