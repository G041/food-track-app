import { useQuery } from '@tanstack/react-query';

// Respuesta de /api/menu-preview (función de Vercel en el repo food-track-web: api/menu-preview.ts).
export type MenuPreview = {
  /** unverified: el sitio rechaza al servidor (anti-bots), pero puede andar en el navegador. */
  status: 'embeddable' | 'blocked' | 'broken' | 'unverified' | 'unreachable' | 'invalid';
  kind: 'html' | 'pdf';
  /** URL a cargar en el WebView (puede diferir del link original, p. ej. Google Drive → /preview). */
  embedUrl: string | null;
  finalUrl: string | null;
  httpStatus: number | null;
  title: string | null;
};

// Las funciones del servidor viven en el deploy de la web (food-track-web en Vercel).
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://food-track-web.vercel.app';

async function fetchPreview(url: string): Promise<MenuPreview | null> {
  try {
    const res = await fetch(`${API_URL}/api/menu-preview?url=${encodeURIComponent(url)}`);
    if (!res.ok || !res.headers.get('content-type')?.includes('json')) return null;
    return (await res.json()) as MenuPreview;
  } catch {
    return null; // sin verificador (p. ej. desarrollo local): se intenta mostrar igual
  }
}

/** Verifica del lado del servidor si el menú se puede mostrar dentro de la app. */
export function useMenuPreview(url: string | undefined) {
  return useQuery({
    queryKey: ['menu-preview', url],
    queryFn: () => fetchPreview(url!),
    enabled: !!url,
    staleTime: 60 * 60_000,
  });
}
