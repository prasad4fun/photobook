import * as Sentry from '@sentry/react';
import { SENTRY_DSN, SENTRY_ENV } from './constants';

export function initSentry() {
  if (!SENTRY_DSN) {
    console.log('Sentry DSN not configured, skipping initialization');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENV,
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: SENTRY_ENV === 'production' ? 0.1 : 1.0,
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    // Filter out non-critical errors
    beforeSend(event, _hint) {
      // Don't send errors from browser extensions
      if (event.exception?.values?.[0]?.stacktrace?.frames?.some(
        (frame) => frame.filename?.includes('extensions/')
      )) {
        return null;
      }
      return event;
    },
  });
}

export function captureError(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, { extra: context });
}

export function setUserContext(userId: string, email?: string) {
  Sentry.setUser({ id: userId, email });
}

export function clearUserContext() {
  Sentry.setUser(null);
}

export function addBreadcrumb(message: string, category: string, data?: Record<string, any>) {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
}
