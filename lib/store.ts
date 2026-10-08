"use client";
import type { Analysis } from "./schema";

const ANALYSES_KEY = "atlas:analyses:v1";
const VIEWED_KEY = "atlas:viewed:v1";

export function saveAnalysis(a: Analysis) {
  try {
    const raw = localStorage.getItem(ANALYSES_KEY);
    const list: Analysis[] = raw ? JSON.parse(raw) : [];
    const next = [a, ...list.filter((x) => x.id !== a.id)].slice(0, 20);
    localStorage.setItem(ANALYSES_KEY, JSON.stringify(next));
  } catch {}
}

export function recentAnalyses(): Analysis[] {
  try {
    const raw = localStorage.getItem(ANALYSES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function getAnalysis(id: string): Analysis | null {
  return recentAnalyses().find((a) => a.id === id) ?? null;
}

export function markViewed(slug: string) {
  try {
    const raw = localStorage.getItem(VIEWED_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    localStorage.setItem(VIEWED_KEY, JSON.stringify([slug, ...list.filter((s) => s !== slug)].slice(0, 12)));
  } catch {}
}

export function recentlyViewed(): string[] {
  try {
    const raw = localStorage.getItem(VIEWED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
