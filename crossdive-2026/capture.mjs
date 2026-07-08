// Render the CrossDive film to H.264 MP4 by deterministically seeking each frame.
// Usage: FFMPEG=/path/to/ffmpeg node capture.mjs <variant> [fps]
//   variants: master | subtitled | cut15   (silent == master, produced by build.sh)
import { chromium } from 'playwright';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const VARIANTS = {
  master:    { params: 'hud=0',              out: 'out/crossdive-2026_master.mp4' },
  subtitled: { params: 'hud=0&captions=1',   out: 'out/crossdive-2026_subtitled.mp4' },
  cut15:     { params: 'hud=0&cut=15',       out: 'out/crossdive-2026_cutdown-15s.mp4' },
};
const variant = process.argv[2] || 'master';
const fps = Number(process.argv[3] || 30);
const cfg = VARIANTS[variant];
if (!cfg) { console.error('unknown variant', variant); process.exit(1); }
const FFMPEG = process.env.FFMPEG || 'ffmpeg';
fs.mkdirSync('out', { recursive: true });

const url = 'file://' + path.resolve('film.html') + '?' + cfg.params;
const browser = await chromium.launch({ args: ['--force-color-profile=srgb'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
page.on('pageerror', e => { console.error('PAGE ERROR', e); process.exit(1); });
await page.goto(url, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForFunction('window.__ready===true');
await page.addStyleTag({ content: '#hud{display:none!important}' });

const duration = await page.evaluate(() => window.__duration());
const total = Math.round(duration * fps);
console.log(`[${variant}] ${duration}s @ ${fps}fps = ${total} frames -> ${cfg.out}`);

const ff = spawn(FFMPEG, [
  '-y', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '15', '-preset', 'medium',
  '-x264-params', 'keyint=60', '-movflags', '+faststart', cfg.out,
], { stdio: ['pipe', 'inherit', 'inherit'] });

const write = buf => new Promise(res => { ff.stdin.write(buf) ? res() : ff.stdin.once('drain', res); });

for (let i = 0; i < total; i++) {
  await page.evaluate(t => window.__seek(t), i / fps);
  const buf = await page.screenshot({ type: 'png' });
  await write(buf);
  if (i % 60 === 0) process.stdout.write(`\r  frame ${i}/${total}`);
}
ff.stdin.end();
await new Promise((res, rej) => ff.on('close', c => c === 0 ? res() : rej(new Error('ffmpeg exit ' + c))));
await browser.close();
console.log(`\n[${variant}] done -> ${cfg.out}`);
