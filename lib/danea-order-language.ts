/**
 * Easyfatt è in italiano: le righe ordine usano il nome catalogo IT,
 * anche se il cliente ha comprato in un'altra lingua del sito.
 */

export interface StoveNames {
  nameIt: string;
  nameEn?: string | null;
  nameFr?: string | null;
  nameEs?: string | null;
}

const VIRGIN_NOTE = "Opzione: scheda vergine (non programmata)";

const VIRGIN_NOTES = new Set([
  VIRGIN_NOTE.toLowerCase(),
  "option: blank board (unprogrammed)",
  "option : carte vierge (non programmée)",
  "opción: placa virgen (no programada)",
]);

const PROGRAMMED_PREFIXES = [
  "opzione: programmata per ",
  "option: programmed for ",
  "option : programmée pour ",
  "opción: programada para ",
];

const DISPLAY_PREFIXES = ["display: ", "afficheur : ", "pantalla: "];

function aliasKey(value: string): string {
  return value.trim().toLocaleLowerCase("it");
}

export function buildStoveAliasMap(stoves: StoveNames[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const stove of stoves) {
    const italian = stove.nameIt.trim();
    if (!italian) continue;
    for (const alias of [stove.nameIt, stove.nameEn, stove.nameFr, stove.nameEs]) {
      const key = alias?.trim();
      if (key) map.set(aliasKey(key), italian);
    }
  }
  return map;
}

function italianStoveName(raw: string, stoveAliases: Map<string, string>): string {
  const name = raw.trim();
  return stoveAliases.get(aliasKey(name)) || name;
}

function italianizeNoteLine(line: string, stoveAliases: Map<string, string>): string {
  const trimmed = line.trim();
  if (!trimmed) return line;
  const lower = trimmed.toLocaleLowerCase("it");

  if (VIRGIN_NOTES.has(lower)) return VIRGIN_NOTE;

  for (const prefix of PROGRAMMED_PREFIXES) {
    if (lower.startsWith(prefix)) {
      const stove = trimmed.slice(prefix.length);
      return `Opzione: programmata per ${italianStoveName(stove, stoveAliases)}`;
    }
  }

  for (const prefix of DISPLAY_PREFIXES) {
    if (lower.startsWith(prefix)) {
      const display = trimmed.slice(prefix.length).trim();
      return `Display: ${display}`;
    }
  }

  return line;
}

export function italianDaneaDescription(
  storedName: string,
  nameIt: string | null | undefined,
  stoveAliases: Map<string, string> = new Map()
): string {
  const newline = storedName.indexOf("\n");
  const storedBase = (newline >= 0 ? storedName.slice(0, newline) : storedName).trim();
  const notes = newline >= 0 ? storedName.slice(newline + 1) : "";
  const base = nameIt?.trim() || storedBase || "Prodotto";
  if (!notes.trim()) return base;

  const italianNotes = notes
    .split("\n")
    .map((line) => italianizeNoteLine(line, stoveAliases))
    .join("\n");
  return `${base}\n${italianNotes}`;
}
