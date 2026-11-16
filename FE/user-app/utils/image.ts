import { BASE_URL } from '@/services/api';

export function getImageUrl(path?: string): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const base = BASE_URL.replace('/api', '');
  return `${base}/${path.replace(/^\//, '')}`;
}
