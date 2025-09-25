"use client";

import { useEffect, useRef, useState } from "react";

export default function VideoBackground() {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const onCanPlay = () => setReady(true);
    const onError = () => setError(true);
    v.addEventListener("canplay", onCanPlay);
    v.addEventListener("error", onError);
    return () => {
      v.removeEventListener("canplay", onCanPlay);
      v.removeEventListener("error", onError);
    };
  }, []);

  return (
    <div className="absolute inset-0 -z-10">
      {!error && (
        <video
          ref={ref}
          className={`w-full h-full object-cover ${ready ? "opacity-90" : "opacity-40"} transition-opacity duration-700`}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          poster="/og.png"
          src="/bg.mp4"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/50 to-black/70" />
    </div>
  );
}
