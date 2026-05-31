import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Switch,
  TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getSettings, setSetting, DEFAULT_SETTINGS } from '../services/settingsService';
import { logout } from '../services/authService';
import { colors, fonts } from '../config/theme';

const APP_VERSION = '1.0.0';

export default function SettingsScreen({ navigation }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  const toggle = async (key) => {
    const next = await setSetting(key, !settings[key]);
    setSettings(next);
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
          <SettingRow
            label="Ses Efektleri"
            description="Doğru/yanlış cevap sesleri"
            value={settings.soundEffects}
            onToggle={() => toggle('soundEffects')}
          />
          <Divider />
          <SettingRow
            label="Arka Plan Müziği"
            description="Uygulama içi müzik"
            value={settings.music}
            onToggle={() => toggle('music')}
          />
          <Divider />
          <SettingRow
            label="Bildirimler"
            description="Günlük hatırlatmalar"
            value={settings.notifications}
            onToggle={() => toggle('notifications')}
          />
        </View>

        <Text style={styles.sectionTitle}>GÖRÜNÜM</Text>
        <View style={styles.card}>
          <SettingRow
            label="Karanlık Mod"
            description="Koyu renk teması"
            value={settings.darkMode}
            onToggle={() => toggle('darkMode')}
          />
        </View>

        <Text style={styles.sectionTitle}>HESAP</Text>
        <View style={styles.card}>
          <ActionRow label="Profili Düzenle" onPress={() => handleSoon('Profili düzenle')} />
          <Divider />
          <ActionRow label="Şifre Değiştir" onPress={() => handleSoon('Şifre değiştir')} />
          <Divider />
          <ActionRow label="Hesabı Sil" onPress={handleDeleteAccount} danger />
        </View>

        <Text style={styles.sectionTitle}>HAKKINDA</Text>
        <View style={styles.card}>
          <InfoRow label="Uygulama Sürümü" value={APP_VERSION} />
          <Divider />
          <ActionRow label="Gizlilik Politikası" onPress={() => handleSoon('Gizlilik politikası')} />
          <Divider />
          <ActionRow label="Kullanım Koşulları" onPress={() => handleSoon('Kullanım koşulları')} />
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Text style={styles.logoutText}>ÇIKIŞ YAP</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

function SettingRow({ label, description, value, onToggle }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLabelBox}>
        <Text style={styles.rowLabel}>{label}</Text>
        {description && <Text style={styles.rowDesc}>{description}</Text>}
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

function ActionRow({ label, onPress, danger }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <Text style={[styles.rowLabel, danger && styles.danger]}>{label}</Text>
      <Text style={[styles.chevron, danger && styles.danger]}>›</Text>
    </TouchableOpacity>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.magenta,
    borderBottomWidth: 5,
    borderBottomColor: colors.magentaDark,
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backBtnText: { fontSize: 38, color: colors.white, fontWeight: '700', marginTop: -6 },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: 3,
    fontFamily: fonts.poppinsExtraBold,
  },

  scroll: { padding: 20, paddingBottom: 48 },

  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#7A7080',
    letterSpacing: 2,
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
  },

  card: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    overflow: 'hidden',
    borderBottomWidth: 5,
    borderBottomColor: '#A098A8',
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
  rowLabel: { fontSize: 16, fontWeight: '700', color: '#3A3040' },
  rowDesc: { fontSize: 12, color: '#7A7080', marginTop: 2, fontWeight: '500' },
  rowValue: { fontSize: 14, color: '#7A7080', fontWeight: '700' },
  chevron: { fontSize: 28, color: '#9A9098', fontWeight: '700' },
  danger: { color: '#D02020' },

  divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.07)', marginHorizontal: 18 },

  logoutBtn: {
    marginTop: 28,
    backgroundColor: '#FFF0F0',
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderTopColor: '#EF4444',
    borderLeftColor: '#EF4444',
    borderRightColor: '#EF4444',
    borderBottomWidth: 5,
    borderBottomColor: '#EF4444',
    borderRadius: 16,
    paddingTop: 14,
    paddingBottom: 10,
    alignItems: 'center',
  },
  logoutText: { color: '#EF4444', fontWeight: '900', fontSize: 16, letterSpacing: 2 },
});
