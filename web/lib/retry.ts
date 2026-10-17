/**
 * Fetch with a timeout and retries for transient failures (network errors, timeouts,
 * and 408/429/5xx). Safe in server and client code. Cold starts on free hosting are
 * the main reason this exists.
 */
export type RetryOptions = {
  attempts?: number;
  timeoutMs?: number;
  baseDelayMs?: number;
};

const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504]);

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchWithRetry(
  input: string,
  init: RequestInit = {},
  options: RetryOptions = {},
): Promise<Response> {
  const attempts = Math.max(1, options.attempts ?? 3);
  const timeoutMs = options.timeoutMs ?? 10_000;
  const baseDelayMs = options.baseDelayMs ?? 250;
  let lastError: unknown = new Error("request failed");

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const res = await fetch(input, { ...init, signal: AbortSignal.timeout(timeoutMs) });
      if (!RETRYABLE_STATUS.has(res.status) || attempt === attempts - 1) return res;
      lastError = new Error(`HTTP ${res.status}`);
    } catch (err) {
      lastError = err;
    }
    if (attempt < attempts - 1) await sleep(baseDelayMs * 2 ** attempt);
  }
  throw lastError;
}
