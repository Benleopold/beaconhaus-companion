// Rasterize public/icon.svg into the PNG sizes the manifest references.
import sharp from "sharp";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const pub = resolve(here, "../public");
const src = resolve(pub, "icon.svg");
const targets = { "icon-192.png": 192, "icon-512.png": 512, "icon-180.png": 180, "icon-maskable-512.png": 512 };

for (const [name, size] of Object.entries(targets)) {
  await sharp(src, { density: 400 }).resize(size, size).png().toFile(resolve(pub, name));
  console.log(`wrote public/${name} (${size}px)`);
}
