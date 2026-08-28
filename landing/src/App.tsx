import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

const APP = {
  version: '0.1.0',
  download:
    'https://github.com/ibrolord/clipboard-router-releases/releases/download/v0.1.0/Clipboard-Router-0.1.0-arm64.zip',
  brew: 'brew install --cask ibrolord/tap/clipboard-router',
  sha: '44d4c15cee3d5f155bdad65089434a93dc19baf1fe03dd247db7f9d50046cda6',
  issues: 'https://github.com/ibrolord/clipboard-router-releases/issues',
  privacy: 'https://github.com/ibrolord/clipboard-router-releases/blob/main/PRIVACY.md',
  support: 'https://github.com/ibrolord/clipboard-router-releases/blob/main/SUPPORT.md',
} as const

const TRUST_LINE = 'Free · macOS 14 Sonoma or later · Apple silicon · Version 0.1.0'
const CHECKSUM_COMMAND = 'shasum -a 256 ~/Downloads/Clipboard-Router-0.1.0-arm64.zip'
const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`

const NAV_LINKS = [
  ['#history', 'History'],
  ['#actions', 'Actions'],
  ['#protection', 'Protection'],
  ['#faq', 'FAQ'],
] as const

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
      { threshold: 0.25 },
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
 * A single cropped detail plate from the privacy-safe real SwiftUI capture harness.
 *
 * Desktop and mobile sources are different crops. A <picture> with a
 * matching <source> lets the browser resolve and fetch only the one
 * source that applies to the current viewport, instead of downloading
 * both. CSS sizes the resulting <img> per breakpoint exactly as before.
 */
type PlateProps = {
  src: string
  alt: string
  width: number
  height: number
  className: string
  priority?: boolean
} & (
  | { mobileSrc?: undefined; mobileWidth?: undefined; mobileHeight?: undefined }
  | { mobileSrc: string; mobileWidth: number; mobileHeight: number }
)

function Plate({
  src,
  mobileSrc,
  mobileWidth,
  mobileHeight,
  alt,
  width,
  height,
  className,
  priority = false,
}: PlateProps) {
  const loading = priority ? 'eager' : 'lazy'
  const fetchPriority = priority ? 'high' : 'auto'

  const img = (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      decoding="async"
      loading={loading}
      fetchPriority={fetchPriority}
    />
  )

  if (!mobileSrc) {
    return <span className={className}>{img}</span>
  }

  return (
    <span className={className}>
      <picture>
        <source
          media="(max-width: 833px)"
          srcSet={mobileSrc}
          width={mobileWidth}
          height={mobileHeight}
        />
        {img}
      </picture>
    </span>
  )
}

/* ------------------------------------------------------------------ */

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
          <h1 id="hero-title">Everything you copy is ready when you need it.</h1>
          <p className="hero-deck">
            Clipboard Router keeps your clipboard searchable, turns repeated steps into workflows you
            can review, and gives sensitive clips a safer place to go.
          </p>

          <div className="hero-cta">
            <a className="btn" href={APP.download}>Download for Mac</a>
            <BrewAction className="link-action" />
          </div>

          <p className="trust">{TRUST_LINE}</p>
        </div>

        <Reveal className="hero-stage">
          <Plate
            className="plate plate-hero"
            src={asset('product/plate-hero.png')}
            mobileSrc={asset('product/plate-hero-mobile.png')}
            mobileWidth={850}
            mobileHeight={754}
            alt="Clipboard Router's real dark-mode History view with fictional clips from Notes, Safari, Terminal, and Xcode."
            width={1299}
            height={812}
            priority
          />
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
              <h2 id="history-title">Find what you copied in a clean, local history.</h2>
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
            <Reveal className="chapter-media history-figure" delay={90}>
              <Plate
                className="plate plate-history-list"
                src={asset('product/plate-history-list.png')}
                alt="A searchable local History of fictional notes, links, commands, and code rendered by the real Clipboard Router interface."
                width={670}
                height={840}
              />
              <Plate
                className="plate plate-history-sidebar"
                mobileSrc={asset('product/plate-history-sidebar-mobile.png')}
                mobileWidth={440}
                mobileHeight={422}
                src={asset('product/plate-history-sidebar.png')}
                alt="The real Clipboard Router sidebar with Saved, Notes, Actions, Auto Organize, Clipboard Health, Vault, and Private Session."
                width={440}
                height={850}
              />
            </Reveal>
          </div>
        </section>

        {/* 2 — Reviewable workflows */}
        <section id="actions" className="chapter chapter-tint" aria-labelledby="actions-title">
          <div className="shell-wide chapter-grid chapter-grid-flip">
            <Reveal className="chapter-media chapter-media-left actions-figure">
              <Plate
                className="plate plate-actions-control"
                mobileSrc={asset('product/plate-actions-control-mobile.png')}
                mobileWidth={874}
                mobileHeight={883}
                src={asset('product/plate-actions-control.png')}
                alt="The real Actions workspace with a fictional review-and-file action, one-click destinations, and run-safety controls."
                width={1250}
                height={680}
              />
              <Plate
                className="plate plate-actions-safety"
                src={asset('product/plate-actions-safety.png')}
                alt="The Actions safety rules stating that scripts, arbitrary webhooks, and automatic sends are not allowed."
                width={1212}
                height={240}
              />
              <ul className="actions-safety-text">
                <li>No scripts or arbitrary webhooks.</li>
                <li>Folder triggers never run from sync.</li>
                <li>Vault or Private Session content cannot run actions.</li>
              </ul>
            </Reveal>
            <Reveal className="chapter-copy" delay={90}>
              <h2 id="actions-title">Turn repeated steps into actions you can review.</h2>
              <p>
                The work you repeat every day can become a reviewable step instead. Build custom
                Actions that clean, extract, or reformat a clip, let Auto Organize file things by
                rules you can preview before they apply and undo afterward, gather several clips
                into a Paste Stack, and run the same pipelines from the bundled command-line tool.
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
              <h2 id="protection-title">Keep sensitive clips out of ordinary history.</h2>
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
            <Reveal className="chapter-media protection-figure" delay={90}>
              <Plate
                className="plate plate-privacy-switch"
                src={asset('product/plate-privacy-switch.png')}
                alt="The real active Private Session controls in the Clipboard Router sidebar."
                width={440}
                height={180}
              />
              <Plate
                className="plate plate-privacy-empty"
                mobileSrc={asset('product/plate-privacy-empty-mobile.png')}
                mobileWidth={773}
                mobileHeight={405}
                src={asset('product/plate-privacy-empty.png')}
                alt="Private Session is active: new clips stay only in memory and disappear when the session ends."
                width={1200}
                height={650}
              />
              <Plate
                className="plate plate-privacy-toast"
                mobileSrc={asset('product/plate-privacy-toast-mobile.png')}
                mobileWidth={1100}
                mobileHeight={110}
                src={asset('product/plate-privacy-toast.png')}
                alt="Confirmation toast: Private Session started, nothing will be saved."
                width={1100}
                height={120}
              />
            </Reveal>
          </div>
        </section>

        {/* 4 — Conversion */}
        <section id="download" className="closer" aria-labelledby="closer-title">
          <div className="shell closer-inner">
            <img className="closer-icon" src={asset('product/icon.png')} alt="" width={72} height={72} loading="lazy" />
            <h2 id="closer-title">All your clipboard work, captured, organized, and ready.</h2>
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
