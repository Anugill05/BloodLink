// "use client";

// import clsx from "clsx";
// import { useState } from "react";
// import useSWR from "swr";
// import { BellRing, Check, Clock, HeartHandshake, MapPin, Navigation, Phone, Settings2, X } from "lucide-react";
// import { LocationPicker } from "@/components/LocationPicker";
// import { ActionButton, MatchStatusPill } from "@/components/RequestBits";
// import { Empty, GroupMark, PageLoader, Pill, Stat } from "@/components/ui";
// import { fetcher, patch, post } from "@/lib/api";
// import { useAuth, useRequireAuth } from "@/lib/auth";
// import { URGENCY } from "@/lib/blood";
// import { daysUntil, fmtDate, mapsLink, timeAgo, timeLeft } from "@/lib/format";
// import type { DonorAlert, DonorProfile, User } from "@/lib/types";

// const isDonor = (u: User) => !!u.donor_profile;

// function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
//   return (
//     <button role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)}
//       className={clsx("relative h-8 w-14 shrink-0 rounded-full transition-colors", on ? "bg-ok" : "bg-line")}>
//       <span className={clsx("absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all", on ? "left-7" : "left-1")} />
//     </button>
//   );
// }

// function EligibilityRing({ p }: { p: DonorProfile }) {
//   const left = daysUntil(p.next_eligible_date);
//   const pct = p.is_eligible ? 1 : 1 - left / 90;
//   const C = 2 * Math.PI * 52;
//   return (
//     <div className="flex items-center gap-5">
//       <div className="relative h-32 w-32 shrink-0">
//         <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
//           <circle cx="60" cy="60" r="52" fill="none" stroke="rgb(var(--line))" strokeWidth="8" />
//           <circle cx="60" cy="60" r="52" fill="none" stroke={p.is_eligible ? "rgb(var(--ok))" : "rgb(var(--blood))"} strokeWidth="8" strokeLinecap="round"
//             strokeDasharray={C} strokeDashoffset={C * (1 - pct)} className="transition-all duration-1000" />
//         </svg>
//         <div className="absolute inset-0 grid place-items-center text-center">
//           {p.is_eligible ? <Check className="h-9 w-9 text-ok" /> : (
//             <div><div className="font-serif text-4xl leading-none">{left}</div><div className="eyebrow !text-[9px]">days</div></div>
//           )}
//         </div>
//       </div>
//       <div>
//         <div className="font-semibold">{p.is_eligible ? "Ready to donate" : "Recovering"}</div>
//         <p className="mt-1 text-sm text-muted">
//           {p.is_eligible
//             ? p.last_donation_date ? `Last donated ${fmtDate(p.last_donation_date)}.` : "You'll get alerts for compatible requests near you."
//             : `Your body is rebuilding. Eligible again on ${fmtDate(p.next_eligible_date!)} — we'll remind you.`}
//         </p>
//       </div>
//     </div>
//   );
// }

// function AlertCard({ a, refresh }: { a: DonorAlert; refresh: () => void }) {
//   const [eta, setEta] = useState(20);
//   const r = a.request;
//   return (
//     <div className="card relative overflow-hidden animate-rise">
//       <div className={clsx("absolute inset-y-0 left-0 w-1", r.urgency === "CRITICAL" ? "bg-pulse" : r.urgency === "URGENT" ? "bg-warn" : "bg-ok")} />
//       <div className="flex flex-wrap items-start gap-4 p-5 pl-6">
//         <GroupMark group={r.blood_group} size="md" />
//         <div className="min-w-0 flex-1">
//           <div className="flex flex-wrap items-center gap-2">
//             <Pill tone={r.urgency === "CRITICAL" ? "pulse" : "warn"} live>{URGENCY[r.urgency].label}</Pill>
//             <span className="font-mono text-xs text-muted">{r.code} · {timeAgo(a.notified_at)}</span>
//           </div>
//           <div className="mt-2 text-lg font-semibold">{r.units_needed}u {r.component_label.toLowerCase()} · {r.hospital.name}</div>
//           <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
//             <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{a.distance_km.toFixed(1)} km away</span>
//             <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{timeLeft(r.needed_by)}</span>
//             <span>{r.units_pledged}/{r.units_needed} pledged</span>
//           </div>
//           {r.reason && <p className="mt-2 text-sm">&ldquo;{r.reason}&rdquo;</p>}
//         </div>
//       </div>
//       <div className="flex flex-wrap items-center gap-3 border-t border-line bg-paper/50 px-5 py-4 pl-6">
//         <span className="text-sm text-muted">I can be there in</span>
//         <div className="flex gap-1">
//           {[10, 20, 30, 45].map((m) => (
//             <button key={m} onClick={() => setEta(m)} className={clsx("rounded-full border px-3 py-1 font-mono text-xs", eta === m ? "border-ink bg-ink text-paper" : "border-line")}>{m}m</button>
//           ))}
//         </div>
//         <div className="ml-auto flex gap-2">
//           <ActionButton onRun={() => post(`/matches/${a.id}/decline/`)} done={refresh}><X className="h-3.5 w-3.5" /> Can&rsquo;t</ActionButton>
//           <ActionButton variant="blood" onRun={() => post(`/matches/${a.id}/accept/`, { eta_minutes: eta })} done={refresh}><HeartHandshake className="h-4 w-4" /> I&rsquo;m coming</ActionButton>
//         </div>
//       </div>
//     </div>
//   );
// }

// function OnTheWay({ a, refresh }: { a: DonorAlert; refresh: () => void }) {
//   const r = a.request;
//   const h = r.hospital;
//   return (
//     <div className="relative overflow-hidden rounded-[1.75rem] bg-ink p-6 text-paper sm:p-8">
//       <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 animate-ripple rounded-full border-2 border-pulse/60" />
//       <div className="eyebrow !text-paper/60">You&rsquo;re on the way · {r.code}</div>
//       <h2 className="mt-3 font-serif text-4xl leading-tight">{h.name}</h2>
//       <p className="text-paper/70">{h.address}, {h.city} · {a.distance_km.toFixed(1)} km</p>
//       <div className="mt-6 grid gap-4 border-y border-paper/10 py-5 sm:grid-cols-3">
//         <div><div className="eyebrow !text-paper/50">Patient</div><div className="mt-1">{r.patient_name}</div></div>
//         <div><div className="eyebrow !text-paper/50">Ask for</div><div className="mt-1">{r.contact_name}</div></div>
//         <div><div className="eyebrow !text-paper/50">Give</div><div className="mt-1">{r.component_label} · {r.blood_group}</div></div>
//       </div>
//       {r.notes && <p className="mt-4 text-sm text-paper/70">Note: {r.notes}</p>}
//       <div className="mt-6 flex flex-wrap gap-2">
//         <a href={mapsLink(h.coordinates?.lat, h.coordinates?.lng)} target="_blank" rel="noreferrer" className="btn bg-pulse text-white hover:bg-blood"><Navigation className="h-4 w-4" /> Directions</a>
//         <a href={`tel:${r.contact_phone}`} className="btn border border-paper/20 text-paper hover:bg-paper/10"><Phone className="h-4 w-4" /> {r.contact_phone}</a>
//         <span className="ml-auto [&_button]:!border-paper/20 [&_button]:!bg-transparent [&_button]:!text-paper/70">
//           <ActionButton onRun={() => post(`/matches/${a.id}/decline/`, { reason: "Can no longer make it" })} done={refresh}>I can&rsquo;t make it anymore</ActionButton>
//         </span>
//       </div>
//       <p className="mt-6 text-xs text-paper/50">Eat something light and drink water before you go. Carry a photo ID. The blood bank will do a quick health check.</p>
//     </div>
//   );
// }

// function Preferences({ p, refresh }: { p: DonorProfile; refresh: () => void }) {
//   const save = async (body: Partial<DonorProfile> | { lat: number; lng: number }) => { await patch("/donors/me/", body); refresh(); };
//   return (
//     <details className="card group">
//       <summary className="flex cursor-pointer list-none items-center gap-2 px-5 py-4">
//         <Settings2 className="h-4 w-4 text-muted" /> <span className="font-medium">Alert preferences</span>
//         <span className="ml-auto text-xs text-muted group-open:hidden">Travel up to {p.max_travel_km} km</span>
//       </summary>
//       <div className="space-y-6 border-t border-line p-5">
//         <div>
//           <div className="flex justify-between text-sm"><span>How far will you travel?</span><span className="font-mono">{p.max_travel_km} km</span></div>
//           <input type="range" min={3} max={50} defaultValue={p.max_travel_km} className="mt-3 w-full accent-[rgb(var(--blood))]"
//             onMouseUp={(e) => save({ max_travel_km: +(e.target as HTMLInputElement).value })}
//             onTouchEnd={(e) => save({ max_travel_km: +(e.target as HTMLInputElement).value })} />
//           <p className="mt-1 text-xs text-muted">For critical cases we may still ask if you&rsquo;re a bit further away.</p>
//         </div>
//         {(["notify_sms", "notify_email"] as const).map((k) => (
//           <div key={k} className="flex items-center justify-between">
//             <span className="text-sm">{k === "notify_sms" ? "SMS alerts" : "Email alerts"}</span>
//             <Switch on={p[k]} label={k} onChange={(v) => save({ [k]: v })} />
//           </div>
//         ))}
//         <div>
//           <div className="mb-2 text-sm">Update my location</div>
//           <LocationPicker value={p.coordinates} onChange={(c) => save({ lat: c.lat, lng: c.lng })} />
//         </div>
//       </div>
//     </details>
//   );
// }

// export default function DonorHome() {
//   const { user } = useRequireAuth(isDonor, "/requests");
//   const { reload } = useAuth();
//   const { data: profile, mutate: mp } = useSWR<DonorProfile>(user ? "/donors/me/" : null, fetcher);
//   const { data: alerts, mutate: ma } = useSWR<DonorAlert[]>(user ? "/donors/me/alerts/" : null, fetcher, { refreshInterval: 10000 });
//   const { data: donations } = useSWR<{ id: number; donated_on: string; hospital_name: string; units: number }[]>(user ? "/donors/me/donations/" : null, fetcher);
//   if (!user || !profile || !alerts) return <PageLoader />;

//   const refresh = () => { ma(); mp(); reload(); };
//   const pending = alerts.filter((a) => a.status === "NOTIFIED" && a.request.status === "OPEN");
//   const active = alerts.filter((a) => a.status === "ACCEPTED" || a.status === "ARRIVED");
//   const history = alerts.filter((a) => !pending.includes(a) && !active.includes(a));
//   const rate = profile.alerts_received ? Math.round((profile.alerts_accepted / profile.alerts_received) * 100) : null;

//   return (
//     <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
//       <div className="flex flex-wrap items-center gap-5">
//         <GroupMark group={profile.blood_group} size="lg" />
//         <div className="flex-1">
//           <div className="eyebrow">Donor · {user.city || "BloodLink"}</div>
//           <h1 className="mt-1 font-serif text-5xl">Hi, {user.full_name.split(" ")[0]}.</h1>
//         </div>
//         <div className="card flex items-center gap-4 px-5 py-4">
//           <div>
//             <div className="text-sm font-semibold">{profile.is_available ? "Available for alerts" : "Paused"}</div>
//             <div className="text-xs text-muted">{profile.is_available ? "We'll alert you if someone nearby needs you" : "You won't get any alerts"}</div>
//           </div>
//           <Switch on={profile.is_available} label="Availability" onChange={async (v) => { await patch("/donors/me/", { is_available: v }); mp(); }} />
//         </div>
//       </div>

//       <div className="mt-10 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
//         <div className="space-y-6">
//           {active.map((a) => <OnTheWay key={a.id} a={a} refresh={refresh} />)}

//           <div>
//             <div className="mb-3 flex items-center gap-2">
//               <BellRing className="h-4 w-4 text-blood" />
//               <h2 className="font-semibold">Needs your response</h2>
//               {pending.length > 0 && <span className="rounded-full bg-pulse px-2 font-mono text-xs text-white">{pending.length}</span>}
//             </div>
//             <div className="space-y-3">
//               {pending.length === 0 ? (
//                 <Empty title="All quiet near you">
//                   {profile.is_available ? "When a verified hospital nearby needs your blood group, the alert shows up here and on your phone." : "Turn on availability to receive alerts."}
//                 </Empty>
//               ) : pending.map((a) => <AlertCard key={a.id} a={a} refresh={refresh} />)}
//             </div>
//           </div>

//           {history.length > 0 && (
//             <div>
//               <h2 className="mb-3 font-semibold">Past alerts</h2>
//               <div className="card divide-y divide-line">
//                 {history.slice(0, 12).map((a) => (
//                   <div key={a.id} className="flex items-center gap-3 px-5 py-3 text-sm">
//                     <span className="w-10 font-serif text-xl text-blood">{a.request.blood_group.replace("-", "−")}</span>
//                     <span className="min-w-0 flex-1 truncate">{a.request.hospital.name}</span>
//                     <span className="hidden font-mono text-xs text-muted sm:inline">{timeAgo(a.notified_at)}</span>
//                     <MatchStatusPill status={a.status} />
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>

//         <aside className="space-y-6">
//           <div className="card p-6"><EligibilityRing p={profile} /></div>
//           <div className="card grid grid-cols-3 gap-4 p-6">
//             <Stat label="Donations" value={profile.donations_count} />
//             <Stat label="Lives" value={profile.lives_impacted} sub="up to 3 per unit" />
//             <Stat label="Response" value={rate != null ? `${rate}%` : "—"} />
//           </div>
//           {donations && donations.length > 0 && (
//             <div className="card p-5">
//               <div className="eyebrow mb-3">Donation record</div>
//               <ul className="space-y-2 text-sm">
//                 {donations.map((d) => (
//                   <li key={d.id} className="flex justify-between gap-3"><span className="truncate">{d.hospital_name ?? "Blood bank"}</span><span className="font-mono text-xs text-muted">{fmtDate(d.donated_on)}</span></li>
//                 ))}
//               </ul>
//             </div>
//           )}
//           <Preferences p={profile} refresh={() => mp()} />
//         </aside>
//       </div>
//     </div>
//   );
// }
"use client";

import clsx from "clsx";
import { useState } from "react";
import useSWR from "swr";
import { BellRing, Check, Clock, HeartHandshake, MapPin, Navigation, Phone, Settings2, X } from "lucide-react";
import { LocationPicker } from "@/components/LocationPicker";
import { ActionButton, MatchStatusPill } from "@/components/RequestBits";
import { Empty, GroupMark, PageLoader, Pill, Stat } from "@/components/ui";
import { fetcher, patch, post } from "@/lib/api";
import { useAuth, useRequireAuth } from "@/lib/auth";
import { URGENCY } from "@/lib/blood";
import { daysUntil, fmtDate, mapsLink, timeAgo, timeLeft } from "@/lib/format";
import type { DonorAlert, DonorProfile, User } from "@/lib/types";

const isDonor = (u: User) => !!u.donor_profile;

function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={clsx("relative h-6 w-11 shrink-0 rounded-full transition-colors", on ? "bg-ok" : "bg-line")}
    >
      <span className={clsx("absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform", on && "translate-x-5")} />
    </button>
  );
}

function Eligibility({ p }: { p: DonorProfile }) {
  const left = daysUntil(p.next_eligible_date);
  const pct = p.is_eligible ? 100 : Math.max(0, Math.min(100, Math.round((1 - left / 90) * 100)));
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-semibold">
          {p.is_eligible && <Check className="h-4 w-4 text-ok" />}
          {p.is_eligible ? "Ready to donate" : "Recovering"}
        </div>
        {!p.is_eligible && <span className="text-sm text-muted">{left} days left</span>}
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-line">
        <div className={clsx("h-full rounded-full", p.is_eligible ? "bg-ok" : "bg-blood")} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-3 text-sm text-muted">
        {p.is_eligible
          ? p.last_donation_date ? `Last donated ${fmtDate(p.last_donation_date)}.` : "You'll get alerts for compatible requests near you."
          : `Your body is rebuilding. Eligible again on ${fmtDate(p.next_eligible_date!)}. We'll remind you.`}
      </p>
    </div>
  );
}

function AlertCard({ a, refresh }: { a: DonorAlert; refresh: () => void }) {
  const [eta, setEta] = useState(20);
  const r = a.request;
  const edge = r.urgency === "CRITICAL" ? "border-l-blood" : r.urgency === "URGENT" ? "border-l-warn" : "border-l-ok";
  return (
    <div className={clsx("card animate-rise border-l-4", edge)}>
      <div className="flex flex-wrap items-start gap-4 p-5">
        <GroupMark group={r.blood_group} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone={r.urgency === "CRITICAL" ? "pulse" : "warn"}>{URGENCY[r.urgency].label}</Pill>
            <span className="text-xs text-muted">{r.code} · {timeAgo(a.notified_at)}</span>
          </div>
          <div className="mt-2 text-lg font-semibold">{r.units_needed} units {r.component_label.toLowerCase()} · {r.hospital.name}</div>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{a.distance_km.toFixed(1)} km away</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{timeLeft(r.needed_by)}</span>
            <span>{r.units_pledged}/{r.units_needed} pledged</span>
          </div>
          {r.reason && <p className="mt-2 text-sm">&ldquo;{r.reason}&rdquo;</p>}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 border-t border-line bg-paper px-5 py-4">
        <span className="text-sm text-muted">I can be there in</span>
        <div className="flex gap-1.5">
          {[10, 20, 30, 45].map((m) => (
            <button
              key={m}
              onClick={() => setEta(m)}
              className={clsx("rounded-md border px-3 py-1 text-xs font-medium", eta === m ? "border-ink bg-ink text-white" : "border-line bg-card hover:bg-ink/5")}
            >
              {m} min
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-2">
          <ActionButton onRun={() => post(`/matches/${a.id}/decline/`)} done={refresh}><X className="h-3.5 w-3.5" /> Can&rsquo;t</ActionButton>
          <ActionButton variant="blood" onRun={() => post(`/matches/${a.id}/accept/`, { eta_minutes: eta })} done={refresh}><HeartHandshake className="h-4 w-4" /> I&rsquo;m coming</ActionButton>
        </div>
      </div>
    </div>
  );
}

function OnTheWay({ a, refresh }: { a: DonorAlert; refresh: () => void }) {
  const r = a.request;
  const h = r.hospital;
  return (
    <div className="rounded-lg border border-blood/30 bg-blood/5 p-6">
      <p className="text-sm font-semibold text-blood">You&rsquo;re on the way · {r.code}</p>
      <h2 className="mt-2 text-2xl font-bold">{h.name}</h2>
      <p className="text-muted">{h.address}, {h.city} · {a.distance_km.toFixed(1)} km</p>
      <dl className="mt-5 grid gap-4 border-y border-blood/15 py-5 sm:grid-cols-3">
        <div><dt className="text-sm text-muted">Patient</dt><dd className="mt-0.5 font-medium">{r.patient_name}</dd></div>
        <div><dt className="text-sm text-muted">Ask for</dt><dd className="mt-0.5 font-medium">{r.contact_name}</dd></div>
        <div><dt className="text-sm text-muted">Give</dt><dd className="mt-0.5 font-medium">{r.component_label} · {r.blood_group}</dd></div>
      </dl>
      {r.notes && <p className="mt-4 text-sm text-muted">Note: {r.notes}</p>}
      <div className="mt-5 flex flex-wrap gap-2">
        <a href={mapsLink(h.coordinates?.lat, h.coordinates?.lng)} target="_blank" rel="noreferrer" className="btn-blood">
          <Navigation className="h-4 w-4" /> Directions
        </a>
        <a href={`tel:${r.contact_phone}`} className="btn-ghost">
          <Phone className="h-4 w-4" /> {r.contact_phone}
        </a>
        <span className="ml-auto">
          <ActionButton onRun={() => post(`/matches/${a.id}/decline/`, { reason: "Can no longer make it" })} done={refresh}>
            I can&rsquo;t make it anymore
          </ActionButton>
        </span>
      </div>
      <p className="mt-5 text-xs text-muted">Eat something light and drink water before you go. Carry a photo ID. The blood bank will do a quick health check.</p>
    </div>
  );
}

function Preferences({ p, refresh }: { p: DonorProfile; refresh: () => void }) {
  const save = async (body: Partial<DonorProfile> | { lat: number; lng: number }) => { await patch("/donors/me/", body); refresh(); };
  return (
    <details className="card group">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-5 py-4">
        <Settings2 className="h-4 w-4 text-muted" /> <span className="font-medium">Alert preferences</span>
        <span className="ml-auto text-xs text-muted group-open:hidden">Travel up to {p.max_travel_km} km</span>
      </summary>
      <div className="space-y-6 border-t border-line p-5">
        <div>
          <div className="flex justify-between text-sm"><span>How far will you travel?</span><span className="font-medium">{p.max_travel_km} km</span></div>
          <input
            type="range" min={3} max={50} defaultValue={p.max_travel_km}
            className="mt-3 w-full accent-[rgb(var(--blood))]"
            onMouseUp={(e) => save({ max_travel_km: +(e.target as HTMLInputElement).value })}
            onTouchEnd={(e) => save({ max_travel_km: +(e.target as HTMLInputElement).value })}
          />
          <p className="mt-1 text-xs text-muted">For critical cases we may still ask if you&rsquo;re a bit further away.</p>
        </div>
        {(["notify_sms", "notify_email"] as const).map((k) => (
          <div key={k} className="flex items-center justify-between">
            <span className="text-sm">{k === "notify_sms" ? "SMS alerts" : "Email alerts"}</span>
            <Switch on={p[k]} label={k} onChange={(v) => save({ [k]: v })} />
          </div>
        ))}
        <div>
          <div className="mb-2 text-sm">Update my location</div>
          <LocationPicker value={p.coordinates} onChange={(c) => save({ lat: c.lat, lng: c.lng })} />
        </div>
      </div>
    </details>
  );
}

export default function DonorHome() {
  const { user } = useRequireAuth(isDonor, "/requests");
  const { reload } = useAuth();
  const { data: profile, mutate: mp } = useSWR<DonorProfile>(user ? "/donors/me/" : null, fetcher);
  const { data: alerts, mutate: ma } = useSWR<DonorAlert[]>(user ? "/donors/me/alerts/" : null, fetcher, { refreshInterval: 10000 });
  const { data: donations } = useSWR<{ id: number; donated_on: string; hospital_name: string; units: number }[]>(user ? "/donors/me/donations/" : null, fetcher);
  if (!user || !profile || !alerts) return <PageLoader />;

  const refresh = () => { ma(); mp(); reload(); };
  const pending = alerts.filter((a) => a.status === "NOTIFIED" && a.request.status === "OPEN");
  const active = alerts.filter((a) => a.status === "ACCEPTED" || a.status === "ARRIVED");
  const history = alerts.filter((a) => !pending.includes(a) && !active.includes(a));
  const rate = profile.alerts_received ? Math.round((profile.alerts_accepted / profile.alerts_received) * 100) : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex flex-wrap items-center gap-4">
        <GroupMark group={profile.blood_group} size="lg" />
        <div className="flex-1">
          <p className="text-sm text-muted">Donor · {user.city || "BloodLink"}</p>
          <h1 className="mt-0.5 text-3xl font-bold tracking-tight sm:text-4xl">Hi, {user.full_name.split(" ")[0]}</h1>
        </div>
        <div className="card flex items-center gap-4 px-5 py-4">
          <div>
            <div className="text-sm font-semibold">{profile.is_available ? "Available for alerts" : "Paused"}</div>
            <div className="text-xs text-muted">{profile.is_available ? "We'll alert you if someone nearby needs you" : "You won't get any alerts"}</div>
          </div>
          <Switch on={profile.is_available} label="Availability" onChange={async (v) => { await patch("/donors/me/", { is_available: v }); mp(); }} />
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          {active.map((a) => <OnTheWay key={a.id} a={a} refresh={refresh} />)}

          <div>
            <div className="mb-3 flex items-center gap-2">
              <BellRing className="h-4 w-4 text-blood" />
              <h2 className="font-semibold">Needs your response</h2>
              {pending.length > 0 && <span className="rounded-full bg-blood px-2 text-xs font-semibold text-white">{pending.length}</span>}
            </div>
            <div className="space-y-3">
              {pending.length === 0 ? (
                <Empty title="All quiet near you">
                  {profile.is_available ? "When a verified hospital nearby needs your blood group, the alert shows up here and on your phone." : "Turn on availability to receive alerts."}
                </Empty>
              ) : pending.map((a) => <AlertCard key={a.id} a={a} refresh={refresh} />)}
            </div>
          </div>

          {history.length > 0 && (
            <div>
              <h2 className="mb-3 font-semibold">Past alerts</h2>
              <div className="card divide-y divide-line">
                {history.slice(0, 12).map((a) => (
                  <div key={a.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                    <span className="w-10 text-base font-bold text-blood">{a.request.blood_group.replace("-", "−")}</span>
                    <span className="min-w-0 flex-1 truncate">{a.request.hospital.name}</span>
                    <span className="hidden text-xs text-muted sm:inline">{timeAgo(a.notified_at)}</span>
                    <MatchStatusPill status={a.status} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="card p-6"><Eligibility p={profile} /></div>
          <div className="card grid grid-cols-3 gap-4 p-6">
            <Stat label="Donations" value={profile.donations_count} />
            <Stat label="Lives" value={profile.lives_impacted} sub="up to 3 per unit" />
            <Stat label="Response" value={rate != null ? `${rate}%` : "—"} />
          </div>
          {donations && donations.length > 0 && (
            <div className="card p-5">
              <div className="mb-3 text-sm font-semibold">Donation record</div>
              <ul className="space-y-2 text-sm">
                {donations.map((d) => (
                  <li key={d.id} className="flex justify-between gap-3">
                    <span className="truncate">{d.hospital_name ?? "Blood bank"}</span>
                    <span className="text-xs text-muted">{fmtDate(d.donated_on)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <Preferences p={profile} refresh={() => mp()} />
        </aside>
      </div>
    </div>
  );
}