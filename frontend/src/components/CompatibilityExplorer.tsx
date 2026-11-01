// "use client";

// import clsx from "clsx";
// import { useState } from "react";
// import { COMPONENTS, GROUPS, giveTo, receiveFrom } from "@/lib/blood";
// import type { BloodGroup, Component } from "@/lib/types";

// export function CompatibilityExplorer() {
//   const [group, setGroup] = useState<BloodGroup>("B+");
//   const [component, setComponent] = useState<Component>("WHOLE_BLOOD");
//   const from = receiveFrom(group, component);
//   const to = giveTo(group, component);

//   return (
//     <div className="card overflow-hidden">
//       <div className="flex flex-wrap items-center gap-2 border-b border-line p-4 sm:p-5">
//         <span className="eyebrow mr-2">Component</span>
//         {COMPONENTS.map((c) => (
//           <button
//             key={c.value}
//             onClick={() => setComponent(c.value)}
//             className={clsx("rounded-full border px-3 py-1.5 text-[13px] transition",
//               component === c.value ? "border-ink bg-ink text-paper" : "border-line text-muted hover:text-ink")}
//           >
//             {c.label}
//           </button>
//         ))}
//       </div>

//       <div className="grid gap-px bg-line md:grid-cols-[1fr_1.1fr]">
//         <div className="bg-card p-5 sm:p-8">
//           <div className="eyebrow">Pick a blood group</div>
//           <div className="mt-4 grid grid-cols-4 gap-2">
//             {GROUPS.map((g) => (
//               <button
//                 key={g}
//                 onClick={() => setGroup(g)}
//                 className={clsx(
//                   "aspect-square rounded-2xl border font-serif text-3xl transition sm:text-4xl",
//                   g === group ? "border-blood bg-blood text-white shadow-lg shadow-blood/30" : "border-line hover:border-ink/40",
//                 )}
//               >
//                 {g.replace("-", "−")}
//               </button>
//             ))}
//           </div>
//           <p className="mt-6 text-sm text-muted">
//             {group === "O-" && component !== "PLASMA" && "O− is the universal red-cell donor — which is exactly why BloodLink alerts O− donors last, saving them for patients who have no other match."}
//             {group === "AB+" && component !== "PLASMA" && "AB+ can receive red cells from everyone. For plasma, AB is the universal donor."}
//             {group !== "O-" && group !== "AB+" && `BloodLink alerts exact ${group} matches first, then other compatible groups only if needed.`}
//             {component === "PLASMA" && (group === "O-" || group === "AB+") && "For plasma the rule flips: the donor's plasma must not carry antibodies against the patient's cells."}
//           </p>
//         </div>

//         <div className="grid gap-px bg-line">
//           {[
//             { title: `${group} can receive from`, list: from, accent: "blood" },
//             { title: `${group} can give to`, list: to, accent: "ink" },
//           ].map((row) => (
//             <div key={row.title} className="bg-card p-5 sm:p-8">
//               <div className="flex items-baseline justify-between">
//                 <div className="eyebrow">{row.title}</div>
//                 <div className="font-mono text-xs text-muted">{row.list.length}/8</div>
//               </div>
//               <div className="mt-4 grid grid-cols-8 gap-1.5">
//                 {GROUPS.map((g) => {
//                   const on = row.list.includes(g);
//                   return (
//                     <div
//                       key={g}
//                       className={clsx(
//                         "grid aspect-[3/4] place-items-center rounded-lg font-mono text-[11px] transition-all duration-300 sm:text-xs",
//                         on ? (row.accent === "blood" ? "bg-blood text-white" : "bg-ink text-paper") : "border border-dashed border-line text-muted/50",
//                       )}
//                     >
//                       {g.replace("-", "−")}
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";

import clsx from "clsx";
import { useState } from "react";
import { COMPONENTS, GROUPS, giveTo, receiveFrom } from "@/lib/blood";
import type { BloodGroup, Component } from "@/lib/types";

export function CompatibilityExplorer() {
  const [group, setGroup] = useState<BloodGroup>("B+");
  const [component, setComponent] = useState<Component>("WHOLE_BLOOD");
  const from = receiveFrom(group, component);
  const to = giveTo(group, component);

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-line p-4 sm:p-5">
        <span className="mr-2 text-sm font-medium">Component</span>
        {COMPONENTS.map((c) => (
          <button
            key={c.value}
            onClick={() => setComponent(c.value)}
            className={clsx(
              "rounded-md border px-3 py-1.5 text-sm font-medium transition",
              component === c.value ? "border-blood bg-blood/5 text-blood" : "border-line text-muted hover:bg-ink/5 hover:text-ink",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-[1fr_1.1fr]">
        <div className="p-5 sm:p-8">
          <div className="text-sm font-medium">Pick a blood group</div>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {GROUPS.map((g) => (
              <button
                key={g}
                onClick={() => setGroup(g)}
                className={clsx(
                  "aspect-square rounded-md border text-xl font-bold transition sm:text-2xl",
                  g === group ? "border-blood bg-blood text-white" : "border-line hover:bg-ink/5",
                )}
              >
                {g.replace("-", "−")}
              </button>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted">
            {group === "O-" && component !== "PLASMA" && "O− is the universal red-cell donor. That is why BloodLink alerts O− donors last, saving them for patients who have no other match."}
            {group === "AB+" && component !== "PLASMA" && "AB+ can receive red cells from everyone. For plasma, AB is the universal donor."}
            {group !== "O-" && group !== "AB+" && `BloodLink alerts exact ${group} matches first, then other compatible groups only if needed.`}
            {component === "PLASMA" && (group === "O-" || group === "AB+") && "For plasma the rule flips: the donor's plasma must not carry antibodies against the patient's cells."}
          </p>
        </div>

        <div className="divide-y divide-line border-t border-line md:border-l md:border-t-0">
          {[
            { title: `${group} can receive from`, list: from, accent: "blood" },
            { title: `${group} can give to`, list: to, accent: "ink" },
          ].map((row) => (
            <div key={row.title} className="p-5 sm:p-8">
              <div className="flex items-baseline justify-between">
                <div className="text-sm font-medium">{row.title}</div>
                <div className="text-xs text-muted">{row.list.length} of 8</div>
              </div>
              <div className="mt-4 grid grid-cols-8 gap-1.5">
                {GROUPS.map((g) => {
                  const on = row.list.includes(g);
                  return (
                    <div
                      key={g}
                      className={clsx(
                        "grid aspect-[3/4] place-items-center rounded-md text-xs font-semibold transition-colors",
                        on ? (row.accent === "blood" ? "bg-blood text-white" : "bg-ink text-white") : "border border-line text-muted/50",
                      )}
                    >
                      {g.replace("-", "−")}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}