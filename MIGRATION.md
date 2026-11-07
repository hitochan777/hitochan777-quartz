# Quartz → Astro + TinaCMS

This implements the [shared migration discussion](https://chatgpt.com/share/6aeec5ed-125c-83ee-a023-d35e102df287): Git-backed Markdown, a visual editor, and Vercel hosting.

## Content and URLs

All 40 original Markdown files remain in `content/`, at their original paths. Article text and code are retained. Two posts (`azurite.md`, `latex-astro.md`) have list continuation indentation removed because Tina rejects fenced code inside list items; their code blocks now sit outside the lists. All other article bodies are unchanged. The one scalar `tags: c#,testing` value is normalized to a list for Tina. Missing titles fall back to the filename; missing dates stay undated. Old `layout` frontmatter is ignored.

The same case-sensitive Quartz slug rules retain spaces as hyphens, Japanese characters, parentheses, and punctuation. Examples:

- `content/posts/Grokking Functional Programming.md` → `/posts/Grokking-Functional-Programming`
- `content/OAuth2.0 (OIDC) in Tauri 2.md` → `/OAuth2.0-(OIDC)-in-Tauri-2`
- `content/index.md` → `/`

The public article list, tags, search index, RSS (`/index.xml`), sitemap (`/sitemap.xml`), and article routes exclude drafts. Drafts remain editable in Tina's full-page form but intentionally have no public live preview. The admin checks `/editor-routes.json` to open visual previews only for documents present in this deployment; new articles use the form until first deployed. Publish by clearing Draft, saving, and waiting for Vercel to deploy the Git commit. Public static pages reflect the last deployment, not unsaved changes.

## Local editing

Use Node 22 (22.12 or newer) and `npm ci`, then `npm run dev`. The package engine is pinned to `22.x` so Vercel cannot select a newer major unsupported by Tina's CLI. Tina's local GraphQL server and Astro start together. `/admin` redirects to `/admin/index.html`. The local editor writes Markdown files without TinaCloud credentials. New published documents are included on the next build; restart the dev server if a new route is not visible.

`npm run build:local` starts a temporary local Tina data layer, generates the client/admin, and builds Astro without calling TinaCloud. It is for CI and local verification; deploy using the production build so the generated client targets TinaCloud rather than localhost.

## TinaCloud and Vercel

1. Create/connect a TinaCloud project for `hitochan777/hitochan777-quartz`, authorize the intended GitHub repository, and select the branch to index (normally `main`). These account and authorization steps happen outside this PR.
2. Add `http://localhost:4321` and the production site origin to TinaCloud's allowed origins. Add each Vercel preview origin you intend to use for editing.
3. Copy `.env.example` to `.env` for local cloud builds. Set `PUBLIC_TINA_CLIENT_ID` to the project client ID and `TINA_TOKEN` to its read token. Set those same variables in Vercel. Keep the token out of Git.
4. Set `TINA_BRANCH=main` in production. For branch-specific previews, use an indexed TinaCloud branch: `TINA_BRANCH` overrides `VERCEL_GIT_COMMIT_REF`, which overrides `main`. Do not point a PR preview at another branch if you intend to save changes into the PR branch.
5. Keep the existing Vercel project and domain. Use the Astro framework preset, Node 22, install command `npm ci`, build command `npm run build`, output `dist`. `vercel.json` records the framework and build settings; remove any old project-level Quartz build-command override.
6. After TinaCloud indexes the schema and content, deploy and visit `/admin/index.html`. Sign in, open a published article, click its title/body, edit, save, and confirm the Git commit and subsequent Vercel deployment.

`tinacms build` checks the cloud schema/index. If it reports a mismatch, ensure TinaCloud has indexed the exact branch and commit before retrying. Do not replace the production build with `build:local` to bypass that check.

## Visual editing and hosting

Public pages are prerendered from the local Markdown at build time. The `@tinacms/astro` integration, `requestWithMetadata`, `TinaIsland`, field markers, and the `/tina-island/[name]` endpoint implement in-context preview. The endpoint queries TinaCloud in production and rerenders only the article region with unsaved editor data. Vercel's Astro adapter serves that endpoint as a function; a plain static export is insufficient. No React runtime is needed in the public blog.

Git remains the source of truth. Markdown edits in an IDE and browser edits both become repository changes. Media uploads go to `public/uploads`.

## Differences from Quartz

- Search (including Japanese text), tags, RSS, dark mode, wiki links, GFM tables, code blocks, heading anchors, and KaTeX math remain available on public pages.
- Graph visualization, backlinks, Obsidian embeds/callouts, hover previews, and Quartz's SPA navigation are not migrated.
- Tina's live rich-text renderer previews standard Markdown. KaTeX, wiki-link conversion and duplicate heading anchors are applied by the public build renderer; those extensions may appear differently in the live preview. Check the published build for those features.
- Publication dates use explicit `created`/`date` metadata. There is no filesystem timestamp fallback, so rebuilding cannot change dates of undated notes.
- The retired Quartz engine and upstream-only workflows remain temporarily in the repository for reference; they are excluded from the active TypeScript project and package scripts.

## Verification

`tests/content-baseline.json` records the 40 original file paths, URLs, draft flags, and article-body hashes from the pre-migration commit, plus migrated hashes for the two documented indentation normalizations. `npm run verify:migration` checks the one-time preservation baseline. It is intentionally separate from CI so later article edits and deletions do not fail the blog build. `npm test` checks current draft filtering, URL edge cases, and Markdown rendering. `npm run test:smoke` checks a running `npm run dev` instance, including unsaved overlay updates and draft rejection. CI additionally runs the credential-free full build and Astro type checks. A production TinaCloud sign-in/save/deploy smoke test requires the account configuration above.
