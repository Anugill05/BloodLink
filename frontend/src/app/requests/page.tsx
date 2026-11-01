// "use client";

// import Link from "next/link";
// import useSWR from "swr";
// import { Droplets, Plus } from "lucide-react";
// import { RequestRow } from "@/components/RequestRow";
// import { Empty, PageLoader } from "@/components/ui";
// import { fetcher } from "@/lib/api";
// import { useRequireAuth } from "@/lib/auth";
// import type { Paginated, RequestListItem } from "@/lib/types";

// export default function MyRequests() {
//   const { user } = useRequireAuth();
//   const { data } = useSWR<Paginated<RequestListItem>>(user ? "/requests/?limit=50" : null, fetcher, { refreshInterval: 10000 });
//   if (!user || !data) return <PageLoader />;
//   const mine = data.results;
//   return (
//     <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
//       <div className="flex flex-wrap items-end justify-between gap-4">
//         <div>
//           <div className="eyebrow">{user.hospital ? user.hospital.name : "Your requests"}</div>
//           <h1 className="mt-2 font-serif text-5xl">Requests</h1>
//         </div>
//         <Link href="/request/new" className="btn-blood"><Plus className="h-4 w-4" /> New request</Link>
//       </div>
//       <div className="mt-8 space-y-3">
//         {mine.length === 0 ? (
//           <Empty icon={<Droplets className="h-8 w-8" />} title="No requests yet">
//             When someone you care for needs blood, raise a request and we&rsquo;ll handle the search.
//           </Empty>
//         ) : mine.map((r) => <RequestRow key={r.id} r={r} staff={!!user.hospital} />)}
//       </div>
//     </div>
//   );
// }
"use client";

import Link from "next/link";
import useSWR from "swr";
import { Droplets, Plus } from "lucide-react";
import { RequestRow } from "@/components/RequestRow";
import { Empty, PageLoader } from "@/components/ui";
import { fetcher } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";
import type { Paginated, RequestListItem } from "@/lib/types";

export default function MyRequests() {
  const { user } = useRequireAuth();
  const { data } = useSWR<Paginated<RequestListItem>>(user ? "/requests/?limit=50" : null, fetcher, { refreshInterval: 10000 });
  if (!user || !data) return <PageLoader />;
  const mine = data.results;
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">{user.hospital ? user.hospital.name : "Your requests"}</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Requests</h1>
        </div>
        <Link href="/request/new" className="btn-blood"><Plus className="h-4 w-4" /> New request</Link>
      </div>
      <div className="mt-6 space-y-3">
        {mine.length === 0 ? (
          <Empty icon={<Droplets className="h-8 w-8" />} title="No requests yet">
            When someone you care for needs blood, raise a request and we&rsquo;ll handle the search.
          </Empty>
        ) : mine.map((r) => <RequestRow key={r.id} r={r} staff={!!user.hospital} />)}
      </div>
    </div>
  );
}