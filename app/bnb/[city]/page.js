export default async function CityBnB({ params }) {
  const city = decodeURIComponent(params.city);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/search?type=bnb&q=${city}`,
    { next: { revalidate: 3600 } }
  );
  const data = await res.json();

  return (
    <section className="max-w-6xl mx-auto py-16 px-6">
      <h1 className="text-4xl font-bold mb-6">BnB e Hotel a {city}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {data.results.map((r, i) => (
          <a
            key={i}
            href={`/api/track?url=${encodeURIComponent(r.url)}`}
            target="_blank"
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:scale-105 transition"
          >
            <img src={r.image || "/logo.png"} alt={r.title} className="w-full h-40 object-cover rounded-t-2xl" />
            <div className="p-4">
              <h3 className="font-bold">{r.title}</h3>
              <p className="text-sm text-gray-500">{r.location}</p>
              <p className="text-blue-600 font-semibold mt-2">{r.price}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
