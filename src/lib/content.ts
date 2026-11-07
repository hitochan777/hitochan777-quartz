import { readdir, readFile } from "node:fs/promises"
import path from "node:path"
import matter from "gray-matter"
import { documentUrl, quartzSlug } from "./paths"

export interface Article {
  relativePath: string
  url: string
  title: string
  description: string
  date?: string
  tags: string[]
  draft: boolean
  body: string
}

export function parseArticle(relativePath: string, source: string): Article {
  const { data, content } = matter(source)
  const tags = Array.isArray(data.tags) ? data.tags : String(data.tags ?? "").split(",")
  const rawDate = data.created ?? data.date
  const date = rawDate ? new Date(rawDate) : undefined
  return {
    relativePath,
    url: documentUrl(relativePath),
    title: String(data.title || path.basename(relativePath, ".md")),
    description: String(
      data.description ||
        content
          .replace(/```[\s\S]*?```/g, "")
          .replace(/[#*`\[\]]/g, "")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 160),
    ),
    date: date && !Number.isNaN(date.valueOf()) ? date.toISOString() : undefined,
    tags: [...new Set(tags.map((tag: unknown) => quartzSlug(String(tag).trim())).filter(Boolean))],
    draft: data.draft === true,
    body: content,
  }
}

async function walk(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  const groups = await Promise.all(
    entries.map((entry) => {
      const name = path.join(directory, entry.name)
      return entry.isDirectory()
        ? walk(name)
        : Promise.resolve(entry.name.endsWith(".md") ? [name] : [])
    }),
  )
  return groups.flat()
}

export async function getArticles({ includeDrafts = false } = {}): Promise<Article[]> {
  const root = path.resolve("content")
  const files = await walk(root)
  const articles = await Promise.all(
    files.map(async (file) =>
      parseArticle(
        path.relative(root, file).split(path.sep).join("/"),
        await readFile(file, "utf8"),
      ),
    ),
  )
  const urls = new Set<string>()
  for (const article of articles) {
    if (urls.has(article.url)) throw new Error(`Duplicate article URL: ${article.url}`)
    urls.add(article.url)
  }
  return articles
    .filter((article) => includeDrafts || !article.draft)
    .sort(
      (a, b) => (b.date ?? "").localeCompare(a.date ?? "") || a.title.localeCompare(b.title, "ja"),
    )
}

export const listedArticles = (articles: Article[]) =>
  articles.filter((article) => article.url !== "/")
export const displayDate = (date?: string) =>
  date
    ? new Intl.DateTimeFormat("ja-JP", { dateStyle: "medium", timeZone: "Asia/Tokyo" }).format(
        new Date(date),
      )
    : undefined
