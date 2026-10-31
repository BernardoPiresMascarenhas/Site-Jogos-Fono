"use client";

import { MotionConfig } from "motion/react";
import { SoundProvider } from "@/lib/audio/sound-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <SoundProvider>{children}</SoundProvider>
    </MotionConfig>
  );
}
