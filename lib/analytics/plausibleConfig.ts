const ENABLED_VALUES = new Set(['1', 'true', 'yes', 'on']);

export function getPlausibleScriptUrl(): string | null {
  const raw = process.env['NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL']?.trim();
  if (!raw) {
    return null;
  }

  try {
    const url = new URL(raw);
    if (
      url.protocol !== 'https:' ||
      url.hostname !== 'plausible.io' ||
      !url.pathname.startsWith('/js/') ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    ) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

export function isPlausiblePilotEnabled(): boolean {
  const enabled = ENABLED_VALUES.has(
    process.env['NEXT_PUBLIC_PLAUSIBLE_ENABLED']?.trim().toLowerCase() ?? '',
  );
  return enabled && getPlausibleScriptUrl() !== null;
}

export function getPlausibleOrigin(): string | null {
  const scriptUrl = getPlausibleScriptUrl();
  return scriptUrl ? new URL(scriptUrl).origin : null;
}
