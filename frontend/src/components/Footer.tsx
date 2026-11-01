// import Link from "next/link";
// import { LogoMark } from "./Logo";

// export function Footer() {
//   return (
//     <footer className="mt-24 border-t border-line">
//       <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
//         <div>
//           <div className="flex items-center gap-2">
//             <LogoMark className="h-6 w-6" />
//             <span className="font-serif text-xl">BloodLink</span>
//           </div>
//           <p className="mt-3 max-w-sm text-sm text-muted">
//             Every request is verified by the treating hospital before a single donor is alerted. Donor numbers are never public.
//           </p>
//           <p className="mt-6 text-xs text-muted">
//             In a life-threatening emergency, call <span className="font-mono text-ink">112</span>. BloodLink supports — never replaces — your hospital's blood bank.
//           </p>
//         </div>
//         <div className="space-y-2 text-sm">
//           <div className="eyebrow mb-3">Donate</div>
//           <Link className="block text-muted hover:text-ink" href="/register">Become a donor</Link>
//           <Link className="block text-muted hover:text-ink" href="/#compatibility">Who can I give to?</Link>
//           <Link className="block text-muted hover:text-ink" href="/#eligibility">Am I eligible?</Link>
//         </div>
//         <div className="space-y-2 text-sm">
//           <div className="eyebrow mb-3">Hospitals</div>
//           <Link className="block text-muted hover:text-ink" href="/register?as=hospital">Onboard your hospital</Link>
//           <Link className="block text-muted hover:text-ink" href="/request/new">Raise a request</Link>
//           <a className="block text-muted hover:text-ink" href="/api/docs/">API docs</a>
//         </div>
//       </div>
//     </footer>
//   );
// }
import Link from "next/link";
import { LogoMark } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-card">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2">
            <LogoMark className="h-6 w-6" />
            <span className="text-lg font-bold tracking-tight">
              Blood<span className="text-blood">Link</span>
            </span>
          </div>
          <p className="mt-3 max-w-sm text-sm text-muted">
            Every request is verified by the treating hospital before a single donor is alerted. Donor numbers are never public.
          </p>
        </div>
        <div className="space-y-2.5 text-sm">
          <div className="mb-3 font-semibold">Donate</div>
          <Link className="block text-muted hover:text-ink" href="/register">Become a donor</Link>
          <Link className="block text-muted hover:text-ink" href="/#compatibility">Who can I give to?</Link>
          <Link className="block text-muted hover:text-ink" href="/#eligibility">Am I eligible?</Link>
        </div>
        <div className="space-y-2.5 text-sm">
          <div className="mb-3 font-semibold">Hospitals</div>
          <Link className="block text-muted hover:text-ink" href="/register?as=hospital">Onboard your hospital</Link>
          <Link className="block text-muted hover:text-ink" href="/request/new">Raise a request</Link>
          <a className="block text-muted hover:text-ink" href="/api/docs/">API docs</a>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-muted sm:flex-row sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} BloodLink. All rights reserved.</p>
          <p>
            In a life-threatening emergency, call <span className="font-semibold text-ink">112</span>. BloodLink supports, and never replaces, your hospital's blood bank.
          </p>
        </div>
      </div>
    </footer>
  );
}