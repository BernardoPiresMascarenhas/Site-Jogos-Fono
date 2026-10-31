import type { CategoryId } from "./types";

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "animais", label: "Animais" },
  { id: "alimentos", label: "Alimentos" },
  { id: "objetos", label: "Objetos" },
  { id: "corpo", label: "Corpo" },
  { id: "higiene", label: "Higiene" },
  { id: "roupas", label: "Roupas" },
  { id: "transportes", label: "Transportes" },
];

export function categoryLabel(id: CategoryId): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}
