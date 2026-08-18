import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combina clases de Tailwind de forma segura, resolviendo conflictos.
 * Ideal para construir componentes UI reutilizables (Modular UI).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
