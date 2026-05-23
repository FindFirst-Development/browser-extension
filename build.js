import esbuild from "esbuild";
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const watch = process.argv.includes("--watch");
const targetArg = process.argv.find((a) => a.startsWith("--target="));
const targets = targetArg
  ? [targetArg.split("=")[1]]
  : ["chrome", "firefox"];

const entryPoints = [
  { in: "src/background/service-worker.ts", out: "background/service-worker" },
  { in: "src/popup/popup.ts", out: "popup/popup" },
  { in: "src/options/options.ts", out: "options/options" },
];

function copyStaticAssets(target) {
  const out = `dist/${target}`;
  mkdirSync(`${out}/icons`, { recursive: true });
  mkdirSync(`${out}/popup`, { recursive: true });
  mkdirSync(`${out}/options`, { recursive: true });

  copyFileSync("src/icons/icon-48.png", `${out}/icons/icon-48.png`);
  copyFileSync("src/icons/icon-96.png", `${out}/icons/icon-96.png`);
  copyFileSync("src/popup/popup.html", `${out}/popup/popup.html`);
  copyFileSync("src/popup/popup.css", `${out}/popup/popup.css`);
  copyFileSync("src/options/options.html", `${out}/options/options.html`);
  copyFileSync("src/options/options.css", `${out}/options/options.css`);

  const manifest = JSON.parse(
    readFileSync(`manifests/manifest.${target}.json`, "utf8")
  );
  writeFileSync(join(out, "manifest.json"), JSON.stringify(manifest, null, 2));
}

async function build(target) {
  const outdir = `dist/${target}`;
  mkdirSync(outdir, { recursive: true });

  const ctx = await esbuild.context({
    entryPoints,
    outdir,
    bundle: true,
    format: "esm",
    target: "es2022",
    platform: "browser",
    sourcemap: watch ? "inline" : false,
    minify: !watch,
  });

  copyStaticAssets(target);

  if (watch) {
    await ctx.watch();
    console.log(`Watching ${target}...`);
  } else {
    await ctx.rebuild();
    await ctx.dispose();
    console.log(`Built ${target}`);
  }
}

for (const target of targets) {
  await build(target);
}
