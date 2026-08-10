import type {
  AnnouncementAudience,
  AnnouncementScheduleMode,
  AnnouncementSeverity,
} from "@/lib/types";

export type AnnouncementPayload = {
  id: number;
  message: string;
  severity: AnnouncementSeverity;
  audience: AnnouncementAudience;
  scheduleMode: AnnouncementScheduleMode;
  startsAt: string | null;
  endsAt: string | null;
};

/** Simple non-crypto fingerprint so edits re-show dismissed popups. */
export function announcementFingerprint(a: AnnouncementPayload): string {
  const raw = [
    a.message,
    a.severity,
    a.audience,
    a.scheduleMode,
    a.startsAt ?? "",
    a.endsAt ?? "",
  ].join("|");
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash << 5) - hash + raw.charCodeAt(i);
    hash |= 0;
  }
  return (hash >>> 0).toString(36);
}

function storageKey(id: number, fingerprint: string): string {
  return `rxs-avviso:${id}:${fingerprint}`;
}

export function isAnnouncementDismissed(a: AnnouncementPayload): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(storageKey(a.id, announcementFingerprint(a))) === "1";
  } catch {
    return false;
  }
}

export function dismissAnnouncement(a: AnnouncementPayload): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(storageKey(a.id, announcementFingerprint(a)), "1");
  } catch {
    /* ignore quota / private mode */
  }
}
