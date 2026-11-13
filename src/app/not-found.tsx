import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="mx-auto max-w-xl space-y-4 p-8">
      <h1 className="font-heading text-3xl">This page isn’t on the menu</h1>
      <Link
        href="/"
        className="inline-flex min-h-12 items-center text-primary underline"
      >
        Back to restaurants
      </Link>
    </main>
  );
}
