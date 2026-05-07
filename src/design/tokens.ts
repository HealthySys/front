/**
 * HealthSys Design Tokens — Web (React + Vite)
 * Source of truth for colors, typography, spacing, radii and shadows.
 * Mirrors src/design/tokens.css. Use in TS where dynamic values are needed
 * (e.g. RiskConfig). For static styling, prefer the CSS variables in the
 * .module.css files.
 */

export const Colors = {
  // Sidebar
  sidebar:        "#0d1424",
  sidebarHover:   "#1a2438",
  sidebarActive:  "#1e2d4a",
  sidebarBorder:  "rgba(255,255,255,0.06)",

  // Accent (teal)
  accent:         "#0f9490",
  accentLight:    "#d0f0ef",
  accentDim:      "rgba(15,148,144,0.12)",

  // Backgrounds
  bg:             "#f0f4f8",
  surface:        "#ffffff",
  surface2:       "#f7f9fc",

  // Borders
  border:         "#e2e8f0",

  // Text
  text:           "#0f172a",
  text2:          "#475569",
  text3:          "#94a3b8",

  // Manchester Protocol (triage risk levels)
  riskVermelho:   "#ef4444",
  riskVermelhoB:  "#fef2f2",
  riskVermelhoBd: "#fca5a5",

  riskLaranja:    "#f97316",
  riskLaranjaB:   "#fff7ed",
  riskLaranjaBd:  "#fdba74",

  riskAmarelo:    "#d97706",
  riskAmareloB:   "#fffbeb",
  riskAmareloBd:  "#fcd34d",

  riskVerde:      "#16a34a",
  riskVerdeB:     "#f0fdf4",
  riskVerdeBd:    "#86efac",

  riskAzul:       "#2563eb",
  riskAzulB:      "#eff6ff",
  riskAzulBd:     "#93c5fd",

  // Status (Ativo/Inativo)
  statusAtivoBg:  "#f0fdf4",
  statusAtivo:    "#16a34a",
  statusAtivoBd:  "#bbf7d0",

  // Semantic
  danger:         "#ef4444",
  dangerBg:       "#fef2f2",
  dangerBd:       "#fca5a5",
  warning:        "#d97706",
  warningBg:      "#fffbeb",
  success:        "#16a34a",
  successBg:      "#f0fdf4",
} as const;

export const FontFamily = {
  base: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

export const FontWeight = {
  regular:   400,
  medium:    500,
  semibold:  600,
  bold:      700,
  extrabold: 800,
} as const;

export const FontSize = {
  xs:    11,
  sm:    12,
  base:  13.5,
  md:    15,
  lg:    17,
  xl:    22,
  "2xl": 26,
  "3xl": 30,
} as const;

export const LineHeight = {
  tight:  1.2,
  normal: 1.5,
  loose:  1.7,
} as const;

export const Spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
} as const;

export const Radius = {
  sm:   8,
  md:   10,
  lg:   12,
  full: 999,
} as const;

export const Shadow = {
  sm: "0 1px 3px rgba(15, 23, 42, 0.06)",
  md: "0 4px 16px rgba(15, 23, 42, 0.08)",
} as const;

export const SidebarWidth = 220;
export const TopBarHeight = 56;

export type RiskLevel = "vermelho" | "laranja" | "amarelo" | "verde" | "azul";

export const RiskConfig: Record<RiskLevel, {
  label: string;
  color: string;
  bg: string;
  border: string;
}> = {
  vermelho: { label: "Vermelho", color: Colors.riskVermelho, bg: Colors.riskVermelhoB, border: Colors.riskVermelhoBd },
  laranja:  { label: "Laranja",  color: Colors.riskLaranja,  bg: Colors.riskLaranjaB,  border: Colors.riskLaranjaBd  },
  amarelo:  { label: "Amarelo",  color: Colors.riskAmarelo,  bg: Colors.riskAmareloB,  border: Colors.riskAmareloBd  },
  verde:    { label: "Verde",    color: Colors.riskVerde,    bg: Colors.riskVerdeB,    border: Colors.riskVerdeBd    },
  azul:     { label: "Azul",     color: Colors.riskAzul,     bg: Colors.riskAzulB,     border: Colors.riskAzulBd     },
};

export type EntryType = "CONSULTA" | "PRESCRICAO" | "EXAME" | "TRIAGEM";

export const EntryConfig: Record<EntryType, { color: string; bg: string; label: string }> = {
  CONSULTA:     { color: Colors.accent,     bg: Colors.accentDim, label: "Consulta" },
  PRESCRICAO:   { color: "#db2777",         bg: "#fdf2f8",        label: "Prescrição" },
  EXAME:        { color: "#7c3aed",         bg: "#f5f3ff",        label: "Exame" },
  TRIAGEM:      { color: Colors.text2,      bg: "#f1f5f9",        label: "Triagem" },
};
