"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type ResultItem = {
  type?: string;
  _priceVal?: number;
};

export default function Charts({
  results,
  visible,
  t,
}: {
  results: ResultItem[];
  visible: boolean;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  if (!visible || !results?.length) return null;

  const byTypeMap = new Map<string, { type: string; count: number; sum: number; n: number }>();
  for (const r of results) {
    const key = r.type || "other";
    const priceVal = typeof r._priceVal === "number" ? r._priceVal : NaN;
    const cur = byTypeMap.get(key) || { type: key, count: 0, sum: 0, n: 0 };
    cur.count += 1;
    if (!Number.isNaN(priceVal)) {
      cur.sum += priceVal;
      cur.n += 1;
    }
    byTypeMap.set(key, cur);
  }

  const byType = Array.from(byTypeMap.values()).map((x) => ({
    type: x.type,
    count: x.count,
    avgPrice: x.n ? Math.round((x.sum / x.n) * 100) / 100 : 0,
  }));

  return (
    <section className="py-12 px-6 max-w-6xl w-full mx-auto">
      <h2 className="text-2xl font-bold mb-6">Insights</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="chart-card">
          <h3 className="font-semibold mb-3">Distribuzione per tipo</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byType}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="Conteggio" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h3 className="font-semibold mb-3">Prezzo medio per tipo (€)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byType}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="avgPrice" name="€ medio" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
