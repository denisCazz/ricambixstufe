/**
 * Italian Partita IVA (11 digits): check digit per specifiche Agenzia delle Entrate.
 */
export function isValidItalianPartitaIva(raw: string): boolean {
  const normalized = raw.trim().replace(/^IT/i, "").replace(/\s/g, "");
  if (!/^\d{11}$/.test(normalized)) return false;

  let sum = 0;
  for (let i = 0; i < 10; i++) {
    const pos = i + 1;
    let d = parseInt(normalized[i], 10);
    if (pos % 2 === 1) {
      sum += d;
    } else {
      d *= 2;
      if (d > 9) d -= 9;
      sum += d;
    }
  }
  const check = (10 - (sum % 10)) % 10;
  return check === parseInt(normalized[10], 10);
}

/** Prezzo catalogo è IVA inclusa 22%: solo Italia o P.IVA italiana valida in fatturazione. */
export function italianVatIncludedOnProducts(
  shippingCountry: string,
  billingVatNumber: string | undefined
): boolean {
  if (shippingCountry === "Italia") return true;
  if (billingVatNumber && isValidItalianPartitaIva(billingVatNumber)) return true;
  return false;
}
