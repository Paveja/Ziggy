import type { Restaurant } from "@/lib/restaurants";
import { FoodArt } from "./food-art";
const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <article className="overflow-hidden rounded-container bg-card shadow-sm ring-1 ring-border">
      <div className="aspect-video overflow-hidden">
        <FoodArt variant={restaurant.artwork} name={restaurant.name} />
      </div>
      <div className="space-y-3 p-6">
        <div className="flex items-start justify-between gap-3">
          <h2
            className="truncate font-heading text-xl font-semibold"
            title={restaurant.name}
          >
            {restaurant.name}
          </h2>
          <span
            className="shrink-0 rounded-full bg-success/10 px-2 py-1 text-sm font-semibold text-success"
            aria-label={`Rated ${restaurant.rating / 10} out of 5`}
          >
            ★ {(restaurant.rating / 10).toFixed(1)}
          </span>
        </div>
        <p className="text-sm font-medium text-primary">{restaurant.cuisine}</p>
        <p className="min-h-12 text-muted-foreground">{restaurant.specialty}</p>
        <div className="flex flex-wrap justify-between gap-2 border-t border-border pt-4 text-sm">
          <span>
            {restaurant.minutes}–{restaurant.minutes + 10} min
          </span>
          <span>{currency.format(restaurant.pricePaise / 100)} for one</span>
        </div>
      </div>
    </article>
  );
}
