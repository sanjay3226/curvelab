import { CurveLabConfig } from "@/types/curve-config";

export function encodeCurveToURL(config: CurveLabConfig): string {
  try {
    const json = JSON.stringify(config);
    if (typeof window === "undefined") return "";
    const encoded = btoa(encodeURIComponent(json));
    return `${window.location.origin}${window.location.pathname}#${encoded}`;
  } catch (error) {
    console.error("Failed to encode curve config to URL:", error);
    return "";
  }
}

export function decodeCurveFromURL(): CurveLabConfig | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.slice(1);
  if (!hash) return null;
  try {
    const json = decodeURIComponent(atob(hash));
    return JSON.parse(json) as CurveLabConfig;
  } catch (error) {
    console.warn("Invalid curve hash in URL:", error);
    return null;
  }
}
