import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base must match the GitHub Pages path: daniel-hirst.github.io/gym-tracker/
export default defineConfig({
  plugins: [react()],
  base: "/gym-tracker/",
  define: {
    // Shown in the app footer so we can tell which build a phone is running
    __BUILD_STAMP__: JSON.stringify(new Date().toISOString().slice(0, 16).replace("T", " ")),
  },
});
