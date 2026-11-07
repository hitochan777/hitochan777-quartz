/** Match Quartz slugs, including case, Unicode, spaces, and punctuation. */
export function quartzSlug(value: string): string {
  return value
    .split("/")
    .map((part) =>
      part
        .replace(/\s/g, "-")
        .replace(/&/g, "-and-")
        .replace(/%/g, "-percent")
        .replace(/[?#]/g, ""),
    )
    .join("/")
    .replace(/\/$/, "")
}

export function documentUrl(relativePath: string): string {
  const slug = quartzSlug(relativePath.replace(/\.md$/, "")).replace(/(^|\/)_(?=index$)/, "$1")
  return slug === "index" ? "/" : `/${slug.replace(/\/index$/, "")}`
}

export const tagUrl = (tag: string) => `/tags/${quartzSlug(tag)}`
