import { defineConfig } from "tinacms"
import { documentUrl } from "../src/lib/paths"

const branch = process.env.TINA_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || "main"

export default defineConfig({
  branch,
  clientId: process.env.PUBLIC_TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  build: { outputFolder: "admin", publicFolder: "public" },
  media: { tina: { mediaRoot: "uploads", publicFolder: "public" } },
  schema: {
    collections: [
      {
        name: "article",
        label: "Articles and notes",
        path: "content",
        format: "md",
        ui: {
          // Only preview routes that exist in this deployment. Drafts and new
          // documents use the full-page form until their first published build.
          router: async ({ document }) => {
            try {
              const response = await fetch("/editor-routes.json", { cache: "no-store" })
              if (!response.ok) return undefined
              const paths: string[] = await response.json()
              return paths.includes(document._sys.relativePath)
                ? documentUrl(document._sys.relativePath)
                : undefined
            } catch {
              return undefined
            }
          },
        },
        fields: [
          { type: "string", name: "title", label: "Title" },
          {
            type: "string",
            name: "description",
            label: "Description",
            ui: { component: "textarea" },
          },
          { type: "datetime", name: "date", label: "Publication date" },
          { type: "datetime", name: "created", label: "Created" },
          { type: "datetime", name: "modified", label: "Modified" },
          { type: "string", name: "tags", label: "Tags", list: true },
          { type: "boolean", name: "draft", label: "Draft" },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
            parser: { type: "markdown" },
          },
        ],
      },
    ],
  },
})
