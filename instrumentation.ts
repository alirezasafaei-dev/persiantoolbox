import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env['NEXT_RUNTIME'] === 'nodejs') {
    await import('./sentry.server.config');

    process.on('unhandledRejection', (reason: unknown) => {
      console.error('[UNHANDLED_REJECTION]', reason);
    });

    process.on('uncaughtException', (error: Error) => {
      console.error('[UNCAUGHT_EXCEPTION]', error);
    });
  }

  if (process.env['NEXT_RUNTIME'] === 'edge') {
    await import('./sentry.edge.config');
  }
}

export const onRequestError = Sentry.captureRequestError;
