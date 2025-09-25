import { defineConfig } from "rolldown";

export default defineConfig({
  input: "src/main.ts",
  output: {
    file: "dist/index.js",
    format: "esm",
  },
  external: ["react", "fast-xml-parser", "node:fs", "node:path"],
  // jsx-runtime will be bundled since it's not external
});

