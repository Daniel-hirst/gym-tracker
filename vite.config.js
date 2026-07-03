import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base must match the GitHub Pages path: daniel-hirst.github.io/gym-tracker/
export default defineConfig({
  plugins: [react()],
  base: "/gym-tracker/",
});
