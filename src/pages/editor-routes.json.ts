import { getArticles } from "../lib/content"
export async function GET() {
  return Response.json((await getArticles()).map((article) => article.relativePath))
}
