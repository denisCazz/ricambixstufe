/**
 * Pure shipping rate types and calculations.
 * Safe to import from client components. Persistence lives in lib/shipping.ts.
 */

export type ShippingZone = "italy" | "islands_calabria" | "europe";

export type ShippingTier = {
  maxKg: number;
  rate: number;
};

export type ZoneConfig = {
  label: string;
  tiers: ShippingTier[];
  includesIva: boolean;
};

export type ShippingConfig = {
  zones: Record<ShippingZone, ZoneConfig>;
  codSurcharge: number;
  ivaRate: number;
  islandsCalabriaProvincia: string[];
  /** Optional express rate kept for the admin form. Not offered at checkout. */
  dhlRate?: number;
};

export const DEFAULT_SHIPPING_CONFIG: ShippingConfig = {
  zones: {
    italy: {
      label: "Italia",
      tiers: [
        { maxKg: 10, rate: 8.5 },
        { maxKg: 30, rate: 12.5 },
      ],
      includesIva: true,
    },
    islands_calabria: {
      label: "Isole e Calabria",
      tiers: [
        { maxKg: 10, rate: 12.5 },
        { maxKg: 30, rate: 16.5 },
      ],
      includesIva: true,
    },
    europe: {
      label: "Europa",
      tiers: [
        { maxKg: 10, rate: 20.0 },
        { maxKg: 30, rate: 30.0 },
      ],
      includesIva: false,
    },
  },
  codSurcharge: 7.0,
  ivaRate: 0.22,
  dhlRate: 45.0,
  islandsCalabriaProvincia: [
    "AG", "CL", "CT", "EN", "ME", "PA", "RG", "SR", "TP",
    "CA", "CI", "MD", "NU", "OG", "OT", "OR", "SS", "SU", "VS",
    "CS", "CZ", "KR", "RC", "VV",
  ],
};

const SHIPPING_ZONES: ShippingZone[] = ["italy", "islands_calabria", "europe"];

function isZoneConfig(value: unknown): value is ZoneConfig {
  if (!value || typeof value !== "object") return false;
  const zone = value as ZoneConfig;
  return Array.isArray(zone.tiers) && zone.tiers.length > 0;
}

/** Merge a stored JSON value over the defaults so missing fields stay valid. */
export function normalizeShippingConfig(raw: unknown): ShippingConfig {
  const base = DEFAULT_SHIPPING_CONFIG;
  if (!raw || typeof raw !== "object") return base;
  const input = raw as Partial<ShippingConfig>;
  const zones = { ...base.zones };
  for (const zone of SHIPPING_ZONES) {
    const candidate = input.zones?.[zone];
    if (isZoneConfig(candidate)) {
      zones[zone] = {
        label: candidate.label || base.zones[zone].label,
        includesIva: candidate.includesIva ?? base.zones[zone].includesIva,
        tiers: candidate.tiers
          .filter((t) => Number.isFinite(t.maxKg) && Number.isFinite(t.rate))
          .map((t) => ({ maxKg: Number(t.maxKg), rate: Number(t.rate) })),
      };
      if (!zones[zone].tiers.length) zones[zone] = base.zones[zone];
    }
  }
  return {
    zones,
    codSurcharge: Number.isFinite(input.codSurcharge)
      ? Number(input.codSurcharge)
      : base.codSurcharge,
    ivaRate: Number.isFinite(input.ivaRate) ? Number(input.ivaRate) : base.ivaRate,
    dhlRate: Number.isFinite(input.dhlRate) ? Number(input.dhlRate) : base.dhlRate,
    islandsCalabriaProvincia:
      Array.isArray(input.islandsCalabriaProvincia) && input.islandsCalabriaProvincia.length
        ? input.islandsCalabriaProvincia.map((p) => String(p).toUpperCase())
        : base.islandsCalabriaProvincia,
  };
}

export function getShippingZone(
  country: string,
  province?: string | null,
  config: ShippingConfig = DEFAULT_SHIPPING_CONFIG
): ShippingZone {
  const isItaly =
    country === "Italia" ||
    country === "IT" ||
    country.toLowerCase() === "italia";

  if (!isItaly) return "europe";

  const provinces = new Set(config.islandsCalabriaProvincia);
  if (province && provinces.has(province.toUpperCase())) {
    return "islands_calabria";
  }

  return "italy";
}

/** Gross price shown to customers for one tier. */
export function tierGrossPrice(
  rate: number,
  includesIva: boolean,
  ivaRate: number
): number {
  if (!includesIva) return rate;
  return Math.round(rate * (1 + ivaRate) * 100) / 100;
}

export function calculateShippingCost(
  totalWeightKg: number,
  zone: ShippingZone,
  config: ShippingConfig = DEFAULT_SHIPPING_CONFIG
): number {
  const weight = Math.max(totalWeightKg, 0.1);
  const zoneConfig = config.zones[zone];
  const sorted = [...zoneConfig.tiers].sort((a, b) => a.maxKg - b.maxKg);
  const tier = sorted.find((t) => weight <= t.maxKg) ?? sorted[sorted.length - 1];
  return tierGrossPrice(tier.rate, zoneConfig.includesIva, config.ivaRate);
}

export function getShippingZoneLabel(
  zone: ShippingZone,
  config: ShippingConfig = DEFAULT_SHIPPING_CONFIG
): string {
  return config.zones[zone]?.label ?? zone;
}

export const COD_SURCHARGE = DEFAULT_SHIPPING_CONFIG.codSurcharge;
export const BANK_IBAN = "IT76S0708461620000000920491";
export const BANK_INTESTATARIO = "Ricambi X Stufe";
