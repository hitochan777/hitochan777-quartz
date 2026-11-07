import { dev } from "astro"

// Keep Astro in this process so Tina's parent command stays alive. Astro's CLI
// can automatically detach when launched by coding agents.
const server = await dev({})
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, async () => {
    await server.stop()
    process.exit(0)
  })
}
