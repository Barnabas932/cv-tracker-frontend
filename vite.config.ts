import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  // Replit preview hostok engedélyezése
  server: {
    allowedHosts: [
      ".replit.dev",
      ".riker.replit.dev"
    ],
    host: true,
    port: 5000
  }
});
