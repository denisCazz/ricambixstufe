/**
 * Shipping rates stored in `app_settings` (key = "shipping"),
 * edited from Admin → Spedizioni.
 */

import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { appSettings } from "@/db/schema";
import {
  DEFAULT_SHIPPING_CONFIG,
  normalizeShippingConfig,
  type ShippingConfig,
} from "@/lib/shipping-rates";

export * from "@/lib/shipping-rates";

let _cachedConfig: ShippingConfig | null = null;
let _cacheTs = 0;
const CACHE_TTL_MS = 60_000;

export async function getShippingConfig(): Promise<ShippingConfig> {
  const now = Date.now();
  if (_cachedConfig && now - _cacheTs < CACHE_TTL_MS) return _cachedConfig;

  try {
    const db = getDb();
    const [row] = await db
      .select({ value: appSettings.value })
      .from(appSettings)
      .where(eq(appSettings.key, "shipping"))
      .limit(1);

    if (row?.value) {
      _cachedConfig = normalizeShippingConfig(row.value);
      _cacheTs = now;
      return _cachedConfig;
    }
  } catch {
    // Table missing or DB unavailable — use defaults.
  }

  return DEFAULT_SHIPPING_CONFIG;
}

export function invalidateShippingConfigCache() {
  _cachedConfig = null;
  _cacheTs = 0;
}
