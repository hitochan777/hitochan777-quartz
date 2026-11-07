# Hitochan's Tech blog

An Astro blog with Markdown articles in Git and TinaCMS visual editing at `/admin/index.html`.

```sh
npm ci
npm run dev
```

Open http://localhost:4321 for the blog and http://localhost:4321/admin/index.html for the local editor. Local saves write to `content/**/*.md`; commit those changes as usual.

```sh
npm test             # URLs, drafts, Markdown behavior
npm run verify:migration # one-time original-content preservation check
npm run test:smoke   # HTTP and live-preview checks against npm run dev
npm run build:local  # build without TinaCloud credentials
npm run check        # Astro and TypeScript checks after client generation
npm run build        # production build with TinaCloud settings
```

See [MIGRATION.md](MIGRATION.md) for TinaCloud and Vercel setup, publishing, and differences from Quartz.
