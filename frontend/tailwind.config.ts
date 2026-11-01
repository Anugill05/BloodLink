// import type { Config } from "tailwindcss";

// const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

// export default {
//   content: ["./src/**/*.{ts,tsx}"],
//   darkMode: ["class", '[data-theme="dark"]'],
//   theme: {
//     extend: {
//       colors: {
//         paper: v("paper"),
//         card: v("card"),
//         ink: v("ink"),
//         muted: v("muted"),
//         line: v("line"),
//         blood: v("blood"),
//         pulse: v("pulse"),
//         plasma: v("plasma"),
//         ok: v("ok"),
//         warn: v("warn"),
//       },
//       fontFamily: {
//         serif: ["var(--font-serif)", "Georgia", "serif"],
//         sans: ["var(--font-sans)", "system-ui", "sans-serif"],
//         mono: ["var(--font-mono)", "ui-monospace", "monospace"],
//       },
//       borderRadius: { xl2: "1.25rem" },
//       keyframes: {
//         ripple: { "0%": { transform: "scale(0.2)", opacity: "0.9" }, "100%": { transform: "scale(1)", opacity: "0" } },
//         beat: { "0%,100%": { transform: "scale(1)" }, "15%": { transform: "scale(1.18)" }, "30%": { transform: "scale(1)" }, "45%": { transform: "scale(1.1)" } },
//         marquee: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
//         rise: { "0%": { opacity: "0", transform: "translateY(8px)" }, "100%": { opacity: "1", transform: "none" } },
//         sweep: { "0%": { transform: "rotate(0deg)" }, "100%": { transform: "rotate(360deg)" } },
//       },
//       animation: {
//         ripple: "ripple 3.6s cubic-bezier(.2,.6,.3,1) infinite",
//         beat: "beat 1.4s ease-in-out infinite",
//         marquee: "marquee 40s linear infinite",
//         rise: "rise .5s ease-out both",
//         sweep: "sweep 6s linear infinite",
//       },
//     },
//   },
//   plugins: [],
// } satisfies Config;
import type { Config } from "tailwindcss";

const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

// One typeface across the site. `serif` and `mono` point to the same font,
// so any existing font-serif / font-mono classes render in the new font
// without editing every file.
const sans = ['"Plus Jakarta Sans Variable"', "system-ui", "-apple-system", "Segoe UI", "sans-serif"];

export default {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        paper: v("paper"),
        card: v("card"),
        ink: v("ink"),
        muted: v("muted"),
        line: v("line"),
        blood: v("blood"),
        pulse: v("pulse"),
        plasma: v("plasma"),
        ok: v("ok"),
        warn: v("warn"),
      },
      fontFamily: { sans, serif: sans, mono: sans },
      borderRadius: { xl2: "1.25rem" },
      keyframes: {
        rise: { "0%": { opacity: "0", transform: "translateY(4px)" }, "100%": { opacity: "1", transform: "none" } },
      },
      animation: {
        rise: "rise .2s ease-out both",
      },
    },
  },
  plugins: [],
} satisfies Config;