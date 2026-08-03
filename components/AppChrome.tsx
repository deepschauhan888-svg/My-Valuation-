"use client";

import CustomCursor from "./CustomCursor";
import LoadingScreen from "./LoadingScreen";

export default function AppChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LoadingScreen />
      <CustomCursor />
      {children}
    </>
  );
}
