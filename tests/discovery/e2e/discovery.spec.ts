import { test, expect, type Page } from "playwright/test";

const baseURL = process.env.BASE_URL;
test.use({ baseURL, browserName: "chromium" });
test.afterEach(async ({ page }) => {
  if (process.env.QA_VIDEO === "1") await page.waitForTimeout(1500);
});

// Expected catalogue and tie order: scripts/seed.ts:3-124; IDs break ties.
const ordered = {
  rating: ["Sugar Lane", "The Dough House", "Leaf & Ladle", "Miso Moon", "Basil & Brick", "Cocoa Corner", "Saffron & Spice", "Garden Table", "Tiffin Tales", "Little Wok Kitchen", "Bun Intended", "Golden Griddle"],
  delivery: ["Golden Griddle", "Leaf & Ladle", "Little Wok Kitchen", "Bun Intended", "Cocoa Corner", "The Dough House", "Tiffin Tales", "Garden Table", "Miso Moon", "Saffron & Spice", "Basil & Brick", "Sugar Lane"],
  price: ["Cocoa Corner", "Sugar Lane", "Tiffin Tales", "Little Wok Kitchen", "Golden Griddle", "Saffron & Spice", "Garden Table", "Bun Intended", "Leaf & Ladle", "Basil & Brick", "Miso Moon", "The Dough House"],
};
const results = (page: Page) => page.getByRole("region", { name: "Restaurants", exact: true });
const names = (page: Page) => results(page).getByRole("article").getByRole("heading", { level: 2 });
const pagination = (page: Page) => page.getByRole("navigation", { name: "Pagination" });

async function submit(page: Page, q = "", cuisine = "", sort = "rating") {
  await page.getByRole("searchbox", { name: "Find your next favourite" }).fill(q);
  await page.getByRole("combobox", { name: "Cuisine", exact: true }).selectOption(cuisine);
  await page.getByRole("combobox", { name: "Sort by" }).selectOption(sort);
  await page.getByRole("button", { name: "Discover", exact: true }).click();
  await expect(page).toHaveURL((url) => url.pathname === "/"
    && url.searchParams.get("q") === q
    && url.searchParams.get("cuisine") === cuisine
    && url.searchParams.get("sort") === sort
    && !url.searchParams.has("page"));
}

async function catalogue(page: Page) {
  await expect(results(page).getByText("12 restaurants found", { exact: true })).toBeVisible();
  await expect(names(page)).toHaveText(ordered.rating.slice(0, 9));
  await expect(page.getByRole("searchbox", { name: "Find your next favourite" })).toHaveValue("");
  await expect(page.getByRole("combobox", { name: "Cuisine", exact: true })).toHaveValue("");
  await expect(page.getByRole("combobox", { name: "Sort by" })).toHaveValue("rating");
}

async function recover(page: Page) {
  await page.getByRole("link", { name: "Explore all restaurants", exact: true }).click();
  await expect(page).toHaveURL(new URL("/", baseURL).href);
  await catalogue(page);
}

test("D01 browse both catalogue pages and return", async ({ page }) => {
  await page.goto("/");
  await catalogue(page);
  await expect(pagination(page).getByText("Page 1 of 2", { exact: true })).toBeVisible();
  await expect(pagination(page).getByRole("link", { name: "Previous", exact: true })).toHaveCount(0);
  await pagination(page).getByRole("link", { name: "Next", exact: true }).click();
  await expect(names(page)).toHaveText(ordered.rating.slice(9));
  await expect(pagination(page).getByText("Page 2 of 2", { exact: true })).toBeVisible();
  await expect(pagination(page).getByRole("link", { name: "Next", exact: true })).toHaveCount(0);
  await pagination(page).getByRole("link", { name: "Previous", exact: true }).click();
  await catalogue(page);
});

test("D02 search a mixed-case name reload and clear", async ({ page }) => {
  await page.goto("/");
  await submit(page, "sAfFrOn");
  await expect(names(page)).toHaveText(["Saffron & Spice"]);
  await expect(results(page).getByText("1 restaurant found", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("searchbox", { name: "Find your next favourite" })).toHaveValue("sAfFrOn");
  await expect(names(page)).toHaveText(["Saffron & Spice"]);
  await page.getByRole("link", { name: "Clear filters", exact: true }).click();
  await catalogue(page);
});

test("D03 search a specialty with matching cuisine and clear", async ({ page }) => {
  await page.goto("/");
  await submit(page, "pizza", "Italian");
  await expect(names(page)).toHaveText(["The Dough House"]);
  const card = results(page).getByRole("article");
  await expect(card.getByText("Italian", { exact: true })).toBeVisible();
  await expect(card.getByText("Wood-fired pizza, handmade pasta", { exact: true })).toBeVisible();
  await expect(card.getByLabel("Rated 4.8 out of 5", { exact: true })).toBeVisible();
  await expect(card.getByText("25–35 min", { exact: true })).toBeVisible();
  await expect(card.getByText("₹350 for one", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Clear filters", exact: true }).click();
  await catalogue(page);
});

test("D04 recover from a conflicting search and cuisine", async ({ page }) => {
  await page.goto("/");
  await submit(page, "pizza", "Indian");
  await expect(page.getByRole("heading", { name: "No restaurants match your filters", exact: true })).toBeVisible();
  await expect(results(page).getByText("0 restaurants found", { exact: true })).toBeVisible();
  await expect(names(page)).toHaveCount(0);
  await recover(page);
});

for (const sort of ["rating", "delivery", "price"] as const) {
  test(`D06 ${sort} sort survives pagination and reload`, async ({ page }) => {
    await page.goto("/");
    await submit(page, "", "", sort);
    await expect(names(page)).toHaveText(ordered[sort].slice(0, 9));
    await pagination(page).getByRole("link", { name: "Next", exact: true }).click();
    await expect(page).toHaveURL((url) => url.searchParams.get("page") === "2" && url.searchParams.get("sort") === sort && url.searchParams.get("q") === "" && url.searchParams.get("cuisine") === "");
    await expect(names(page)).toHaveText(ordered[sort].slice(9));
    await page.reload();
    await expect(names(page)).toHaveText(ordered[sort].slice(9));
    await expect(page.getByRole("combobox", { name: "Sort by" })).toHaveValue(sort);
    await pagination(page).getByRole("link", { name: "Previous", exact: true }).click();
    await expect(names(page)).toHaveText(ordered[sort].slice(0, 9));
    await expect(page).toHaveURL((url) => url.searchParams.get("page") === "1" && url.searchParams.get("sort") === sort);
  });
}

test("D07 submitting a new search from page two resets pagination", async ({ page }) => {
  await page.goto("/?page=2");
  await expect(pagination(page).getByText("Page 2 of 2", { exact: true })).toBeVisible();
  await submit(page, "pizza", "Italian", "price");
  await expect(names(page)).toHaveText(["The Dough House"]);
  await expect(pagination(page)).toHaveCount(0);
});

for (const q of ["%", "_"]) {
  test(`D08 literal ${q === "%" ? "percent" : "underscore"} search and recovery`, async ({ page }) => {
    await page.goto("/");
    await submit(page, q);
    await expect(page.getByRole("heading", { name: "No restaurants match your filters", exact: true })).toBeVisible();
    await expect(results(page).getByText("0 restaurants found", { exact: true })).toBeVisible();
    await expect(names(page)).toHaveCount(0);
    await recover(page);
  });
}

for (const requestedPage of [3, 10000]) {
  test(`D14 excessive valid page ${requestedPage} redirects and preserves sort`, async ({ page }) => {
    await page.goto(`/?q=&cuisine=&sort=price&page=${requestedPage}`);
    await expect(page).toHaveURL((url) => url.searchParams.get("page") === "2" && url.searchParams.get("sort") === "price" && url.searchParams.get("q") === "" && url.searchParams.get("cuisine") === "");
    await expect(names(page)).toHaveText(ordered.price.slice(9));
    await expect(pagination(page).getByText("Page 2 of 2", { exact: true })).toBeVisible();
  });
}

test("D16 unknown route recovers to restaurant discovery", async ({ page }) => {
  await page.goto("/qa-nonexistent-discovery-route");
  await expect(page.getByRole("heading", { name: "This page isn’t on the menu", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Back to restaurants", exact: true }).click();
  await expect(page).toHaveURL(new URL("/", baseURL).href);
  await catalogue(page);
});
