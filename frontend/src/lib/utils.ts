import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizeText(text: string) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
}
import { BACKEND_URL } from "./config"

export function getImageUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  return `${BACKEND_URL}${url}`;
}

export function compressImage(file: File, _maxWidth = 400, _maxHeight = 400, _quality = 0.7): Promise<File> {
  return Promise.resolve(file);
}

