import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Minimal OpenNext Cloudflare config. This is what `opennextjs-cloudflare build`
// reads to transform the Next.js build output into a Cloudflare Worker
// (.open-next/worker.js) plus static assets (.open-next/assets).
export default defineCloudflareConfig();
