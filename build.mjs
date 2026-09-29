import * as esbuild from "esbuild";

const serve = process.argv.includes("--serve");

const options = {
  entryPoints: ["src/main.jsx"],
  bundle: true,
  outfile: "bundle.js",
  format: "iife",
  minify: !serve,
  sourcemap: serve,
  target: ["es2019"],
  loader: { ".js": "jsx" },
  define: { "process.env.NODE_ENV": serve ? '"development"' : '"production"' },
};

if (serve) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
  const { host, port } = await ctx.serve({ servedir: ".", port: 5173 });
  console.log(`Servindo em http://${host === "0.0.0.0" ? "localhost" : host}:${port}`);
} else {
  await esbuild.build(options);
  console.log("Build gerado em bundle.js");
}
