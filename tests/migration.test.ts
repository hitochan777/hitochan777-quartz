import assert from "node:assert/strict"
import test from "node:test"
import { getArticles, parseArticle } from "../src/lib/content"
import { renderMarkdown } from "../src/lib/markdown"
import { documentUrl, tagUrl } from "../src/lib/paths"

test("Quartz path and tag rules retain case, Unicode, punctuation and nested folders", () => {
  assert.equal(
    documentUrl("posts/Grokking Functional Programming.md"),
    "/posts/Grokking-Functional-Programming",
  )
  assert.equal(documentUrl("OAuth2.0 (OIDC) in Tauri 2.md"), "/OAuth2.0-(OIDC)-in-Tauri-2")
  assert.equal(documentUrl("posts/Rustのtracing.md"), "/posts/Rustのtracing")
  assert.equal(documentUrl("index.md"), "/")
  assert.equal(tagUrl("c#"), "/tags/c")
  assert.equal(tagUrl("Azure"), "/tags/Azure")
})

test("missing metadata and legacy tags remain readable without invented dates", () => {
  const article = parseArticle("note.md", "---\ntags: rust, testing\n---\nHello")
  assert.equal(article.title, "note")
  assert.equal(article.date, undefined)
  assert.deepEqual(article.tags, ["rust", "testing"])
})

test("Markdown renders wiki links, GFM, math, and stable duplicate heading anchors", async () => {
  const html = await renderMarkdown(
    "[[posts]]\n\n# Heading\n\n# Heading\n\n~~done~~\n\n| A | B |\n| - | - |\n| 1 | 2 |\n\n$x^2$\n\n```rust\nlet x = 1;\n```",
  )
  assert.match(html, /href="\/posts"/)
  assert.match(html, /id="heading"/)
  assert.match(html, /id="heading-1"/)
  assert.match(html, /<del>done<\/del>/)
  assert.match(html, /<table>/)
  assert.match(html, /class="katex"/)
  assert.match(html, /language-rust/)
})

test("the public collection filters draft content", async () => {
  const all = await getArticles({ includeDrafts: true })
  const published = await getArticles()
  assert.deepEqual(
    new Set(published.map((article) => article.relativePath)),
    new Set(all.filter((article) => !article.draft).map((article) => article.relativePath)),
  )
  assert.ok(parseArticle("draft.md", "---\ndraft: true\n---\nSecret").draft)
})
