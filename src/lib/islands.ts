import type { IslandRegistry } from "@tinacms/astro/experimental"
import EditableArticle from "../components/EditableArticle.astro"
import { getEditableArticle } from "./tina"
import type { ArticleQuery } from "../../tina/__generated__/types"

export const islands: IslandRegistry = {
  article: {
    fetch: async (_request, params) => {
      const relativePath = params.get("path")
      if (!relativePath || relativePath.includes("..") || !relativePath.endsWith(".md"))
        throw new Error("Invalid article path")
      const result = await getEditableArticle(relativePath)
      // The editor form can manage drafts, but the public refresh endpoint cannot disclose them.
      if (result.data.article.draft) throw new Error("Draft preview is unavailable")
      return result
    },
    component: EditableArticle,
    wrapper: { tag: "article", className: "article" },
    propsFromData: (result) => ({ data: (result as { data: ArticleQuery }).data.article }),
  },
}
