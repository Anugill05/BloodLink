// "use client";

// import clsx from "clsx";
// import Link from "next/link";
// import { useState } from "react";
// import useSWR from "swr";
// import { Clock4, Plus, ShieldAlert } from "lucide-react";
// import { VerifyActions } from "@/components/RequestBits";
// import { RequestRow } from "@/components/RequestRow";
// import { Empty, PageLoader, Stat } from "@/components/ui";
// import { fetcher } from "@/lib/api";
// import { useRequireAuth } from "@/lib/auth";
// import type { Paginated, RequestListItem, User } from "@/lib/types";

// const isStaff = (u: User) => !!u.hospital;
// type Tab = "verify" | "active" | "closed";

// export default function HospitalConsole() {
//   const { user } = useRequireAuth(isStaff, "/");
//   const [tab, setTab] = useState<Tab>("verify");
//   const { data, mutate } = useSWR<Paginated<RequestListItem>>(user ? "/requests/?limit=100" : null, fetcher, { refreshInterval: 8000 });
//   if (!user || !data) return <PageLoader />;
//   const h = user.hospital!;

//   const all = data.results;
//   const pending = all.filter((r) => r.status === "PENDING_VERIFICATION");
//   const active = all.filter((r) => r.status === "OPEN");
//   const closed = all.filter((r) => !["PENDING_VERIFICATION", "OPEN"].includes(r.status));
//   const enRoute = active.reduce((s, r) => s + r.units_pledged - r.units_fulfilled, 0);
//   const lists: Record<Tab, RequestListItem[]> = { verify: pending, active, closed };
//   // Show the queue that needs attention first
//   const current = tab === "verify" && pending.length === 0 && active.length > 0 ? "active" : tab;

//   return (
//     <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
//       <div className="flex flex-wrap items-end justify-between gap-4">
//         <div>
//           <div className="eyebrow">Blood bank console</div>
//           <h1 className="mt-2 font-serif text-[clamp(2.25rem,5vw,3.5rem)] leading-none">{h.name}</h1>
//         </div>
//         {h.is_verified && <Link href="/request/new" className="btn-blood"><Plus className="h-4 w-4" /> Raise request</Link>}
//       </div>

//       {!h.is_verified && (
//         <div className="mt-8 flex gap-4 rounded-2xl border border-warn/30 bg-warn/5 p-5">
//           <ShieldAlert className="h-6 w-6 shrink-0 text-warn" />
//           <div>
//             <div className="font-semibold">Verification in progress</div>
//             <p className="text-sm text-muted">A BloodLink admin is checking your registration. You&rsquo;ll be able to verify requests and raise your own once approved.</p>
//           </div>
//         </div>
//       )}

//       <div className="card mt-8 grid grid-cols-2 gap-6 p-6 sm:grid-cols-4">
//         <Stat label="To verify" value={<span className={pending.length ? "text-pulse" : ""}>{pending.length}</span>} sub="families waiting on you" />
//         <Stat label="Active searches" value={active.length} />
//         <Stat label="Donors en route" value={enRoute} />
//         <Stat label="Fulfilled" value={closed.filter((r) => r.status === "FULFILLED").length} sub="all time" />
//       </div>

//       <div className="mt-10 flex gap-1 border-b border-line">
//         {([["verify", "Verify", pending.length], ["active", "Active", active.length], ["closed", "Closed", closed.length]] as const).map(([k, l, n]) => (
//           <button key={k} onClick={() => setTab(k)}
//             className={clsx("-mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-sm transition", current === k ? "border-blood text-ink" : "border-transparent text-muted hover:text-ink")}>
//             {l} <span className={clsx("rounded-full px-1.5 font-mono text-[11px]", k === "verify" && n ? "bg-pulse text-white" : "bg-ink/5")}>{n}</span>
//           </button>
//         ))}
//       </div>

//       <div className="mt-6 space-y-3">
//         {lists[current].length === 0 && (
//           <Empty icon={<Clock4 className="h-8 w-8" />} title={current === "verify" ? "Nothing to verify" : current === "active" ? "No active searches" : "No closed requests yet"}>
//             {current === "verify" ? "When a family raises a request for a patient here, it lands in this queue." : undefined}
//           </Empty>
//         )}
//         {lists[current].map((r) => (
//           <RequestRow key={r.id} r={r} staff actions={current === "verify" ? <VerifyActions id={r.id} refresh={() => mutate()} /> : undefined} />
//         ))}
//       </div>
//     </div>
//   );
// }
"use client";

import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import { Clock4, Plus, ShieldAlert } from "lucide-react";
import { VerifyActions } from "@/components/RequestBits";
import { RequestRow } from "@/components/RequestRow";
import { Empty, PageLoader, Stat } from "@/components/ui";
import { fetcher } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";
import type { Paginated, RequestListItem, User } from "@/lib/types";

const isStaff = (u: User) => !!u.hospital;
type Tab = "verify" | "active" | "closed";

export default function HospitalConsole() {
  const { user } = useRequireAuth(isStaff, "/");
  const [tab, setTab] = useState<Tab>("verify");
  const { data, mutate } = useSWR<Paginated<RequestListItem>>(user ? "/requests/?limit=100" : null, fetcher, { refreshInterval: 8000 });
  if (!user || !data) return <PageLoader />;
  const h = user.hospital!;

  const all = data.results;
  const pending = all.filter((r) => r.status === "PENDING_VERIFICATION");
  const active = all.filter((r) => r.status === "OPEN");
  const closed = all.filter((r) => !["PENDING_VERIFICATION", "OPEN"].includes(r.status));
  const enRoute = active.reduce((s, r) => s + r.units_pledged - r.units_fulfilled, 0);
  const lists: Record<Tab, RequestListItem[]> = { verify: pending, active, closed };
  // Show the queue that needs attention first
  const current = tab === "verify" && pending.length === 0 && active.length > 0 ? "active" : tab;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Blood bank console</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">{h.name}</h1>
        </div>
        {h.is_verified && (
          <Link href="/request/new" className="btn-blood">
            <Plus className="h-4 w-4" /> Raise request
          </Link>
        )}
      </div>

      {!h.is_verified && (
        <div className="mt-6 flex gap-4 rounded-lg border border-warn/30 bg-warn/5 p-5">
          <ShieldAlert className="h-6 w-6 shrink-0 text-warn" />
          <div>
            <div className="font-semibold">Verification in progress</div>
            <p className="text-sm text-muted">A BloodLink admin is checking your registration. You&rsquo;ll be able to verify requests and raise your own once approved.</p>
          </div>
        </div>
      )}

      <div className="card mt-6 grid grid-cols-2 gap-6 p-6 sm:grid-cols-4">
        <Stat label="To verify" value={<span className={pending.length ? "text-blood" : ""}>{pending.length}</span>} sub="families waiting on you" />
        <Stat label="Active searches" value={active.length} />
        <Stat label="Donors en route" value={enRoute} />
        <Stat label="Fulfilled" value={closed.filter((r) => r.status === "FULFILLED").length} sub="all time" />
      </div>

      <div className="mt-8 flex gap-1 overflow-x-auto border-b border-line">
        {([["verify", "Verify", pending.length], ["active", "Active", active.length], ["closed", "Closed", closed.length]] as const).map(([k, l, n]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={clsx(
              "-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition",
              current === k ? "border-blood text-ink" : "border-transparent text-muted hover:text-ink",
            )}
          >
            {l}
            <span className={clsx("rounded-full px-1.5 text-xs", k === "verify" && n ? "bg-blood font-semibold text-white" : "bg-ink/5")}>{n}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {lists[current].length === 0 && (
          <Empty icon={<Clock4 className="h-8 w-8" />} title={current === "verify" ? "Nothing to verify" : current === "active" ? "No active searches" : "No closed requests yet"}>
            {current === "verify" ? "When a family raises a request for a patient here, it lands in this queue." : undefined}
          </Empty>
        )}
        {lists[current].map((r) => (
          <RequestRow key={r.id} r={r} staff actions={current === "verify" ? <VerifyActions id={r.id} refresh={() => mutate()} /> : undefined} />
        ))}
      </div>
    </div>
  );
}