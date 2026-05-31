import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Bildirim geldiğinde nasıl gösterilsin (uygulama açıkken de)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// Bildirim izni iste
export const requestPermission = async () => {
  if (!Device.isDevice) return false; // Emülatörde çalışmaz

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

// Günlük saat 20:00'de hatırlatma planla
export const scheduleDailyReminder = async () => {
  const granted = await requestPermission();
  if (!granted) return;

  // Önce eski bildirimleri iptal et (tekrar planlarken çakışmasın)
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '📜 Mnemo seni bekliyor!',
      body: 'Bugünkü dersin ve günlük bilgi kartın hazır. Streak\'ini kaybetme! 🔥',
      sound: false,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 20,
      minute: 0,
    },
  });
};

// Bildirimleri tamamen iptal et
export const cancelReminders = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};
