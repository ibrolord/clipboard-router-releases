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

const TRUST_LINE = 'Free and open source · macOS 14 Sonoma or later · Apple silicon · Version 0.1.0'
const CHECKSUM_COMMAND = 'shasum -a 256 ~/Downloads/Clipboard-Router-0.1.0-arm64.zip'
const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`

const NAV_LINKS = [
  ['#history', 'History'],
  ['#actions', 'Actions'],
  ['#protection', 'Protection'],
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
        'Capture plain text, URLs, RTF, HTML, images, and file references while preserving their original representations.',
      ],
      [
        'Menu-bar Quick Paste',
        'Included',
        'Reach pinned and recent clips, preview them, copy them, or optionally paste into the app that was active before the menu opened.',
      ],
      [
        'Advanced search filters',
        'Included',
        'Search by content, source app, domain, type, device, approximate location, secret category, date, folder, tag, or recent position.',
      ],
      [
        'Smart Views',
        'Included',
        'Save, rename, pin, reorder, edit, and delete reusable searches that remain local.',
      ],
      [
        'OCR, previews, and clip details',
        'Included',
        'Extract text from supported images locally and inspect thumbnails, provenance, dimensions, size, word counts, duplicate counts, and paste counts.',
      ],
      [
        'Capture context',
        'Requires setup',
        'Optionally attach a local Mac label or a coarse location label; exact coordinates are never stored.',
      ],
      [
        'App exclusions and pause controls',
        'Included',
        'Exclude installed or running apps from capture and pause or resume clipboard monitoring.',
      ],
    ],
  ],
  [
    'Save and organize',
    [
      [
        'Saved clips and editable notes',
        'Included',
        'Save useful clips, create first-class notes, or turn eligible text and URLs into notes without changing the History source.',
      ],
      [
        'Nested folders, tags, and drag-and-drop',
        'Included',
        'Organize saved material in unlimited nested folders and move items safely by menu or drag-and-drop.',
      ],
      [
        'Bulk library actions',
        'Included',
        'Review multiple selections before saving, moving, tagging, pinning, unpinning, or exporting them.',
      ],
      [
        'Auto Organize',
        'Included',
        'Create local rules based on type, domain, source app, detected entity, or safe regular expressions, then preview and undo changes.',
      ],
    ],
  ],
  [
    'Combine and automate',
    [
      [
        'Combine Clips',
        'Included',
        'Gather several eligible clips into one reviewed piece of context.',
      ],
      [
        'Paste Stack',
        'Included',
        'Queue several clips and paste them in the exact order you choose.',
      ],
      [
        'Deterministic transforms',
        'Included',
        'Clean, extract, and reformat copied text through predictable local steps.',
      ],
      [
        'Reviewed Custom Actions',
        'Included',
        'Build explicit tag, move, follow-up-note, enrichment, web, or app-handoff steps that wait for review.',
      ],
      [
        'Folder triggers and durable recovery',
        'Included',
        'Run reversible local steps when items enter a folder and resume retry-safe work after relaunch without blindly repeating uncertain external actions.',
      ],
      [
        'Archive export and macOS sharing',
        'Included',
        'Export reviewed material as a portable archive or use the standard macOS share sheet.',
      ],
    ],
  ],
  [
    'Act across apps',
    [
      [
        'Actionable links, emails, phone numbers, and dates',
        'Included',
        'Detect useful entities locally and offer explicit Open, Compose, Calling App, Save Contact, Calendar Draft, Research, and Find Related actions.',
      ],
      [
        'Verified ChatGPT, Claude, and Codex routing',
        'Included',
        'Resolve the intended signed application before changing the clipboard and never silently substitute a website after launch failure.',
      ],
      [
        'Contacts and Calendar drafts',
        'Requires setup',
        'Review every draft before granting permission or creating a system record.',
      ],
      [
        'Salesforce and HubSpot connectors',
        'Engineering preview',
        'Review allowlisted fields, duplicates, retries, and reconciliation receipts before any CRM write.',
      ],
      [
        'Live link previews',
        'Included',
        'Load a link preview only when requested and keep redirect, error, offline, and unsafe-action handling bounded.',
      ],
    ],
  ],
  [
    'Assistant and insert',
    [
      [
        'On-device Assistant',
        'Requires setup',
        "Use Apple's Foundation Models on a supported macOS 26 Mac for clip-scoped drafting and analysis.",
      ],
      [
        'Hosted Assistant',
        'Engineering preview',
        "Use an explicit bring-your-own API key stored in this Mac's Keychain; no request leaves the Mac until Send is pressed.",
      ],
      [
        'Assistant workflows',
        'Requires setup',
        'Use multi-turn chat and presets for quick answers, enrichment, rewriting, formatting, follow-up drafts, and opt-in research while treating every result as an unverified draft.',
      ],
      [
        'Insert Palette and aliases',
        'Included',
        'Insert saved clips or notes through local semicolon aliases without duplicating their contents.',
      ],
      [
        'System-wide Text Expansion',
        'Requires setup',
        'Expand exact aliases after explicit Accessibility access, with secure-field blocking and immediate Escape restoration.',
      ],
    ],
  ],
  [
    'Protect sensitive content',
    [
      [
        'Clipboard Health and quarantine',
        'Included',
        'Detect secret-like values across captured text and OCR, then keep, delete, or move eligible material to Vault after review.',
      ],
      [
        'Private Session',
        'Included',
        'Keep new clips in memory only and destroy them when the session is cleared or ended.',
      ],
      [
        'Vault',
        'Included',
        'Encrypt deliberately protected text, rich text, HTML, images, and bounded file-reference payloads and require authentication before reveal.',
      ],
      [
        'Portable and encrypted sharing',
        'Included',
        'Use clearly labeled reversible Base64 for eligible portable content or recipient-key encryption with replay protection.',
      ],
    ],
  ],
  [
    'Share and collaborate',
    [
      [
        'iCloud saved-library sync',
        'Engineering preview',
        'Sync eligible saved clips and folders without syncing active history, Vault, quarantine, Private Sessions, or the Mac pasteboard.',
      ],
      [
        'Collaborative folders and roles',
        'Engineering preview',
        'Share eligible saved folders with owner, editor, and viewer permissions after CloudKit identity and provenance checks pass.',
      ],
      [
        'Visible sync status',
        'Engineering preview',
        'See per-item sync state and why a clip is local-only or ineligible.',
      ],
    ],
  ],
  [
    'Built for macOS',
    [
      [
        'Global shortcuts and multi-display placement',
        'Included',
        'Configure separate search and note shortcuts, detect conflicts, and open search on the display containing the pointer.',
      ],
      [
        'Launch at Login',
        'Requires setup',
        'Start Clipboard Router with macOS after the user enables the system-managed login item.',
      ],
      [
        'Native Mac experience',
        'Included',
        'Use keyboard shortcuts, drag-and-drop organization, a three-column library, and a signed and notarized Apple-silicon app for macOS 14 or later.',
      ],
      [
        'Bundled cr command-line tool',
        'Included',
        'Run version-matched analyze and transform pipelines from Terminal without changing PATH unless the user explicitly exports the helper.',
      ],
    ],
  ],
  [
    'Specialized workflows',
    [
      [
        'Sales Workspaces',
        'Included',
        'Create a ready-made local research structure for organizing account, contact, and follow-up material.',
      ],
      [
        'Developer Projects and Debug Bundles',
        'Included',
        'Group project clips, build reviewed Markdown debug context, save or share bundles, ask the Assistant, and hand work to an IDE.',
      ],
    ],
  ],
]

const faqs: readonly (readonly [string, string])[] = [
  [
    'Which Macs can run Clipboard Router?',
    'Version 0.1.0 runs on macOS 14 Sonoma or later, on Apple silicon. There is no Intel or universal build yet, and it is not currently available on the Mac App Store.',
  ],
  [
    'Do I need an account to use it?',
    'No. The local workspace needs no account, purchase, subscription, or license key, and this initial release is free.',
  ],
  [
    'What happens to the things I copy?',
    'They stay on your Mac as local application data that you can search, save, annotate, and organize. The local workspace has no analytics transport. Optional features can transmit data only after you enable or invoke them, and the privacy terms of whatever service you send to then apply.',
  ],
  [
    'Is everything in my history encrypted?',
    'No, and the difference matters. Ordinary history, saved clips, and notes are local application data rather than Vault content. Vault is the separate store that is encrypted and requires authentication before a clip is revealed.',
  ],
  [
    'How is a Private Session different from deleting a clip?',
    'A Private Session keeps new clips in memory only, and they are destroyed when you clear or end the session, so they never reach your history in the first place.',
  ],
  [
    'Is sharing something as Base64 the same as encrypting it?',
    'No. Base64 is encoding, not encryption, so anyone holding the string can decode it. Recipient-key sharing is the separate encrypted option, and it includes replay protection.',
  ],
  [
    'Does Clipboard Router paste or send things for me?',
    'No. It can prepare a reviewed clip and open the destination for you, but you are the one who pastes and presses Send. Accessibility-assisted paste is opt-in and only ever pastes into an app you picked.',
  ],
  [
    'Can I check the download before I run it?',
    'Yes. The app is signed with an Apple Developer ID, notarized, and stapled, and every release ships a SHA-256 checksum and a build-provenance manifest you can verify yourself.',
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
            Clipboard Router keeps captured clips ready to reuse, turns repeated work into
            reviewable automations, and protects sensitive clips, so you can finish more without
            retracing steps or switching context.
          </p>

          <div className="hero-cta">
            <a className="btn" href={APP.download}>Download for Mac</a>
            <BrewAction className="link-action" />
          </div>

          <p className="trust">{TRUST_LINE}</p>
          <p className="productivity-note">
            The 20× goal applies to repetitive clipboard-heavy workflows where saved searches and
            reviewed automations replace repeated app switching; results vary by workflow.
          </p>
        </div>

        <Reveal className="hero-media">
          <Figure
            className="stage stage-hero"
            caption="An illustration of the Clipboard Router window: a sidebar holding History, Browse, Saved, Notes, Pinned Saved, iCloud Sync, Projects, Actions, Auto Organize, Clipboard Health, Vault, and Private Session, next to a searchable History list of example clips captured from Notes, Safari, Terminal, and Xcode."
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
                Clipboard Router captures what you copy as you work and keeps it organized on your
                Mac, so the snippet, link, or address you need is still there when you go looking
                for it. You can search by content or by the context around it, and open any clip
                with its full detail.
              </p>
              <p>
                When something is worth more than a place in history, you can promote it into Saved,
                add a Note that records why it mattered, group it into a Project, pin what you reach
                for constantly, and keep a search you trust as a Smart View.
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
                caption="A closer view of one example automation from the same workspace, named “Review and file product notes”: two steps that clean the clip and file it into the Launch 1.2 project, a result waiting for you to paste and send, and the safety rules that no scripts, arbitrary webhooks, or automatic sends are allowed, that folder triggers never run from sync and queue external steps for review, and that Vault and Private Session content can never run an action."
              >
                <ActionsPane />
              </Figure>
            </Reveal>
            <Reveal className="chapter-copy" delay={90}>
              <h2 id="actions-title">Automate the work that starts with copy and paste.</h2>
              <p>
                Turn the work you repeat every day into a reviewable workflow. Custom Actions can
                clean, extract, or reformat a clip; Auto Organize can file it using rules you preview
                before they apply and undo afterward; Paste Stack can gather several clips into the
                exact sequence you need; and the bundled command-line tool can run the same pipelines.
              </p>
              <p className="chapter-note">
                Routing prepares a reviewed clip and opens the destination for you. You are still
                the one who pastes and presses Send, and accessibility-assisted paste only runs when
                you turn it on.
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
                Some of what you copy should not sit in a list for the rest of the week. Clipboard
                Health looks for secret-like values in captured text, including text read out of
                images, and holds them for review instead of filing them normally.
              </p>
              <p>
                A Private Session keeps new clips in memory only until you clear or end it, so they
                never reach your history. Vault is the encrypted store that asks you to authenticate
                before a clip is revealed, and recipient-key sharing encrypts a clip for one
                intended recipient with replay protection.
              </p>
              <p className="chapter-note chapter-note-dark">
                Two things worth stating plainly: ordinary history is local but is not Vault
                encrypted, and Base64 is encoding, not encryption, because anyone holding the string
                can decode it.
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
              <h2 id="features-title">Clipboard Router helps you find, reuse, organize, automate, protect, and share what you copy.</h2>
              <p className="feature-index-intro">All 40 user-facing features in version {APP.version} are grouped below.</p>
            </Reveal>
            <div className="feature-groups">
              {FEATURE_GROUPS.map(([groupTitle, features], groupIndex) => (
                <Reveal className="feature-group" key={groupTitle} delay={Math.min(groupIndex * 40, 240)}>
                  <h3 className="feature-group-title">
                    <span className="feature-group-index" aria-hidden="true">{String(groupIndex + 1).padStart(2, '0')}</span>
                    {groupTitle}
                  </h3>
                  <ul className="feature-ledger" role="list">
                    {features.map(([title, , description]) => (
                      <li className="feature-row" key={title}>
                        <h4 className="feature-row-title">{title}</h4>
                        <p className="feature-row-desc">{description}</p>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* 4 — Conversion */}
        <section id="download" className="closer" aria-labelledby="closer-title">
          <div className="shell closer-inner">
            <img className="closer-icon" src={asset('product/icon.png')} alt="" width={72} height={72} loading="lazy" />
            <h2 id="closer-title">Work from your clipboard and keep your momentum.</h2>
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
                Download the archive, unzip it, move Clipboard Router to your Applications folder,
                and launch it from the menu bar. If you prefer Homebrew, install the cask instead.
              </p>
              <code className="cmd" id={BREW_COMMAND_ID} tabIndex={-1}>{APP.brew}</code>
              <CopyButton value={APP.brew} label="Copy command" describes="Homebrew command" />
            </Reveal>

            <Reveal className="install-block">
              <h3>Verify it</h3>
              <p>
                The app is signed with an Apple Developer ID, notarized, and stapled. Every release
                also ships a SHA-256 checksum and a build-provenance manifest, so you can confirm
                the download before you run it.
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
              <h2 id="faq-title">Questions, answered plainly.</h2>
            </Reveal>
            <Reveal className="faq-list" delay={80}>
              {faqs.map(([question, answer], index) => (
                <details key={question} open={index === 0}>
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
            When you report a bug, please leave out clipboard contents, credentials, and anything
            else you would not want in a public thread.
          </p>
        </div>
      </footer>
    </>
  )
}

export default App
