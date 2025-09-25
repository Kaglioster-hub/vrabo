"use client";
export default function HeroBackdrop({children}:{children:React.ReactNode}){
  return (
    <div className="hero-backdrop p-4 sm:p-6 lg:p-8">
      <span className="hero-mark" aria-hidden />
      {children}
    </div>
  );
}
