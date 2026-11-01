// import Link from "next/link";

// export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
//   // A droplet whose inner negative space is a location ring — "blood, near you".
//   return (
//     <svg viewBox="0 0 32 32" className={className} aria-hidden>
//       <path d="M16 2.5c5.2 6.4 10 12.2 10 17.6A10 10 0 0 1 6 20.1C6 14.7 10.8 8.9 16 2.5Z" fill="rgb(var(--blood))" />
//       <circle cx="16" cy="20" r="4.2" fill="none" stroke="rgb(var(--paper))" strokeWidth="2" />
//       <circle cx="16" cy="20" r="1.3" fill="rgb(var(--paper))" />
//     </svg>
//   );
// }

// export function Logo() {
//   return (
//     <Link href="/" className="group flex items-center gap-2">
//       <LogoMark />
//       <span className="font-serif text-[22px] leading-none tracking-tight">
//         Blood<span className="italic text-blood">Link</span>
//       </span>
//     </Link>
//   );
// }
import Link from "next/link";

export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
        className="fill-blood"
      />
      <path d="M12 8v6M9 11h6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="BloodLink home">
      <LogoMark />
      <span className="text-lg font-bold tracking-tight text-ink">
        Blood<span className="text-blood">Link</span>
      </span>
    </Link>
  );
}