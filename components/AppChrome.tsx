"use client";

import AmbientBackground from "./AmbientBackground";
import CustomCursor from "./CustomCursor";
import LoadingScreen from "./LoadingScreen";

export default function AppChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LoadingScreen />
      <AmbientBackground />
      <CustomCursor />
      {children}
    </>
  );
}
