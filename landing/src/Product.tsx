/**
 * Synthetic product UI.
 *
 * Everything the landing page shows of the app is drawn here in DOM and CSS
 * from one shared token scale (see the `.ui` block in App.css), not cropped
 * out of raster captures. That buys three things the old plate set could not
 * have: it is crisp at every pixel ratio, every close-up is provably the same
 * components at the same scale as the hero, and no bytes from a real
 * clipboard can reach the page.
 *
 * Every string below is invented for the page. Links point at example.com or
 * github.com/example, and the sidebar mirrors the app's real taxonomy so the
 * demonstration stays truthful without inventing capabilities.
 */

const ICONS = {
  history: 'M8 4.2v4l2.6 1.6M2.6 8a5.4 5.4 0 1 0 1.7-3.9M2.4 3v2.6H5',
  browse: 'M3 4.6h10M3 8h10M3 11.4h6',
  search: 'M7.2 11.4a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4ZM10.4 10.4 13.4 13.4',
  saved: 'M4 2.9h8v10.6L8 10.7l-4 2.8Z',
  note: 'M3.4 3.2h9.2v9.6H3.4ZM5.6 6.2h4.8M5.6 8.6h3.2',
  pin: 'M6.2 2.6h3.6M6.6 2.6v3.2L5 8.2h6L9.4 5.8V2.6M8 8.2v5',
  cloud: 'M4.8 11.6h6a2.4 2.4 0 0 0 .2-4.8 3.4 3.4 0 0 0-6.5.7 2.1 2.1 0 0 0 .3 4.1Z',
  projects: 'M2.6 4.6h4l1.2 1.6h5.6v6.6H2.6Z',
  actions: 'M8.8 2.2 4.2 8.9h3.2l-.6 4.9 4.8-6.9H8.3Z',
  organize: 'M3 12.8 10.4 5.4M9 4 12 7M11.2 2.2l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4L9.2 4.2l1.4-.6ZM3.6 3l.4 1 1 .4-1 .4-.4 1-.4-1-1-.4 1-.4Z',
  health: 'M8 2.4 3.4 4.2v3.4c0 2.6 1.9 5 4.6 5.9 2.7-.9 4.6-3.3 4.6-5.9V4.2ZM6.1 7.9 7.5 9.3l2.6-2.7',
  vault: 'M4 7.1h8v5.9H4ZM5.9 7.1V5.2a2.1 2.1 0 0 1 4.2 0v1.9M8 9.3v1.6',
  private: 'M2.4 8s2.3-3.9 5.6-3.9c1 0 1.9.4 2.7.9M13.6 8s-2.3 3.9-5.6 3.9c-1 0-2-.4-2.7-.9M3 3l10 10',
  text: 'M3.6 2.6h8.8v10.8H3.6ZM5.8 5.6h4.4M5.8 8h4.4M5.8 10.4h2.6',
  link: 'M6.6 9.4 9.4 6.6M6.9 4.6 8.2 3.3a2.6 2.6 0 0 1 3.7 3.7l-1.3 1.3M9.1 11.4l-1.3 1.3a2.6 2.6 0 0 1-3.7-3.7l1.3-1.3',
  terminal: 'M2.6 3.2h10.8v9.6H2.6ZM5 6.4l1.9 1.6L5 9.6M8.6 10h3',
  code: 'M5.6 5.2 2.8 8l2.8 2.8M10.4 5.2 13.2 8l-2.8 2.8M9.1 3.4 6.9 12.6',
  copy: 'M5.4 5.4h7.2v7.2H5.4ZM3.4 10.2V3.4h6.8',
  check: 'M3.6 8.4 6.4 11.2l6-6.4',
  bolt: 'M8.8 2.2 4.2 8.9h3.2l-.6 4.9 4.8-6.9H8.3Z',
  send: 'M13.4 2.6 2.6 6.9l4.3 1.8 1.8 4.3Z',
  plus: 'M8 3.4v9.2M3.4 8h9.2',
  chevron: 'M6.4 4.4 10 8l-3.6 3.6',
} as const

type IconName = keyof typeof ICONS

function Icon({ name }: { name: IconName }) {
  return (
    <svg className="ui-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d={ICONS[name]} />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* Shared primitives — the hero window and every close-up are built    */
/* from these, at one identical size. Nothing is ever transform-scaled. */
/* ------------------------------------------------------------------ */

type Clip = {
  kind: IconName
  tone?: 'blue' | 'green' | 'violet'
  title: string
  source: string
  when: string
  state?: 'selected' | 'fresh'
}

/** The fictional workspace every composition on the page draws from. */
const WORKSPACE: readonly Clip[] = [
  {
    kind: 'text',
    title: 'Ship the onboarding flow before Friday’s review.',
    source: 'Notes',
    when: 'Just now',
    state: 'fresh',
  },
  {
    kind: 'link',
    title: 'https://docs.example.com/product/clipboard-workflows',
    source: 'Safari',
    when: '2 min ago',
  },
  {
    kind: 'terminal',
    title: 'npm run typecheck && npm run test',
    source: 'Terminal',
    when: '11 min ago',
  },
  {
    kind: 'text',
    title: 'Draft the release notes from the approved checklist.',
    source: 'Notes',
    when: '24 min ago',
    state: 'selected',
  },
  {
    kind: 'code',
    title: 'SELECT status, count(*) FROM tasks GROUP BY status;',
    source: 'Xcode',
    when: '38 min ago',
  },
  {
    kind: 'link',
    title: 'https://github.com/example/clipboard-router/issues/42',
    source: 'Safari',
    when: '52 min ago',
  },
  {
    kind: 'text',
    title: 'Turn these meeting notes into a launch checklist.',
    source: 'Notes',
    when: '1 hr ago',
  },
]

function ClipRow({ clip }: { clip: Clip }) {
  return (
    <div className="ui-row" data-state={clip.state}>
      <span className="ui-tile" data-tone={clip.tone ?? 'blue'}>
        <Icon name={clip.kind} />
      </span>
      <span className="ui-row-text">
        <span className="ui-row-title">{clip.title}</span>
        <span className="ui-row-meta">
          {clip.when}
          <i>·</i>
          History
          <i>·</i>
          {clip.source}
        </span>
      </span>
      <span className="ui-row-copy">
        <Icon name="copy" />
      </span>
    </div>
  )
}

function SearchField({ query, placeholder }: { query?: string; placeholder: string }) {
  return (
    <div className="ui-search">
      <Icon name="search" />
      {query ? <span className="ui-search-query">{query}</span> : <span className="ui-search-hint">{placeholder}</span>}
      {query ? <span className="ui-caret" /> : null}
    </div>
  )
}

const SIDEBAR = [
  {
    group: 'Find',
    items: [
      { icon: 'history', label: 'History', badge: '12', active: true },
      { icon: 'browse', label: 'Browse' },
    ],
  },
  {
    group: 'Keep',
    items: [
      { icon: 'saved', label: 'Saved' },
      { icon: 'note', label: 'Notes' },
      { icon: 'pin', label: 'Pinned Saved' },
      { icon: 'cloud', label: 'iCloud Sync' },
      { icon: 'projects', label: 'Projects' },
    ],
  },
  {
    group: 'Use',
    items: [
      { icon: 'actions', label: 'Actions' },
      { icon: 'organize', label: 'Auto Organize' },
    ],
  },
  {
    group: 'Protect',
    items: [
      { icon: 'health', label: 'Clipboard Health' },
      { icon: 'vault', label: 'Vault' },
    ],
  },
] as const satisfies readonly {
  group: string
  items: readonly { icon: IconName; label: string; badge?: string; active?: boolean }[]
}[]

function Sidebar() {
  return (
    <div className="ui-sidebar">
      {SIDEBAR.map(({ group, items }) => (
        <div className="ui-group" key={group}>
          <p className="ui-group-label">{group}</p>
          {items.map((item) => (
            <div className="ui-item" key={item.label} data-active={'active' in item && item.active ? 'true' : undefined}>
              <Icon name={item.icon} />
              <span className="ui-item-label">{item.label}</span>
              {'badge' in item && item.badge ? <span className="ui-badge">{item.badge}</span> : null}
            </div>
          ))}
        </div>
      ))}

      <div className="ui-group ui-group-footer">
        <div className="ui-item ui-item-private">
          <Icon name="private" />
          <span className="ui-item-label">Private Session</span>
          <span className="ui-switch" />
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 1 — The dominant composition                                        */
/* ------------------------------------------------------------------ */

export function WorkspaceWindow() {
  return (
    <div className="ui-window">
      <div className="ui-titlebar">
        <span className="ui-lights">
          <i /> <i /> <i />
        </span>
        <span className="ui-title">Clipboard Router</span>
      </div>

      <div className="ui-body">
        <Sidebar />

        <div className="ui-main">
          <div className="ui-main-head">
            <div>
              <p className="ui-h">History</p>
              <p className="ui-sub">12 clips on this Mac</p>
            </div>
            <span className="ui-pill">
              Selected Items
              <Icon name="chevron" />
            </span>
          </div>

          <div className="ui-main-tools">
            <SearchField placeholder="Search everything you have copied" />
          </div>

          <div className="ui-list">
            {WORKSPACE.map((clip) => (
              <ClipRow clip={clip} key={clip.title} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 2 — Close-ups. Same primitives, same scale, framed differently.      */
/* ------------------------------------------------------------------ */

/** Retrieval: a search narrowing history, and the clip promoted out of it. */
export function RetrievalPane() {
  return (
    <div className="ui-pair">
      <div className="ui-pane">
        <div className="ui-pane-head">
          <p className="ui-h-sm">History</p>
          <span className="ui-count">3 of 12</span>
        </div>
        <SearchField query="release notes" placeholder="Search" />
        <div className="ui-list ui-list-tight">
          {[WORKSPACE[3], WORKSPACE[6], WORKSPACE[0]].map((clip) => (
            <ClipRow clip={{ ...clip, state: clip === WORKSPACE[3] ? 'selected' : undefined }} key={clip.title} />
          ))}
        </div>
      </div>

      <div className="ui-pane ui-pane-detail">
        <div className="ui-pane-head">
          <p className="ui-h-sm">Saved</p>
          <span className="ui-chip-row">
            <span className="ui-chip" data-tone="violet">
              <Icon name="projects" />
              Launch 1.2
            </span>
            <span className="ui-chip">
              <Icon name="pin" />
              Pinned
            </span>
          </span>
        </div>
        <p className="ui-detail-body">Draft the release notes from the approved checklist.</p>
        <div className="ui-note">
          <span className="ui-note-label">
            <Icon name="note" />
            Note
          </span>
          <p>Kept because the wording was signed off — reuse it verbatim for the 1.2 announcement.</p>
        </div>
        <p className="ui-foot">Saved from History · Notes · Project “Launch 1.2”</p>
      </div>
    </div>
  )
}

/** Action: one reviewable automation, its steps, and the safety rules. */
export function ActionsPane() {
  return (
    <div className="ui-pair ui-pair-stack">
      <div className="ui-pane">
        <div className="ui-pane-head">
          <p className="ui-h-sm">Custom actions</p>
          <span className="ui-count">1 action</span>
        </div>

        <div className="ui-action">
          <span className="ui-tile" data-tone="green">
            <Icon name="bolt" />
          </span>
          <span className="ui-row-text">
            <span className="ui-row-title">Review and file product notes</span>
            <span className="ui-row-meta">
              Any clip<i>·</i>2 steps<i>·</i>manual
            </span>
          </span>
          <span className="ui-switch" data-on="true" />
        </div>

        <ol className="ui-steps">
          <li>
            <span className="ui-step-num">1</span>
            <span>Clean the clip and pull out the checklist lines.</span>
            <span className="ui-step-tag">Ready</span>
          </li>
          <li>
            <span className="ui-step-num">2</span>
            <span>File it into the Launch 1.2 project and open the destination.</span>
            <span className="ui-step-tag">Ready</span>
          </li>
        </ol>

        <div className="ui-review">
          <span className="ui-review-text">
            <Icon name="send" />
            Prepared and waiting for you to paste and send.
          </span>
          <span className="ui-btn">Review</span>
        </div>
      </div>

      <div className="ui-pane ui-pane-safety">
        <div className="ui-pane-head">
          <p className="ui-h-sm">Safety</p>
        </div>
        <ul className="ui-rules">
          <li>
            <Icon name="check" />
            No scripts, arbitrary webhooks, or automatic sends.
          </li>
          <li>
            <Icon name="check" />
            Folder triggers never run from sync, and external steps queue for review.
          </li>
          <li>
            <Icon name="check" />
            Vault and Private Session content can never run an action.
          </li>
        </ul>
      </div>
    </div>
  )
}

/** Privacy: the two separate protections, side by side and clearly distinct. */
export function ProtectionPane() {
  return (
    <div className="ui-pair ui-pair-stack">
      <div className="ui-pane ui-pane-private">
        <div className="ui-pane-head">
          <p className="ui-h-sm">
            <span className="ui-live" />
            Private Session
          </p>
          <span className="ui-switch" data-on="true" data-tone="violet" />
        </div>
        <p className="ui-empty-title">Private Session is recording nothing yet</p>
        <p className="ui-empty-body">
          Clips you copy from now on stay in memory for this session only. Nothing is written to
          history, search, or disk, and the session clears when you end it.
        </p>
        <span className="ui-btn ui-btn-quiet">End Private Session</span>
      </div>

      <div className="ui-pane">
        <div className="ui-pane-head">
          <p className="ui-h-sm">Vault</p>
          <span className="ui-count">2 protected clips</span>
        </div>
        <div className="ui-row ui-row-locked">
          <span className="ui-tile" data-tone="violet">
            <Icon name="vault" />
          </span>
          <span className="ui-row-text">
            <span className="ui-row-title ui-redacted" />
            <span className="ui-row-meta">Encrypted<i>·</i>Authenticate to reveal</span>
          </span>
          <span className="ui-row-copy">
            <Icon name="vault" />
          </span>
        </div>
        <div className="ui-row ui-row-locked">
          <span className="ui-tile" data-tone="violet">
            <Icon name="vault" />
          </span>
          <span className="ui-row-text">
            <span className="ui-row-title ui-redacted" data-short="true" />
            <span className="ui-row-meta">Encrypted<i>·</i>Authenticate to reveal</span>
          </span>
          <span className="ui-row-copy">
            <Icon name="vault" />
          </span>
        </div>

        <div className="ui-toast">
          <span className="ui-toast-dot" />
          Private Session started. New clips stay only in memory.
        </div>
      </div>
    </div>
  )
}
