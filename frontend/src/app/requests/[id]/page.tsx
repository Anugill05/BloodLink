// "use client";

// import clsx from "clsx";
// import Link from "next/link";
// import { useParams } from "next/navigation";
// import { useState } from "react";
// import useSWR from "swr";
// import { ArrowLeft, Check, Clock, Hourglass, Link2, MapPin, Phone, ShieldCheck } from "lucide-react";
// import { Radar } from "@/components/Radar";
// import { ActionButton, MatchStatusPill, RequestStatusPill, StaffMatchActions, VerifyActions } from "@/components/RequestBits";
// import { Empty, GroupMark, PageLoader, UnitsRail } from "@/components/ui";
// import { fetcher, post } from "@/lib/api";
// import { useRequireAuth } from "@/lib/auth";
// import { URGENCY } from "@/lib/blood";
// import { fmtTime, mapsLink, timeAgo, timeLeft } from "@/lib/format";
// import type { BloodRequest } from "@/lib/types";

// const EVENT_DOT: Record<string, string> = {
//   CREATED: "bg-ink", PENDING: "bg-warn", VERIFIED: "bg-ok", WAVE: "bg-blood", ACCEPTED: "bg-warn", COVERED: "bg-ok",
//   DONATED: "bg-ok", FULFILLED: "bg-ok", ARRIVED: "bg-ink", CANCELLED: "bg-muted", REJECTED: "bg-muted", EXPIRED: "bg-muted",
//   NO_SHOW: "bg-pulse", WITHDRAWN: "bg-pulse", EXHAUSTED: "bg-pulse",
// };

// export default function RequestTracker() {
//   const { id } = useParams<{ id: string }>();
//   const { user } = useRequireAuth();
//   const { data: r, mutate, error } = useSWR<BloodRequest>(user ? `/requests/${id}/` : null, fetcher, {
//     refreshInterval: (d) => (!d || d.status === "OPEN" || d.status === "PENDING_VERIFICATION" ? 5000 : 0),
//   });
//   const [copied, setCopied] = useState(false);

//   if (error) return <div className="mx-auto max-w-3xl px-4 py-20"><Empty title="Request not found">You may not have access to this request.</Empty></div>;
//   if (!r || !user) return <PageLoader />;

//   const isStaff = user.hospital?.id === r.hospital.id;
//   const live = r.status === "OPEN";
//   const pledged = r.units_fulfilled + r.matches.filter((m) => m.status === "ACCEPTED" || m.status === "ARRIVED").length;
//   const onTheWay = r.matches.filter((m) => ["ACCEPTED", "ARRIVED", "DONATED"].includes(m.status));
//   const share = async () => {
//     const url = `${location.origin}/r/${r.code}`;
//     try {
//       if (navigator.share) await navigator.share({ title: `${r.blood_group} blood needed`, text: `${r.units_needed} unit(s) of ${r.blood_group} needed at ${r.hospital.name}`, url });
//       else { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }
//     } catch { /* dismissed */ }
//   };

//   return (
//     <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
//       <Link href={isStaff ? "/hospital" : "/requests"} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
//         <ArrowLeft className="h-4 w-4" /> Back
//       </Link>

//       {/* Header */}
//       <div className="mt-6 flex flex-wrap items-start gap-5">
//         <GroupMark group={r.blood_group} size="lg" />
//         <div className="min-w-0 flex-1">
//           <div className="flex flex-wrap items-center gap-2">
//             <span className="font-mono text-sm text-muted">{r.code}</span>
//             <RequestStatusPill status={r.status} />
//             <span className={clsx("chip", URGENCY[r.urgency].tone)}>{URGENCY[r.urgency].label}</span>
//           </div>
//           <h1 className="mt-2 font-serif text-[clamp(2rem,5vw,3.25rem)] leading-[1.05]">
//             {r.units_needed} unit{r.units_needed > 1 && "s"} of {r.component_label.toLowerCase()}
//           </h1>
//           <p className="mt-1 text-muted">
//             for {r.patient_name}{r.patient_age ? `, ${r.patient_age}` : ""} · {r.hospital.name}, {r.hospital.city}
//           </p>
//         </div>
//         <div className="flex gap-2">
//           {live && <button onClick={share} className="btn-ghost !py-2"><Link2 className="h-4 w-4" /> {copied ? "Link copied" : "Share"}</button>}
//           {(r.status === "OPEN" || r.status === "PENDING_VERIFICATION") && (
//             <ActionButton onRun={() => post(`/requests/${r.id}/cancel/`)} done={() => mutate()}>Cancel</ActionButton>
//           )}
//         </div>
//       </div>

//       {r.status === "PENDING_VERIFICATION" && (
//         <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-warn/30 bg-warn/5 p-5 sm:flex-row sm:items-center">
//           <Hourglass className="h-6 w-6 shrink-0 text-warn" />
//           <div className="flex-1">
//             <div className="font-semibold">{isStaff ? "Please confirm this patient is admitted." : `Waiting for ${r.hospital.name} to verify.`}</div>
//             <div className="text-sm text-muted">
//               {isStaff ? "Donors will be alerted the moment you verify." : "The ward has been notified. Donors are alerted only after the hospital confirms — this keeps fake requests out."}
//             </div>
//           </div>
//           {isStaff ? <VerifyActions id={r.id} refresh={() => mutate()} /> : (
//             <a href={`tel:${r.hospital.phone}`} className="btn-ghost !py-2"><Phone className="h-4 w-4" /> Call ward</a>
//           )}
//         </div>
//       )}

//       <div className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_1fr]">
//         {/* Radar + progress */}
//         <div className="card p-5 sm:p-7">
//           <div className="grid grid-cols-3 gap-4 border-b border-line pb-5">
//             <div>
//               <div className="eyebrow">Pledged</div>
//               <div className="mt-1 font-serif text-4xl">{Math.min(pledged, r.units_needed)}<span className="text-muted">/{r.units_needed}</span></div>
//             </div>
//             <div>
//               <div className="eyebrow">Alerted</div>
//               <div className="mt-1 font-serif text-4xl">{r.stats.total}</div>
//             </div>
//             <div>
//               <div className="eyebrow">Needed by</div>
//               <div className="mt-2 font-mono text-sm">{fmtTime(r.needed_by)}</div>
//               <div className="text-xs text-muted">{timeLeft(r.needed_by)}</div>
//             </div>
//           </div>
//           <div className="mt-5"><UnitsRail needed={r.units_needed} pledged={pledged} fulfilled={r.units_fulfilled} /></div>
//           <Radar
//             className="mx-auto mt-4 max-w-[460px]"
//             live={live}
//             activeKm={r.search_radius_km}
//             dots={r.matches.map((m) => ({ id: m.id, distance_km: m.distance_km, status: m.status, label: m.donor_name ?? m.blood_group }))}
//             center={live ? <span className="eyebrow">Wave {r.current_wave} · searching {r.search_radius_km} km</span> : undefined}
//           />
//           <div className="mt-2 flex flex-wrap justify-center gap-4 text-xs text-muted">
//             {[["bg-ink/55", "Alerted"], ["bg-warn", "On the way"], ["bg-ok", "Donated"], ["bg-ink/15", "Declined / stood down"]].map(([c, l]) => (
//               <span key={l} className="flex items-center gap-1.5"><span className={clsx("h-2 w-2 rounded-full", c)} />{l}</span>
//             ))}
//           </div>
//         </div>

//         <div className="space-y-6">
//           {/* Donors on the way */}
//           <div className="card">
//             <div className="flex items-center justify-between border-b border-line px-5 py-4">
//               <span className="eyebrow">Donors responding</span>
//               <span className="font-mono text-xs text-muted">{onTheWay.length}</span>
//             </div>
//             {onTheWay.length === 0 ? (
//               <p className="px-5 py-8 text-center text-sm text-muted">
//                 {live ? "Alerts are out. Donors usually respond within minutes." : "No donors yet."}
//               </p>
//             ) : (
//               <ul className="divide-y divide-line">
//                 {onTheWay.map((m) => (
//                   <li key={m.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
//                     <span className="grid h-10 w-10 place-items-center rounded-full bg-blood/10 font-serif text-lg text-blood">{m.blood_group.replace("-", "−")}</span>
//                     <div className="min-w-0 flex-1">
//                       <div className="font-medium">{m.donor_name ?? "Donor"}</div>
//                       <div className="flex items-center gap-3 text-xs text-muted">
//                         <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{m.distance_km.toFixed(1)} km</span>
//                         {m.eta_minutes && m.status === "ACCEPTED" && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />ETA {m.eta_minutes} min</span>}
//                         {m.donor_phone && <a href={`tel:${m.donor_phone}`} className="flex items-center gap-1 text-blood"><Phone className="h-3 w-3" />{m.donor_phone}</a>}
//                       </div>
//                     </div>
//                     <MatchStatusPill status={m.status} />
//                     {isStaff && <div className="w-full"><StaffMatchActions m={m} refresh={() => mutate()} /></div>}
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>

//           {/* Timeline */}
//           <div className="card px-5 py-4">
//             <div className="eyebrow mb-4">Timeline</div>
//             <ol className="relative space-y-4 border-l border-line pl-5">
//               {[...r.events].reverse().map((e, i) => (
//                 <li key={i} className={clsx("relative", i === 0 && "animate-rise")}>
//                   <span className={clsx("absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-card", EVENT_DOT[e.kind] ?? "bg-ink")} />
//                   <div className="text-sm">{e.message}</div>
//                   <div className="font-mono text-[11px] text-muted">{fmtTime(e.created_at)} · {timeAgo(e.created_at)}</div>
//                 </li>
//               ))}
//             </ol>
//           </div>

//           <div className="card flex items-center gap-3 p-5">
//             <ShieldCheck className="h-5 w-5 shrink-0 text-ok" />
//             <div className="min-w-0 flex-1 text-sm">
//               <div className="font-medium">{r.hospital.name}</div>
//               <div className="truncate text-muted">{r.hospital.address}</div>
//             </div>
//             <a className="btn-ghost !px-3 !py-1.5 !text-[13px]" target="_blank" rel="noreferrer" href={mapsLink(r.hospital.coordinates?.lat, r.hospital.coordinates?.lng)}>
//               Directions
//             </a>
//           </div>
//           {r.status === "FULFILLED" && (
//             <div className="flex items-center gap-3 rounded-2xl bg-ok/10 p-5 text-ok"><Check className="h-5 w-5" /> All units collected. Wishing {r.patient_name.split(" ")[0]} a quick recovery.</div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";

import clsx from "clsx";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";
import { ArrowLeft, Check, Clock, Hourglass, Link2, MapPin, Phone, ShieldCheck } from "lucide-react";
import { ActionButton, MatchStatusPill, RequestStatusPill, StaffMatchActions, VerifyActions } from "@/components/RequestBits";
import { Empty, GroupMark, PageLoader, UnitsRail } from "@/components/ui";
import { fetcher, post } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";
import { URGENCY } from "@/lib/blood";
import { fmtTime, mapsLink, timeAgo, timeLeft } from "@/lib/format";
import type { BloodRequest } from "@/lib/types";

const EVENT_DOT: Record<string, string> = {
  CREATED: "bg-ink", PENDING: "bg-warn", VERIFIED: "bg-ok", WAVE: "bg-blood", ACCEPTED: "bg-warn", COVERED: "bg-ok",
  DONATED: "bg-ok", FULFILLED: "bg-ok", ARRIVED: "bg-ink", CANCELLED: "bg-muted", REJECTED: "bg-muted", EXPIRED: "bg-muted",
  NO_SHOW: "bg-blood", WITHDRAWN: "bg-blood", EXHAUSTED: "bg-blood",
};

export default function RequestTracker() {
  const { id } = useParams<{ id: string }>();
  const { user } = useRequireAuth();
  const { data: r, mutate, error } = useSWR<BloodRequest>(user ? `/requests/${id}/` : null, fetcher, {
    refreshInterval: (d) => (!d || d.status === "OPEN" || d.status === "PENDING_VERIFICATION" ? 5000 : 0),
  });
  const [copied, setCopied] = useState(false);

  if (error) return <div className="mx-auto max-w-3xl px-4 py-20"><Empty title="Request not found">You may not have access to this request.</Empty></div>;
  if (!r || !user) return <PageLoader />;

  const isStaff = user.hospital?.id === r.hospital.id;
  const live = r.status === "OPEN";
  const pledged = r.units_fulfilled + r.matches.filter((m) => m.status === "ACCEPTED" || m.status === "ARRIVED").length;
  const onTheWay = r.matches.filter((m) => ["ACCEPTED", "ARRIVED", "DONATED"].includes(m.status));

  // Simple counts instead of the old radar
  const total = r.matches.length;
  const waiting = r.matches.filter((m) => m.status === "NOTIFIED").length;
  const coming = r.matches.filter((m) => m.status === "ACCEPTED" || m.status === "ARRIVED").length;
  const donated = r.matches.filter((m) => m.status === "DONATED").length;
  const other = Math.max(0, total - waiting - coming - donated);

  const share = async () => {
    const url = `${location.origin}/r/${r.code}`;
    try {
      if (navigator.share) await navigator.share({ title: `${r.blood_group} blood needed`, text: `${r.units_needed} unit(s) of ${r.blood_group} needed at ${r.hospital.name}`, url });
      else { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    } catch { /* dismissed */ }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <Link href={isStaff ? "/hospital" : "/requests"} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      {/* Header */}
      <div className="mt-6 flex flex-wrap items-start gap-4">
        <GroupMark group={r.blood_group} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted">{r.code}</span>
            <RequestStatusPill status={r.status} />
            <span className={clsx("chip", URGENCY[r.urgency].tone)}>{URGENCY[r.urgency].label}</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            {r.units_needed} unit{r.units_needed > 1 && "s"} of {r.component_label.toLowerCase()}
          </h1>
          <p className="mt-1 text-muted">
            for {r.patient_name}{r.patient_age ? `, ${r.patient_age}` : ""} · {r.hospital.name}, {r.hospital.city}
          </p>
        </div>
        <div className="flex gap-2">
          {live && (
            <button onClick={share} className="btn-ghost">
              <Link2 className="h-4 w-4" /> {copied ? "Link copied" : "Share"}
            </button>
          )}
          {(r.status === "OPEN" || r.status === "PENDING_VERIFICATION") && (
            <ActionButton onRun={() => post(`/requests/${r.id}/cancel/`)} done={() => mutate()}>Cancel</ActionButton>
          )}
        </div>
      </div>

      {r.status === "PENDING_VERIFICATION" && (
        <div className="mt-6 flex flex-col gap-4 rounded-lg border border-warn/30 bg-warn/5 p-5 sm:flex-row sm:items-center">
          <Hourglass className="h-6 w-6 shrink-0 text-warn" />
          <div className="flex-1">
            <div className="font-semibold">{isStaff ? "Please confirm this patient is admitted." : `Waiting for ${r.hospital.name} to verify.`}</div>
            <div className="text-sm text-muted">
              {isStaff ? "Donors will be alerted the moment you verify." : "The ward has been notified. Donors are alerted only after the hospital confirms, which keeps fake requests out."}
            </div>
          </div>
          {isStaff ? <VerifyActions id={r.id} refresh={() => mutate()} /> : (
            <a href={`tel:${r.hospital.phone}`} className="btn-ghost"><Phone className="h-4 w-4" /> Call ward</a>
          )}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.25fr_1fr]">
        {/* Progress */}
        <div className="card p-5 sm:p-6">
          <h2 className="font-semibold">Progress</h2>
          <div className="mt-4 grid grid-cols-3 gap-4 border-b border-line pb-5">
            <div>
              <div className="text-sm text-muted">Pledged</div>
              <div className="mt-1 text-3xl font-bold">{Math.min(pledged, r.units_needed)}<span className="text-muted">/{r.units_needed}</span></div>
            </div>
            <div>
              <div className="text-sm text-muted">Donors alerted</div>
              <div className="mt-1 text-3xl font-bold">{r.stats.total}</div>
            </div>
            <div>
              <div className="text-sm text-muted">Needed by</div>
              <div className="mt-1 text-sm font-semibold">{fmtTime(r.needed_by)}</div>
              <div className="text-xs text-muted">{timeLeft(r.needed_by)}</div>
            </div>
          </div>

          <div className="mt-5"><UnitsRail needed={r.units_needed} pledged={pledged} fulfilled={r.units_fulfilled} /></div>

          {live && (
            <p className="mt-4 text-sm text-muted">
              Searching within <span className="font-semibold text-ink">{r.search_radius_km} km</span> · wave {r.current_wave}
            </p>
          )}

          <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Waiting to reply", waiting],
              ["On the way", coming],
              ["Donated", donated],
              ["Declined or stood down", other],
            ].map(([label, n]) => (
              <div key={label} className="rounded-md border border-line bg-paper p-3">
                <dd className="text-xl font-bold">{n}</dd>
                <dt className="mt-0.5 text-xs text-muted">{label}</dt>
              </div>
            ))}
          </dl>
        </div>

        <div className="space-y-6">
          {/* Donors on the way */}
          <div className="card">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <span className="font-semibold">Donors responding</span>
              <span className="text-sm text-muted">{onTheWay.length}</span>
            </div>
            {onTheWay.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted">
                {live ? "Alerts are out. Donors usually respond within minutes." : "No donors yet."}
              </p>
            ) : (
              <ul className="divide-y divide-line">
                {onTheWay.map((m) => (
                  <li key={m.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                    <span className="grid h-10 w-10 place-items-center rounded-md bg-blood/10 text-sm font-bold text-blood">{m.blood_group.replace("-", "−")}</span>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">{m.donor_name ?? "Donor"}</div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{m.distance_km.toFixed(1)} km</span>
                        {m.eta_minutes && m.status === "ACCEPTED" && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />ETA {m.eta_minutes} min</span>}
                        {m.donor_phone && <a href={`tel:${m.donor_phone}`} className="flex items-center gap-1 font-medium text-blood"><Phone className="h-3 w-3" />{m.donor_phone}</a>}
                      </div>
                    </div>
                    <MatchStatusPill status={m.status} />
                    {isStaff && <div className="w-full"><StaffMatchActions m={m} refresh={() => mutate()} /></div>}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Timeline */}
          <div className="card px-5 py-4">
            <div className="mb-4 font-semibold">Timeline</div>
            <ol className="relative space-y-4 border-l border-line pl-5">
              {[...r.events].reverse().map((e, i) => (
                <li key={i} className="relative">
                  <span className={clsx("absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-card", EVENT_DOT[e.kind] ?? "bg-ink")} />
                  <div className="text-sm">{e.message}</div>
                  <div className="text-xs text-muted">{fmtTime(e.created_at)} · {timeAgo(e.created_at)}</div>
                </li>
              ))}
            </ol>
          </div>

          {/* Hospital */}
          <div className="card flex items-center gap-3 p-5">
            <ShieldCheck className="h-5 w-5 shrink-0 text-ok" />
            <div className="min-w-0 flex-1 text-sm">
              <div className="font-medium">{r.hospital.name}</div>
              <div className="truncate text-muted">{r.hospital.address}</div>
            </div>
            <a className="btn-ghost !px-3 !py-1.5" target="_blank" rel="noreferrer" href={mapsLink(r.hospital.coordinates?.lat, r.hospital.coordinates?.lng)}>
              Directions
            </a>
          </div>

          {r.status === "FULFILLED" && (
            <div className="flex items-center gap-3 rounded-lg border border-ok/30 bg-ok/10 p-5 text-ok">
              <Check className="h-5 w-5" /> All units collected. Wishing {r.patient_name.split(" ")[0]} a quick recovery.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}