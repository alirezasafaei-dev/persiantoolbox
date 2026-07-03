'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type PushNotificationState = 'unsupported' | 'denied' | 'default' | 'subscribed' | 'loading';

interface PushSubscriptionResponse {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function registerPushWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw-push.js');
    await navigator.serviceWorker.ready;
    return registration;
  } catch (error) {
    console.error('Push service worker registration failed:', error);
    return null;
  }
}

async function getExistingSubscription(
  registration: ServiceWorkerRegistration,
): Promise<PushSubscription | null> {
  try {
    return await registration.pushManager.getSubscription();
  } catch {
    return null;
  }
}

export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>('loading');
  const [isSupported, setIsSupported] = useState(false);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);

    if (!supported) {
      setState('unsupported');
      return;
    }

    const permission = Notification.permission;
    if (permission === 'denied') {
      setState('denied');
      return;
    }

    async function init() {
      const registration = await registerPushWorker();
      if (!registration) {
        setState('unsupported');
        return;
      }

      registrationRef.current = registration;

      const subscription = await getExistingSubscription(registration);
      if (subscription) {
        setState('subscribed');
      } else {
        setState(permission === 'granted' ? 'default' : 'default');
      }
    }

    void init();
  }, []);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    setState('loading');

    try {
      const registration = registrationRef.current;
      if (!registration) {
        setState('default');
        return false;
      }

      const subscription = await getExistingSubscription(registration);
      if (!subscription) {
        setState('default');
        return true;
      }

      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });

      await subscription.unsubscribe();
      setState('default');
      return true;
    } catch (error) {
      console.error('Push unsubscribe failed:', error);
      setState('default');
      return false;
    }
  }, []);

  const subscribe = useCallback(async (): Promise<boolean> => {
    const vapidPublicKey = process.env['NEXT_PUBLIC_VAPID_PUBLIC_KEY'];
    if (!vapidPublicKey) {
      console.error('VAPID public key not configured');
      return false;
    }

    setState('loading');

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setState('denied');
        return false;
      }

      let registration = registrationRef.current;
      if (!registration) {
        registration = await registerPushWorker();
        if (!registration) {
          setState('unsupported');
          return false;
        }
        registrationRef.current = registration;
      }

      const existingSubscription = await getExistingSubscription(registration);
      if (existingSubscription) {
        await unsubscribe();
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      const subscriptionData: PushSubscriptionResponse = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: JSON.parse(JSON.stringify(subscription.toJSON().keys)).p256dh,
          auth: JSON.parse(JSON.stringify(subscription.toJSON().keys)).auth,
        },
      };

      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscriptionData),
      });

      if (response.ok) {
        setState('subscribed');
        return true;
      } else {
        await subscription.unsubscribe();
        setState('default');
        return false;
      }
    } catch (error) {
      console.error('Push subscription failed:', error);
      setState('default');
      return false;
    }
  }, [unsubscribe]);

  return {
    state,
    isSupported,
    subscribe,
    unsubscribe,
    isSubscribed: state === 'subscribed',
    isDenied: state === 'denied',
    isLoading: state === 'loading',
  };
}
