import Fuse from "fuse.js";
import { sources } from "@/data/sources";

const fuse = new Fuse(sources, {
  keys: [
    { name: "title", weight: 0.6 },
    { name: "description", weight: 0.3 },
    { name: "tags", weight: 0.1 },
  ],
  threshold: 0.35,
  ignoreLocation: true,
  includeScore: true,
  useExtendedSearch: true
});

export function searchItems(q: string, limit = 10) {
  if (!q || q.trim().length === 0) return sources.slice(0, limit);
  return fuse.search(q).slice(0, limit).map(r => r.item);
}

export function getTopItems(limit=8) {
  return sources.slice(0, limit);
}
