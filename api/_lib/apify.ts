/**
 * Apify REST primitives for the Facebook snapshot functions.
 *
 * Two flows are supported (no SQL/queue/KV dependency, plain `fetch`):
 *
 *  1. Cheap read: fetch the latest SUCCEEDED run's dataset. Runs on an Apify
 *     schedule (or any previous run) make this nearly free and instant.
 *  2. On-demand refresh: start a run and wait up to ~50s. Apify streams rows
 *     into the dataset as they are scraped, so partial results are valid.
 */
import { DEFAULT_APIFY_ACTOR } from './config'
import { extractItems, fetchJson } from './parse'

const APIFY_API = 'https://api.apify.com/v2'
/** Under the 60s function cap so the handler can always still respond. */
export const RUN_WAIT_MS = 45_000
const FETCH_TIMEOUT_MS = 20_000

export interface ApifyRun {
  id: string
  status: string
  startedAt: string
  finishedAt?: string
  defaultDatasetId: string
}

interface ApifyRunListResponse {
  data: {
    items: ApifyRun[]
  }
}

interface ApifyRunResponse {
  data: ApifyRun
}

/**
 * Apify URLs address named actors as `owner~actor-name` (tilde), while the
 * UI often shows `owner/actor-name` (slash). Accept both.
 */
function toActorPath(actorId: string): string {
  return actorId.includes('/') ? actorId.replace('/', '~') : actorId
}

function assertActorId(actorId: string): string {
  const candidate = actorId || DEFAULT_APIFY_ACTOR
  if (!candidate.trim()) {
    throw new Error('APIFY_ACTOR_ID is missing.')
  }
  return toActorPath(candidate.trim())
}

/** Latest finished (SUCCEEDED) run of the actor, if any. */
export async function latestSuccessfulRun(
  token: string,
  actorId: string,
): Promise<ApifyRun | null> {
  const path = assertActorId(actorId)
  const url =
    `${APIFY_API}/acts/${path}/runs?token=${encodeURIComponent(token)}` +
    '&status=SUCCEEDED&desc=true&limit=1'
  const json = await fetchJson(url, { method: 'GET' }, FETCH_TIMEOUT_MS) as ApifyRunListResponse
  const run = json?.data?.items?.[0]
  return run && run.defaultDatasetId ? run : null
}

/** Rows stored in a run's (possibly still streaming) dataset. */
export async function datasetItems(
  token: string,
  datasetId: string,
  limit: number,
): Promise<Record<string, unknown>[]> {
  const url =
    `${APIFY_API}/datasets/${encodeURIComponent(datasetId)}/items` +
    `?token=${encodeURIComponent(token)}&limit=${limit}&clean=true`
  const json = await fetchJson(url, { method: 'GET' }, FETCH_TIMEOUT_MS)
  return extractItems(json)
}

/**
 * Start the actor synchronously and wait up to `waitMs` for completion.
 *
 * Even when the wait times out (status stays RUNNING), rows already pushed
 * to the dataset can be read — callers always chain `datasetItems`.
 */
export async function startActorRun(
  token: string,
  actorId: string,
  actorInput: Record<string, unknown>,
  waitMs: number = RUN_WAIT_MS,
): Promise<ApifyRun> {
  const path = assertActorId(actorId)
  const waitSeconds = Math.max(1, Math.floor(waitMs / 1000))
  const url =
    `${APIFY_API}/acts/${path}/runs?token=${encodeURIComponent(token)}` +
    `&waitForFinish=${waitSeconds}`
  const json = await fetchJson(
    url,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(actorInput),
    },
    waitMs + FETCH_TIMEOUT_MS,
  ) as ApifyRunResponse

  const run = json?.data
  if (!run || !run.defaultDatasetId) {
    throw new Error('Apify did not return a runnable dataset.')
  }
  return run
}

export interface ApifyScrapeInput {
  startUrls: string[]
  resultsLimit: number
}

/** Build the actor input, letting APIFY_ACTOR_INPUT env JSON take precedence. */
export function buildActorInput(
  actorInputOverride: Record<string, unknown> | null,
  input: ApifyScrapeInput,
): Record<string, unknown> {
  return {
    startUrls: input.startUrls,
    resultsLimit: input.resultsLimit,
    ...(actorInputOverride ?? {}),
  }
}
