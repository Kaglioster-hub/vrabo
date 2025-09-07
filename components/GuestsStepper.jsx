"use client";
import { useEffect, useMemo, useRef, useState } from "react";

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

export default function GuestsStepper({
  value,
  onChange,
  min = 1,
  max = 16,
  step = 1,
  label = "Ospiti",
  size = "md",
  className = "",
}) {
  const [local, setLocal] = useState(clamp(value, min, max));
  const holdRef = useRef(null);

  // sync con value esterno
  useEffect(() => setLocal(clamp(value, min, max)), [value, min, max]);

  const atMin = local <= min;
  const atMax = local >= max;

  const inc = () => {
    setLocal((v) => {
      const nv = clamp(v + step, min, max);
      if (nv !== v) onChange(nv);
      return nv;
    });
  };
  const dec = () => {
    setLocal((v) => {
      const nv = clamp(v - step, min, max);
      if (nv !== v) onChange(nv);
      return nv;
    });
  };

  const startHold = (fn) => {
    fn(); // azione immediata
    clearHold();
    holdRef.current = setInterval(fn, 120); // ripeti finché tenuto premuto
  };
  const clearHold = () => {
    if (holdRef.current) {
      clearInterval(holdRef.current);
      holdRef.current = null;
    }
  };

  const onInput = (e) => {
    const raw = e.target.value;
    const n = Number(String(raw).replace(",", "."));
    const nv = Number.isFinite(n) ? Math.round(n) : min;
    const clamped = clamp(nv, min, max);
    setLocal(clamped);
    onChange(clamped);
  };

  const onKey = (e) => {
    if (e.key === "ArrowUp") { e.preventDefault(); inc(); }
    if (e.key === "ArrowDown") { e.preventDefault(); dec(); }
    if (e.key === "Home") { e.preventDefault(); setLocal(min); onChange(min); }
    if (e.key === "End") { e.preventDefault(); setLocal(max); onChange(max); }
  };

  const sizeCls = useMemo(
    () =>
      size === "sm"
        ? { btn: "px-2 py-1 text-sm", inp: "w-16 px-2 py-1 text-sm" }
        : { btn: "px-3 py-2",         inp: "w-20 px-3 py-2" },
    [size]
  );

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* − */}
      <button
        type="button"
        aria-label={`${label} meno`}
        onMouseDown={() => startHold(dec)}
        onTouchStart={() => startHold(dec)}
        onMouseUp={clearHold}
        onMouseLeave={clearHold}
        onTouchEnd={clearHold}
        onClick={dec}
        disabled={atMin}
        className={`${sizeCls.btn} rounded-lg border bg-gray-100 dark:bg-gray-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-400`}
      >
        −
      </button>

      {/* input */}
      <input
        type="number"
        inputMode="numeric"
        role="spinbutton"
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={local}
        min={min}
        max={max}
        step={step}
        value={local}
        onChange={onInput}
        onKeyDown={onKey}
        className={`${sizeCls.inp} rounded-lg border text-center text-black`}
      />

      {/* + */}
      <button
        type="button"
        aria-label={`${label} più`}
        onMouseDown={() => startHold(inc)}
        onTouchStart={() => startHold(inc)}
        onMouseUp={clearHold}
        onMouseLeave={clearHold}
        onTouchEnd={clearHold}
        onClick={inc}
        disabled={atMax}
        className={`${sizeCls.btn} rounded-lg border bg-gray-100 dark:bg-gray-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-400`}
      >
        +
      </button>
    </div>
  );
}
