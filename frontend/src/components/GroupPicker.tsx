// "use client";

// import clsx from "clsx";
// import { GROUPS } from "@/lib/blood";
// import type { BloodGroup } from "@/lib/types";

// export function GroupPicker({ value, onChange }: { value: BloodGroup | null; onChange: (g: BloodGroup) => void }) {
//   return (
//     <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
//       {GROUPS.map((g) => (
//         <button
//           type="button"
//           key={g}
//           onClick={() => onChange(g)}
//           className={clsx(
//             "h-14 rounded-xl border font-serif text-2xl transition",
//             value === g ? "border-blood bg-blood text-white shadow-md shadow-blood/30" : "border-line bg-card hover:border-ink/40",
//           )}
//         >
//           {g.replace("-", "−")}
//         </button>
//       ))}
//     </div>
//   );
// }
"use client";

import clsx from "clsx";
import { GROUPS } from "@/lib/blood";
import type { BloodGroup } from "@/lib/types";

export function GroupPicker({ value, onChange }: { value: BloodGroup | null; onChange: (g: BloodGroup) => void }) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
      {GROUPS.map((g) => (
        <button
          type="button"
          key={g}
          onClick={() => onChange(g)}
          aria-pressed={value === g}
          className={clsx(
            "h-12 rounded-md border text-lg font-bold transition",
            value === g ? "border-blood bg-blood text-white" : "border-line bg-card hover:bg-ink/5",
          )}
        >
          {g.replace("-", "−")}
        </button>
      ))}
    </div>
  );
}