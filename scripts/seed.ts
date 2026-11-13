import { openDatabase, restaurants } from "../src/lib/database";
const { sqlite, db } = openDatabase("ziggy.db");
const entries = [
  [
    "saffron",
    "Saffron & Spice",
    "Indian",
    "Slow-cooked biryani, comforting curries",
    47,
    30,
    25000,
    0,
  ],
  [
    "dough",
    "The Dough House",
    "Italian",
    "Wood-fired pizza, handmade pasta",
    48,
    25,
    35000,
    1,
  ],
  [
    "wok",
    "Little Wok Kitchen",
    "Asian",
    "Noodles, dumplings, big flavours",
    46,
    20,
    22000,
    2,
  ],
  [
    "bun",
    "Bun Intended",
    "American",
    "Smash burgers, crispy fries",
    45,
    25,
    28000,
    3,
  ],
  [
    "leaf",
    "Leaf & Ladle",
    "Healthy",
    "Colourful bowls, fresh salads",
    48,
    20,
    30000,
    4,
  ],
  [
    "sugar",
    "Sugar Lane",
    "Desserts",
    "Small-batch cakes, sweet treats",
    49,
    35,
    18000,
    5,
  ],
  [
    "tiffin",
    "Tiffin Tales",
    "Indian",
    "Homestyle thalis, dal and roti",
    46,
    25,
    19000,
    6,
  ],
  [
    "basil",
    "Basil & Brick",
    "Italian",
    "Fresh pesto, rustic flatbreads",
    47,
    35,
    32000,
    7,
  ],
  [
    "miso",
    "Miso Moon",
    "Asian",
    "Ramen bowls, gyoza and rice",
    48,
    30,
    34000,
    8,
  ],
  [
    "griddle",
    "Golden Griddle",
    "American",
    "Buttermilk pancakes, breakfast buns",
    44,
    20,
    24000,
    9,
  ],
  [
    "garden",
    "Garden Table",
    "Healthy",
    "Roasted vegetables, grain bowls",
    46,
    30,
    26000,
    10,
  ],
  [
    "cocoa",
    "Cocoa Corner",
    "Desserts",
    "Brownies, chocolate and cookies",
    47,
    25,
    16000,
    11,
  ],
] as const;
try {
  db.transaction((tx) => {
    for (const [
      id,
      name,
      cuisine,
      specialty,
      rating,
      minutes,
      pricePaise,
      artwork,
    ] of entries)
      tx.insert(restaurants)
        .values({
          id,
          name,
          cuisine,
          specialty,
          rating,
          minutes,
          pricePaise,
          artwork,
        })
        .onConflictDoNothing()
        .run();
  });
  console.log("Seed complete: 12 fictional restaurants available.");
} finally {
  sqlite.close();
}
