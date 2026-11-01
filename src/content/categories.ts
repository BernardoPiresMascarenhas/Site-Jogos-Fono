import type { CategoryId } from "./types";

/** Categorias de conteúdo, na ordem em que aparecem nos filtros e na configuração. */
export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "animais", label: "Animais" },
  { id: "alimentos", label: "Alimentos" },
  { id: "objetos", label: "Objetos" },
  { id: "higiene", label: "Higiene" },
  { id: "corpo", label: "Corpo humano" },
  { id: "roupas", label: "Roupas" },
  { id: "transportes", label: "Transportes" },
  { id: "natureza", label: "Natureza" },
  { id: "profissoes", label: "Profissões" },
  { id: "rotina", label: "Rotina diária" },
  { id: "historias", label: "Pequenas histórias" },
  { id: "variadas", label: "Variadas" },
];

export function categoryLabel(id: CategoryId): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function isCategoryId(value: unknown): value is CategoryId {
  return typeof value === "string" && CATEGORIES.some((c) => c.id === value);
}
