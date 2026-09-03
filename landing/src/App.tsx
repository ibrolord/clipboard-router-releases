import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { ActionsPane, ProtectionPane, RetrievalPane, WorkspaceWindow } from './Product'

const APP = {
  version: '0.1.0',
  download:
    'https://github.com/ibrolord/clipboard-router-releases/releases/download/v0.1.0/Clipboard-Router-0.1.0-arm64.zip',
  brew: 'brew install --cask ibrolord/tap/clipboard-router',
  sha: '44d4c15cee3d5f155bdad65089434a93dc19baf1fe03dd247db7f9d50046cda6',
  issues: 'https://github.com/ibrolord/clipboard-router/issues',
  source: 'https://github.com/ibrolord/clipboard-router',
  privacy: 'https://github.com/ibrolord/clipboard-router-releases/blob/main/PRIVACY.md',
  support: 'https://github.com/ibrolord/clipboard-router-releases/blob/main/SUPPORT.md',
} as const

const TRUST_LINE = 'Free and open source · macOS 14+ · Apple silicon'
const CHECKSUM_COMMAND = 'shasum -a 256 ~/Downloads/Clipboard-Router-0.1.0-arm64.zip'
const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`

const NAV_LINKS = [
  ['#features', 'Features'],
  ['#faq', 'FAQ'],
] as const

type FeatureAvailability = 'Included' | 'Requires setup' | 'Engineering preview'

type Feature = readonly [title: string, availability: FeatureAvailability, description: string]
type FeatureGroup = readonly [title: string, features: readonly Feature[]]

const FEATURE_GROUPS: readonly FeatureGroup[] = [
  [
    'Capture and find',
    [
      [
        'Searchable clipboard history',
        'Included',
        'Capture text, URLs, RTF, HTML, images, and file references in their original forms.',
      ],
      [
        'Menu-bar Quick Paste',
        'Included',
        'Preview or copy pinned and recent clips from the menu bar, or paste into the previously active app.',
      ],
      [
        'Advanced search filters',
        'Included',
        'Search by content, app, domain, type, device, coarse location, secret category, date, folder, tag, or recency.',
      ],
      [
        'Smart Views',
        'Included',
        'Save and manage reusable searches that stay on your Mac.',
      ],
      [
        'OCR, previews, and clip details',
        'Included',
        'Read image text locally and inspect previews, provenance, dimensions, size, word count, duplicates, and paste count.',
      ],
      [
        'Capture context',
        'Requires setup',
        'Optionally add a Mac label or coarse location. Exact coordinates are never stored.',
      ],
      [
        'App exclusions and pause controls',
        'Included',
        'Exclude apps from capture or pause clipboard monitoring at any time.',
      ],
    ],
  ],
  [
    'Save and organize',
    [
      [
        'Saved clips and editable notes',
        'Included',
        'Save clips, create notes, or turn text and URLs into notes without changing History.',
      ],
      [
        'Nested folders, tags, and drag-and-drop',
        'Included',
        'Use unlimited nested folders and tags, then move items by menu or drag-and-drop.',
      ],
      [
        'Bulk library actions',
        'Included',
        'Review a selection before saving, moving, tagging, pinning, or exporting it.',
      ],
      [
        'Auto Organize',
        'Included',
        'Preview local filing rules by type, domain, app, entity, or safe pattern, then undo changes.',
      ],
    ],
  ],
  [
    'Combine and automate',
    [
      [
        'Combine Clips',
        'Included',
        'Combine several eligible clips into one reviewed piece of context.',
      ],
      [
        'Paste Stack',
        'Included',
        'Queue clips and copy them back to the system clipboard in order as you paste.',
      ],
      [
        'Deterministic transforms',
        'Included',
        'Trim whitespace, normalize line endings, change case, turn text into a Markdown quote or code block, pretty-print JSON, strip ANSI, or URL-decode.',
      ],
      [
        'Reviewed Custom Actions',
        'Included',
        'Build reviewed steps for tagging, filing, follow-up notes, websites, signed apps, or on-device AI enrichment.',
      ],
      [
        'Folder triggers and durable recovery',
        'Included',
        'Run local tagging and filing when a clip enters a watched folder, and recover after relaunch without replaying uncertain external work.',
      ],
      [
        'Archive export and macOS sharing',
        'Included',
        'Export reviewed material as an archive or share it through macOS.',
      ],
    ],
  ],
  [
    'Act across apps',
    [
      [
        'Actionable links, emails, phone numbers, and dates',
        'Included',
        'Turn detected links, emails, phone numbers, and dates into explicit actions.',
      ],
      [
        'Verified ChatGPT, Claude, and Codex routing',
        'Included',
        'Confirm the signed destination app before changing the clipboard, with no silent website fallback.',
      ],
      [
        'Contacts and Calendar drafts',
        'Requires setup',
        'Review drafts before granting permission or creating a contact or event.',
      ],
      [
        'Salesforce and HubSpot connectors',
        'Engineering preview',
        'Review allowed fields, duplicates, retries, and receipts before writing to a configured provider.',
      ],
      [
        'Live link previews',
        'Included',
        'Load previews only when requested, with clear handling for redirects, errors, offline pages, and unsafe actions.',
      ],
    ],
  ],
  [
    'Assistant and insert',
    [
      [
        'On-device Assistant',
        'Requires setup',
        'Draft and analyze clips with Apple Foundation Models on supported macOS 26 Macs.',
      ],
      [
        'Hosted Assistant',
        'Engineering preview',
        'Bring a Keychain-stored provider key and review content before it leaves the Mac.',
      ],
      [
        'Assistant workflows',
        'Requires setup',
        'Use chat and presets for answers, rewrites, formatting, drafts, enrichment, and opt-in research. Review every result.',
      ],
      [
        'Insert Palette and aliases',
        'Included',
        'Insert saved clips or notes through local semicolon aliases without duplicating their contents.',
      ],
      [
        'System-wide Text Expansion',
        'Requires setup',
        'Expand exact aliases after Accessibility access, block secure fields, and immediately restore the alias with Escape.',
      ],
    ],
  ],
  [
    'Protect sensitive content',
    [
      [
        'Clipboard Health and quarantine',
        'Included',
        'Detect secret-like values in text and OCR, then review whether to keep, delete, or move them to Vault.',
      ],
      [
        'Private Session',
        'Included',
        'Keep new clips in memory, then destroy them when the session is cleared or ended.',
      ],
      [
        'Vault',
        'Included',
        'Encrypt selected text, rich text, HTML, images, and bounded file-reference payloads behind authentication.',
      ],
      [
        'Portable and encrypted sharing',
        'Included',
        'Export eligible text or URLs as clearly labeled Base64, or encrypt them for a public key you verified out of band.',
      ],
    ],
  ],
  [
    'Share and collaborate',
    [
      [
        'iCloud saved-library sync',
        'Engineering preview',
        'Sync eligible saved clips and folders without syncing history, Vault, Private Sessions, quarantine, or pasteboard state.',
      ],
      [
        'Collaborative folders and roles',
        'Engineering preview',
        'Share eligible folders with owner, editor, and viewer roles after identity and provenance checks.',
      ],
      [
        'Visible sync status',
        'Engineering preview',
        'Show each saved item’s sync state and why it remains local.',
      ],
    ],
  ],
  [
    'Built for macOS',
    [
      [
        'Global shortcuts and multi-display placement',
        'Included',
        'Set separate search and note shortcuts, detect conflicts, and open search on the display under your pointer.',
      ],
      [
        'Launch at Login',
        'Requires setup',
        'Start Clipboard Router through the macOS-managed login item.',
      ],
      [
        'Native Mac experience',
        'Included',
        'Use a signed, notarized Apple-silicon app with shortcuts, drag-and-drop, and a three-column library.',
      ],
      [
        'Bundled cr command-line tool',
        'Included',
        'Run matching analyze and transform pipelines from Terminal without changing PATH.',
      ],
    ],
  ],
  [
    'Specialized workflows',
    [
      [
        'Sales Workspaces',
        'Included',
        'Create a local structure for account, contact, and follow-up research.',
      ],
      [
        'Developer Projects and Debug Bundles',
        'Included',
        'Group project clips, build reviewed Markdown debug context, ask the Assistant, and hand bundles to an IDE.',
      ],
    ],
  ],
]

const faqs: readonly (readonly [string, string])[] = [
  [
    'Which Macs can run Clipboard Router?',
    'Version 0.1.0 runs on Apple-silicon Macs with macOS 14 or later. Intel and Mac App Store builds are not available.',
  ],
  [
    'Do I need an account to use it?',
    'No. The local workspace is free and needs no account, subscription, purchase, or license key.',
  ],
  [
    'What happens to the things I copy?',
    'History, saved clips, and notes stay in local app data, and the local workspace sends no analytics. Data leaves your Mac only when you use a feature that sends it elsewhere.',
  ],
  [
    'Is everything in my history encrypted?',
    'No. Ordinary history, saved clips, and notes are local but not Vault-encrypted. Vault encrypts selected clips and requires authentication to reveal them. Other Mac apps may still read plaintext while it is on the shared system pasteboard.',
  ],
  [
    'How is a Private Session different from deleting a clip?',
    'Private Sessions keep new clips in memory and destroy them when you clear or end the session, before they reach history.',
  ],
  [
    'Is sharing something as Base64 the same as encrypting it?',
    'No. Anyone holding Base64 text can decode it. Recipient-key sharing is encrypted and includes replay protection.',
  ],
  [
    'Does Clipboard Router paste or send things for me?',
    'Clipboard Router can prepare a clip and open its destination, but you paste and send it. Assisted paste works only when you enable it and choose the app.',
  ],
  [
    'Can I check the download before I run it?',
    'Yes. Each release is Developer ID signed, notarized, stapled, and published with a SHA-256 checksum and provenance manifest.',
  ],
]

/* ------------------------------------------------------------------ */

/**
 * Content is always visible. The ready state supplies only a small spatial
 * offset, then intersection settles it into place. That gives the page a
 * deliberate entrance without repeating the old hide-after-paint flicker.
 */
function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node || entered) return
    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setEntered(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setEntered(true)
          observer.disconnect()
        }
      },
      // A composition can be taller than the viewport, in which case it can
      // never reach a fractional ratio — settle as soon as any of it lands.
      { threshold: 0 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [entered])

  return (
    <div
      ref={ref}
      className={className || undefined}
      data-enter={entered ? 'in' : 'ready'}
      style={{ '--enter-delay': `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  )
}

function useCopy(value: string) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const copy = useCallback(async () => {
    window.clearTimeout(timer.current)
    try {
      await navigator.clipboard.writeText(value)
      setState('copied')
      timer.current = window.setTimeout(() => setState('idle'), 2400)
      return 'copied' as const
    } catch {
      setState('failed')
      timer.current = window.setTimeout(() => setState('idle'), 6000)
      return 'failed' as const
    }
  }, [value])

  return { state, copy }
}

/** The Homebrew action copies the install command rather than navigating. */
const BREW_COMMAND_ID = 'brew-command'

/** Reveals the printed install command and puts focus on it. */
function showBrewCommand() {
  const target = document.getElementById(BREW_COMMAND_ID)
  if (!target) return
  // Recovering from a failed copy should land immediately: the page-wide
  // smooth behaviour would otherwise animate thousands of pixels, or stall.
  target.focus({ preventScroll: true })
  target.scrollIntoView({ block: 'center', behavior: 'instant' })
}

function BrewAction({ className }: { className: string }) {
  const { state, copy } = useCopy(APP.brew)

  // The sticky nav can sit a long way from the printed command, so a failed
  // copy takes the reader to it instead of pointing vaguely downward.
  const onClick = useCallback(() => {
    if (state === 'failed') {
      showBrewCommand()
      return
    }
    void copy().then((result) => {
      if (result === 'failed') showBrewCommand()
    })
  }, [state, copy])

  return (
    <>
      <button className={className} type="button" onClick={onClick} data-state={state}>
        {state === 'copied'
          ? 'Command copied'
          : state === 'failed'
            ? 'Show the install command'
            : 'Install with Homebrew'}
      </button>
      <span className="sr-only" role="status">
        {state === 'copied'
          ? 'Homebrew install command copied to the clipboard'
          : state === 'failed'
            ? 'Copying is unavailable here. The install command is now shown and focused below.'
            : ''}
      </span>
    </>
  )
}

function CopyButton({ value, label, describes }: { value: string; label: string; describes: string }) {
  const { state, copy } = useCopy(value)
  return (
    <>
      <button className="copy-btn" type="button" onClick={copy} data-state={state}>
        {state === 'copied' ? 'Copied' : state === 'failed' ? 'Select it manually' : label}
      </button>
      <span className="sr-only" role="status">
        {state === 'copied'
          ? `${describes} copied to the clipboard`
          : state === 'failed'
            ? `Automatic copy is unavailable. Select the ${describes} text manually.`
            : ''}
      </span>
    </>
  )
}

/**
 * A product composition drawn in DOM and CSS rather than pasted in as a
 * raster crop (see Product.tsx).
 *
 * The drawing itself is decorative markup — dozens of nested spans that a
 * screen reader would otherwise read out as loose prose — so it is hidden
 * from the accessibility tree and described once, in a sentence, by the
 * caption. Anything the caption states is also stated in the section copy
 * beside it, so nothing is available only to sighted readers.
 */
function Figure({ className, caption, children }: { className: string; caption: string; children: ReactNode }) {
  return (
    <figure className={className}>
      <div className="ui" aria-hidden="true">
        {children}
      </div>
      <figcaption className="sr-only">{caption}</figcaption>
    </figure>
  )
}

/* ------------------------------------------------------------------ */

function SiteNav() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLElement>(null)

  useEffect(() => {
    let frame = 0
    const read = () => {
      frame = 0
      setScrolled(window.scrollY > 6)
    }
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(read)
    }
    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.cancelAnimationFrame(frame)
    }
  }, [])

  const close = useCallback(() => {
    setOpen(false)
    triggerRef.current?.focus()
  }, [])

  // Closing the panel removes the link that was just activated, so hand focus
  // to the destination. preventScroll leaves the anchor jump in charge.
  const followLink = useCallback((href: string) => {
    setOpen(false)
    const target = document.getElementById(href.slice(1))
    if (!target) return
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
    target.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close()
        return
      }
      if (event.key !== 'Tab') return

      // Cycle within the trigger and the panel links so background content
      // never takes focus while the menu covers it.
      const trigger = triggerRef.current
      const panel = panelRef.current
      if (!trigger || !panel) return
      const items: HTMLElement[] = [trigger, ...Array.from(panel.querySelectorAll<HTMLAnchorElement>('a[href]'))]
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement as HTMLElement | null
      const inside = active !== null && items.includes(active)

      if (event.shiftKey ? active === first || !inside : active === last || !inside) {
        event.preventDefault()
        ;(event.shiftKey ? last : first).focus()
      }
    }
    const onResize = () => {
      if (window.innerWidth > 833) setOpen(false)
    }
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.querySelector('a')?.focus()
    document.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
    }
  }, [open, close])

  return (
    <header className="nav" data-scrolled={scrolled} data-open={open}>
      <div className="nav-inner">
        <a className="brand" href="#top">
          <img src={asset('product/icon.png')} alt="" width={28} height={28} />
          <span>Clipboard Router</span>
        </a>

        <nav className="nav-links" aria-label="Sections">
          {NAV_LINKS.map(([href, label]) => (
            <a key={href} href={href}>{label}</a>
          ))}
        </nav>

        <div className="nav-actions">
          <a className="nav-source" href={APP.source}>Source</a>
          <a className="nav-download" href={APP.download}>Download</a>
          <BrewAction className="nav-brew" />
          <button
            ref={triggerRef}
            className="nav-toggle"
            type="button"
            aria-expanded={open}
            aria-controls="nav-panel"
            onClick={() => (open ? close() : setOpen(true))}
          >
            {open ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>

      <nav className="nav-panel" id="nav-panel" aria-label="Sections" ref={panelRef} hidden={!open}>
        {NAV_LINKS.map(([href, label]) => (
          <a key={href} href={href} onClick={() => followLink(href)}>{label}</a>
        ))}
        <a href={APP.source}>Source code</a>
        <a href="#download" onClick={() => followLink('#download')}>Download</a>
      </nav>
    </header>
  )
}

/* ------------------------------------------------------------------ */

function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="shell-wide hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">Clipboard Router for Mac</p>
          <h1 id="hero-title">Work from your clipboard toward 20× productivity.</h1>
          <p className="hero-deck">
            Search captured clips, queue several items for ordered pasting, and run reviewed actions
            when you choose, so you make fewer trips between apps.
          </p>

          <div className="hero-cta">
            <a className="btn" href={APP.download}>Download for Mac</a>
            <BrewAction className="link-action" />
          </div>

          <p className="trust">{TRUST_LINE}</p>
          <p className="productivity-note">
            The 20× target applies to repetitive clipboard work; results vary by workflow.
          </p>
        </div>

        <Reveal className="hero-media">
          <Figure
            className="stage stage-hero"
            caption="An illustration of the Clipboard Router window: a sidebar holding History, Browse, Saved, Notes, Pinned Saved, Projects, Actions, Auto Organize, Clipboard Health, Vault, and Private Session, next to a searchable History list of example clips captured from Notes, Safari, Terminal, and Xcode."
          >
            <WorkspaceWindow />
          </Figure>
        </Reveal>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */

function App() {
  const [openFeatureGroups, setOpenFeatureGroups] = useState<Set<number>>(() => new Set([0]))

  useEffect(() => {
    const syncHashTarget = () => {
      const rawID = window.location.hash.slice(1)
      if (!rawID) return
      let targetID = rawID
      try {
        targetID = decodeURIComponent(rawID)
      } catch {
        return
      }
      document.getElementById(targetID)?.scrollIntoView({ block: 'start' })
    }

    // The browser resolves the fragment before React mounts its target.
    syncHashTarget()
    window.addEventListener('hashchange', syncHashTarget)
    return () => window.removeEventListener('hashchange', syncHashTarget)
  }, [])

  return (
    <>
      <a
        className="skip-link"
        href="#main"
        onClick={() => {
          const target = document.getElementById('main')
          // The anchor still owns the hash and the scroll; this only moves focus.
          target?.focus({ preventScroll: true })
        }}
      >
        Skip to content
      </a>
      <SiteNav />

      <main id="main" tabIndex={-1}>
        <span id="top" />
        <Hero />

        {/* 1 — Recover and reuse */}
        <section id="history" className="chapter chapter-light" aria-labelledby="history-title">
          <div className="shell-wide chapter-grid">
            <Reveal className="chapter-copy">
              <h2 id="history-title">Find captured work without doing it twice.</h2>
              <p>
                Search far beyond keywords—find text, links, images, and files by their content,
                source app, or surrounding context. When a clip matters, promote it into Saved,
                attach notes for why it was kept, or organize it with Projects and Smart Views.
              </p>
            </Reveal>
            <Reveal className="chapter-media" delay={90}>
              <Figure
                className="stage"
                caption="A closer view of the same example workspace: a search for “release notes” narrows History to three of twelve clips, and the selected one is shown promoted into Saved with a note explaining why it was kept and a Launch 1.2 project tag."
              >
                <RetrievalPane />
              </Figure>
            </Reveal>
          </div>
        </section>

        {/* 2 — Reviewable workflows */}
        <section id="actions" className="chapter chapter-tint" aria-labelledby="actions-title">
          <div className="shell-wide chapter-grid chapter-grid-flip">
            <Reveal className="chapter-media chapter-media-left">
              <Figure
                className="stage"
                caption="A closer view of one example automation from the same workspace, named “Review and file product notes”: two reviewed steps, both marked ready, that move a saved clip to the Launch 1.2 folder and open a destination, plus safety rules that prohibit scripts, arbitrary webhooks, and automatic sends; prevent folder triggers from running through sync; queue external steps for review; and prevent Vault or Private Session content from running an action."
              >
                <ActionsPane />
              </Figure>
            </Reveal>
            <Reveal className="chapter-copy" delay={90}>
              <h2 id="actions-title">Automate the work that starts with copy and paste.</h2>
              <p>
                Turn repetitive clipboard work into reviewed steps that file a saved clip, create a
                follow-up note, or open a website or signed app. Run them yourself or when a clip
                enters a watched folder, then use transforms and Paste Stack for the rest of the workflow.
              </p>
            </Reveal>
          </div>
        </section>

        {/* 3 — Sensitive material */}
        <section id="protection" className="chapter chapter-dark on-dark" aria-labelledby="protection-title">
          <div className="shell-wide chapter-grid">
            <Reveal className="chapter-copy">
              <h2 id="protection-title">Move faster without losing control of sensitive content.</h2>
              <p>
                Clipboard Health holds secret-like values found in text and OCR-extracted text out
                of ordinary history for review. Private Session keeps new clips in memory, and Vault
                encrypts clips you choose behind authentication. For encrypted sharing, verify the
                recipient’s public key through another channel.
              </p>
            </Reveal>
            <Reveal className="chapter-media" delay={90}>
              <Figure
                className="stage"
                caption="A closer view of the two protections in the same example workspace: an active Private Session that is recording nothing, holding new clips in memory only until you end it, and a Vault holding two encrypted clips whose contents stay hidden until you authenticate."
              >
                <ProtectionPane />
              </Figure>
            </Reveal>
          </div>
        </section>

        {/* Feature index */}
        <section id="features" className="feature-index" aria-labelledby="features-title">
          <div className="shell">
            <Reveal className="feature-index-head">
              <h2 id="features-title">Explore Clipboard Router’s capabilities.</h2>
              <p className="feature-index-intro">
                Browse the available features below. iCloud sync, CRM connectors, and hosted AI
                appear only as engineering previews and are not available in this release.
              </p>
            </Reveal>
            <div className="feature-groups">
              {FEATURE_GROUPS.map(([groupTitle, features], groupIndex) => {
                const isOpen = openFeatureGroups.has(groupIndex)
                const panelID = `feature-group-${groupIndex + 1}`

                return (
                  <Reveal className="feature-group" key={groupTitle} delay={Math.min(groupIndex * 40, 240)}>
                    <h3 className="feature-group-title">
                      <button
                        className="feature-group-toggle"
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={panelID}
                        onClick={() => {
                          setOpenFeatureGroups((current) => {
                            const next = new Set(current)
                            if (next.has(groupIndex)) next.delete(groupIndex)
                            else next.add(groupIndex)
                            return next
                          })
                        }}
                      >
                        <span className="feature-group-name">{groupTitle}</span>
                        <span className="feature-group-count">{features.length} features</span>
                        <svg
                          className="feature-group-chevron"
                          viewBox="0 0 16 16"
                          aria-hidden="true"
                          focusable="false"
                        >
                          <path d="M3.5 6 8 10.5 12.5 6" />
                        </svg>
                      </button>
                    </h3>
                    <ul id={panelID} className="feature-ledger" role="list" hidden={!isOpen}>
                      {features.map(([title, availability, description]) => (
                        <li className="feature-row" key={title}>
                          <div className="feature-row-label">
                            <h4 className="feature-row-title">{title}</h4>
                            {availability === 'Engineering preview' && (
                              <span className="feature-row-status">Engineering preview</span>
                            )}
                          </div>
                          <p className="feature-row-desc">{description}</p>
                        </li>
                      ))}
                    </ul>
                  </Reveal>
                )
              })}
            </div>
          </div>
        </section>

        {/* 4 — Conversion */}
        <section id="download" className="closer" aria-labelledby="closer-title">
          <div className="shell closer-inner">
            <img className="closer-icon" src={asset('product/icon.png')} alt="" width={72} height={72} loading="lazy" />
            <h2 id="closer-title">Try it on the work you repeat most.</h2>
            <div className="hero-cta">
              <a className="btn" href={APP.download}>Download for Mac</a>
              <BrewAction className="link-action" />
            </div>
            <p className="trust">{TRUST_LINE}</p>
          </div>

          <div className="shell install-grid">
            <Reveal className="install-block" delay={90}>
              <h3>Install it</h3>
              <p>
                Download and unzip the app, then move it to Applications. Or install the Homebrew cask.
              </p>
              <code className="cmd" id={BREW_COMMAND_ID} tabIndex={-1}>{APP.brew}</code>
              <CopyButton value={APP.brew} label="Copy command" describes="Homebrew command" />
            </Reveal>

            <Reveal className="install-block">
              <h3>Verify it</h3>
              <p>
                The app is Developer ID signed, notarized, and stapled. Compare the SHA-256 checksum
                before opening it.
              </p>
              <code className="cmd">{CHECKSUM_COMMAND}</code>
              <code className="cmd cmd-hash">{APP.sha}</code>
              <CopyButton value={APP.sha} label="Copy checksum" describes="SHA-256 checksum" />
            </Reveal>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="faq" aria-labelledby="faq-title">
          <div className="shell">
            <Reveal>
              <h2 id="faq-title">Here’s what to know before you download.</h2>
            </Reveal>
            <Reveal className="faq-list" delay={80}>
              {faqs.map(([question, answer]) => (
                <details key={question}>
                  <summary>{question}</summary>
                  <p>{answer}</p>
                </details>
              ))}
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="shell footer-inner">
          <p className="footer-brand">Clipboard Router {APP.version} for macOS</p>
          <nav className="footer-links" aria-label="Resources">
            <a href={APP.privacy}>Privacy</a>
            <a href={APP.support}>Support</a>
            <a href={APP.source}>Source code</a>
            <a href={APP.issues}>Open an issue</a>
          </nav>
          <p className="footer-note">
            Please keep clipboard contents and credentials out of bug reports.
          </p>
        </div>
      </footer>
    </>
  )
}

export default App
