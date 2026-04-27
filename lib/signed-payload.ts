import { createHmac, timingSafeEqual } from "crypto";

const SECRET = process.env.AUTH_SECRET || "fallback-secret";
const SEPARATOR = ".";

export function signPayload(payload: object): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", SECRET).update(data).digest("base64url");
  return `${data}${SEPARATOR}${sig}`;
}

export function verifyPayload<T = unknown>(token: string): T | null {
  try {
    const idx = token.lastIndexOf(SEPARATOR);
    if (idx === -1) return null;
    const data = token.slice(0, idx);
    const sig = token.slice(idx + 1);
    const expected = createHmac("sha256", SECRET).update(data).digest("base64url");
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    return JSON.parse(Buffer.from(data, "base64url").toString()) as T;
  } catch {
    return null;
  }
}
