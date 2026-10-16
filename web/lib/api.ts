import "server-only";

export class ApiUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiUnavailableError";
  }
}

function baseUrl(): string {
  const url = process.env.API_URL;
  if (!url) throw new ApiUnavailableError("API_URL is not configured");
  return url.replace(/\/$/, "");
}

/**
 * GET from the Aswem API, server-side only.
 * Returns null on 404 and throws ApiUnavailableError on network or server failures.
 */
export async function apiGet<T>(path: string, revalidateSeconds = 300): Promise<T | null> {
  let res: Response;
  try {
    res = await fetch(`${baseUrl()}/api/v1${path}`, {
      next: { revalidate: revalidateSeconds },
      headers: { Accept: "application/json" },
    });
  } catch {
    throw new ApiUnavailableError("API unreachable");
  }
  if (res.status === 404) return null;
  if (!res.ok) throw new ApiUnavailableError(`API responded with ${res.status}`);
  return (await res.json()) as T;
}

/** Like apiGet, but never throws for availability problems. Pages can render a fallback instead. */
export async function tryApiGet<T>(
  path: string,
  revalidateSeconds = 300,
): Promise<{ data: T | null; failed: boolean }> {
  try {
    return { data: await apiGet<T>(path, revalidateSeconds), failed: false };
  } catch (err) {
    if (err instanceof ApiUnavailableError) {
      return { data: null, failed: true };
    }
    throw err;
  }
}
