// Render many stills from one bundle: node tools/stills.mjs <comp> <props.json> <outdir> <t1,t2,...> [gl]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
const [comp, propsPath, outDir, times, gl] = process.argv.slice(2);
const inputProps = JSON.parse(fs.readFileSync(propsPath, 'utf8'));
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const chromiumOptions = gl ? {gl} : {};
const composition = await selectComposition({serveUrl, id: comp, inputProps, chromiumOptions});
fs.mkdirSync(outDir, {recursive: true});
for (const t of times.split(',').map(Number)) {
  const output = path.join(outDir, `f_${t.toFixed(2).padStart(5, '0')}.png`);
  await renderStill({serveUrl, composition, inputProps, frame: Math.round(t * 30), output, chromiumOptions, onBrowserLog: process.env.LOG ? (l) => console.log('[browser]', l.type, l.text.slice(0, 400)) : undefined});
  console.log(output);
}
