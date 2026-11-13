import { test } from "node:test";
import assert from "node:assert/strict";
import { openDatabase, restaurants } from "./database";
import {
  discoverySchema,
  listRestaurants,
  validDiscoveryPage,
} from "./restaurants";
test("discovery persists data, filters, sorts, paginates and treats search literally", () => {
  const { sqlite, db } = openDatabase(":memory:");
  try {
    db.insert(restaurants)
      .values(
        Array.from({ length: 12 }, (_, index) => ({
          id: String(index).padStart(2, "0"),
          name: `Kitchen ${index}`,
          cuisine: index < 6 ? "Indian" : "Italian",
          specialty: "Fresh curry",
          rating: 40 + (index % 10),
          minutes: 20 + index,
          pricePaise: 10000 + index * 1000,
          artwork: index,
        })),
      )
      .run();
    const defaults = discoverySchema.parse({});
    assert.equal(listRestaurants(defaults, db).total, 12);
    const outOfRange = listRestaurants({ ...defaults, page: 3 }, db);
    const correctedPage = validDiscoveryPage(3, outOfRange.pages);
    assert.equal(correctedPage, 2);
    assert.equal(
      listRestaurants({ ...defaults, page: correctedPage }, db).items.length,
      3,
    );
    assert.equal(validDiscoveryPage(999, outOfRange.pages), 2);
    assert.equal(validDiscoveryPage(1, outOfRange.pages), 1);
    assert.equal(validDiscoveryPage(3, 0), 1);
    assert.equal(listRestaurants(defaults, db).items.length, 9);
    assert.equal(listRestaurants({ ...defaults, page: 2 }, db).items.length, 3);
    assert.equal(
      listRestaurants({ ...defaults, cuisine: "Indian" }, db).total,
      6,
    );
    assert.equal(
      listRestaurants({ ...defaults, q: "KITCHEN 11" }, db).items[0]?.id,
      "11",
    );
    assert.equal(listRestaurants({ ...defaults, q: "%" }, db).total, 0);
    assert.equal(
      listRestaurants({ ...defaults, q: "' OR 1=1 --" }, db).total,
      0,
    );
    assert.equal(
      listRestaurants({ ...defaults, sort: "price" }, db).items[0]?.pricePaise,
      10000,
    );
    assert.equal(
      listRestaurants({ ...defaults, sort: "delivery" }, db).items[0]?.minutes,
      20,
    );
    assert.equal(
      listRestaurants({ ...defaults, cuisine: "Indian", q: "Kitchen 11" }, db)
        .total,
      0,
    );
    assert.equal(
      db.select().from(restaurants).limit(1).get()?.name,
      "Kitchen 0",
    );
  } finally {
    sqlite.close();
  }
});
test("invalid query inputs are rejected", () => {
  for (const input of [
    { q: "a".repeat(81) },
    { sort: "injection" },
    { cuisine: "unknown" },
    { page: 0 },
    { page: "bad" },
    { q: ["one", "two"] },
  ])
    assert.equal(discoverySchema.safeParse(input).success, false);
});
