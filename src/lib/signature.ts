import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * The one signature implementation.
 *
 * ── Why this file exists ──
 *
 * Three systems in this estate sign webhooks the same way:
 *
 *   t=<unix seconds>,v1=<hmac-sha256 over "<t>.<body>">
 *
 * Grocery signs its order handoff to logistics with it, logistics
 * signs delivery status back with it, and Inventory signs its events
 * with it. One scheme, learned once.
 *
 * It was also implemented once per receiver, which is how two copies
 * of "the same" check quietly stop agreeing — a different tolerance, a
 * length check missed, a `===` where a constant-time compare belongs.
 * Every receiver in this app now calls this.
 *
 * ── Why the timestamp is inside the MAC ──
 *
 * Signing only the body lets somebody who captures one delivery replay
 * it forever. Signing `t.body` means the age is part of what was
 * signed, so a receiver can refuse anything old AND the age cannot be
 * edited to make it look fresh.
 */

/** Five minutes, the same figure Inventory and logistics use. */
export const DEFAULT_TOLERANCE_SECONDS = 300;

export type VerifyFailure =
  | "not_configured"
  | "header_missing"
  | "header_malformed"
  | "timestamp_out_of_range"
  | "signature_mismatch";

export type VerifyResult =
  | { ok: true }
  | { ok: false; reason: VerifyFailure; detail: string };

/**
 * Check a signature header against the exact bytes that were received.
 *
 * `body` must be the RAW request text. Re-serialising parsed JSON can
 * reorder keys and produce a mismatch indistinguishable from a wrong
 * secret — which is a genuinely miserable afternoon.
 */
export function verifySignature(
  body: string,
  header: string | null,
  secret: string | undefined,
  toleranceSeconds = DEFAULT_TOLERANCE_SECONDS,
): VerifyResult {
  if (!secret) {
    return { ok: false, reason: "not_configured", detail: "no signing secret is set" };
  }
  if (!header) {
    return { ok: false, reason: "header_missing", detail: "signature header missing" };
  }

  const parts: Record<string, string> = {};
  for (const p of header.split(",")) {
    const i = p.indexOf("=");
    if (i > 0) parts[p.slice(0, i).trim()] = p.slice(i + 1).trim();
  }

  const t = Number(parts.t);
  if (!t || !parts.v1) {
    return { ok: false, reason: "header_malformed", detail: "expected t=<unix>,v1=<hex>" };
  }

  // A replay of a genuine, correctly-signed request is still a replay.
  const drift = Math.abs(Date.now() / 1000 - t);
  if (drift > toleranceSeconds) {
    return {
      ok: false,
      reason: "timestamp_out_of_range",
      detail: `timestamp is ${Math.round(drift)}s away from ours (tolerance ${toleranceSeconds}s)`,
    };
  }

  const want = createHmac("sha256", secret).update(`${t}.${body}`).digest("hex");

  let a: Buffer;
  let b: Buffer;
  try {
    a = Buffer.from(want, "hex");
    b = Buffer.from(parts.v1, "hex");
  } catch {
    return { ok: false, reason: "header_malformed", detail: "v1 is not hex" };
  }

  // Length first: timingSafeEqual throws on a length mismatch rather
  // than returning false.
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, reason: "signature_mismatch", detail: "signature does not match" };
  }

  return { ok: true };
}
