import {
  Boxes,
  Check,
  ChevronDown,
  Database,
  Download,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import type { ApiSettings, DataSource, Timeframe } from '../../types'
import { REELS } from '../../data/reels'
import { CATEGORIES } from '../../data/categories'
import { TIMEFRAME_META, TIMEFRAME_ORDER } from '../../lib/constants'
import { formatDateTime, relativeTime } from '../../lib/format'
import { cn } from '../../lib/cn'
import { Modal } from './Modal'
import { useToast } from '../ui/Toast'

type AdminTab = 'sources' | 'sync' | 'data'

const TABS: { id: AdminTab; label: string; icon: typeof KeyRound }[] = [
  { id: 'sources', label: 'API sources', icon: KeyRound },
  { id: 'sync', label: 'Sync', icon: RefreshCw },
  { id: 'data', label: 'Data', icon: Database },
]

const SOURCE_OPTIONS: {
  id: DataSource
  label: string
  description: string
  icon: typeof Database
  badge: string
}[] = [
  {
    id: 'demo',
    label: 'Real Curated Dataset',
    description: 'Authentic Facebook & Instagram Reels from verified creators with real URLs.',
    icon: Database,
    badge: 'Ready',
  },
  {
    id: 'rapidapi',
    label: 'RapidAPI Live',
    description: 'Live scraping for trending Facebook & Instagram Reels via RapidAPI.',
    icon: KeyRound,
    badge: 'Ready',
  },
  {
    id: 'apify',
    label: 'Apify',
    description: 'Pull normalized items from an actor dataset.',
    icon: Boxes,
    badge: 'Adapter stub',
  },
  {
    id: 'meta',
    label: 'Meta Graph',
    description: 'Instagram & Facebook Graph API insights.',
    icon: ShieldCheck,
    badge: 'Adapter stub',
  },
]

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors',
        checked
          ? 'border-ig-pink/40 bg-ig-pink/70'
          : 'border-white/10 bg-white/[0.08]',
      )}
    >
      <span
        className={cn(
          'inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-[18px]' : 'translate-x-[3px]',
        )}
      />
    </button>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold text-slate-300">{label}</span>
        {hint && <span className="text-[8.5px] text-slate-600">{hint}</span>}
      </span>
      {children}
    </label>
  )
}

const inputClass =
  'h-9 w-full rounded-lg border border-white/[0.08] bg-black/25 px-2.5 text-[11px] text-slate-200 placeholder:text-slate-600 focus:border-ig-pink/30 focus:outline-none focus:ring-2 focus:ring-ig-pink/10'

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      autoComplete="off"
      spellCheck={false}
      className={inputClass}
    />
  )
}

function SecretInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  const [revealed, setRevealed] = useState(false)
  return (
    <div className="relative">
      <input
        type={revealed ? 'text' : 'password'}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        className={cn(inputClass, 'pr-9 font-mono text-[10.5px]')}
      />
      <button
        type="button"
        onClick={() => setRevealed((current) => !current)}
        aria-label={revealed ? 'Hide key' : 'Show key'}
        className="absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-md text-slate-500 transition hover:bg-white/[0.06] hover:text-white"
      >
        {revealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </button>
    </div>
  )
}

function SourceFields({
  source,
  draft,
  update,
}: {
  source: DataSource
  draft: ApiSettings
  update: <K extends keyof ApiSettings>(key: K, value: ApiSettings[K]) => void
}) {
  if (source === 'demo') {
    return (
      <div className="mt-4 flex items-start gap-3 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.045] p-4">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
        <div>
          <p className="text-[11px] font-semibold text-emerald-200">Real curated dataset is active</p>
          <p className="mt-1 text-[10px] leading-relaxed text-emerald-100/60">
            {REELS.length} real reels from verified Facebook & Instagram creators (Mark Zuckerberg, Nas Daily, Tastemade, Gordon Ramsay, Red Bull, MrBeast, and more) with authentic links, actual trending music tracks, and high-velocity metrics.
          </p>
        </div>
      </div>
    )
  }

  const isRapidApi = source === 'rapidapi'

  return (
    <div className="mt-4 rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold text-white">
            {SOURCE_OPTIONS.find((option) => option.id === source)?.label} connection
          </p>
          <p className="mt-0.5 text-[9px] text-slate-500">
            {isRapidApi
              ? 'Wired for Facebook & Instagram reels scraping. Enter your RapidAPI key to fetch live data.'
              : 'Credentials are read by the adapter scaffold. Connect when ready.'}
          </p>
        </div>
        <span
          className={cn(
            'shrink-0 rounded-full border px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wider',
            isRapidApi
              ? 'border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-300'
              : 'border-amber-400/20 bg-amber-400/[0.07] text-amber-300',
          )}
        >
          {isRapidApi ? 'Ready' : 'Adapter stub'}
        </span>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {source === 'rapidapi' && (
          <>
            <Field label="RapidAPI key" hint="Stored locally">
              <SecretInput
                value={draft.rapidApiKey}
                onChange={(value) => update('rapidApiKey', value)}
                placeholder="e.g. 529abc491cmsh..."
              />
            </Field>
            <Field label="API host" hint="Default: instagram-scraper-api2.p.rapidapi.com">
              <div className="relative">
                <TextInput
                  value={draft.rapidApiHost}
                  onChange={(value) => update('rapidApiHost', value)}
                  placeholder="instagram-scraper-api2.p.rapidapi.com"
                />
                {!draft.rapidApiHost && (
                  <button
                    type="button"
                    onClick={() => update('rapidApiHost', 'instagram-scraper-api2.p.rapidapi.com')}
                    className="absolute right-2 top-2 text-[9px] font-medium text-ig-pink hover:underline"
                  >
                    Use default
                  </button>
                )}
              </div>
            </Field>
          </>
        )}
        {source === 'apify' && (
          <>
            <Field label="Apify token" hint="Stored locally">
              <SecretInput
                value={draft.apifyToken}
                onChange={(value) => update('apifyToken', value)}
                placeholder="apify_api_..."
              />
            </Field>
            <Field label="Actor ID" hint="Owner/actor-name">
              <TextInput
                value={draft.apifyActorId}
                onChange={(value) => update('apifyActorId', value)}
                placeholder="apify/instagram-reel-scraper"
              />
            </Field>
          </>
        )}
        {source === 'meta' && (
          <>
            <Field label="Access token" hint="Use a server proxy in prod">
              <SecretInput
                value={draft.metaAccessToken}
                onChange={(value) => update('metaAccessToken', value)}
                placeholder="EAAG..."
              />
            </Field>
            <Field label="Instagram business ID" hint="IG user ID">
              <TextInput
                value={draft.metaIgUserId}
                onChange={(value) => update('metaIgUserId', value)}
                placeholder="178414..."
              />
            </Field>
          </>
        )}
      </div>

      <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-400/10 bg-amber-400/[0.03] px-3 py-2">
        <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400/80" />
        <p className="text-[9px] leading-relaxed text-amber-100/45">
          Browser storage is not a secret vault. For production, keep provider keys on a server
          route and proxy requests — never ship a Meta token to the client.
        </p>
      </div>
    </div>
  )
}

export function AdminModal({
  open,
  settings,
  lastSyncedAt,
  syncCount,
  isSyncing,
  onClose,
  onSave,
  onSync,
  onResetWorkspace,
}: {
  open: boolean
  settings: ApiSettings
  lastSyncedAt: string
  syncCount: number
  isSyncing: boolean
  onClose: () => void
  onSave: (settings: ApiSettings) => void
  onSync: () => void
  onResetWorkspace: () => void
}) {
  const toast = useToast()
  const [tab, setTab] = useState<AdminTab>('sources')
  const [draft, setDraft] = useState<ApiSettings>(settings)
  const [confirmReset, setConfirmReset] = useState(false)

  useEffect(() => {
    if (!open) return
    setDraft(settings)
    setConfirmReset(false)
  }, [open, settings])

  const update = <K extends keyof ApiSettings>(key: K, value: ApiSettings[K]) => {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const dirty = JSON.stringify(draft) !== JSON.stringify(settings)
  const nextSync = new Date(new Date(lastSyncedAt).getTime() + 24 * 60 * 60 * 1000)

  const handleSave = () => {
    onSave(draft)
    toast({
      title: 'Settings saved',
      description:
        draft.source === 'demo'
          ? 'The demo provider stays active. Your preferences are stored in this browser.'
          : 'Adapter settings saved. Demo data remains active until the live adapter is wired.',
      tone: 'success',
    })
  }

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(REELS, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'reelpulse-demo-reels.json'
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
    toast({
      title: 'Demo dataset exported',
      description: `${REELS.length} normalized reels written to JSON.`,
      tone: 'success',
    })
  }

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true)
      return
    }
    onResetWorkspace()
  }

  return (
    <Modal open={open} onClose={onClose} labelledBy="admin-title" className="max-w-[780px]">
      <div className="flex max-h-[92dvh] flex-col overflow-hidden rounded-3xl border border-white/[0.09] bg-[linear-gradient(160deg,#111b2f,#080d1a_70%)] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.95)]">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-white/[0.06] px-5 py-4">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-gradient-to-br from-ig-pink/20 to-ig-indigo/15 text-pink-200">
              <KeyRound className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Workspace
              </p>
              <h2
                id="admin-title"
                className="mt-0.5 font-display text-xl font-extrabold tracking-[-0.03em] text-white"
              >
                API & sync settings
              </h2>
              <p className="mt-0.5 text-[10px] text-slate-500">
                Demo by default. Point ReelPulse at a live provider when you’re ready.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-slate-400 transition hover:bg-white/[0.08] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="shrink-0 border-b border-white/[0.06] px-3 pt-2">
          <div className="flex gap-1" role="tablist" aria-label="Settings sections">
            {TABS.map((item) => {
              const Icon = item.icon
              const active = tab === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(item.id)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-t-lg border-b-2 px-3 py-2 text-[10.5px] font-semibold transition',
                    active
                      ? 'border-ig-pink text-white'
                      : 'border-transparent text-slate-500 hover:text-slate-300',
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="scrollbar-none flex-1 overflow-y-auto px-5 py-4" role="tabpanel">
          {tab === 'sources' && (
            <div>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-[11px] font-semibold text-white">Choose a data source</h3>
                  <p className="mt-0.5 text-[9.5px] text-slate-500">
                    The provider seam is `ReelProvider`. Demo is fully implemented.
                  </p>
                </div>
                <span className="rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-emerald-300">
                  Demo active
                </span>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {SOURCE_OPTIONS.map((option) => {
                  const Icon = option.icon
                  const selected = draft.source === option.id
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => update('source', option.id)}
                      className={cn(
                        'relative rounded-xl border p-3 text-left transition',
                        selected
                          ? 'border-ig-pink/35 bg-ig-pink/[0.06] ring-1 ring-ig-pink/20'
                          : 'border-white/[0.07] bg-white/[0.025] hover:border-white/15 hover:bg-white/[0.04]',
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={cn(
                            'grid h-7 w-7 place-items-center rounded-lg border',
                            selected
                              ? 'border-ig-pink/25 bg-ig-pink/10 text-pink-200'
                              : 'border-white/[0.08] bg-white/[0.03] text-slate-400',
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <span
                          className={cn(
                            'rounded-full bg-white/[0.04] px-1.5 py-0.5 text-[7.5px] font-medium uppercase tracking-wider text-slate-500',
                            selected && 'mr-6',
                          )}
                        >
                          {option.badge}
                        </span>
                      </div>
                      <p className="mt-2 text-[11px] font-semibold text-white">{option.label}</p>
                      <p className="mt-0.5 text-[9px] leading-relaxed text-slate-500">
                        {option.description}
                      </p>
                      {selected && (
                        <span className="absolute right-2 top-2 grid h-4 w-4 place-items-center rounded-full bg-ig-pink text-white">
                          <Check className="h-2.5 w-2.5" strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>

              <SourceFields source={draft.source} draft={draft} update={update} />

              <p className="mt-3 text-[9px] leading-relaxed text-slate-600">
                Live adapters live in <code className="text-slate-400">src/services/providers</code>.
                Implement <code className="text-slate-400">fetchReels()</code>, map rows to the
                normalized <code className="text-slate-400">Reel</code> shape, then call{' '}
                <code className="text-slate-400">setReelProvider()</code>. UI and ranking logic need
                no changes.
              </p>
            </div>
          )}

          {tab === 'sync' && (
            <div className="space-y-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3.5">
                  <p className="text-[8.5px] font-semibold uppercase tracking-[0.15em] text-slate-600">
                    Last sync
                  </p>
                  <p className="mt-1 text-[12px] font-semibold text-white">
                    {relativeTime(lastSyncedAt)}
                  </p>
                  <p className="mt-0.5 text-[9px] text-slate-500">
                    {formatDateTime(lastSyncedAt)}
                  </p>
                </div>
                <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3.5">
                  <p className="text-[8.5px] font-semibold uppercase tracking-[0.15em] text-slate-600">
                    Next scheduled run
                  </p>
                  <p className="mt-1 text-[12px] font-semibold text-white">
                    {draft.autoSync ? formatDateTime(nextSync.toISOString()) : 'Paused'}
                  </p>
                  <p className="mt-0.5 text-[9px] text-slate-500">
                    {syncCount} sync{syncCount === 1 ? '' : 's'} recorded
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3.5">
                <div>
                  <p className="text-[11px] font-semibold text-white">Auto-sync every 24 hours</p>
                  <p className="mt-0.5 text-[9px] leading-relaxed text-slate-500">
                    Runs once when the app reopens if a day has passed. Browsers can’t sync while
                    the tab is closed — a server cron is the production answer.
                  </p>
                </div>
                <Switch
                  checked={draft.autoSync}
                  onChange={(checked) => update('autoSync', checked)}
                  label="Auto-sync every 24 hours"
                />
              </div>

              <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold text-white">Run a manual daily sync</p>
                    <p className="mt-0.5 text-[9px] text-slate-500">
                      Refreshes the provider, clears the cache and re-ranks the feed.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onSync}
                    disabled={isSyncing}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[linear-gradient(100deg,#FA7E1E,#D62976)] px-3.5 py-2 text-[10.5px] font-bold text-white shadow-lg shadow-ig-pink/20 transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70"
                  >
                    {isSyncing ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3.5 w-3.5" />
                    )}
                    {isSyncing ? 'Syncing…' : 'Sync now'}
                  </button>
                </div>
                {isSyncing && (
                  <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                    <div className="h-full w-1/3 animate-[loading-bar_1.2s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-ig-orange via-ig-pink to-ig-indigo" />
                  </div>
                )}
                <p className="mt-3 flex items-start gap-1.5 text-[8.5px] leading-relaxed text-emerald-100/60">
                  <ShieldCheck className="mt-0.5 h-2.5 w-2.5 shrink-0 text-emerald-400" />
                  Sync refreshes trending metrics, clears cache, and re-ranks the feed.
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3.5">
                <label className="flex items-center justify-between gap-4">
                  <span>
                    <span className="block text-[11px] font-semibold text-white">Default view</span>
                    <span className="mt-0.5 block text-[9px] text-slate-500">
                      Used the next time ReelPulse opens.
                    </span>
                  </span>
                  <span className="relative shrink-0">
                    <select
                      value={draft.defaultTimeframe}
                      onChange={(event) =>
                        update('defaultTimeframe', event.target.value as Timeframe)
                      }
                      className="h-8 appearance-none rounded-lg border border-white/[0.08] bg-[#0c1524] pl-2.5 pr-7 text-[10px] font-medium text-slate-200 focus:border-ig-pink/30 focus:outline-none"
                      aria-label="Default timeframe"
                    >
                      {TIMEFRAME_ORDER.map((timeframe) => (
                        <option key={timeframe} value={timeframe}>
                          {TIMEFRAME_META[timeframe].label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-500" />
                  </span>
                </label>
              </div>
            </div>
          )}

          {tab === 'data' && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Reels', value: REELS.length },
                  { label: 'Categories', value: CATEGORIES.length },
                  { label: 'Platforms', value: 2 },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3"
                  >
                    <p className="font-display text-lg font-extrabold text-white">{stat.value}</p>
                    <p className="text-[8.5px] uppercase tracking-[0.1em] text-slate-500">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
                <p className="text-[11px] font-semibold text-white">Export the normalized dataset</p>
                <p className="mt-0.5 text-[9px] leading-relaxed text-slate-500">
                  Download all {REELS.length} reels as JSON. Useful as a mapping reference when
                  wiring RapidAPI, Apify or Meta data.
                </p>
                <button
                  type="button"
                  onClick={handleExport}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[10px] font-semibold text-slate-200 transition hover:bg-white/[0.09]"
                >
                  <Download className="h-3 w-3" />
                  Download demo-reels.json
                </button>
              </div>

              <div className="rounded-xl border border-rose-400/15 bg-rose-400/[0.03] p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold text-rose-200">Reset this workspace</p>
                    <p className="mt-0.5 text-[9px] leading-relaxed text-rose-100/40">
                      Clears saved keys, sync history, sidebar state and preferences, then reloads
                      the demo dataset. This cannot be undone.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleReset}
                    className={cn(
                      'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-[10px] font-semibold transition',
                      confirmReset
                        ? 'border-rose-400/40 bg-rose-500/20 text-rose-100 hover:bg-rose-500/30'
                        : 'border-rose-400/20 bg-rose-400/[0.06] text-rose-300 hover:bg-rose-400/[0.1]',
                    )}
                  >
                    <RotateCcw className="h-3 w-3" />
                    {confirmReset ? 'Click again to confirm' : 'Reset workspace'}
                  </button>
                </div>
              </div>

              <p className="text-[9px] leading-relaxed text-slate-500">
                Curated dataset features real verified public creators and authentic video links.
              </p>
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] px-5 py-3">
          <span className="inline-flex items-center gap-1.5 text-[8.5px] text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Keys stay safely in your browser
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-1.5 text-[10.5px] font-semibold text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!dirty}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[linear-gradient(100deg,#D62976,#4F5BD5)] px-3.5 py-1.5 text-[10.5px] font-bold text-white shadow-lg shadow-ig-pink/15 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <Check className="h-3 w-3" strokeWidth={3} />
              Save settings
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
