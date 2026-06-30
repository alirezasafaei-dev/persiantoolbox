export function registerProcessHandlers() {
  if (typeof process !== 'undefined' && typeof process.on === 'function') {
    process.on('unhandledRejection', (reason: unknown) => {
      console.error('[UNHANDLED_REJECTION]', reason);
    });

    process.on('uncaughtException', (error: Error) => {
      console.error('[UNCAUGHT_EXCEPTION]', error);
    });
  }
}
