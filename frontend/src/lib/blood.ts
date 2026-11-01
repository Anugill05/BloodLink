import type { BloodGroup, Component, MatchStatus, RequestStatus, Urgency } from "./types";

// Mirrors backend apps/core/blood.py so the explorer reacts instantly with no round-trip.
export const GROUPS: BloodGroup[] = ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"];

const split = (g: BloodGroup) => {
  const abo = g.slice(0, -1);
  return { ag: new Set(abo === "O" ? [] : abo.split("")), pos: g.endsWith("+") };
};
const subset = (a: Set<string>, b: Set<string>) => [...a].every((x) => b.has(x));

export function canDonate(donor: BloodGroup, recipient: BloodGroup, component: Component = "WHOLE_BLOOD") {
  const d = split(donor), r = split(recipient);
  if (component === "PLASMA") return subset(r.ag, d.ag);
  return subset(d.ag, r.ag) && (r.pos || !d.pos);
}
export const receiveFrom = (g: BloodGroup, c: Component = "WHOLE_BLOOD") => GROUPS.filter((d) => canDonate(d, g, c));
export const giveTo = (g: BloodGroup, c: Component = "WHOLE_BLOOD") => GROUPS.filter((r) => canDonate(g, r, c));

export const COMPONENTS: { value: Component; label: string; hint: string }[] = [
  { value: "WHOLE_BLOOD", label: "Whole blood", hint: "Trauma, surgery" },
  { value: "PRBC", label: "Red cells", hint: "Anaemia, thalassemia" },
  { value: "PLATELETS", label: "Platelets", hint: "Dengue, chemo" },
  { value: "PLASMA", label: "Plasma", hint: "Burns, liver" },
];

// export const URGENCY: Record<Urgency, { label: string; hint: string; tone: string }> = {
//   CRITICAL: { label: "Critical", hint: "Needed within hours", tone: "text-pulse" },
//   URGENT: { label: "Urgent", hint: "Within 24 hours", tone: "text-warn" },
//   PLANNED: { label: "Planned", hint: "Surgery / scheduled", tone: "text-ok" },
// };
export const URGENCY: Record<Urgency, { label: string; hint: string; tone: string }> = {
  CRITICAL: { label: "Critical", hint: "Needed within hours", tone: "text-blood" },
  URGENT: { label: "Urgent", hint: "Within 24 hours", tone: "text-warn" },
  PLANNED: { label: "Planned", hint: "Surgery / scheduled", tone: "text-ok" },
};

export const REQUEST_STATUS: Record<RequestStatus, { label: string; tone: "pulse" | "warn" | "ok" | "muted" }> = {
  PENDING_VERIFICATION: { label: "Awaiting hospital", tone: "warn" },
  OPEN: { label: "Searching", tone: "pulse" },
  FULFILLED: { label: "Fulfilled", tone: "ok" },
  CANCELLED: { label: "Cancelled", tone: "muted" },
  EXPIRED: { label: "Expired", tone: "muted" },
  REJECTED: { label: "Not verified", tone: "muted" },
};

export const MATCH_STATUS: Record<MatchStatus, { label: string; tone: "pulse" | "warn" | "ok" | "muted" | "ink" }> = {
  NOTIFIED: { label: "Alerted", tone: "muted" },
  ACCEPTED: { label: "On the way", tone: "warn" },
  ARRIVED: { label: "At hospital", tone: "ink" },
  DONATED: { label: "Donated", tone: "ok" },
  DECLINED: { label: "Can't make it", tone: "muted" },
  NO_SHOW: { label: "No-show", tone: "muted" },
  STOOD_DOWN: { label: "Stood down", tone: "muted" },
};
