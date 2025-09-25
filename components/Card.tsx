import Link from "next/link";

export default function Card({ item }: { item: any }) {
  return (
    <Link href={item.url} target="_blank" className="card card-hover p-4 flex flex-col gap-3">
      <div className="flex-1">
        <div className="font-semibold text-lg">{item.title}</div>
        <p className="text-sm text-white/70 mt-1 line-clamp-3">{item.description}</p>
      </div>
      <div className="flex items-center justify-between pt-2">
        <div className="flex gap-1 flex-wrap">
          {item.tags?.map((t:string) => <span key={t} className="badge">{t}</span>)}
        </div>
        <div className="text-xs text-white/60">{item.category}</div>
      </div>
    </Link>
  );
}
