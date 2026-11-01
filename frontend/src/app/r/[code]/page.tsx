// "use client";

// import Link from "next/link";
// import { useParams } from "next/navigation";
// import useSWR from "swr";
// import { ArrowRight, ShieldCheck } from "lucide-react";
// import { RequestStatusPill } from "@/components/RequestBits";
// import { Empty, GroupMark, PageLoader, UnitsRail } from "@/components/ui";
// import { fetcher } from "@/lib/api";
// import { URGENCY, receiveFrom } from "@/lib/blood";
// import { timeLeft } from "@/lib/format";
// import type { PublicRequest } from "@/lib/types";

// /** The page a family shares on WhatsApp. No phone numbers, no patient name — just a way in. */
// export default function PublicRequestPage() {
//   const { code } = useParams<{ code: string }>();
//   const { data: r, error } = useSWR<PublicRequest>(`/public/requests/${code}/`, fetcher, { refreshInterval: 15000 });
//   if (error) return <div className="mx-auto max-w-xl px-4 py-20"><Empty title="This request isn't available">It may have been closed or is still awaiting hospital verification.</Empty></div>;
//   if (!r) return <PageLoader />;
//   const open = r.status === "OPEN";
//   return (
//     <div className="relative overflow-hidden">
//       <div className="grid-paper pointer-events-none absolute inset-0" />
//       <div className="relative mx-auto max-w-xl px-4 py-14 text-center sm:py-20">
//         <GroupMark group={r.blood_group} size="xl" className="mx-auto shadow-2xl shadow-blood/40" />
//         <div className="mt-6 flex items-center justify-center gap-2">
//           <RequestStatusPill status={r.status} />
//           <span className={`chip ${URGENCY[r.urgency].tone}`}>{URGENCY[r.urgency].label}</span>
//         </div>
//         <h1 className="mt-5 font-serif text-[clamp(2.25rem,7vw,3.75rem)] leading-[1.02]">
//           {r.units_needed} unit{r.units_needed > 1 && "s"} of {r.blood_group.replace("-", "−")} {r.component_label.toLowerCase()} needed
//         </h1>
//         <p className="mt-3 text-lg text-muted">at {r.hospital_name}, {r.city}</p>
//         <div className="mx-auto mt-8 max-w-xs">
//           <UnitsRail needed={r.units_needed} pledged={r.units_fulfilled + r.units_pledged} fulfilled={r.units_fulfilled} />
//           <div className="mt-2 font-mono text-xs text-muted">{r.units_fulfilled + r.units_pledged}/{r.units_needed} covered · {timeLeft(r.needed_by)}</div>
//         </div>

//         <div className="card mt-10 p-6 text-left">
//           <div className="flex items-center gap-2 text-sm font-medium text-ok"><ShieldCheck className="h-4 w-4" /> Verified by the hospital</div>
//           <p className="mt-2 text-sm text-muted">
//             Compatible donors: <span className="font-mono text-ink">{receiveFrom(r.blood_group, r.component).map((g) => g.replace("-", "−")).join(" · ")}</span>.
//             {open ? " Register on BloodLink and, if you're eligible and nearby, you'll get the alert straight away. Contact details are shared once you accept." : " Thank you — this request is no longer open."}
//           </p>
//           {open && (
//             <Link href="/register" className="btn-blood mt-5 w-full">I can donate <ArrowRight className="h-4 w-4" /></Link>
//           )}
//         </div>
//         <p className="mt-6 font-mono text-xs text-muted">{r.code}</p>
//       </div>
//     </div>
//   );
// }
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { ShieldCheck } from "lucide-react";
import { RequestStatusPill } from "@/components/RequestBits";
import { Empty, GroupMark, PageLoader, UnitsRail } from "@/components/ui";
import { fetcher } from "@/lib/api";
import { URGENCY, receiveFrom } from "@/lib/blood";
import { timeLeft } from "@/lib/format";
import type { PublicRequest } from "@/lib/types";

/** The page a family shares on WhatsApp. No phone numbers, no patient name, just a way in. */
export default function PublicRequestPage() {
  const { code } = useParams<{ code: string }>();
  const { data: r, error } = useSWR<PublicRequest>(`/public/requests/${code}/`, fetcher, { refreshInterval: 15000 });
  if (error) return <div className="mx-auto max-w-xl px-4 py-20"><Empty title="This request isn't available">It may have been closed or is still awaiting hospital verification.</Empty></div>;
  if (!r) return <PageLoader />;
  const open = r.status === "OPEN";
  return (
    <div className="mx-auto max-w-xl px-4 py-12 text-center sm:py-16">
      <GroupMark group={r.blood_group} size="xl" className="mx-auto" />
      <div className="mt-6 flex items-center justify-center gap-2">
        <RequestStatusPill status={r.status} />
        <span className={`chip ${URGENCY[r.urgency].tone}`}>{URGENCY[r.urgency].label}</span>
      </div>
      <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
        {r.units_needed} unit{r.units_needed > 1 && "s"} of {r.blood_group.replace("-", "−")} {r.component_label.toLowerCase()} needed
      </h1>
      <p className="mt-3 text-lg text-muted">at {r.hospital_name}, {r.city}</p>
      <div className="mx-auto mt-8 max-w-xs">
        <UnitsRail needed={r.units_needed} pledged={r.units_fulfilled + r.units_pledged} fulfilled={r.units_fulfilled} />
        <div className="mt-2 text-sm text-muted">{r.units_fulfilled + r.units_pledged} of {r.units_needed} covered · {timeLeft(r.needed_by)}</div>
      </div>

      <div className="card mt-10 p-6 text-left">
        <div className="flex items-center gap-2 text-sm font-semibold text-ok"><ShieldCheck className="h-4 w-4" /> Verified by the hospital</div>
        <p className="mt-2 text-sm text-muted">
          Compatible donors: <span className="font-semibold text-ink">{receiveFrom(r.blood_group, r.component).map((g) => g.replace("-", "−")).join(", ")}</span>.
          {open ? " Register on BloodLink and, if you're eligible and nearby, you'll get the alert straight away. Contact details are shared once you accept." : " Thank you, this request is no longer open."}
        </p>
        {open && (
          <Link href="/register" className="btn-blood mt-5 w-full">I can donate</Link>
        )}
      </div>
      <p className="mt-6 text-xs text-muted">Request {r.code}</p>
    </div>
  );
}