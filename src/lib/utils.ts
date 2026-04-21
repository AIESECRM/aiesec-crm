import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
/**
 * Verilen tarihi dd/mm/yyyy formatına çevirir.
 * @param dateInput - Çevrilecek tarih objesi veya string'i
 */
export function formatDate(dateInput: Date | string | number | null | undefined): string {
  if (!dateInput) return '-';

  const d = new Date(dateInput);

  // Gün ve ayı iki haneli yapmak için padStart kullanıyoruz (Örn: 5 -> 05)
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
}