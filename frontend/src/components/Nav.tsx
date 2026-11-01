// "use client";

// import clsx from "clsx";
// import Link from "next/link";
// import { usePathname, useRouter } from "next/navigation";
// import { useEffect, useRef, useState } from "react";
// import useSWR from "swr";
// import { Bell, LogOut, Moon, Plus, Sun } from "lucide-react";
// import { fetcher, post } from "@/lib/api";
// import { useAuth } from "@/lib/auth";
// import { timeAgo } from "@/lib/format";
// import type { Notification, Paginated } from "@/lib/types";
// import { Logo } from "./Logo";

// function ThemeToggle() {
//   const [dark, setDark] = useState<boolean | null>(null);
//   useEffect(() => {
//     let saved: string | null = null;
//     try { saved = localStorage.getItem("bl.theme"); } catch {}
//     const isDark = saved ? saved === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
//     setDark(isDark);
//   }, []);
//   const toggle = () => {
//     const next = !dark;
//     setDark(next);
//     document.documentElement.dataset.theme = next ? "dark" : "light";
//     try { localStorage.setItem("bl.theme", next ? "dark" : "light"); } catch {}
//   };
//   return (
//     <button onClick={toggle} aria-label="Toggle theme" className="grid h-9 w-9 place-items-center rounded-full text-muted transition hover:bg-ink/5 hover:text-ink">
//       {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
//     </button>
//   );
// }

// function Bellbox() {
//   const [open, setOpen] = useState(false);
//   const box = useRef<HTMLDivElement>(null);
//   const router = useRouter();
//   const { data: count, mutate: mc } = useSWR<{ count: number }>("/notifications/unread-count/", fetcher, { refreshInterval: 15000 });
//   const { data, mutate } = useSWR<Paginated<Notification>>(open ? "/notifications/?limit=8" : null, fetcher);
//   useEffect(() => {
//     const close = (e: MouseEvent) => box.current && !box.current.contains(e.target as Node) && setOpen(false);
//     document.addEventListener("mousedown", close);
//     return () => document.removeEventListener("mousedown", close);
//   }, []);
//   const readAll = async () => { await post("/notifications/read-all/"); mc(); mutate(); };
//   const n = count?.count ?? 0;
//   return (
//     <div className="relative" ref={box}>
//       <button onClick={() => setOpen(!open)} aria-label="Notifications" className="relative grid h-9 w-9 place-items-center rounded-full text-muted transition hover:bg-ink/5 hover:text-ink">
//         <Bell className="h-4 w-4" />
//         {n > 0 && <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-pulse px-1 font-mono text-[9px] text-white">{n}</span>}
//       </button>
//       {open && (
//         <div className="card absolute right-0 top-11 z-50 w-[min(360px,calc(100vw-32px))] overflow-hidden shadow-2xl shadow-ink/10 animate-rise">
//           <div className="flex items-center justify-between border-b border-line px-4 py-3">
//             <span className="eyebrow">Notifications</span>
//             {n > 0 && <button onClick={readAll} className="text-xs text-blood hover:underline">Mark all read</button>}
//           </div>
//           <div className="max-h-96 overflow-y-auto">
//             {data?.results.length === 0 && <p className="px-4 py-8 text-center text-sm text-muted">You're all caught up.</p>}
//             {data?.results.map((x) => (
//               <button
//                 key={x.id}
//                 onClick={() => { setOpen(false); if (x.link) router.push(x.link); }}
//                 className="flex w-full gap-3 border-b border-line/60 px-4 py-3 text-left last:border-0 hover:bg-ink/[.03]"
//               >
//                 <span className={clsx("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", x.read_at ? "bg-transparent" : "bg-pulse")} />
//                 <span>
//                   <span className="block text-sm font-medium">{x.title}</span>
//                   <span className="mt-0.5 block text-xs text-muted">{x.body}</span>
//                   <span className="mt-1 block font-mono text-[10px] text-muted/80">{timeAgo(x.created_at)}</span>
//                 </span>
//               </button>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export function Nav() {
//   const { user, logout } = useAuth();
//   const path = usePathname();
//   const router = useRouter();
//   const links = user
//     ? [
//         user.donor_profile && { href: "/donor", label: "My alerts" },
//         user.hospital && { href: "/hospital", label: "Console" },
//         { href: "/requests", label: "Requests" },
//       ].filter(Boolean) as { href: string; label: string }[]
//     : [
//         { href: "/#how", label: "How it works" },
//         { href: "/#compatibility", label: "Compatibility" },
//         { href: "/register?as=hospital", label: "For hospitals" },
//       ];

//   return (
//     <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/80 backdrop-blur-xl">
//       <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
//         <Logo />
//         <nav className="hidden items-center gap-1 md:flex">
//           {links.map((l) => (
//             <Link
//               key={l.href}
//               href={l.href}
//               className={clsx("rounded-full px-3 py-1.5 text-sm transition", path === l.href ? "bg-ink/5 text-ink" : "text-muted hover:text-ink")}
//             >
//               {l.label}
//             </Link>
//           ))}
//         </nav>
//         <div className="ml-auto flex items-center gap-1.5">
//           <ThemeToggle />
//           {user ? (
//             <>
//               <Bellbox />
//               <button onClick={() => { logout(); router.push("/"); }} aria-label="Sign out" className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-ink/5 hover:text-ink">
//                 <LogOut className="h-4 w-4" />
//               </button>
//             </>
//           ) : (
//             <Link href="/login" className="hidden px-3 text-sm text-muted hover:text-ink sm:block">Sign in</Link>
//           )}
//           <Link href="/request/new" className="btn-blood !px-4 !py-2">
//             <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Request blood</span><span className="sm:hidden">Request</span>
//           </Link>
//         </div>
//       </div>
//       {/* mobile nav */}
//       <nav className="flex gap-1 overflow-x-auto px-4 pb-2 md:hidden">
//         {links.map((l) => (
//           <Link key={l.href} href={l.href} className={clsx("whitespace-nowrap rounded-full px-3 py-1 text-[13px]", path === l.href ? "bg-ink/5" : "text-muted")}>
//             {l.label}
//           </Link>
//         ))}
//       </nav>
//     </header>
//   );
// }
"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { Bell, LogOut, Menu, X } from "lucide-react";
import { fetcher, post } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { timeAgo } from "@/lib/format";
import type { Notification, Paginated } from "@/lib/types";
import { Logo } from "./Logo";

const iconBtn =
  "relative grid h-9 w-9 place-items-center rounded-md text-muted transition hover:bg-ink/5 hover:text-ink";

function Bellbox() {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { data: count, mutate: mc } = useSWR<{ count: number }>("/notifications/unread-count/", fetcher, { refreshInterval: 15000 });
  const { data, mutate } = useSWR<Paginated<Notification>>(open ? "/notifications/?limit=8" : null, fetcher);
  useEffect(() => {
    const close = (e: MouseEvent) => box.current && !box.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  const readAll = async () => { await post("/notifications/read-all/"); mc(); mutate(); };
  const n = count?.count ?? 0;
  return (
    <div className="relative" ref={box}>
      <button onClick={() => setOpen(!open)} aria-label="Notifications" className={iconBtn}>
        <Bell className="h-[18px] w-[18px]" />
        {n > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-blood px-1 text-[10px] font-semibold text-white">
            {n}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-50 w-[min(360px,calc(100vw-32px))] overflow-hidden rounded-lg border border-line bg-card shadow-lg animate-rise">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <span className="text-sm font-semibold">Notifications</span>
            {n > 0 && <button onClick={readAll} className="text-xs font-medium text-blood hover:underline">Mark all read</button>}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {data?.results.length === 0 && <p className="px-4 py-8 text-center text-sm text-muted">You're all caught up.</p>}
            {data?.results.map((x) => (
              <button
                key={x.id}
                onClick={() => { setOpen(false); if (x.link) router.push(x.link); }}
                className="flex w-full gap-3 border-b border-line px-4 py-3 text-left last:border-0 hover:bg-ink/[.03]"
              >
                <span className={clsx("mt-1.5 h-2 w-2 shrink-0 rounded-full", x.read_at ? "bg-transparent" : "bg-blood")} />
                <span>
                  <span className="block text-sm font-medium">{x.title}</span>
                  <span className="mt-0.5 block text-sm text-muted">{x.body}</span>
                  <span className="mt-1 block text-xs text-muted">{timeAgo(x.created_at)}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function Nav() {
  const { user, logout } = useAuth();
  const path = usePathname();
  const router = useRouter();
  const [menu, setMenu] = useState(false);

  useEffect(() => setMenu(false), [path]);

  const links = user
    ? [
        user.donor_profile && { href: "/donor", label: "My alerts" },
        user.hospital && { href: "/hospital", label: "Console" },
        { href: "/requests", label: "Requests" },
      ].filter(Boolean) as { href: string; label: string }[]
    : [
        { href: "/#how", label: "How it works" },
        { href: "/#compatibility", label: "Compatibility" },
        { href: "/register?as=hospital", label: "For hospitals" },
      ];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-card">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={clsx("text-sm font-medium transition", path === l.href ? "text-ink" : "text-muted hover:text-ink")}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <>
              <Bellbox />
              <button
                onClick={() => { logout(); router.push("/"); }}
                aria-label="Sign out"
                className={iconBtn}
              >
                <LogOut className="h-[18px] w-[18px]" />
              </button>
            </>
          ) : (
            <Link href="/login" className="hidden px-3 text-sm font-medium text-muted hover:text-ink sm:block">
              Sign in
            </Link>
          )}
          <Link
            href="/request/new"
            className="inline-flex items-center rounded-md bg-blood px-4 py-2 text-sm font-semibold text-white transition hover:bg-blood/90"
          >
            Request blood
          </Link>
          <button
            onClick={() => setMenu(!menu)}
            aria-label={menu ? "Close menu" : "Open menu"}
            aria-expanded={menu}
            className={clsx(iconBtn, "md:hidden")}
          >
            {menu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* mobile menu */}
      {menu && (
        <nav className="border-t border-line bg-card px-4 py-2 md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={clsx("block border-b border-line py-3 text-sm font-medium last:border-0", path === l.href ? "text-ink" : "text-muted")}
            >
              {l.label}
            </Link>
          ))}
          {!user && (
            <Link href="/login" className="block py-3 text-sm font-medium text-muted">Sign in</Link>
          )}
        </nav>
      )}
    </header>
  );
}