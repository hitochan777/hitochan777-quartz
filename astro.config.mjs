import { defineConfig } from "astro/config"
import vercel from "@astrojs/vercel"
import tina from "@tinacms/astro/integration"
import { tinaAdminDevRedirect } from "@tinacms/astro/vite"

export default defineConfig({
  site: "https://hitochan777.vercel.app",
  output: "static",
  trailingSlash: "never",
  adapter: vercel(),
  integrations: [tina()],
  vite: { plugins: [tinaAdminDevRedirect()] },
})
