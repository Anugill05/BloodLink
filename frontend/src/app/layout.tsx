// import type { Metadata, Viewport } from "next";
// // Self-hosted fonts (no runtime call to Google; builds offline / in CI).
// import "@fontsource/instrument-serif/400.css";
// import "@fontsource/instrument-serif/400-italic.css";
// import "@fontsource-variable/inter-tight";
// import "@fontsource-variable/jetbrains-mono";
// import { AuthProvider } from "@/lib/auth";
// import { Nav } from "@/components/Nav";
// import { Footer } from "@/components/Footer";
// import "./globals.css";

// export const metadata: Metadata = {
//   title: { default: "BloodLink — the right donor, close by, right now", template: "%s · BloodLink" },
//   description:
//     "BloodLink matches hospital-verified blood requests with compatible, eligible donors nearby — in widening waves, without spamming anyone or exposing phone numbers.",
// };
// export const viewport: Viewport = { themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#110c0c" }, { color: "#f6f1ea" }] };

// // Applies the saved theme before paint so there's no flash.
// const themeScript = `try{var t=localStorage.getItem('bl.theme');if(t)document.documentElement.dataset.theme=t}catch(e){}`;

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <head>
//         <script dangerouslySetInnerHTML={{ __html: themeScript }} />
//       </head>
//       <body className="min-h-screen">
//         <AuthProvider>
//           <Nav />
//           <main>{children}</main>
//           <Footer />
//         </AuthProvider>
//       </body>
//     </html>
//   );
// }
import type { Metadata, Viewport } from "next";
// Self-hosted font (no runtime call to Google; builds offline / in CI).
import "@fontsource-variable/plus-jakarta-sans";
import { AuthProvider } from "@/lib/auth";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "BloodLink — the right donor, close by, right now", template: "%s · BloodLink" },
  description:
    "BloodLink matches hospital-verified blood requests with compatible, eligible donors nearby — in widening waves, without spamming anyone or exposing phone numbers.",
};
export const viewport: Viewport = { themeColor: "#ffffff" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-paper font-sans text-ink antialiased">
        <AuthProvider>
          <Nav />
          <main>{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}