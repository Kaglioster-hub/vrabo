export default async function BrokerPage({ params }) {
  const broker = decodeURIComponent(params.broker);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/search?type=trading&q=${broker}`,
    { next: { revalidate: 3600 } }
  );
  const data = await res.json();

  return (
    <section className="max-w-6xl mx-auto py-16 px-6">
      <h1 className="text-4xl font-bold mb-6">Broker {broker}</h1>
      <p className="mb-6 text-gray-600 dark:text-gray-300">
        Confronta le migliori condizioni di trading e apri un conto con il broker {broker}.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {data.results.map((r, i) => (
          <a
            key={i}
            href={`/api/track?url=${encodeURIComponent(r.url)}`}
            target="_blank"
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:scale-105 transition"
          >
            <h3 className="font-bold text-lg">{r.title}</h3>
            <p className="text-sm text-gray-500">{r.location}</p>
            <p className="text-green-600 font-semibold mt-2">{r.price}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
