"use client";

export default function AmbientBackground() {
  return (
    <div aria-hidden className="fixed inset-0 -z-50 pointer-events-none overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03] grain-texture"
        style={{ mixBlendMode: "overlay" }}
      />
      <div
        className="absolute -top-1/4 -left-1/4 w-[60vw] h-[60vw] rounded-full opacity-[0.05] dark:opacity-[0.07] blur-3xl animate-[float-a_26s_ease-in-out_infinite]"
        style={{ background: "radial-gradient(circle, #9C7A45, transparent 70%)" }}
      />
      <div
        className="absolute -bottom-1/4 -right-1/4 w-[55vw] h-[55vw] rounded-full opacity-[0.045] dark:opacity-[0.06] blur-3xl animate-[float-b_32s_ease-in-out_infinite]"
        style={{ background: "radial-gradient(circle, #3D8F68, transparent 70%)" }}
      />
    </div>
  );
}
