import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

export const restaurants = sqliteTable(
  "restaurants",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull().unique(),
    cuisine: text("cuisine").notNull(),
    specialty: text("specialty").notNull(),
    rating: integer("rating").notNull(),
    minutes: integer("minutes").notNull(),
    pricePaise: integer("price_paise").notNull(),
    artwork: integer("artwork").notNull(),
  },
  (table) => [index("cuisine_idx").on(table.cuisine)],
);

export function openDatabase(filename: string) {
  const sqlite = new Database(filename);
  sqlite.pragma("foreign_keys = ON");
  sqlite.pragma("busy_timeout = 5000");
  sqlite.exec(`CREATE TABLE IF NOT EXISTS restaurants (
    id TEXT PRIMARY KEY, name TEXT NOT NULL UNIQUE, cuisine TEXT NOT NULL,
    specialty TEXT NOT NULL, rating INTEGER NOT NULL CHECK(rating BETWEEN 0 AND 50),
    minutes INTEGER NOT NULL CHECK(minutes > 0),
    price_paise INTEGER NOT NULL CHECK(price_paise >= 0), artwork INTEGER NOT NULL
  ); CREATE INDEX IF NOT EXISTS cuisine_idx ON restaurants(cuisine);`);
  return { sqlite, db: drizzle(sqlite) };
}
const globalDatabase = globalThis as unknown as {
  ziggy?: ReturnType<typeof openDatabase>;
};
export function getDatabase() {
  return (globalDatabase.ziggy ??= openDatabase("ziggy.db")).db;
}
