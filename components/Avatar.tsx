"use client";
import { useState } from "react";

export default function Avatar({ src, name, size = 56 }: { src?: string; name: string; size?: number }) {
  const [bad, setBad] = useState(false);
  const style = { width: size, height: size };
  if (!src || bad) {
    return (
      <div style={style} className="rounded-full bg-purple-700 flex items-center justify-center font-bold shrink-0">
        {name.slice(0, 2).toUpperCase()}
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={name} style={style} onError={() => setBad(true)} className="rounded-full object-cover shrink-0" />;
}
