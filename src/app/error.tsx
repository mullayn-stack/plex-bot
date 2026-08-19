"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="shell"><section className="card"><h1>Something went wrong</h1><p>We could not complete that request. No information has been changed unless you saw a confirmation.</p><button className="button button-primary" onClick={reset}>Try again</button></section></main>;
}
