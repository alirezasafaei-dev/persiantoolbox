type DeferredTaskOptions = {
  fallbackDelayMs?: number;
  idleTimeoutMs?: number;
  maxWaitMs?: number;
};

type IdleDeadlineLike = {
  didTimeout: boolean;
  timeRemaining: () => number;
};

type RequestIdleCallback = (
  callback: (deadline: IdleDeadlineLike) => void,
  options?: { timeout: number },
) => number;
type CancelIdleCallback = (handle: number) => void;

function getRequestIdleCallback(): RequestIdleCallback | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return (
    (window as Window & { requestIdleCallback?: RequestIdleCallback }).requestIdleCallback ?? null
  );
}

function getCancelIdleCallback(): CancelIdleCallback | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return (
    (window as Window & { cancelIdleCallback?: CancelIdleCallback }).cancelIdleCallback ?? null
  );
}

export function scheduleDeferredTask(
  task: () => void,
  options: DeferredTaskOptions = {},
): () => void {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const fallbackDelayMs = options.fallbackDelayMs ?? 600;
  const idleTimeoutMs = options.idleTimeoutMs ?? 1200;
  const maxWaitMs = options.maxWaitMs ?? 4500;

  let cancelled = false;
  let executed = false;
  let idleScheduled = false;
  let loadTimer: number | null = null;
  let idleTimer: number | null = null;
  let maxWaitTimer: number | null = null;
  let idleHandle: number | null = null;

  const clearTimers = () => {
    if (loadTimer !== null) {
      window.clearTimeout(loadTimer);
    }
    if (idleTimer !== null) {
      window.clearTimeout(idleTimer);
    }
    if (maxWaitTimer !== null) {
      window.clearTimeout(maxWaitTimer);
    }
    const cancelIdleCallback = getCancelIdleCallback();
    if (idleHandle !== null && cancelIdleCallback) {
      cancelIdleCallback(idleHandle);
    }
    loadTimer = null;
    idleTimer = null;
    maxWaitTimer = null;
    idleHandle = null;
  };

  function onLoad() {
    if (cancelled || executed) {
      return;
    }
    scheduleIdle();
  }

  const execute = () => {
    if (cancelled || executed) {
      return;
    }
    executed = true;
    window.removeEventListener('load', onLoad);
    clearTimers();
    task();
  };

  const scheduleIdle = () => {
    if (cancelled || executed || idleScheduled) {
      return;
    }
    idleScheduled = true;
    const requestIdleCallback = getRequestIdleCallback();
    if (requestIdleCallback) {
      idleHandle = requestIdleCallback(() => execute(), { timeout: idleTimeoutMs });
      return;
    }
    idleTimer = window.setTimeout(execute, fallbackDelayMs);
  };

  if (document.readyState === 'complete') {
    scheduleIdle();
  } else {
    window.addEventListener('load', onLoad, { once: true });
    loadTimer = window.setTimeout(() => {
      window.removeEventListener('load', onLoad);
      scheduleIdle();
    }, fallbackDelayMs);
  }

  maxWaitTimer = window.setTimeout(() => {
    window.removeEventListener('load', onLoad);
    execute();
  }, maxWaitMs);

  return () => {
    cancelled = true;
    window.removeEventListener('load', onLoad);
    clearTimers();
  };
}
