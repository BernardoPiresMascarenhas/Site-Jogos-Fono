import { Layers, Search, Spline, type LucideIcon } from "lucide-react";
import type { GameType } from "@/content/types";

export const GAME_TYPE_ICON: Record<GameType, LucideIcon> = {
  ligar: Spline,
  memoria: Layers,
  "onde-esta": Search,
};
