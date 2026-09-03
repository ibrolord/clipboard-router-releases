import { execFile, spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { once } from 'node:events'
import { access, copyFile, mkdir, mkdtemp, readFile, readdir, rename, rm, stat, writeFile } from 'node:fs/promises'
import { createServer } from 'node:net'
import { dirname, join, resolve } from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'

const execFileAsync = promisify(execFile)
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const output = resolve(root, '../docs/assets/launch')
const landingOg = resolve(root, 'public/og.png')
const directoryIcon = resolve(root, 'public/product/icon.png')
const chrome = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const vite = resolve(root, 'node_modules/.bin/vite')
const pageMarker = '<meta name="clipboard-router-launch-art" content="v1"'
const exportsToRender = [
  { id: 'feature-hero', file: 'reddit-swiftui-feature-hero-1600x900.png', width: 1600, height: 900, layout: 'wide' },
  { id: 'microlaunch-hero', file: 'microlaunch-feature-hero-680x340.png', width: 680, height: 340, layout: 'compact' },
  { id: 'github-social-preview', file: 'github-social-preview-1280x640.png', width: 1280, height: 640, layout: 'social', maxBytes: 1_000_000 },
  { id: 'landing-social-card', file: 'landing-social-card-1200x630.png', width: 1200, height: 630, layout: 'social' },
]
const staticAssets = [
  { id: 'directory-icon', file: 'landing/public/product/icon.png', path: directoryIcon, width: 512, height: 512 },
]
const existingAssetSets = [
  {
    id: 'mac-app-store-gallery',
    repository: 'ibrolord/clipboard-router',
    manifest: 'AppStore/screenshot-manifest.md',
    files: 'five 1440x900 PNG screenshots',
  },
]
const channelCoverage = [
  { id: 'show-hn', channel: 'Hacker News / Show HN', delivery: 'none', assets: [], note: 'The submission surface is title plus URL or text.' },
  { id: 'reddit-macapps-app-pile', channel: 'r/macapps App Pile', delivery: 'none', assets: [], note: 'The active placement is a comment, not an image post.' },
  { id: 'reddit-macosprogramming', channel: 'r/macosprogramming', delivery: 'image', assets: ['feature-hero'] },
  { id: 'reddit-swiftui', channel: 'r/SwiftUI', delivery: 'image', assets: ['feature-hero'] },
  { id: 'reddit-coolgithubprojects', channel: 'r/coolgithubprojects', delivery: 'image', assets: ['feature-hero'] },
  { id: 'reddit-sideproject', channel: 'r/SideProject', delivery: 'image', assets: ['feature-hero'] },
  { id: 'reddit-macos-developer-saturday', channel: 'r/MacOS Developer Saturday', delivery: 'image', assets: ['feature-hero'] },
  { id: 'macmenubar', channel: 'MacMenuBar', delivery: 'image', assets: ['directory-icon', 'feature-hero'] },
  { id: 'macapps-org', channel: 'macapps.org', delivery: 'none', assets: [], note: 'The current submission form has no image field.' },
  { id: 'alternativeto', channel: 'AlternativeTo', delivery: 'image', assets: ['directory-icon', 'feature-hero'] },
  { id: 'macupdate', channel: 'MacUpdate', delivery: 'none', assets: [], note: 'The current new-app form has no image upload field.' },
  { id: 'appaddict', channel: 'AppAddict', delivery: 'image', assets: ['directory-icon'] },
  { id: 'toolhunt', channel: 'Toolhunt', delivery: 'image', assets: ['directory-icon', 'feature-hero'] },
  { id: 'thriftmac', channel: 'Thriftmac', delivery: 'image', assets: ['directory-icon', 'feature-hero'] },
  { id: 'macstories', channel: 'MacStories press pitch', delivery: 'image', assets: ['feature-hero', 'mac-app-store-gallery'] },
  { id: '9to5mac', channel: '9to5Mac press pitch', delivery: 'image', assets: ['feature-hero', 'mac-app-store-gallery'] },
  { id: 'macrumors', channel: 'MacRumors press pitch', delivery: 'image', assets: ['feature-hero', 'mac-app-store-gallery'] },
  { id: 'awesome-mac', channel: 'Awesome Mac', delivery: 'none', assets: [], note: 'README list contribution.' },
  { id: 'doesitarm', channel: 'Does It ARM', delivery: 'none', assets: [], note: 'Structured compatibility contribution.' },
  { id: 'open-source-macos-apps', channel: 'Open Source macOS Apps', delivery: 'image', assets: ['directory-icon', 'feature-hero'] },
  { id: 'awesome-swift-macos-apps', channel: 'Awesome Swift macOS Apps', delivery: 'none', assets: [], note: 'README list contribution.' },
  { id: 'clipboard-manager-comparison', channel: 'Clipboard Manager Comparison', delivery: 'none', assets: [], note: 'Structured comparison form.' },
  { id: 'indie-hackers', channel: 'Indie Hackers', delivery: 'image', assets: ['feature-hero'] },
  { id: 'microlaunch', channel: 'MicroLaunch', delivery: 'image', assets: ['directory-icon', 'microlaunch-hero'], note: '680x340 is the current UI-observed hero target.' },
  { id: 'peerlist', channel: 'Peerlist', delivery: 'image', assets: ['directory-icon', 'feature-hero'] },
  { id: 'launching-next', channel: 'Launching Next', delivery: 'image', assets: ['directory-icon', 'feature-hero'] },
  { id: 'opentosh', channel: 'OpenTosh', delivery: 'image', assets: ['directory-icon', 'feature-hero'], note: 'No public fixed dimensions are documented.' },
  { id: 'dev', channel: 'DEV Community', delivery: 'held', assets: ['feature-hero'], note: 'Prepared only if the channel becomes policy-compatible.' },
  { id: 'mac-app-store', channel: 'Mac App Store', delivery: 'existing', assets: ['mac-app-store-gallery'] },
  { id: 'homebrew', channel: 'Homebrew', delivery: 'none', assets: [], note: 'Cask metadata has no image field.' },
  { id: 'github-readme', channel: 'GitHub README', delivery: 'image', assets: ['directory-icon', 'feature-hero'] },
  { id: 'github-social', channel: 'GitHub repository social preview', delivery: 'image', assets: ['github-social-preview'] },
  { id: 'github-pages', channel: 'GitHub Pages / Open Graph', delivery: 'image', assets: ['landing-social-card'] },
  { id: 'product-hunt', channel: 'Product Hunt', delivery: 'excluded', assets: [], note: 'Explicitly excluded from this launch.' },
]

const delay = (milliseconds) => new Promise((resolvePromise) => setTimeout(resolvePromise, milliseconds))

function assertUnique(values, label) {
  if (new Set(values).size !== values.length) throw new Error(`Duplicate ${label} in launch registry`)
}

function validateRegistry() {
  const knownLayouts = new Set(['compact', 'social', 'wide'])
  assertUnique(exportsToRender.map(({ id }) => id), 'export id')
  assertUnique(exportsToRender.map(({ file }) => file), 'export filename')
  assertUnique(staticAssets.map(({ id }) => id), 'static asset id')
  assertUnique(existingAssetSets.map(({ id }) => id), 'existing asset-set id')
  assertUnique(channelCoverage.map(({ id }) => id), 'channel id')
  const assetIds = new Set([
    ...exportsToRender.map(({ id }) => id),
    ...staticAssets.map(({ id }) => id),
    ...existingAssetSets.map(({ id }) => id),
  ])
  for (const spec of exportsToRender) {
    if (!knownLayouts.has(spec.layout)) throw new Error(`Unknown layout in launch registry: ${spec.layout}`)
    if (!Number.isInteger(spec.width) || !Number.isInteger(spec.height) || spec.width <= 0 || spec.height <= 0) {
      throw new Error(`Invalid dimensions for ${spec.id}`)
    }
  }
  for (const entry of channelCoverage) {
    for (const asset of entry.assets) {
      if (!assetIds.has(asset)) throw new Error(`${entry.id} references unknown asset ${asset}`)
    }
    if (entry.delivery === 'image' && entry.assets.length === 0) {
      throw new Error(`${entry.id} requires an image but has no assigned asset`)
    }
  }
}

async function availablePort() {
  const probe = createServer()
  probe.unref()
  await new Promise((resolvePromise, reject) => {
    probe.once('error', reject)
    probe.listen(0, '127.0.0.1', resolvePromise)
  })
  const address = probe.address()
  if (!address || typeof address === 'string') throw new Error('Could not allocate a local capture port')
  await new Promise((resolvePromise, reject) => probe.close((error) => error ? reject(error) : resolvePromise()))
  return address.port
}

async function waitForLaunchPage(url, server, getServerError) {
  const deadline = Date.now() + 20_000
  while (Date.now() < deadline) {
    const spawnError = getServerError()
    if (spawnError) throw spawnError
    if (server.exitCode !== null || server.signalCode !== null) {
      throw new Error(`Vite exited before the launch page was ready (${server.exitCode ?? server.signalCode})`)
    }
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(1_000) })
      const html = await response.text()
      if (response.ok && html.includes(pageMarker)) return
    } catch {
      // Vite is still starting.
    }
    await delay(200)
  }
  throw new Error(`Timed out waiting for the marked launch page at ${url}`)
}

async function assertPngSize(path, width, height) {
  const bytes = await readFile(path)
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  if (bytes.length < 24 || !bytes.subarray(0, 8).equals(signature) || bytes.toString('ascii', 12, 16) !== 'IHDR') {
    throw new Error(`${path} is not a valid PNG with an IHDR header`)
  }
  const actualWidth = bytes.readUInt32BE(16)
  const actualHeight = bytes.readUInt32BE(20)
  if (actualWidth !== width || actualHeight !== height) {
    throw new Error(`${path}: expected ${width}x${height}, got ${actualWidth}x${actualHeight}`)
  }
}

async function sha256(path) {
  return createHash('sha256').update(await readFile(path)).digest('hex')
}

async function captureOnce({ path, width, height, layout, base, profile }) {
  const child = spawn(chrome, [
    '--headless=new',
    '--disable-background-networking',
    '--disable-component-update',
    '--disable-extensions',
    '--disable-gpu',
    '--disable-sync',
    '--force-device-scale-factor=1',
    '--hide-scrollbars',
    '--metrics-recording-only',
    '--no-default-browser-check',
    '--no-first-run',
    '--run-all-compositor-stages-before-draw',
    `--user-data-dir=${profile}`,
    `--window-size=${width},${height}`,
    `--screenshot=${path}`,
    `${base}?layout=${layout}&still`,
  ], { stdio: ['ignore', 'pipe', 'pipe'] })
  let chromeLog = ''
  let chromeError
  const appendChromeLog = (chunk) => { chromeLog = `${chromeLog}${chunk}`.slice(-8_000) }
  child.stdout.on('data', appendChromeLog)
  child.stderr.on('data', appendChromeLog)
  child.once('error', (error) => { chromeError = error })

  try {
    const deadline = Date.now() + 20_000
    let stable = false
    while (Date.now() < deadline) {
      if (chromeError) throw chromeError
      if (child.signalCode !== null) throw new Error(`Chrome exited from signal ${child.signalCode}`)
      if (child.exitCode !== null && child.exitCode !== 0) {
        throw new Error(`Chrome exited with ${child.exitCode}`)
      }
      try {
        await assertPngSize(path, width, height)
        const firstHash = await sha256(path)
        await delay(100)
        await assertPngSize(path, width, height)
        stable = firstHash === await sha256(path)
        if (stable) break
      } catch {
        // Chrome has not finished writing the screenshot.
      }
      await delay(100)
    }
    if (!stable) throw new Error(`Timed out capturing ${width}x${height} ${layout} artwork`)
  } catch (error) {
    if (chromeLog.trim()) console.error(chromeLog.trim())
    throw error
  } finally {
    await stopProcess(child)
  }
}

async function captureAndVerify(spec, base, staging) {
  const primary = resolve(staging, spec.file)
  const verification = resolve(staging, `verify-${spec.file}`)
  await captureOnce({ ...spec, path: primary, base, profile: resolve(staging, `profile-${spec.id}-1`) })
  await captureOnce({ ...spec, path: verification, base, profile: resolve(staging, `profile-${spec.id}-2`) })
  const [primaryHash, verificationHash] = await Promise.all([sha256(primary), sha256(verification)])
  if (primaryHash !== verificationHash) {
    throw new Error(`${spec.file} was not stable across two isolated renders`)
  }
  const bytes = (await stat(primary)).size
  if (spec.maxBytes && bytes >= spec.maxBytes) {
    throw new Error(`${spec.file} must be under ${spec.maxBytes} bytes; rendered ${bytes}`)
  }
  console.log(`${spec.file}: ${spec.width}x${spec.height} ${primaryHash}`)
  return { id: spec.id, file: spec.file, width: spec.width, height: spec.height, layout: spec.layout, bytes, sha256: primaryHash }
}

async function stopProcess(child) {
  if (child.exitCode !== null || child.signalCode !== null) return
  const exited = once(child, 'exit')
  child.kill('SIGTERM')
  await Promise.race([exited, delay(2_000)])
  if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL')
}

async function publishWithRollback(entries, staging) {
  const backupDirectory = resolve(staging, 'backups')
  await mkdir(backupDirectory)
  const prepared = []
  for (const [index, entry] of entries.entries()) {
    const backup = resolve(backupDirectory, String(index))
    let hadBackup = true
    try {
      await copyFile(entry.target, backup)
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error
      hadBackup = false
    }
    prepared.push({ ...entry, backup, hadBackup })
  }

  const published = []
  try {
    for (const entry of prepared) {
      await rename(entry.staged, entry.target)
      published.push(entry)
    }
  } catch (error) {
    for (const entry of published.reverse()) {
      if (entry.hadBackup) await copyFile(entry.backup, entry.target)
      else await rm(entry.target, { force: true })
    }
    throw error
  }
}

async function assertManifestedPngs({ allowMissing = false } = {}) {
  const actual = (await readdir(output)).filter((file) => file.endsWith('.png')).sort()
  const expected = exportsToRender.map(({ file }) => file).sort()
  const expectedSet = new Set(expected)
  const extras = actual.filter((file) => !expectedSet.has(file))
  if (extras.length > 0 || (!allowMissing && JSON.stringify(actual) !== JSON.stringify(expected))) {
    throw new Error(`Launch PNG set does not match the registry: ${actual.join(', ')}`)
  }
}

validateRegistry()
await Promise.all([access(chrome), access(vite), access(directoryIcon), mkdir(output, { recursive: true })])
await assertManifestedPngs({ allowMissing: true })
const port = await availablePort()
const base = `http://127.0.0.1:${port}/clipboard-router-releases/launch.html`
const staging = await mkdtemp(join(dirname(output), '.launch-render-'))
let serverLog = ''
let serverError
const server = spawn(vite, ['--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
  cwd: root,
  stdio: ['ignore', 'pipe', 'pipe'],
})
const appendServerLog = (chunk) => { serverLog = `${serverLog}${chunk}`.slice(-8_000) }
server.stdout.on('data', appendServerLog)
server.stderr.on('data', appendServerLog)
server.once('error', (error) => { serverError = error })

try {
  await waitForLaunchPage(`${base}?layout=wide&still`, server, () => serverError)
  const renderedExports = []
  for (const spec of exportsToRender) {
    renderedExports.push(await captureAndVerify(spec, base, staging))
  }
  const staticAssetResults = []
  for (const asset of staticAssets) {
    await assertPngSize(asset.path, asset.width, asset.height)
    staticAssetResults.push({
      id: asset.id,
      file: asset.file,
      width: asset.width,
      height: asset.height,
      bytes: (await stat(asset.path)).size,
      sha256: await sha256(asset.path),
    })
  }
  const { stdout: chromeVersion } = await execFileAsync(chrome, ['--version'], { timeout: 5_000 })
  const landingSocial = renderedExports.find(({ id }) => id === 'landing-social-card')
  if (!landingSocial) throw new Error('Landing social card is missing from rendered exports')
  const manifest = {
    schemaVersion: 3,
    generatedBy: 'landing/scripts/capture-launch.mjs',
    renderer: {
      browser: chromeVersion.trim(),
      node: process.version,
      platform: process.platform,
      architecture: process.arch,
      deviceScaleFactor: 1,
      verificationRenders: 2,
    },
    sourceFiles: [
      'landing/launch.html',
      'landing/src/launch.tsx',
      'landing/src/LaunchScene.tsx',
      'landing/src/launch.css',
    ],
    contentPolicy: 'Synthetic example clips only; no General pasteboard or real user content is read.',
    exports: renderedExports,
    staticAssets: staticAssetResults,
    existingAssetSets,
    publishedAliases: [
      {
        sourceAsset: 'landing-social-card',
        file: 'landing/public/og.png',
        width: landingSocial.width,
        height: landingSocial.height,
        bytes: landingSocial.bytes,
        sha256: landingSocial.sha256,
      },
    ],
    channelCoverage,
    requirementsEvidence: [
      { channel: 'GitHub repository social preview', source: 'https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/customizing-your-repositorys-social-media-preview', rule: '1280x640 recommended; PNG, JPG, or GIF under 1 MB.' },
      { channel: 'AlternativeTo', source: 'https://alternativeto.net/faq/', rule: 'Square PNG or SVG at 280x280 or larger; transparent background suggested.' },
      { channel: 'Hacker News / Show HN', source: 'https://news.ycombinator.com/showhn.html', rule: 'No native image-upload field.' },
      { channel: 'Reddit organic posts', source: 'https://support.reddithelp.com/hc/en-us/articles/360060422572-How-do-I-post-and-comment-on-Reddit', rule: 'No fixed organic-post pixel dimensions are published.' },
      { channel: 'MicroLaunch', source: 'UI-observed submission form', rule: '680x340 hero and square logo in the current submission flow.' },
    ],
  }
  const stagedManifest = resolve(staging, 'launch-hero-manifest.json')
  const stagedLandingOg = resolve(staging, 'landing-public-og.png')
  await writeFile(stagedManifest, `${JSON.stringify(manifest, null, 2)}\n`)
  await copyFile(resolve(staging, 'landing-social-card-1200x630.png'), stagedLandingOg)

  await publishWithRollback([
    ...exportsToRender.map(({ file }) => ({ staged: resolve(staging, file), target: resolve(output, file) })),
    { staged: stagedLandingOg, target: landingOg },
    { staged: stagedManifest, target: resolve(output, 'launch-hero-manifest.json') },
  ], staging)
  await assertManifestedPngs()
} catch (error) {
  if (serverLog.trim()) console.error(serverLog.trim())
  throw error
} finally {
  await stopProcess(server)
  await rm(staging, { recursive: true, force: true })
}
