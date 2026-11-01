// "use client";

// import { useState } from "react";
// import { Check, CheckCheck, UserX, X } from "lucide-react";
// import { ApiError, post } from "@/lib/api";
// import { MATCH_STATUS, REQUEST_STATUS } from "@/lib/blood";
// import type { MatchStatus, RequestMatch, RequestStatus } from "@/lib/types";
// import { Pill, Spinner } from "./ui";

// export function RequestStatusPill({ status }: { status: RequestStatus }) {
//   const s = REQUEST_STATUS[status];
//   return <Pill tone={s.tone} live={status === "OPEN"}>{s.label}</Pill>;
// }

// export function MatchStatusPill({ status }: { status: MatchStatus }) {
//   const s = MATCH_STATUS[status];
//   return <Pill tone={s.tone} live={status === "ACCEPTED"}>{s.label}</Pill>;
// }

// /** Small async button that surfaces API errors inline. */
// export function ActionButton({
//   onRun, children, variant = "ghost", title, done,
// }: { onRun: () => Promise<unknown>; children: React.ReactNode; variant?: "ghost" | "ink" | "blood"; title?: string; done?: () => void }) {
//   const [busy, setBusy] = useState(false);
//   const [err, setErr] = useState("");
//   const cls = { ghost: "btn-ghost", ink: "btn-ink", blood: "btn-blood" }[variant];
//   return (
//     <span className="inline-flex flex-col">
//       <button
//         title={title}
//         className={`${cls} !px-3 !py-1.5 !text-[13px]`}
//         disabled={busy}
//         onClick={async () => {
//           setBusy(true); setErr("");
//           try { await onRun(); done?.(); } catch (e) { setErr(e instanceof ApiError ? e.message : "Failed"); }
//           setBusy(false);
//         }}
//       >
//         {busy ? <Spinner className="h-3.5 w-3.5" /> : children}
//       </button>
//       {err && <span className="mt-1 max-w-48 text-[11px] text-pulse">{err}</span>}
//     </span>
//   );
// }

// /** Hospital-side controls for a single donor match. */
// export function StaffMatchActions({ m, refresh }: { m: RequestMatch; refresh: () => void }) {
//   if (m.status === "ACCEPTED")
//     return (
//       <div className="flex flex-wrap gap-1.5">
//         <ActionButton onRun={() => post(`/matches/${m.id}/arrived/`)} done={refresh}><Check className="h-3.5 w-3.5" /> Arrived</ActionButton>
//         <ActionButton variant="ink" onRun={() => post(`/matches/${m.id}/confirm/`)} done={refresh}><CheckCheck className="h-3.5 w-3.5" /> Donated</ActionButton>
//         <ActionButton title="Mark no-show" onRun={() => post(`/matches/${m.id}/no-show/`)} done={refresh}><UserX className="h-3.5 w-3.5" /></ActionButton>
//       </div>
//     );
//   if (m.status === "ARRIVED")
//     return <ActionButton variant="ink" onRun={() => post(`/matches/${m.id}/confirm/`)} done={refresh}><CheckCheck className="h-3.5 w-3.5" /> Confirm donation</ActionButton>;
//   return null;
// }

// export function VerifyActions({ id, refresh }: { id: string; refresh: () => void }) {
//   return (
//     <div className="flex flex-wrap gap-2">
//       <ActionButton variant="blood" onRun={() => post(`/requests/${id}/verify/`)} done={refresh}><Check className="h-3.5 w-3.5" /> Patient is admitted — verify</ActionButton>
//       <ActionButton onRun={() => post(`/requests/${id}/reject/`, { reason: "Patient not found at this hospital" })} done={refresh}><X className="h-3.5 w-3.5" /> Reject</ActionButton>
//     </div>
//   );
// }
"use client";

import { useState } from "react";
import { Check, CheckCheck, UserX, X } from "lucide-react";
import { ApiError, post } from "@/lib/api";
import { MATCH_STATUS, REQUEST_STATUS } from "@/lib/blood";
import type { MatchStatus, RequestMatch, RequestStatus } from "@/lib/types";
import { Pill, Spinner } from "./ui";

export function RequestStatusPill({ status }: { status: RequestStatus }) {
  const s = REQUEST_STATUS[status];
  return <Pill tone={s.tone}>{s.label}</Pill>;
}

export function MatchStatusPill({ status }: { status: MatchStatus }) {
  const s = MATCH_STATUS[status];
  return <Pill tone={s.tone}>{s.label}</Pill>;
}

/** Small async button that surfaces API errors inline. */
export function ActionButton({
  onRun, children, variant = "ghost", title, done,
}: { onRun: () => Promise<unknown>; children: React.ReactNode; variant?: "ghost" | "ink" | "blood"; title?: string; done?: () => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const cls = { ghost: "btn-ghost", ink: "btn-ink", blood: "btn-blood" }[variant];
  return (
    <span className="inline-flex flex-col">
      <button
        title={title}
        className={`${cls} !px-3 !py-1.5`}
        disabled={busy}
        onClick={async () => {
          setBusy(true); setErr("");
          try { await onRun(); done?.(); } catch (e) { setErr(e instanceof ApiError ? e.message : "Failed"); }
          setBusy(false);
        }}
      >
        {busy ? <Spinner className="h-3.5 w-3.5" /> : children}
      </button>
      {err && <span className="mt-1 max-w-48 text-xs text-blood">{err}</span>}
    </span>
  );
}

/** Hospital-side controls for a single donor match. */
export function StaffMatchActions({ m, refresh }: { m: RequestMatch; refresh: () => void }) {
  if (m.status === "ACCEPTED")
    return (
      <div className="flex flex-wrap gap-1.5">
        <ActionButton onRun={() => post(`/matches/${m.id}/arrived/`)} done={refresh}><Check className="h-3.5 w-3.5" /> Arrived</ActionButton>
        <ActionButton variant="ink" onRun={() => post(`/matches/${m.id}/confirm/`)} done={refresh}><CheckCheck className="h-3.5 w-3.5" /> Donated</ActionButton>
        <ActionButton title="Mark no-show" onRun={() => post(`/matches/${m.id}/no-show/`)} done={refresh}><UserX className="h-3.5 w-3.5" /></ActionButton>
      </div>
    );
  if (m.status === "ARRIVED")
    return <ActionButton variant="ink" onRun={() => post(`/matches/${m.id}/confirm/`)} done={refresh}><CheckCheck className="h-3.5 w-3.5" /> Confirm donation</ActionButton>;
  return null;
}

export function VerifyActions({ id, refresh }: { id: string; refresh: () => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      <ActionButton variant="blood" onRun={() => post(`/requests/${id}/verify/`)} done={refresh}><Check className="h-3.5 w-3.5" /> Patient is admitted, verify</ActionButton>
      <ActionButton onRun={() => post(`/requests/${id}/reject/`, { reason: "Patient not found at this hospital" })} done={refresh}><X className="h-3.5 w-3.5" /> Reject</ActionButton>
    </div>
  );
}