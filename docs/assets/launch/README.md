# Clipboard Router launch artwork

These launch images are source-controlled browser renders of the synthetic product
scene in `landing/src/LaunchScene.tsx`. The scene uses invented notes, code,
links, and protected-item placeholders. It never reads the macOS General
pasteboard or a real Clipboard Router database.

Regenerate and verify the exact export sizes from `landing/`:

```sh
npm run capture:launch
```

The exporter requires Google Chrome on macOS. Set `CHROME_PATH` to use another
Chrome-compatible executable.

The capture runs in an isolated temporary Chrome profile, confirms the launch
page marker, renders each image twice, and refuses to publish mismatched output.
`launch-hero-manifest.json` records the renderer, source files, dimensions, and
SHA-256 digest for each final export. It also maps every launch channel to an
export, an existing asset set, or an explicit no-image requirement.

## Reusable exports

| File | Use |
|---|---|
| `reddit-swiftui-feature-hero-1600x900.png` | Reddit image posts, Indie Hackers, README, directories, and press |
| `microlaunch-feature-hero-680x340.png` | MicroLaunch's current UI-observed hero slot |
| `github-social-preview-1280x640.png` | GitHub repository social preview; verified under 1 MB |
| `landing-social-card-1200x630.png` | GitHub Pages and general Open Graph previews; also published as `landing/public/og.png` |
| `landing/public/product/icon.png` | 512x512 directory icon, including AlternativeTo |

The Mac App Store's five 1440x900 screenshots remain in the source repository's
`.artifacts/app-store-screenshots/` directory and are tracked by
`AppStore/screenshot-manifest.md`. Text-only launch surfaces do not receive a
decorative image.
