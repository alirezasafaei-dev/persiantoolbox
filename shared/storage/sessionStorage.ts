export function setSessionJson<T>(key: string, value: T): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    return;
  }
}

export function getSessionJson<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function removeSession(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch {
    return;
  }
}
