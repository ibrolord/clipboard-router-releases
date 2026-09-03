type IconName =
  | 'action'
  | 'check'
  | 'chevron'
  | 'code'
  | 'copy'
  | 'folder'
  | 'history'
  | 'link'
  | 'lock'
  | 'note'
  | 'private'
  | 'project'
  | 'search'
  | 'send'
  | 'stack'
  | 'transform'
  | 'vault'

export type LaunchLayout = 'compact' | 'social' | 'wide'

const PATHS: Record<IconName, string> = {
  action: 'M8.8 2.2 4.2 8.9h3.2l-.6 4.9 4.8-6.9H8.3Z',
  check: 'M3.6 8.4 6.4 11.2l6-6.4',
  chevron: 'M6.3 4.7 9.7 8l-3.4 3.3',
  code: 'M5.6 5.2 2.8 8l2.8 2.8M10.4 5.2 13.2 8l-2.8 2.8M9.1 3.4 6.9 12.6',
  copy: 'M5.4 5.4h7.2v7.2H5.4ZM3.4 10.2V3.4h6.8',
  folder: 'M2.6 4.6h4l1.2 1.6h5.6v6.6H2.6Z',
  history: 'M8 4.2v4l2.6 1.6M2.6 8a5.4 5.4 0 1 0 1.7-3.9M2.4 3v2.6H5',
  link: 'M6.6 9.4 9.4 6.6M6.9 4.6 8.2 3.3a2.6 2.6 0 0 1 3.7 3.7l-1.3 1.3M9.1 11.4l-1.3 1.3a2.6 2.6 0 0 1-3.7-3.7l1.3-1.3',
  lock: 'M4 7.1h8v5.9H4ZM5.9 7.1V5.2a2.1 2.1 0 0 1 4.2 0v1.9M8 9.3v1.6',
  note: 'M3.4 3.2h9.2v9.6H3.4ZM5.6 6.2h4.8M5.6 8.6h3.2',
  private: 'M2.4 8s2.3-3.9 5.6-3.9c1 0 1.9.4 2.7.9M13.6 8s-2.3 3.9-5.6 3.9c-1 0-2-.4-2.7-.9M3 3l10 10',
  project: 'M2.6 4.6h4l1.2 1.6h5.6v6.6H2.6Z',
  search: 'M7.2 11.4a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4ZM10.4 10.4 13.4 13.4',
  send: 'M13.4 2.6 2.6 6.9l4.3 1.8 1.8 4.3Z',
  stack: 'm3.2 6.1 4.8 2.7 4.8-2.7L8 3.4 3.2 6.1Zm0 3.2L8 12l4.8-2.7M3.2 12.4 8 15l4.8-2.6',
  transform: 'M3.2 4h9.6M3.2 8h6.2M3.2 12h3.8M11.2 9.4v4.2M9.1 11.5h4.2',
  vault: 'M4 7.1h8v5.9H4ZM5.9 7.1V5.2a2.1 2.1 0 0 1 4.2 0v1.9M8 9.3v1.6',
}

function Icon({ name }: { name: IconName }) {
  return (
    <svg className="launch-icon" viewBox="0 0 16 16" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  )
}

const groups = [
  ['Find', [['history', 'History', '12']]],
  ['Keep', [['note', 'Saved', ''], ['project', 'Projects', '']]],
  ['Use', [['action', 'Actions', ''], ['transform', 'Auto Organize', '']]],
  ['Protect', [['check', 'Clipboard Health', ''], ['vault', 'Vault', '2']]],
] as const

const clips = [
  {
    icon: 'code' as const,
    title: '{"release":"0.1.0","channel":"stable"}',
    meta: '8 min ago · Xcode',
    selected: true,
  },
  {
    icon: 'note' as const,
    title: 'Draft the release notes from the approved checklist.',
    meta: '24 min ago · Notes',
  },
  {
    icon: 'link' as const,
    title: 'github.com/example/clipboard-router/releases',
    meta: '52 min ago · Safari',
  },
]

function Sidebar() {
  return (
    <aside className="launch-sidebar">
      {groups.map(([group, items]) => (
        <section className="launch-side-group" key={group}>
          <p>{group}</p>
          {items.map(([icon, label, badge], index) => (
            <div className="launch-side-item" data-active={group === 'Find' && index === 0 ? 'true' : undefined} key={label}>
              <Icon name={icon} />
              <span>{label}</span>
              {badge ? <small>{badge}</small> : null}
            </div>
          ))}
        </section>
      ))}
      <div className="launch-private">
        <Icon name="private" />
        <span>Private Session</span>
        <small>End</small>
      </div>
    </aside>
  )
}

function ClipRow({ clip }: { clip: (typeof clips)[number] }) {
  return (
    <div className="launch-clip" data-selected={clip.selected ? 'true' : undefined}>
      <span className="launch-tile"><Icon name={clip.icon} /></span>
      <span className="launch-clip-copy">
        <strong>{clip.title}</strong>
        <small>{clip.meta}</small>
      </span>
      <Icon name="copy" />
    </div>
  )
}

function History() {
  return (
    <section className="launch-history">
      <header className="launch-column-head">
        <span><strong>History</strong><small>12 clips on this Mac</small></span>
        <span className="launch-count">3 of 12</span>
      </header>
      <div className="launch-search"><Icon name="search" /><span>release</span><i /></div>
      <div className="launch-clips">{clips.map((clip) => <ClipRow clip={clip} key={clip.title} />)}</div>
      <div className="launch-compact-tools">
        <span><Icon name="transform" />Pretty JSON</span>
        <strong><Icon name="stack" />Add to Paste Stack</strong>
      </div>
      <div className="launch-private-toast"><i />Private Session is on. New clips stay only in memory.</div>
    </section>
  )
}

function Details() {
  return (
    <section className="launch-details">
      <header className="launch-column-head">
        <span><strong>Details</strong><small>Selected clip</small></span>
        <span className="launch-chip"><Icon name="transform" />Pretty JSON</span>
      </header>
      <pre>{`{\n  "release": "0.1.0",\n  "channel": "stable"\n}`}</pre>
      <div className="launch-buttons">
        <span>Copy</span>
        <strong><Icon name="stack" />Add to Paste Stack</strong>
      </div>
      <p className="launch-details-meta">History · Xcode · 8 min ago</p>
    </section>
  )
}

function AppWindow() {
  return (
    <div className="launch-window">
      <header className="launch-titlebar">
        <span className="launch-lights"><i /><i /><i /></span>
        <strong>Clipboard Router</strong>
      </header>
      <div className="launch-window-body">
        <Sidebar />
        <History />
        <Details />
      </div>
    </div>
  )
}

const stackItems = [
  ['code', 'Pretty-printed release JSON'],
  ['note', 'Approved release notes'],
  ['link', 'Release page'],
] as const

function PasteStack() {
  return (
    <section className="launch-pane launch-stack">
      <header><span><Icon name="stack" />Paste Stack</span><small>3 queued</small></header>
      <div className="launch-stack-list">
        {stackItems.map(([icon, label], index) => (
          <div className="launch-stack-row" data-next={index === 0 ? 'true' : undefined} key={label}>
            <i>{index + 1}</i>
            <Icon name={icon} />
            <span>{label}</span>
            {index === 0 ? <small>Next</small> : null}
          </div>
        ))}
      </div>
      <p><strong>Copy Next</strong> puts each queued item on the clipboard.</p>
    </section>
  )
}

function ReviewedAction() {
  return (
    <section className="launch-pane launch-action">
      <header><span><Icon name="action" />Action review</span><small>2 local steps</small></header>
      <div className="launch-action-name">
        <span className="launch-tile launch-tile-green"><Icon name="action" /></span>
        <span><strong>Review and file product notes</strong><small>Nothing runs until approved</small></span>
      </div>
      <ol>
        <li><i>1</i><span>Tag the clip release-notes.</span><small>Pending</small></li>
        <li><i>2</i><span>Move it to Launch 1.2.</span><small>Pending</small></li>
      </ol>
      <div className="launch-review"><span><Icon name="check" />Review both steps before running.</span><strong>Review</strong></div>
    </section>
  )
}

function Vault() {
  return (
    <section className="launch-pane launch-vault">
      <header><span><Icon name="vault" />Vault</span><small>2 protected clips</small></header>
      <div className="launch-secret-status"><i /><span><strong>Potential secret</strong><small>Held outside ordinary History</small></span></div>
      <div className="launch-locked"><Icon name="lock" /><span><i /><i /></span><small>Authenticate to reveal</small></div>
      <div className="launch-share"><Icon name="send" /><span>Encrypt &amp; Share…</span><small>Recipient public key</small></div>
    </section>
  )
}

export function LaunchScene({ layout }: { layout: LaunchLayout }) {
  return (
    <main className="launch-root" data-scene={layout} aria-label="Synthetic Clipboard Router product illustration">
      <div className="launch-stage">
        <AppWindow />
        <aside className="launch-rail">
          <PasteStack />
          <ReviewedAction />
          <Vault />
        </aside>
      </div>
    </main>
  )
}
