import Link from "next/link";
import { cuisines, type DiscoveryFilters } from "@/lib/restaurants";
const control = `min-h-12 w-full rounded-control border border-border bg-card px-4
  text-foreground focus-visible:outline-2 focus-visible:outline-ring`;
export function DiscoveryFilters({ filters }: { filters: DiscoveryFilters }) {
  return (
    <form
      action="/"
      className="grid items-end gap-4 rounded-container bg-muted/50 p-4 sm:grid-cols-2 lg:grid-cols-12"
    >
      <div className="lg:col-span-4">
        <label htmlFor="q" className="mb-2 block text-sm font-medium">
          Find your next favourite
        </label>
        <input
          id="q"
          name="q"
          type="search"
          maxLength={80}
          defaultValue={filters.q}
          placeholder="Restaurant or dish…"
          className={control}
        />
      </div>
      <div className="lg:col-span-3">
        <label htmlFor="cuisine" className="mb-2 block text-sm font-medium">
          Cuisine
        </label>
        <select
          id="cuisine"
          name="cuisine"
          defaultValue={filters.cuisine}
          className={control}
        >
          <option value="">All cuisines</option>
          {cuisines.map((cuisine) => (
            <option key={cuisine}>{cuisine}</option>
          ))}
        </select>
      </div>
      <div className="lg:col-span-3">
        <label htmlFor="sort" className="mb-2 block text-sm font-medium">
          Sort by
        </label>
        <select
          id="sort"
          name="sort"
          defaultValue={filters.sort}
          className={control}
        >
          <option value="rating">Top rated</option>
          <option value="delivery">Fastest delivery</option>
          <option value="price">Price: low to high</option>
        </select>
      </div>
      <button
        className="min-h-12 rounded-control bg-primary px-6 font-semibold
          text-primary-foreground transition-opacity hover:opacity-90
          focus-visible:outline-2 focus-visible:outline-offset-2
          focus-visible:outline-ring active:scale-95 lg:col-span-2"
      >
        Discover
      </button>
      {(filters.q || filters.cuisine || filters.sort !== "rating") && (
        <Link
          href="/"
          className="inline-flex min-h-12 items-center text-sm font-medium
            text-primary underline focus-visible:outline-2
            focus-visible:outline-ring lg:col-span-12"
        >
          Clear filters
        </Link>
      )}
    </form>
  );
}
