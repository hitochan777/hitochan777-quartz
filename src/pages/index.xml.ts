import rss from "@astrojs/rss"
import { getArticles, listedArticles } from "../lib/content"
export async function GET() {
  return rss({
    title: "Hitochan's Tech blog",
    description: "技術の学びと開発の記録。",
    site: "https://hitochan777.vercel.app",
    items: listedArticles(await getArticles()).map((article) => ({
      title: article.title,
      description: article.description,
      link: article.url,
      ...(article.date ? { pubDate: new Date(article.date) } : {}),
    })),
    customData: "<language>ja-jp</language>",
  })
}
