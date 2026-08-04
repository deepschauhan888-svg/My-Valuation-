"use client";

import { useRef } from "react";

export default function SpotlightCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    ref.current?.style.setProperty("--spot-x", `${x}%`);
    ref.current?.style.setProperty("--spot-y", `${y}%`);
  }

  return (
    <div ref={ref} onMouseMove={handleMove} className={`spotlight-card ${className}`}>
      {children}
    </div>
  );
}
