export const SNAPSHOT_INTERVAL_MS = 15_000
/** Min time between AI analyses per session (cost control). */
export const ANALYSIS_MIN_INTERVAL_MS = 120_000
/** Analyze at most this many snapshots per coding session via AI. */
export const ANALYSIS_MAX_PER_SESSION = 8
/** Trigger analysis sooner if stderr is non-empty. */
export const ANALYSIS_FORCE_ON_STDERR = true
/** Min changed characters to consider a “meaningful” edit for analysis. */
export const ANALYSIS_MIN_DIFF_CHARS = 12
