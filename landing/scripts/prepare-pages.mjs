import { cp, mkdir, readdir, rm } from 'node:fs/promises'
import { dirname, extname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const websiteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const clientBuild = resolve(websiteRoot, 'dist/client')
const pagesBuild = resolve(websiteRoot, 'dist/pages')
const sourceProduct = resolve(websiteRoot, 'public/product')
const pagesProduct = resolve(pagesBuild, 'product')

/**
 * Every view of the product is now drawn in DOM and CSS (src/Product.tsx),
 * so the app icon is the only raster the site publishes. The former plate
 * captures stay in public/product for reference but are deliberately not on
 * this list, which means they are never copied into the Pages artifact.
 *
 * Adding a file to public/product does NOT publish it: the loop below copies
 * only what is named here, and the check afterwards fails the build if the
 * artifact and this list ever disagree.
 */
const approvedProductAssets = ['icon.png']
const approvedRasterAssets = ['icon-180.png', 'og.png', 'product/icon.png']

await rm(pagesBuild, { recursive: true, force: true })
await cp(clientBuild, pagesBuild, { recursive: true })
await rm(pagesProduct, { recursive: true, force: true })
await mkdir(pagesProduct, { recursive: true })

for (const name of approvedProductAssets) {
  await cp(resolve(sourceProduct, name), resolve(pagesProduct, name))
}

const publishedProductAssets = (await readdir(pagesProduct)).sort()
if (publishedProductAssets.join('\n') !== approvedProductAssets.slice().sort().join('\n')) {
  throw new Error('GitHub Pages product-asset allowlist did not match the published artifact.')
}

const rasterExtensions = new Set([
  '.avif',
  '.bmp',
  '.gif',
  '.heic',
  '.heif',
  '.ico',
  '.jpeg',
  '.jpg',
  '.jxl',
  '.png',
  '.tif',
  '.tiff',
  '.webp',
])

async function findRasterAssets(directory) {
  const assets = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) {
      assets.push(...await findRasterAssets(path))
    } else if (entry.isFile() && rasterExtensions.has(extname(entry.name).toLowerCase())) {
      assets.push(relative(pagesBuild, path))
    }
  }
  return assets
}

const publishedRasterAssets = (await findRasterAssets(pagesBuild)).sort()
if (publishedRasterAssets.join('\n') !== approvedRasterAssets.slice().sort().join('\n')) {
  throw new Error('GitHub Pages raster-asset allowlist did not match the published artifact.')
}

console.log(
  `Prepared GitHub Pages artifact with ${publishedProductAssets.length} approved product asset and ${publishedRasterAssets.length} approved raster assets.`,
)
