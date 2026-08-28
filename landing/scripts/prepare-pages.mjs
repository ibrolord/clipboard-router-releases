import { cp, mkdir, readdir, rm } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const websiteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const clientBuild = resolve(websiteRoot, 'dist/client')
const pagesBuild = resolve(websiteRoot, 'dist/pages')
const sourceProduct = resolve(websiteRoot, 'public/product')
const pagesProduct = resolve(pagesBuild, 'product')

const approvedProductAssets = [
  'icon.png',
  'plate-actions-control-mobile.png',
  'plate-actions-control.png',
  'plate-actions-safety.png',
  'plate-hero-mobile.png',
  'plate-hero.png',
  'plate-history-list.png',
  'plate-history-sidebar-mobile.png',
  'plate-history-sidebar.png',
  'plate-privacy-empty-mobile.png',
  'plate-privacy-empty.png',
  'plate-privacy-switch.png',
  'plate-privacy-toast-mobile.png',
  'plate-privacy-toast.png',
]

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

console.log(`Prepared GitHub Pages artifact with ${publishedProductAssets.length} approved product assets.`)
