import assert from "node:assert/strict"
import { createHash } from "node:crypto"
import { readFile } from "node:fs/promises"
import test from "node:test"
import { getArticles } from "../src/lib/content"

const baseline = JSON.parse(
  await readFile(new URL("./content-baseline.json", import.meta.url), "utf8"),
) as { file: string; url: string; bodyHash: string; migratedBodyHash?: string; draft: boolean }[]

test("all 40 Markdown bodies and Quartz URLs survive the migration with documented list normalization", async () => {
  const articles = await getArticles({ includeDrafts: true })
  assert.equal(baseline.length, 40)
  for (const original of baseline) {
    const article = articles.find((item) => item.relativePath === original.file)
    assert.ok(article, `Missing ${original.file}`)
    assert.equal(article.url, original.url)
    assert.equal(
      createHash("sha256").update(article.body).digest("hex"),
      original.migratedBodyHash ?? original.bodyHash,
      `Body changed: ${original.file}`,
    )
  }
})

test("published collection excludes every original draft", async () => {
  const published = await getArticles()
  for (const entry of baseline)
    assert.equal(
      published.some((article) => article.relativePath === entry.file),
      !entry.draft,
    )
  assert.ok(published.every((article) => !article.draft))
})
