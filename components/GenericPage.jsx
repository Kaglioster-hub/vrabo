"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import SkeletonCard from "@/components/SkeletonCard";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

export default function GenericPage({ type, emoji, title }) {
  const { city } = useParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!city) return;
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `/api/search?type=${type}&query=${encodeURIComponent(city)}`
        );
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        setResults(data.results || []);
      } catch (err) {
        console.error(err);
        setError("❌ Errore durante il caricamento. Riprova più tardi.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [city, type]);

  return (
    <div className="max-w-7xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-bold mb-6">
        {emoji} {title} {city}
      </h1>

      {/* Stato: loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Stato: errore */}
      {!loading && error && (
        <div className="text-center text-red-500">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
          >
            Riprova
          </button>
        </div>
      )}

      {/* Stato: no results */}
      {!loading && !error && !results.length && (
        <p className="text-gray-400 text-center">Nessun risultato trovato</p>
      )}

      {/* Stato: risultati */}
      {!!results.length && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {results.map((r, i) => (
              <motion.a
                key={i}
                href={`/api/track?url=${encodeURIComponent(r.url)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Apri offerta: ${r.title}`}
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl flex flex-col transition"
              >
                <img
                  src={r.image || "/logo.png"}
                  alt={r.title}
                  onError={(e) => (e.currentTarget.src = "/logo.png")}
                  className="w-full h-44 object-cover"
                />
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg mb-1 truncate">{r.title}</h3>
                  <p className="text-sm text-gray-500 flex-1">
                    {r.location || "—"}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xl text-blue-600 font-semibold">
                      {r.price || "—"}
                    </p>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>

          {/* Chart */}
          <div className="mt-12 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-bold mb-4">📊 Distribuzione prezzi</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={results.map((r) => ({
                  name: (r.title || "").slice(0, 12) + "...",
                  prezzo: r._priceVal || 0,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="prezzo" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
