"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="mx-auto max-w-xl space-y-4 p-8">
      <h1 className="font-heading text-3xl">
        We couldn’t load the restaurants
      </h1>
      <p role="alert" className="text-muted-foreground">
        Please try again in a moment.
      </p>
      <button
        onClick={reset}
        className="min-h-12 rounded-control bg-primary px-6 text-primary-foreground focus-visible:outline-2 focus-visible:outline-ring"
      >
        Try again
      </button>
    </main>
  );
}
