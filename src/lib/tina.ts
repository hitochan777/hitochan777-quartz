import { requestWithMetadata } from "@tinacms/astro"
import client from "../../tina/__generated__/client"

export const getEditableArticle = (relativePath: string) =>
  requestWithMetadata(client.queries.article({ relativePath }), { priority: "primary" })
