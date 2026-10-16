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
  try {
    return (await res.json()) as T;
  } catch {
    throw new ApiUnavailableError("API returned a non-JSON body");
  }
}

/**
 * Like apiGet, but never throws. Any failure (missing config, network error, bad status,
 * non-JSON body) is reported as `failed`, so pages and the sitemap can render a fallback
 * instead of breaking the build or the request.
 */
export async function tryApiGet<T>(
  path: string,
  revalidateSeconds = 300,
): Promise<{ data: T | null; failed: boolean }> {
  try {
    return { data: await apiGet<T>(path, revalidateSeconds), failed: false };
  } catch (err) {
    console.warn(`[api] GET ${path} failed:`, err instanceof Error ? err.message : err);
    return { data: null, failed: true };
  }
}
