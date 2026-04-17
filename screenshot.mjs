import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = 'file:///' + __dirname.split('\').join('/') + '/index.html';

fs.mkdirSync('screenshots', { recursive: true });

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(filePath, { waitUntil: 'domcontentloaded', timeout: 20000 });
await new Promise(r => setTimeout(r, 3000));
await page.screenshot({ path: 'screenshots/01_hero.png' });

const sections = ['manifesto', 'collections', 'featured', 'nature', 'process', 'packaging', 'gallery', 'contact'];
for (let i = 0; i < sections.length; i++) {
  const sel = '#' + sections[i];
  await page.evaluate((s) => {
    const el = document.querySelector(s);
    if (el) el.scrollIntoView({ behavior: 'instant' });
  }, sel);
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'screenshots/0' + (i+2) + '_' + sections[i] + '.png' });
}

await browser.close();
console.log('Screenshots done');
