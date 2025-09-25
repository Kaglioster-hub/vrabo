import { PARTNERS } from "@/data/partners";
import { PartnerCard } from "@/components/PartnerCard";

export default function Partners() {
  return (
    <div className="grid-auto-fit">
      {PARTNERS.map(p => (
        <PartnerCard
          key={p.name}
          name={p.name}
          href={p.href}
          logo={p.logo}
          tag={p.tag}
        />
      ))}
    </div>
  );
}
