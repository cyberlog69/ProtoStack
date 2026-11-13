import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getLayerColor(layer: string): string {
  switch (layer) {
    case 'Application':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    case 'Presentation':
      return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    case 'Session':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'Transport':
      return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
    case 'Network':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'Data Link':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'Physical':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }
}

export function getCategoryBadge(category: string): { label: string; color: string } {
  switch (category) {
    case 'network':
      return { label: 'Network & Core', color: 'bg-blue-500/15 text-blue-300 border-blue-500/30' };
    case 'transport':
      return { label: 'Transport Layer', color: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' };
    case 'application':
      return { label: 'Application Layer', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' };
    case 'iot':
      return { label: 'Internet of Things (IoT)', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' };
    case 'security':
      return { label: 'Security & Auth', color: 'bg-rose-500/15 text-rose-300 border-rose-500/30' };
    case 'wireless':
      return { label: 'Wireless & Radio', color: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' };
    case 'cloud':
      return { label: 'Cloud & Messaging', color: 'bg-purple-500/15 text-purple-300 border-purple-500/30' };
    default:
      return { label: category, color: 'bg-slate-500/15 text-slate-300 border-slate-500/30' };
  }
}

