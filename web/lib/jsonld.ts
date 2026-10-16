/** Serializes JSON-LD safely for embedding inside a <script> tag. */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
