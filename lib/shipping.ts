/**
 * Shipping cost calculation for RicambiXStufe.
 *
 * Zones:
 *   - Italy (standard): €8.50+IVA ≤10kg, €12.50+IVA 10–30kg
 *   - Islands & Calabria: €12.50+IVA ≤10kg, €16.50+IVA 10–30kg
 *   - Europe: €20 ≤10kg, €30 10–30kg
 *
 * Contrassegno (COD) surcharge: +€7.00
 * IBAN for bank transfers: IT76S0708461620000000920491
 */

// Provinces classified as islands + Calabria (surcharge zone)
const ISLANDS_CALABRIA_PROVINCES = new Set([
  // Sicilia
  "AG", "CL", "CT", "EN", "ME", "PA", "RG", "SR", "TP",
  // Sardegna
  "CA", "CI", "MD", "NU", "OG", "OT", "OR", "SS", "SU", "VS",
  // Calabria
  "CS", "CZ", "KR", "RC", "VV",
]);

export type ShippingZone = "italy" | "islands_calabria" | "europe";

// Net rates (without IVA) for Italy zones; flat rates for Europe
// [rate ≤10kg, rate 10–30kg]
const SHIPPING_RATES: Record<ShippingZone, [number, number]> = {
  italy: [8.5, 12.5],
  islands_calabria: [12.5, 16.5],
  europe: [20.0, 30.0],
};

const IVA_RATE = 0.22;

export const COD_SURCHARGE = 7.0;
export const BANK_IBAN = "IT76S0708461620000000920491";
export const BANK_INTESTATARIO = "Ricambi X Stufe";

/** Determine the shipping zone from country + province */
export function getShippingZone(
  country: string,
  province?: string | null
): ShippingZone {
  // Normalize: accept both "Italia" (display name) and "IT" (code)
  const isItaly =
    country === "Italia" ||
    country === "IT" ||
    country.toLowerCase() === "italia";

  if (!isItaly) return "europe";

  if (province && ISLANDS_CALABRIA_PROVINCES.has(province.toUpperCase())) {
    return "islands_calabria";
  }

  return "italy";
}

/**
 * Calculate shipping cost (IVA-inclusive for Italy, flat for Europe).
 * @param totalWeightKg  Total weight of the order in kg
 * @param zone           Shipping zone
 * @returns Shipping cost in EUR (IVA included for Italy zones)
 */
export function calculateShippingCost(
  totalWeightKg: number,
  zone: ShippingZone
): number {
  // Default minimum weight 0.5 kg if nothing specified
  const weight = Math.max(totalWeightKg, 0.1);

  const rates = SHIPPING_RATES[zone];
  const netRate = weight <= 10 ? rates[0] : rates[1];

  if (zone === "europe") {
    // Europe rates are flat (no separate IVA addition)
    return netRate;
  }

  // Italy/Islands: add IVA 22%
  return Math.round(netRate * (1 + IVA_RATE) * 100) / 100;
}

/** Get a human-readable label for the shipping zone */
export function getShippingZoneLabel(zone: ShippingZone): string {
  switch (zone) {
    case "italy":
      return "Italia";
    case "islands_calabria":
      return "Isole e Calabria";
    case "europe":
      return "Europa";
  }
}
