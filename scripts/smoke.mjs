import assert from "node:assert/strict"

const origin = process.env.SMOKE_ORIGIN || "http://localhost:4321"
for (const path of [
  "/",
  "/posts",
  "/search",
  "/tags",
  "/admin/index.html",
  "/admin/bridge.js",
  "/index.xml",
  "/sitemap.xml",
]) {
  const response = await fetch(origin + path)
  assert.equal(response.status, 200, path)
}
const headers = { "content-type": "application/x-tina-preview+json", "X-Tina-Prime": "1" }
const endpoint = origin + "/tina-island/article?path=posts%2Faxum-handler.md"
const response = await fetch(endpoint, { method: "POST", headers, body: "{}" })
assert.equal(response.status, 200)
const html = await response.text()
const decode = (value) =>
  value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
const match = html.match(/data-tina-form="([^"]+)"/)
assert.ok(match, "Tina query metadata is available to the editor")
const form = JSON.parse(decode(match[1]))
assert.equal(form.variables.relativePath, "posts/axum-handler.md")
form.data.article.title = "Unsaved visual-preview smoke test"
const overlay = await fetch(endpoint, {
  method: "POST",
  headers,
  body: JSON.stringify({ [form.id]: form.data }),
})
assert.equal(overlay.status, 200)
assert.ok(
  (await overlay.text()).includes("Unsaved visual-preview smoke test"),
  "The island renders unsaved overlay data",
)

const { getArticles } = await import("../src/lib/content.ts")
const articles = await getArticles({ includeDrafts: true })
const search = await (await fetch(origin + "/search-index.json")).json()
const routes = await (await fetch(origin + "/editor-routes.json")).json()
for (const entry of articles.filter((entry) => entry.draft)) {
  assert.equal((await fetch(origin + entry.url)).status, 404, entry.url)
  assert.ok(!search.some((article) => article.url === entry.url))
  assert.ok(!routes.includes(entry.relativePath))
  const preview = await fetch(
    origin + "/tina-island/article?path=" + encodeURIComponent(entry.relativePath),
    { method: "POST", headers, body: "{}" },
  )
  assert.notEqual(preview.status, 200, "Draft previews must not expose unpublished content")
}
assert.equal((await fetch(endpoint)).status, 405)
console.log("Smoke checks passed: public pages, admin, live unsaved preview, and draft exclusion.")
