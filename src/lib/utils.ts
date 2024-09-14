import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateTotalsWithTva(priceHT: number) {
  const tva = priceHT * 0.2; // 20% TVA
  const ttc = priceHT + tva;
  return { tva, ttc };
}
