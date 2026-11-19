import { test, expect, type Page } from "playwright/test";

const baseURL = process.env.BASE_URL;
test.use({ baseURL });
test.afterEach(async ({ page }) => {
  if (process.env.QA_VIDEO === "1") await page.waitForTimeout(1500);
});
const region = (page: Page) => page.getByRole("region", { name: "Restaurants", exact: true });
const titles = (page: Page) => region(page).getByRole("article").getByRole("heading", { level: 2 });
async function submit(page: Page, q = "", cuisine = "", sort = "rating") {
  await page.getByRole("searchbox", { name: "Find your next favourite" }).fill(q);
  await page.getByRole("combobox", { name: "Cuisine", exact: true }).selectOption(cuisine);
  await page.getByRole("combobox", { name: "Sort by" }).selectOption(sort);
  await page.getByRole("button", { name: "Discover", exact: true }).click();
  await expect(page).toHaveURL(url => url.searchParams.get("q") === q.trim() && url.searchParams.get("cuisine") === cuisine && url.searchParams.get("sort") === sort);
}
async function empty(page: Page) {
  await expect(region(page).getByRole("article")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "No restaurants match your filters" })).toBeVisible();
  await expect(region(page).getByText("0 restaurants found", { exact: true })).toBeVisible();
}

test("D01 default catalogue and accurate card details", async ({ page }) => {
  await page.goto("/");
  await expect(region(page).getByText("12 restaurants found", { exact: true })).toBeVisible();
  await expect(titles(page)).toHaveCount(9);
  await expect(titles(page).first()).toHaveText("Sugar Lane");
  const card = region(page).getByRole("article").filter({ has: page.getByRole("heading", { name: "Sugar Lane", exact: true }) });
  await expect(card.getByText("★ 4.9", { exact: true })).toHaveAttribute("aria-label", "Rated 4.9 out of 5");
  for (const text of ["Desserts", "Small-batch cakes, sweet treats", "35–45 min", "₹180 for one"]) await expect(card.getByText(text, { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Clear filters" })).toHaveCount(0);
});

test("D02 case insensitive trimmed restaurant name", async ({ page }) => {
  await page.goto("/");
  // Trimming is applied by the server; the submitted URL may retain surrounding spaces.
  await page.getByRole("searchbox", { name: "Find your next favourite" }).fill("  sAfFrOn  ");
  await page.getByRole("combobox", { name: "Cuisine", exact: true }).selectOption("");
  await page.getByRole("combobox", { name: "Sort by" }).selectOption("rating");
  await page.getByRole("button", { name: "Discover", exact: true }).click();
  await expect(titles(page)).toHaveText(["Saffron & Spice"]);
  await expect(page.getByRole("searchbox")).toHaveValue("sAfFrOn");
  await expect(region(page).getByText("1 restaurant found", { exact: true })).toBeVisible();
});

test("D03 specialty search", async ({ page }) => {
  await page.goto("/"); await submit(page, "pizza");
  await expect(titles(page)).toHaveText(["The Dough House"]);
});
const cuisineCases = [
  ["Indian", ["Saffron & Spice", "Tiffin Tales"]],
  ["Italian", ["The Dough House", "Basil & Brick"]],
  ["Asian", ["Miso Moon", "Little Wok Kitchen"]],
  ["American", ["Bun Intended", "Golden Griddle"]],
  ["Healthy", ["Leaf & Ladle", "Garden Table"]],
  ["Desserts", ["Sugar Lane", "Cocoa Corner"]],
] as const;
for (const [cuisine, names] of cuisineCases) test(`D04 cuisine ${cuisine}`, async ({ page }) => {
  await page.goto("/"); await submit(page, "", cuisine);
  await expect(titles(page)).toHaveText([...names]);
  await expect(region(page).getByText("2 restaurants found", { exact: true })).toBeVisible();
});
for (const cuisine of ["Italian", "Indian"]) test(`D05 combined pizza and ${cuisine}`, async ({ page }) => {
  await page.goto("/"); await submit(page, "pizza", cuisine);
  if (cuisine === "Italian") await expect(titles(page)).toHaveText(["The Dough House"]);
  else await empty(page);
});
const orders = {
  rating: ["Sugar Lane", "The Dough House", "Leaf & Ladle", "Miso Moon", "Basil & Brick", "Cocoa Corner", "Saffron & Spice", "Garden Table", "Tiffin Tales"],
  delivery: ["Golden Griddle", "Leaf & Ladle", "Little Wok Kitchen", "Bun Intended", "Cocoa Corner", "The Dough House", "Tiffin Tales", "Garden Table", "Miso Moon"],
  price: ["Cocoa Corner", "Sugar Lane", "Tiffin Tales", "Little Wok Kitchen", "Golden Griddle", "Saffron & Spice", "Garden Table", "Bun Intended", "Leaf & Ladle"],
};
for (const [sort, names] of Object.entries(orders)) test(`D06 sort ${sort}`, async ({ page }) => {
  await page.goto("/"); await submit(page, "", "", sort);
  await expect(titles(page)).toHaveText(names);
});
for (const [label, q] of [["no match", "not-a-restaurant"], ["percent", "%"], ["underscore", "_"], ["apostrophe", "' OR 1=1 --"]]) test(`D07 literal search ${label} and recover`, async ({ page }) => {
  await page.goto("/"); await submit(page, q); await empty(page);
  await page.getByRole("link", { name: "Explore all restaurants" }).click();
  await expect(page).toHaveURL("/"); await expect(titles(page)).toHaveCount(9);
});
for (const length of [79, 80]) test(`D08 accepts ${length} search characters`, async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("searchbox")).toHaveAttribute("maxlength", "80");
  await submit(page, "a".repeat(length)); await empty(page);
  await expect(page.getByRole("main").getByRole("alert")).toHaveCount(0);
});
test("D09 whitespace search restores default catalogue", async ({ page }) => {
  await page.goto("/?q=%20%20%20");
  await expect(page.getByRole("searchbox")).toHaveValue("");
  await expect(titles(page)).toHaveText(orders.rating);
});
const invalid = [
  ["search81", new URLSearchParams({ q: "a".repeat(81) }).toString()],
  ["cuisine", "cuisine=unknown"], ["sort", "sort=unknown"], ["duplicate", "q=one&q=two"],
  ...["0", "-1", "1.5", "bad", "10001"].map(value => [`page${value}`, `page=${value}`]),
];
for (const [label, query] of invalid) test(`D10 rejects ${label} and resets`, async ({ page }) => {
  await page.goto(`/?${query}`);
  await expect(page.getByRole("heading", { name: "Check your search filters" })).toBeVisible();
  await expect(page.getByRole("main").getByRole("alert")).toHaveText("Use a search up to 80 characters, a listed cuisine, and a valid sort or page.");
  await page.getByRole("link", { name: "Reset search" }).click();
  await expect(titles(page)).toHaveCount(9);
});
for (const requested of [1, 2, 10000]) test(`D11 requested page ${requested}`, async ({ page }) => {
  await page.goto(`/?page=${requested}`);
  const last = requested > 1;
  await expect(titles(page)).toHaveCount(last ? 3 : 9);
  await expect(page.getByRole("navigation", { name: "Pagination" })).toContainText(`Page ${last ? 2 : 1} of 2`);
  await expect(page.getByRole("link", { name: "Previous", exact: true })).toHaveCount(last ? 1 : 0);
  await expect(page.getByRole("link", { name: "Next", exact: true })).toHaveCount(last ? 0 : 1);
  if (last) await expect(titles(page)).toHaveText(["Little Wok Kitchen", "Bun Intended", "Golden Griddle"]);
  if (requested === 10000) await expect(page).toHaveURL(url => url.searchParams.get("page") === "2");
});
test("D12 empty out of range normalizes to page one", async ({ page }) => {
  await page.goto("/?q=not-a-restaurant&page=10000");
  await expect(page).toHaveURL(url => url.searchParams.get("page") === "1" && url.searchParams.get("q") === "not-a-restaurant");
  await empty(page);
  await expect(page.getByRole("navigation", { name: "Pagination" })).toHaveCount(0);
});
