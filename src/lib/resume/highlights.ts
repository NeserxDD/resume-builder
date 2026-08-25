import type { HighlightStyle } from "@/lib/resume/types";

export const HIGHLIGHT_STYLES = [
  "template-default",
  "bullet",
  "circle",
  "square",
  "triangle",
  "dash",
  "diamond",
  "none",
] as const;

export const HIGHLIGHT_STYLE_LABELS: Record<HighlightStyle, string> = {
  "template-default": "Template default",
  bullet: "Filled bullet",
  circle: "Hollow bullet",
  square: "Square",
  triangle: "Triangle",
  dash: "Dash",
  diamond: "Diamond",
  none: "None",
};

const MARKERS: Record<Exclude<HighlightStyle, "template-default" | "none">, string> = {
  bullet: "• ",
  circle: "◦ ",
  square: "▪ ",
  triangle: "▸ ",
  dash: "— ",
  diamond: "◆ ",
};

export function defaultHighlightStyleForTemplate(templateId: string): HighlightStyle {
  return templateId === "modern" ? "dash" : "bullet";
}

export function resolveHighlightStyle(
  templateId: string,
  selection?: { highlightStyle?: HighlightStyle },
): HighlightStyle {
  const style = selection?.highlightStyle ?? "template-default";
  return style === "template-default" ? defaultHighlightStyleForTemplate(templateId) : style;
}

export function highlightMarker(
  templateId: string,
  selection?: { highlightStyle?: HighlightStyle },
): string {
  const style = resolveHighlightStyle(templateId, selection);
  if (style === "none" || style === "template-default") return "";
  return MARKERS[style];
}