import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import remarkRehype from "remark-rehype"
import rehypeKatex from "rehype-katex"
import rehypeStringify from "rehype-stringify"
import { visit } from "unist-util-visit"
import GithubSlugger from "github-slugger"
import type { Root as MdRoot, Text } from "mdast"
import type { Root as HtmlRoot } from "hast"
import { documentUrl } from "./paths"

function wikiLinks() {
  return (tree: MdRoot) =>
    visit(tree, "text", (node: Text, index, parent) => {
      if (!parent || index === undefined || parent.type === "link") return
      const expression = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g
      const children: (Text | { type: "link"; url: string; children: Text[] })[] = []
      let position = 0
      for (const match of node.value.matchAll(expression)) {
        children.push({ type: "text", value: node.value.slice(position, match.index) })
        const [target, hash] = match[1].split("#")
        children.push({
          type: "link",
          url:
            documentUrl(target.replace(/\.md$/, "") + ".md") +
            (hash ? `#${new GithubSlugger().slug(hash)}` : ""),
          children: [{ type: "text", value: match[2] || target }],
        })
        position = match.index! + match[0].length
      }
      if (!position) return
      children.push({ type: "text", value: node.value.slice(position) })
      parent.children.splice(index, 1, ...children)
      return index + children.length
    })
}

function headings() {
  return (tree: HtmlRoot) => {
    const slugger = new GithubSlugger()
    visit(tree, "element", (node) => {
      if (!/^h[1-6]$/.test(node.tagName)) return
      const text = (value: typeof node.children): string =>
        value
          .map((child) =>
            child.type === "text"
              ? child.value
              : child.type === "element"
                ? text(child.children)
                : "",
          )
          .join("")
      node.properties.id = slugger.slug(text(node.children))
    })
  }
}

export async function renderMarkdown(body: string): Promise<string> {
  return String(
    await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkMath)
      .use(wikiLinks)
      .use(remarkRehype)
      .use(rehypeKatex)
      .use(headings)
      .use(rehypeStringify)
      .process(body),
  )
}
