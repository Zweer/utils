export function escapeRegex(regex: string): string {
  return regex.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
