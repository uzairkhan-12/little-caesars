import "./load-env.mjs";

process.env.NODE_ENV ??= "production";

await import(new URL("../.output/server/index.mjs", import.meta.url).href);
