import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function downloadBlobAsPdf(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

// Helper to format currency
export const formatCurrency = (value: number) => {
  if (isNaN(value) || value === null) return "N/A";
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

// Helper to get badge variant based on viability
export const getViabilityVariant = (viability: string = ""): "default" | "destructive" | "secondary" => {
  const lowerCaseViability = viability.toLowerCase();
  if (lowerCaseViability.includes("crítico") || lowerCaseViability.includes("no recomendable")) {
    return "destructive";
  }
  if (lowerCaseViability.includes("viable con") || lowerCaseViability.includes("moderado")) {
    return "secondary";
  }
  if (lowerCaseViability.includes("viable")) {
    return "default";
  }
  return "secondary";
};
