// Lists every built file the app needs to start, so the service worker can
// cache them all at install, including screens not opened yet.
import { readdir, stat, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;
// Code, fonts and images; the large search index is cached on first use instead.
const KEEP = /\.(js|css|ttf|otf|woff2?|png|jpg|svg|ico)$/;

async function walk(dir) {
  const files = [];
  for (const name of await readdir(dir)) {
    const path = join(dir, name);
    if ((await stat(path)).isDirectory()) files.push(...(await walk(path)));
    else if (KEEP.test(name)) files.push('/' + relative(DIST, path).split('\\').join('/'));
  }
  return files;
}

const files = await walk(DIST);
await writeFile(join(DIST, 'precache.json'), JSON.stringify(files));
console.log(`Precache manifest: ${files.length} files`);
