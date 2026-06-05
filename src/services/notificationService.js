import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

// Expo Go tespiti: SDK 53 ile birlikte expo-notifications Expo Go'da çalışmıyor.
// Development build veya üretim APK'sında sorunsuz çalışır.
// Constants.appOwnership === 'expo' → Expo Go içinde çalışıyoruz demektir.
const isExpoGo = Constants.appOwnership === 'expo';

// Bildirim geldiğinde nasıl gösterilsin (uygulama açıkken de)
// Expo Go'da bu çağrı hata/uyarı ürettiği için guard eklendi
if (!isExpoGo) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

// Bildirim izni iste
// Expo Go'da veya fiziksel cihaz değilse sessizce false döner
export const requestPermission = async () => {
  if (isExpoGo) return false;    // Expo Go → bildirim desteklenmiyor
  if (!Device.isDevice) return false; // Emülatörde çalışmaz

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

// Günlük saat 20:00'de hatırlatma planla
// Expo Go'da çalışmaz — sessizce çıkar, uygulama etkilenmez
export const scheduleDailyReminder = async () => {
  if (isExpoGo) return; // Expo Go'da desteklenmiyor

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
  if (isExpoGo) return; // Expo Go'da desteklenmiyor
  await Notifications.cancelAllScheduledNotificationsAsync();
};
