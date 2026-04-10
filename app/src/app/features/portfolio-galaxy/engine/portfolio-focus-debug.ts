/**
 * Flip to `true` locally to trace sphere focus and panel state in the console.
 * Keep `false` in commits.
 */
export const PORTFOLIO_FOCUS_DEBUG = false;

export function pfLog(message: string, detail?: unknown): void {
  if (!PORTFOLIO_FOCUS_DEBUG) {
    return;
  }
  if (detail !== undefined) {
    console.log(`[portfolio-focus] ${message}`, detail);
  } else {
    console.log(`[portfolio-focus] ${message}`);
  }
}
