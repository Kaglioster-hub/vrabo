"use client";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useCallback } from "react";

export function PartnerCard({ name, href, logo, tag }:{ name:string; href:string; logo:string; tag?:string }){
  const [imgErr, setImgErr] = useState(false);
  const initials = useMemo(()=> name.trim().split(/\s+/).map(s=>s[0]).slice(0,2).join("").toUpperCase(), [name]);
  const onError = useCallback(()=>setImgErr(true),[]);
  const onMove = (e: React.MouseEvent<HTMLAnchorElement>)=>{
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    e.currentTarget.style.setProperty("--rx", `${-y*6}deg`);
    e.currentTarget.style.setProperty("--ry", `${x*6}deg`);
    e.currentTarget.style.setProperty("--mx", `${((e.clientX - r.left)/r.width)*100}%`);
  };
  const onLeave = (e: React.MouseEvent<HTMLAnchorElement>)=>{
    e.currentTarget.style.removeProperty("--rx");
    e.currentTarget.style.removeProperty("--ry");
    e.currentTarget.style.removeProperty("--mx");
  };
  return (
    <Link href={href} target="_blank" rel="noopener noreferrer" aria-label={name}
      className="partner-card group" onMouseMove={onMove} onMouseLeave={onLeave}>
      <div className="partner-sheen" aria-hidden />
      {!imgErr ? (
        <Image src={logo} alt={name} fill unoptimized sizes="(max-width: 768px) 45vw, 180px"
          className="object-contain p-6 opacity-90 group-hover:opacity-100 transition-opacity duration-150" onError={onError} />
      ) : (<div className="partner-fallback">{initials}</div>)}
      <span className="partner-label">{name}</span>
      {tag ? <span className="partner-badge">{tag}</span> : null}
    </Link>
  );
}
