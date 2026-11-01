// import clsx from "clsx";
// import Link from "next/link";
// import { ChevronRight } from "lucide-react";
// import { URGENCY } from "@/lib/blood";
// import { timeAgo, timeLeft } from "@/lib/format";
// import type { RequestListItem } from "@/lib/types";
// import { RequestStatusPill } from "./RequestBits";
// import { GroupMark, UnitsRail } from "./ui";

// export function RequestRow({ r, staff, actions }: { r: RequestListItem; staff?: boolean; actions?: React.ReactNode }) {
//   return (
//     <div className="card group flex flex-col gap-4 p-4 transition hover:border-ink/25 sm:flex-row sm:items-center sm:p-5">
//       <Link href={`/requests/${r.id}`} className="flex min-w-0 flex-1 items-center gap-4">
//         <GroupMark group={r.blood_group} size="sm" />
//         <div className="min-w-0 flex-1">
//           <div className="flex flex-wrap items-center gap-2">
//             <span className="font-mono text-xs text-muted">{r.code}</span>
//             <RequestStatusPill status={r.status} />
//             <span className={clsx("font-mono text-[11px] uppercase tracking-wider", URGENCY[r.urgency].tone)}>{URGENCY[r.urgency].label}</span>
//           </div>
//           <div className="mt-1 truncate font-medium">
//             {r.units_needed}u {r.component.replace("_", " ").toLowerCase()} · {staff ? r.patient_name : r.hospital_name}
//           </div>
//           <div className="truncate text-xs text-muted">
//             {staff ? `Contact ${r.contact_name} · ${r.contact_phone}` : r.patient_name} · raised {timeAgo(r.created_at)}
//             {r.status === "OPEN" && ` · ${timeLeft(r.needed_by)}`}
//           </div>
//         </div>
//       </Link>
//       <div className="flex items-center gap-4 sm:w-64">
//         <div className="flex-1">
//           <UnitsRail needed={r.units_needed} pledged={r.units_fulfilled + r.units_pledged} fulfilled={r.units_fulfilled} />
//           <div className="mt-1.5 font-mono text-[11px] text-muted">
//             {r.units_fulfilled} donated · {r.units_pledged} pledged{r.status === "OPEN" && ` · ${r.search_radius_km} km`}
//           </div>
//         </div>
//         {!actions && <ChevronRight className="h-4 w-4 text-muted transition group-hover:translate-x-0.5" />}
//       </div>
//       {actions}
//     </div>
//   );
// }
import clsx from "clsx";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { URGENCY } from "@/lib/blood";
import { timeAgo, timeLeft } from "@/lib/format";
import type { RequestListItem } from "@/lib/types";
import { RequestStatusPill } from "./RequestBits";
import { GroupMark, UnitsRail } from "./ui";

export function RequestRow({ r, staff, actions }: { r: RequestListItem; staff?: boolean; actions?: React.ReactNode }) {
  return (
    <div className="card flex flex-col gap-4 p-4 transition hover:bg-ink/[.02] sm:flex-row sm:items-center sm:p-5">
      <Link href={`/requests/${r.id}`} className="flex min-w-0 flex-1 items-center gap-4">
        <GroupMark group={r.blood_group} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted">{r.code}</span>
            <RequestStatusPill status={r.status} />
            <span className={clsx("text-xs font-semibold", URGENCY[r.urgency].tone)}>{URGENCY[r.urgency].label}</span>
          </div>
          <div className="mt-1 truncate font-medium">
            {r.units_needed} units {r.component.replace("_", " ").toLowerCase()} · {staff ? r.patient_name : r.hospital_name}
          </div>
          <div className="truncate text-xs text-muted">
            {staff ? `Contact ${r.contact_name} · ${r.contact_phone}` : r.patient_name} · raised {timeAgo(r.created_at)}
            {r.status === "OPEN" && ` · ${timeLeft(r.needed_by)}`}
          </div>
        </div>
      </Link>
      <div className="flex items-center gap-4 sm:w-64">
        <div className="flex-1">
          <UnitsRail needed={r.units_needed} pledged={r.units_fulfilled + r.units_pledged} fulfilled={r.units_fulfilled} />
          <div className="mt-1.5 text-xs text-muted">
            {r.units_fulfilled} donated · {r.units_pledged} pledged{r.status === "OPEN" && ` · ${r.search_radius_km} km`}
          </div>
        </div>
        {!actions && <ChevronRight className="h-4 w-4 text-muted" />}
      </div>
      {actions}
    </div>
  );
}