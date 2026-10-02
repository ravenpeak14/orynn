// Renders the PNG icons the PWA manifest and iOS need from public/logo.svg.
// Run with `npm run icons` after changing the logo.
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const publicDir = new URL('../public/', import.meta.url)
const file = (name) => fileURLToPath(new URL(name, publicDir))

const logo = await readFile(file('logo.svg'), 'utf8')
// Maskable and Apple icons are cropped by the OS, so they must fill the square.
const fullBleed = logo.replace('rx="116"', 'rx="0"')

const outputs = [
  [logo, 'favicon-32x32.png', 32],
  [logo, 'pwa-64x64.png', 64],
  [logo, 'pwa-192x192.png', 192],
  [logo, 'pwa-512x512.png', 512],
  [fullBleed, 'maskable-icon-512x512.png', 512],
  [fullBleed, 'apple-touch-icon-180x180.png', 180],
]

await writeFile(file('favicon.svg'), logo)

for (const [svg, name, size] of outputs) {
  await sharp(Buffer.from(svg), { density: 300 }).resize(size, size).png().toFile(file(name))
  console.log(`public/${name}`)
}
