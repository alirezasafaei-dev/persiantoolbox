import {Platform} from 'react-native';
import notifee, {AndroidImportance} from '@notifee/react-native';

export async function requestNotificationPermission() {
  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      importance: AndroidImportance.HIGH,
    });
  }

  const settings = await notifee.requestPermission();
  return settings.authorizationStatus;
}

export async function sendLocalNotification(title: string, body: string) {
  await notifee.displayNotification({
    title,
    body,
    android: {
      channelId: 'default',
      smallIcon: 'ic_launcher',
    },
    ios: {
      sound: 'default',
    },
  });
}

export async function scheduleNotification(
  title: string,
  body: string,
  delay: number,
) {
  await notifee.createTriggerNotification(
    {
      title,
      body,
      android: {
        channelId: 'default',
      },
    },
    {
      type: 0,
      timestamp: Date.now() + delay,
    },
  );
}
