import {
  Ear,
  EyeOff,
  Hand,
  HelpCircle,
  Layers,
  ListOrdered,
  Music2,
  Puzzle,
  Search,
  SearchCheck,
  Spline,
  Shapes,
  Volume2,
  type LucideIcon,
} from "lucide-react";
import type { GameType } from "@/content/types";

export const GAME_TYPE_ICON: Record<GameType, LucideIcon> = {
  ligar: Spline,
  memoria: Layers,
  "onde-esta": Search,
  intruso: Shapes,
  "quem-sou-eu": HelpCircle,
  "siga-comando": Hand,
  ordem: ListOrdered,
  "monte-frase": Puzzle,
  silabas: Music2,
  rima: Volume2,
  "som-inicial": SearchCheck,
  escute: Ear,
  desapareceu: EyeOff,
};
