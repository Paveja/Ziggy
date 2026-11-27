import { test, expect } from "playwright/test";

const baseURL = process.env.BASE_URL;
test.use({ baseURL, browserName: "chromium" });
test.afterEach(async ({ page }) => {
  if (process.env.QA_VIDEO === "1") await page.waitForTimeout(1500);
});

// Explicit expectations from scripts/seed.ts:3-124, in default rating/ID order.
const cuisineCases = [
  { cuisine: "Indian", names: ["Saffron & Spice", "Tiffin Tales"] },
  { cuisine: "Italian", names: ["The Dough House", "Basil & Brick"] },
  { cuisine: "Asian", names: ["Miso Moon", "Little Wok Kitchen"] },
  { cuisine: "American", names: ["Bun Intended", "Golden Griddle"] },
  { cuisine: "Healthy", names: ["Leaf & Ladle", "Garden Table"] },
  { cuisine: "Desserts", names: ["Sugar Lane", "Cocoa Corner"] },
];
for (const entry of cuisineCases) {
  test(`D05 select ${entry.cuisine} cuisine`, async ({ page }) => {
    await page.goto("/");
    await page.getByRole("searchbox", { name: "Find your next favourite" }).fill("");
    await page.getByRole("combobox", { name: "Cuisine", exact: true }).selectOption(entry.cuisine);
    await page.getByRole("combobox", { name: "Sort by" }).selectOption("rating");
    await page.getByRole("button", { name: "Discover", exact: true }).click();
    await expect(page).toHaveURL((url) => url.searchParams.get("cuisine") === entry.cuisine && url.searchParams.get("q") === "" && url.searchParams.get("sort") === "rating");
    const region = page.getByRole("region", { name: "Restaurants", exact: true });
    await expect(region.getByRole("heading", { name: entry.cuisine, exact: true })).toBeVisible();
    await expect(region.getByText("2 restaurants found", { exact: true })).toBeVisible();
    const cards = region.getByRole("article");
    await expect(cards.getByRole("heading", { level: 2 })).toHaveText(entry.names);
    await expect(cards.getByText(entry.cuisine, { exact: true })).toHaveCount(2);
  });
}

for (const length of [79, 80]) {
  test(`D09 search length ${length} is accepted`, async ({ page }) => {
    const q = "a".repeat(length);
    await page.goto(`/?${new URLSearchParams({ q })}`);
    await expect(page.getByRole("searchbox", { name: "Find your next favourite" })).toHaveValue(q);
    await expect(page.getByRole("heading", { name: "No restaurants match your filters", exact: true })).toBeVisible();
    await expect(page.getByRole("region", { name: "Restaurants", exact: true }).getByText("0 restaurants found", { exact: true })).toBeVisible();
    await expect(page.getByRole("main").getByRole("alert")).toHaveCount(0);
  });
}

const invalidCases = [
  { title: "D10 search length 81", query: new URLSearchParams({ q: "a".repeat(81) }).toString() },
  { title: "D12 unknown cuisine", query: "cuisine=unknown" },
  { title: "D12 unknown sort", query: "sort=injection" },
  { title: "D12 repeated search parameters", query: "q=one&q=two" },
  ...["0", "-1", "1.5", "bad", "10001"].map((value) => ({ title: `D13 invalid page ${value}`, query: `page=${value}` })),
];
for (const entry of invalidCases) {
  test(`${entry.title} is rejected with reset recovery`, async ({ page }) => {
    await page.goto(`/?${entry.query}`);
    await expect(page.getByRole("heading", { name: "Check your search filters", exact: true })).toBeVisible();
    await expect(page.getByRole("main").getByRole("alert")).toHaveText("Use a search up to 80 characters, a listed cuisine, and a valid sort or page.");
    await page.getByRole("link", { name: "Reset search", exact: true }).click();
    await expect(page).toHaveURL(new URL("/", baseURL).href);
    await expect(page.getByRole("heading", { name: "Good food. A little closer.", exact: true })).toBeVisible();
    await expect(page.getByRole("searchbox", { name: "Find your next favourite" })).toHaveValue("");
    await expect(page.getByRole("combobox", { name: "Cuisine", exact: true })).toHaveValue("");
    await expect(page.getByRole("combobox", { name: "Sort by" })).toHaveValue("rating");
  });
}

test("D11 the search input limits typing to 80 characters", async ({ page }) => {
  await page.goto("/");
  const search = page.getByRole("searchbox", { name: "Find your next favourite" });
  await expect(search).toHaveAttribute("maxlength", "80");
  await search.pressSequentially("a".repeat(81));
  await expect(search).toHaveValue("a".repeat(80));
});

for (const entry of [
  { title: "whitespace-only", q: "   ", normalized: "", count: "12 restaurants found" },
  { title: "padded mixed-case", q: "  sAfFrOn  ", normalized: "sAfFrOn", count: "1 restaurant found" },
]) {
  test(`D15 normalize ${entry.title} search`, async ({ page }) => {
    await page.goto(`/?${new URLSearchParams({ q: entry.q })}`);
    await expect(page.getByRole("searchbox", { name: "Find your next favourite" })).toHaveValue(entry.normalized);
    const region = page.getByRole("region", { name: "Restaurants", exact: true });
    await expect(region.getByText(entry.count, { exact: true })).toBeVisible();
    if (entry.normalized) {
      await expect(region.getByRole("article").getByRole("heading", { level: 2 })).toHaveText(["Saffron & Spice"]);
    } else {
      await expect(region.getByRole("article")).toHaveCount(9);
    }
  });
}
