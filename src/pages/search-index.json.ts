import { getArticles, listedArticles } from "../lib/content"
export async function GET() {
  return Response.json(
    listedArticles(await getArticles()).map(({ title, description, tags, body, url }) => ({
      title,
      description,
      tags,
      body,
      url,
    })),
  )
}
