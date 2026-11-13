import { and, asc, count, desc, eq, sql, or } from "drizzle-orm";
import { z } from "zod";
import { getDatabase, restaurants } from "./database";

export const cuisines = [
  "Indian",
  "Italian",
  "Asian",
  "American",
  "Healthy",
  "Desserts",
] as const;
export const discoverySchema = z.object({
  q: z.string().trim().max(80).default(""),
  cuisine: z.enum(["", ...cuisines]).default(""),
  sort: z.enum(["rating", "delivery", "price"]).default("rating"),
  page: z.coerce.number().int().min(1).max(10000).default(1),
});
export type DiscoveryFilters = z.infer<typeof discoverySchema>;
export type Restaurant = typeof restaurants.$inferSelect;

export function validDiscoveryPage(requestedPage: number, totalPages: number) {
  return Math.min(requestedPage, Math.max(1, totalPages));
}
export function listRestaurants(filters: DiscoveryFilters, db = getDatabase()) {
  const where = and(
    filters.cuisine ? eq(restaurants.cuisine, filters.cuisine) : undefined,
    filters.q
      ? or(
          sql`instr(lower(${restaurants.name}), lower(${filters.q})) > 0`,
          sql`instr(lower(${restaurants.specialty}), lower(${filters.q})) > 0`,
        )
      : undefined,
  );
  const order = {
    rating: desc(restaurants.rating),
    delivery: asc(restaurants.minutes),
    price: asc(restaurants.pricePaise),
  }[filters.sort];
  const items = db
    .select()
    .from(restaurants)
    .where(where)
    .orderBy(order, asc(restaurants.id))
    .limit(9)
    .offset((filters.page - 1) * 9)
    .all();
  const total =
    db.select({ value: count() }).from(restaurants).where(where).get()?.value ??
    0;
  return { items, total, pages: Math.ceil(total / 9) };
}
