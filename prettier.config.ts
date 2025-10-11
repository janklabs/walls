import { type PluginConfig as SortImportsPluginOptions } from "@trivago/prettier-plugin-sort-imports"
import { type Config } from "prettier"
import { type PluginOptions as TailwindPluginOptions } from "prettier-plugin-tailwindcss"

const config: Config & TailwindPluginOptions & SortImportsPluginOptions = {
  plugins: [
    "@trivago/prettier-plugin-sort-imports",
    "prettier-plugin-packagejson",
    "prettier-plugin-tailwindcss",
  ],
  importOrder: ["^@/(.*)$", "^[./]", ""],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  tailwindStylesheet: "./src/styles/globals.css",
  semi: false,
}

export default config
