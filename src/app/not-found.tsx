import Link from "next/link";
export default function NotFound() {
  return (
    <main className="not-found">
      <p className="kicker">404</p>
      <h1>That page does not exist.</h1>
      <p>Let&apos;s get you back to Elite Coding School.</p>
      <Link className="button primary" href="/">
        Go home →
      </Link>
    </main>
  );
}
