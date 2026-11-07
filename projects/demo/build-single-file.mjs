// Second step of `npm run publish`: turns the demo build into demo.js and demo.css, for a host page
// that has an <app-root> element and already loads Bootstrap 5 and Font Awesome.
// The builder has no option to disable chunks, so esbuild bundles its output again without splitting.
import { build } from 'esbuild';
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT_DIR = 'dist/demo-publish';
const STYLESHEET = /<link rel="stylesheet" href="([^"]+)"/;
const SCRIPT = /<script src="([^"]+)" type="module"><\/script>/g;
const LEFTOVER_FILE = /\bassets\/|\.\/media\/|\.\/chunk-/;

const read = (file, encoding = 'utf8') => readFileSync(join(OUT_DIR, file), encoding);

const flags = readdirSync(OUT_DIR, { recursive: true })
  .map(file => file.replaceAll('\\', '/'))
  .filter(file => file.endsWith('.svg'));

const html = read('index.html');
const scripts = [...html.matchAll(SCRIPT)].map(match => match[1]);
const stylesheet = html.match(STYLESHEET)?.[1];
if (!scripts.length || !stylesheet) {
  throw new Error(`${OUT_DIR}/index.html: script or stylesheet not found, did the builder change its output?`);
}

// imported in the order of the page, zone.js has to run before Angular
const { outputFiles } = await build({
  stdin: { contents: scripts.map(script => `import './${script}';`).join('\n'), resolveDir: OUT_DIR },
  bundle: true,
  format: 'esm',
  minify: true,
  legalComments: 'none',
  charset: 'utf8',
  write: false
});

// the flags go inside the script: their path would otherwise depend on the url of the host page
const js = flags.reduce(
  (result, file) => result.replaceAll(file, () => `data:image/svg+xml;base64,${read(file, 'base64')}`),
  outputFiles[0].text
);
const css = read(stylesheet);

const leftover = (js + css).match(LEFTOVER_FILE);
if (leftover) {
  throw new Error(`Not inlined: "${leftover[0]}" is still referenced, the host page would not find it.`);
}

const licenses = read('3rdpartylicenses.txt').replaceAll('*/', '* /');
const script = `/*\n${licenses}\n*/\n${js}`;

const size = text => `${(Buffer.byteLength(text) / 1024).toFixed(0)} kB`;
rmSync(OUT_DIR, { recursive: true });
mkdirSync(OUT_DIR);
writeFileSync(join(OUT_DIR, 'demo.js'), script);
writeFileSync(join(OUT_DIR, 'demo.css'), css);
console.log(`${OUT_DIR}: demo.js ${size(script)}, demo.css ${size(css)}`);
