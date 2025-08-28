"use client";
import { clamp } from "@/utils/helpers"; // 👈 se hai helpers, altrimenti definisci inline

export default function GuestsStepper({ value, onChange, min = 1, max = 16 }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(clamp(value - 1, min, max))}
        className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border"
      >
        −
      </button>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(clamp(+e.target.value || min, min, max))}
        className="w-16 px-3 py-2 rounded-lg border text-center text-black"
      />
      <button
        onClick={() => onChange(clamp(value + 1, min, max))}
        className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border"
      >
        +
      </button>
    </div>
  );
}
