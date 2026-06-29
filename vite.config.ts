// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const TUNNEL_HOST = "littlecaesars.primewave2.tech";

export default defineConfig({
  // Self-hosted Node server for Proxmox/Docker (not Cloudflare Workers)
  nitro: {
    preset: "node-server",
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    serverFns: {
      disableCsrfMiddlewareWarning: true,
    },
  },
  vite: {
    server: {
      // Dev server port — point cloudflared at http://localhost:8080
      port: 8080,
      strictPort: true,
      allowedHosts: [TUNNEL_HOST, ".primewave2.tech"],
      // WebSocket HMR over Cloudflare Tunnel (HTTPS terminates at Cloudflare)
      ws: {
        host: TUNNEL_HOST,
        clientPort: 443,
        protocol: "wss",
      },
    },
    preview: {
      port: 8080,
      strictPort: true,
      allowedHosts: [TUNNEL_HOST, ".primewave2.tech"],
    },
  },
});
