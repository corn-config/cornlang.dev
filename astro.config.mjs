import { defineConfig } from 'astro/config';
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import cornLanguage from "./cornLanguage.ts";
import mdx from "@astrojs/mdx";

import vercel from "@astrojs/vercel/static";

// https://astro.build/config
export default defineConfig({
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      langs: [cornLanguage]
    }
  },
  integrations: [mdx()],
  vite: {
    plugins: [wasm(), topLevelAwait()]
  },
  output: "server",
  adapter: vercel()
});