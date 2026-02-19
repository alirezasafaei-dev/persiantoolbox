export const ONLINE_REQUIRED_PATHS = ['/pro', '/account', '/dashboard'] as const;

export const ONLINE_REQUIRED_PREFIXES = ['/pro/', '/checkout/'] as const;

export function isOnlineRequiredPath(pathname: string): boolean {
  if (ONLINE_REQUIRED_PATHS.includes(pathname as (typeof ONLINE_REQUIRED_PATHS)[number])) {
    return true;
  }
  return ONLINE_REQUIRED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
