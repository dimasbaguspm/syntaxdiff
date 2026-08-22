import { trace } from "@opentelemetry/api";
import { APP_VERSION } from "@/utils/version";
import { maskUrl } from "@/utils/mask";
import { getSession } from "@/utils/session";
import { getBrowserInfo } from "@/utils/browser";

const SEVERITY: Record<string, number> = {
  trace: 1,
  debug: 5,
  info: 9,
  warn: 13,
  error: 17,
  fatal: 21,
};

type AttrValue = { stringValue: string } | { intValue: string } | { doubleValue: number };

function valueOf(v: unknown): AttrValue {
  if (typeof v === "number")
    return Number.isInteger(v) ? { intValue: String(v) } : { doubleValue: v };
  if (typeof v === "boolean") return { stringValue: String(v) };
  if (typeof v === "object" && v !== null) return { stringValue: JSON.stringify(v) };
  return { stringValue: String(v ?? "") };
}

function isValidId(id: string | undefined, len: number): id is string {
  return typeof id === "string" && id.length === len && /^[0-9a-f]+$/i.test(id);
}

/** Current trace/span ids so logs correlate with the active span. */
function traceContext(): Record<string, string> {
  try {
    const sc = trace.getActiveSpan()?.spanContext();
    if (sc && isValidId(sc.traceId, 32) && isValidId(sc.spanId, 16)) {
      return { traceId: sc.traceId, spanId: sc.spanId };
    }
  } catch {
    /* tracing not initialized */
  }
  return {};
}

/** Rich, always-on context attached to every log. */
function context(props?: Record<string, unknown>): Record<string, unknown> {
  const session = getSession();
  return {
    ...traceContext(),
    sessionId: session.sessionId,
    referrer: session.referrer,
    ...session.utm,
    ...getBrowserInfo(),
    version: APP_VERSION,
    environment: import.meta.env.MODE,
    page: typeof location !== "undefined" ? maskUrl(location.pathname) : "",
    url: typeof location !== "undefined" ? maskUrl(location.href) : "",
    ...props,
  };
}

/** Current active span ids (null when no span is active). */
export function currentTrace(): { traceId: string; spanId: string } | null {
  const tc = traceContext();
  return tc.traceId ? { traceId: tc.traceId, spanId: tc.spanId } : null;
}

/* ------------------------------------------------------------------ */
/* Batched sender                                                     */
/*                                                                    */
/* Every event/log enqueues an in-memory record. The queue is flushed */
/* on a debounce timer OR when it reaches a cap, then sent as ONE      */
/* batched OTLP payload to `${otelUrl}/v1/logs` (sendBeacon when       */
/* available, otherwise a single batched fetch). This replaces the     */
/* previous one-network-request-per-call behaviour.                    */
/* ------------------------------------------------------------------ */

interface QueuedLog {
  level: string;
  body: string;
  attrs: Record<string, unknown>;
}

const FLUSH_DEBOUNCE_MS = 1500;
const BATCH_CAP = 20;
const TIMEOUT_MS = 10_000;
const RETRY_DELAY_MS = 500;

let logQueue: QueuedLog[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function buildBatchPayload(batch: QueuedLog[]): unknown {
  const tc = traceContext();
  return {
    resourceLogs: [
      {
        resource: {
          attributes: [
            { key: "service.name", value: { stringValue: "syntaxdiff" } },
            {
              key: "service.version",
              value: { stringValue: import.meta.env.VITE_APP_VERSION ?? "" },
            },
          ],
        },
        scopeLogs: [
          {
            scope: { name: "syntaxdiff" },
            logRecords: batch.map((r) => ({
              ...(tc.traceId ? { traceId: tc.traceId, spanId: tc.spanId } : {}),
              severityNumber: SEVERITY[r.level] ?? 9,
              severityText: r.level.toUpperCase(),
              timeUnixNano: String(Date.now() * 1e6),
              body: { stringValue: r.body },
              attributes: Object.entries(r.attrs).map(([k, v]) => ({
                key: k,
                value: valueOf(v),
              })),
            })),
          },
        ],
      },
    ],
  };
}

async function sendOtlpBatch(batch: QueuedLog[]): Promise<boolean> {
  // Read the collector URL at flush time (not the import-time constant) so it
  // can be overridden in tests / at runtime via VITE_OTEL_COLLECTOR_URL.
  const base = import.meta.env.VITE_OTEL_COLLECTOR_URL as string | undefined;
  if (!base || batch.length === 0) return false;
  const body = JSON.stringify(buildBatchPayload(batch));

  const sendOne = async (): Promise<boolean> => {
    try {
      if (typeof globalThis.fetch === "function") {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
        try {
          const res = await fetch(`${base}/v1/logs`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body,
            signal: ctrl.signal,
          });
          return res.ok;
        } finally {
          clearTimeout(timer);
        }
      }
      if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
        return (
          navigator.sendBeacon(`${base}/v1/logs`, new Blob([body], { type: "application/json" })) ??
          false
        );
      }
    } catch {
      return false;
    }
    return false;
  };

  if (await sendOne()) return true;
  await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
  return sendOne();
}

/** Flush the queue immediately, sending one batched payload. */
async function flushNow(): Promise<void> {
  if (logQueue.length === 0) return;
  const batch = logQueue;
  logQueue = [];
  await sendOtlpBatch(batch);
}

function scheduleFlush(): void {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flushNow();
  }, FLUSH_DEBOUNCE_MS);
}

/** Enqueue a log for batched delivery. Public signature unchanged for callers. */
export function enqueueOtlpLog(level: string, body: string, attrs: Record<string, unknown>): void {
  logQueue.push({ level, body, attrs });
  if (logQueue.length >= BATCH_CAP) {
    if (flushTimer) {
      clearTimeout(flushTimer);
      flushTimer = null;
    }
    void flushNow();
  } else {
    scheduleFlush();
  }
}

/** Test-only hook: flush pending logs synchronously-ish so tests can observe. */
export function __flush(): Promise<void> {
  return flushNow();
}

/** Test-only hook: drain and return the pending queue (for batch assertions). */
export function __drain(): QueuedLog[] {
  const q = logQueue;
  logQueue = [];
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  return q;
}

/** Test-only hook: current pending queue length. */
export function __queueLength(): number {
  return logQueue.length;
}

/** Log an error to OTEL with trace/span ids and error details. */
export function logError(err: unknown, message: string, attrs?: Record<string, unknown>): void {
  const e = err instanceof Error ? err : new Error(String(err));
  enqueueOtlpLog(
    "error",
    message,
    context({ errorName: e.name, errorMessage: e.message, stack: e.stack ?? "", ...attrs }),
  );
}

/** Log a warning to OTEL with the active trace/span ids. */
export function logWarn(message: string, attrs?: Record<string, unknown>): void {
  enqueueOtlpLog("warn", message, context(attrs));
}

/** Log an informational message to OTEL with the active trace/span ids. */
export function logInfo(message: string, attrs?: Record<string, unknown>): void {
  enqueueOtlpLog("info", message, context(attrs));
}

/** Log a debug message to OTEL with the active trace/span ids. */
export function logDebug(message: string, attrs?: Record<string, unknown>): void {
  enqueueOtlpLog("debug", message, context(attrs));
}
