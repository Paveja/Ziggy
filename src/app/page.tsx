import Link from "next/link";
import { redirect } from "next/navigation";
import {
  discoverySchema,
  listRestaurants,
  validDiscoveryPage,
} from "@/lib/restaurants";
import { DiscoveryFilters } from "@/components/discovery-filters";
import { RestaurantCard } from "@/components/restaurant-card";
export const dynamic = "force-dynamic";
type Params = Record<string, string | string[] | undefined>;
export default async function DiscoveryPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const parsed = discoverySchema.safeParse(await searchParams);
  if (!parsed.success)
    return (
      <main id="main" className="mx-auto max-w-7xl space-y-4 p-8">
        <h1 className="font-heading text-3xl">Check your search filters</h1>
        <p role="alert">
          Use a search up to 80 characters, a listed cuisine, and a valid sort
          or page.
        </p>
        <Link href="/" className="text-primary underline">
          Reset search
        </Link>
      </main>
    );
  const filters = parsed.data;
  const result = listRestaurants(filters);
  function pageLink(page: number) {
    const params = new URLSearchParams({
      q: filters.q,
      cuisine: filters.cuisine,
      sort: filters.sort,
      page: String(page),
    });
    return `/?${params}`;
  }
  const validPage = validDiscoveryPage(filters.page, result.pages);
  if (validPage !== filters.page) {
    redirect(pageLink(validPage));
  }
  return (
    <main
      id="main"
      className="discovery-enter mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-8 sm:py-12"
    >
      <div className="space-y-3">
        <h1 className="text-balance font-heading text-4xl font-semibold sm:text-5xl">
          Good food. A little closer.
        </h1>
        <p className="max-w-prose text-pretty text-lg text-muted-foreground">
          Discover restaurants, find a new favourite, and follow your cravings.
        </p>
      </div>
      <DiscoveryFilters key={JSON.stringify(filters)} filters={filters} />
      <section aria-label="Restaurants" className="space-y-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-heading text-2xl font-semibold">
            {filters.cuisine || "Explore restaurants"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {result.total} {result.total === 1 ? "restaurant" : "restaurants"}{" "}
            found
          </p>
        </div>
        {result.items.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {result.items.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        ) : (
          <div className="space-y-4 rounded-container border border-border bg-card p-8 text-center">
            <h3 className="font-heading text-2xl">
              {filters.q || filters.cuisine || filters.page > 1
                ? "No restaurants match your filters"
                : "Restaurants are on their way"}
            </h3>
            <p className="text-muted-foreground">
              {filters.q || filters.cuisine || filters.page > 1
                ? "Try another dish or explore all cuisines."
                : "There are no restaurants in the catalogue yet. Check back soon."}
            </p>
            <Link
              href="/"
              className="inline-flex min-h-12 items-center text-primary underline"
            >
              Explore all restaurants
            </Link>
          </div>
        )}
        {result.pages > 1 && (
          <nav
            aria-label="Pagination"
            className="flex flex-wrap items-center justify-center gap-4"
          >
            {filters.page > 1 && (
              <Link
                className="inline-flex min-h-12 items-center px-4 text-primary underline"
                href={pageLink(filters.page - 1)}
              >
                Previous
              </Link>
            )}
            <span aria-current="page">
              Page {filters.page} of {result.pages}
            </span>
            {filters.page < result.pages && (
              <Link
                className="inline-flex min-h-12 items-center px-4 text-primary underline"
                href={pageLink(filters.page + 1)}
              >
                Next
              </Link>
            )}
          </nav>
        )}
      </section>
      <p className="text-sm text-muted-foreground">
        A fictional neighbourhood, full of flavour. Restaurant listings are demo
        data; ordering is not available yet.
      </p>
    </main>
  );
}
