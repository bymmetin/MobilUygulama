import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Switch,
  TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Linking } from 'react-native';
import { getSettings, setSetting, DEFAULT_SETTINGS } from '../services/settingsService';
import { logout } from '../services/authService';
import { useTheme } from '../context/ThemeContext';
import { fonts } from '../config/theme';

const APP_VERSION = '1.0.0';

export default function SettingsScreen({ navigation }) {
  const { colors, toggleDark } = useTheme();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  const toggle = async (key) => {
    const next = await setSetting(key, !settings[key]);
    setSettings(next);
    if (key === 'darkMode') toggleDark(next.darkMode);
  };

  const handleLogout = () => {
    Alert.alert('Çıkış yap', 'Hesabından çıkmak istiyor musun?', [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Çıkış yap', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const handleSoon = (label) => {
    Alert.alert(label, 'Bu özellik yakında eklenecek.');
  };

  const openPrivacy = () =>
    Linking.openURL('https://policies.google.com/privacy');

  const openTerms = () =>
    Linking.openURL('https://policies.google.com/terms');

  const handleDeleteAccount = () => {
    Alert.alert(
      'Hesabı sil',
      'Bu işlem geri alınamaz. Devam etmek istiyor musun?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        { text: 'Sil', style: 'destructive', onPress: () => handleSoon('Hesap silme') },
      ]
    );
  };

  const styles = makeStyles(colors);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AYARLAR</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>

        <Text style={styles.sectionTitle}>SES VE BİLDİRİM</Text>
        <View style={styles.card}>
          <SettingRow s={styles} colors={colors} label="Ses Efektleri" description="Doğru/yanlış cevap sesleri" value={settings.soundEffects} onToggle={() => toggle('soundEffects')} />
          <Divider s={styles} />
          <SettingRow s={styles} colors={colors} label="Arka Plan Müziği" description="Uygulama içi müzik" value={settings.music} onToggle={() => toggle('music')} />
          <Divider s={styles} />
          <SettingRow s={styles} colors={colors} label="Bildirimler" description="Günlük hatırlatmalar" value={settings.notifications} onToggle={() => toggle('notifications')} />
        </View>

        <Text style={styles.sectionTitle}>GÖRÜNÜM</Text>
        <View style={styles.card}>
          <SettingRow s={styles} colors={colors} label="Karanlık Mod" description="Koyu renk teması" value={settings.darkMode} onToggle={() => toggle('darkMode')} />
        </View>

        <Text style={styles.sectionTitle}>HESAP</Text>
        <View style={styles.card}>
          <ActionRow s={styles} label="Profili Düzenle" onPress={() => handleSoon('Profili düzenle')} />
          <Divider s={styles} />
          <ActionRow s={styles} label="Şifre Değiştir" onPress={() => handleSoon('Şifre değiştir')} />
          <Divider s={styles} />
          <ActionRow s={styles} label="Hesabı Sil" onPress={handleDeleteAccount} danger />
        </View>

        <Text style={styles.sectionTitle}>HAKKINDA</Text>
        <View style={styles.card}>
          <InfoRow s={styles} label="Uygulama Sürümü" value={APP_VERSION} />
          <Divider s={styles} />
          <ActionRow s={styles} label="Gizlilik Politikası" onPress={openPrivacy} />
          <Divider s={styles} />
          <ActionRow s={styles} label="Kullanım Koşulları" onPress={openTerms} />
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Text style={styles.logoutText}>ÇIKIŞ YAP</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

function Divider({ s }) {
  return <View style={s.divider} />;
}

function SettingRow({ s, colors, label, description, value, onToggle }) {
  return (
    <View style={s.row}>
      <View style={s.rowLabelBox}>
        <Text style={s.rowLabel}>{label}</Text>
        {description && <Text style={s.rowDesc}>{description}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#B8B0BC', true: colors.magenta }}
        thumbColor={colors.white}
      />
    </View>
  );
}

function ActionRow({ s, label, onPress, danger }) {
  return (
    <TouchableOpacity style={s.row} onPress={onPress} activeOpacity={0.7}>
      <Text style={[s.rowLabel, danger && s.danger]}>{label}</Text>
      <Text style={[s.chevron, danger && s.danger]}>›</Text>
    </TouchableOpacity>
  );
}

function InfoRow({ s, label, value }) {
  return (
    <View style={s.row}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={s.rowValue}>{value}</Text>
    </View>
  );
}

const makeStyles = (c) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: c.magenta,
    borderBottomWidth: 5,
    borderBottomColor: c.magentaDark,
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backBtnText: { fontSize: 38, color: c.white, fontWeight: '700', marginTop: -6 },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: c.white,
    letterSpacing: 3,
    fontFamily: fonts.poppinsExtraBold,
  },

  scroll: { padding: 20, paddingBottom: 48 },

  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: c.textMuted,
    letterSpacing: 2,
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
  },

  card: {
    backgroundColor: c.cardBg,
    borderRadius: 16,
    overflow: 'hidden',
    borderBottomWidth: 4,
    borderBottomColor: c.imgPlaceholder,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    minHeight: 56,
  },
  rowLabelBox: { flex: 1, paddingRight: 12 },
  rowLabel: { fontSize: 16, fontWeight: '700', color: c.text },
  rowDesc: { fontSize: 12, color: c.textMuted, marginTop: 2, fontWeight: '500' },
  rowValue: { fontSize: 14, color: c.textMuted, fontWeight: '700' },
  chevron: { fontSize: 28, color: c.textMuted, fontWeight: '700' },
  danger: { color: '#EF4444' },

  divider: { height: 1, backgroundColor: 'rgba(128,0,128,0.1)', marginHorizontal: 18 },

  logoutBtn: {
    marginTop: 28,
    borderWidth: 2,
    borderColor: '#EF4444',
    borderBottomWidth: 5,
    borderRadius: 16,
    paddingTop: 14,
    paddingBottom: 10,
    alignItems: 'center',
  },
  logoutText: { color: '#EF4444', fontWeight: '900', fontSize: 16, letterSpacing: 2 },
});
