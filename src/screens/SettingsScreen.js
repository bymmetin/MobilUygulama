import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Switch,
  TouchableOpacity, Alert, Modal, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSettings, setSetting, DEFAULT_SETTINGS } from '../services/settingsService';
import { scheduleDailyReminder, cancelReminders } from '../services/notificationService';
import { logout, getCurrentUser } from '../services/authService';
import { supabase } from '../config/supabase';
import { colors, fonts } from '../config/theme';

const APP_VERSION = '1.0.0';

export default function SettingsScreen({ navigation }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [user, setUser] = useState(null);

  // Modal state
  const [editModal, setEditModal] = useState(false);
  const [pwModal, setPwModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettings().then(setSettings);
    getCurrentUser().then(setUser);
  }, []);

  const toggle = async (key) => {
    const next = await setSetting(key, !settings[key]);
    setSettings(next);
    if (key === 'notifications') {
      if (next.notifications) await scheduleDailyReminder();
      else await cancelReminders();
    }
  };

  const handleSoon = (label) => {
    Alert.alert(label, 'Bu özellik yakında eklenecek.');
  };

  const handleLogout = () => {
    Alert.alert('Çıkış yap', 'Hesabından çıkmak istiyor musun?', [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Çıkış yap', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const handleEditUsername = async () => {
    if (!newUsername.trim()) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ username: newUsername.trim() })
      .eq('id', user.id);
    if (error) {
      Alert.alert('Hata', error.message);
    } else {
      const updated = { ...user, username: newUsername.trim() };
      await AsyncStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);
      setEditModal(false);
      setNewUsername('');
      Alert.alert('Tamam', 'Kullanıcı adın güncellendi');
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalı');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor');
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      Alert.alert('Hata', error.message);
    } else {
      Alert.alert('Başarılı', 'Şifren güncellendi');
      setPwModal(false);
      setNewPassword('');
      setConfirmPassword('');
    }
    setSaving(false);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Hesabı Sil',
      'Tüm verilen kalıcı olarak silinecek. Emin misin?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Evet, Sil',
          style: 'destructive',
          onPress: async () => {
            // Önce kullanıcıyı sil (oturum hâlâ geçerli olmalı)
            await supabase.rpc('delete_own_account').catch(() => {});
            // Sonra oturumu hem sunucuda hem cihazda temizle
            await supabase.auth.signOut({ scope: 'global' });
            await logout();
          },
        },
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
          <SettingRow label="Ses Efektleri" description="Doğru/yanlış cevap sesleri" value={settings.soundEffects} onToggle={() => toggle('soundEffects')} />
          <Divider />
          <SettingRow label="Arka Plan Müziği" description="Uygulama içi müzik" value={settings.music} onToggle={() => toggle('music')} />
          <Divider />
          <SettingRow label="Bildirimler" description="Her gün 20:00'de hatırlatma" value={settings.notifications} onToggle={() => toggle('notifications')} />
        </View>

        <Text style={styles.sectionTitle}>GÖRÜNÜM</Text>
        <View style={styles.card}>
          <SettingRow label="Karanlık Mod" description="Koyu renk teması" value={settings.darkMode} onToggle={() => toggle('darkMode')} />
        </View>

        <Text style={styles.sectionTitle}>HESAP</Text>
        <View style={styles.card}>
          <ActionRow
            label="Kullanıcı Adını Değiştir"
            onPress={() => { setNewUsername(user?.username ?? ''); setEditModal(true); }}
          />
          <Divider />
          <ActionRow label="Şifre Değiştir" onPress={() => setPwModal(true)} />
          <Divider />
          <ActionRow label="Hesabı Sil" onPress={handleDeleteAccount} danger />
        </View>

        <Text style={styles.sectionTitle}>HAKKINDA</Text>
        <View style={styles.card}>
          <InfoRow label="Uygulama Sürümü" value={APP_VERSION} />
          <Divider />
          <ActionRow label="Gizlilik Politikası" onPress={() => handleSoon('Gizlilik Politikası')} />
          <Divider />
          <ActionRow label="Kullanım Koşulları" onPress={() => handleSoon('Kullanım Koşulları')} />
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Text style={styles.logoutText}>ÇIKIŞ YAP</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Kullanıcı adı modal */}
      <Modal visible={editModal} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Kullanıcı Adını Değiştir</Text>
            <TextInput
              style={styles.modalInput}
              value={newUsername}
              onChangeText={setNewUsername}
              placeholder="Yeni kullanıcı adı"
              autoCapitalize="none"
              autoFocus
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setEditModal(false)}>
                <Text style={styles.modalCancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSave, saving && { opacity: 0.5 }]}
                onPress={handleEditUsername}
                disabled={saving}
              >
                <Text style={styles.modalSaveText}>{saving ? '...' : 'Kaydet'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Şifre modal */}
      <Modal visible={pwModal} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Şifre Değiştir</Text>
            <TextInput
              style={styles.modalInput}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Yeni şifre (min. 6 karakter)"
              secureTextEntry
              autoFocus
            />
            <TextInput
              style={[styles.modalInput, { marginTop: 10 }]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Şifreyi tekrar gir"
              secureTextEntry
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => { setPwModal(false); setNewPassword(''); setConfirmPassword(''); }}
              >
                <Text style={styles.modalCancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSave, saving && { opacity: 0.5 }]}
                onPress={handleChangePassword}
                disabled={saving}
              >
                <Text style={styles.modalSaveText}>{saving ? '...' : 'Kaydet'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: colors.magenta,
    borderBottomWidth: 5, borderBottomColor: colors.magentaDark,
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backBtnText: { fontSize: 38, color: colors.white, fontWeight: '700', marginTop: -6 },
  headerTitle: {
    fontSize: 20, fontWeight: '900', color: colors.white, letterSpacing: 3,
    fontFamily: fonts.poppinsExtraBold,
  },

  scroll: { padding: 20, paddingBottom: 48 },

  sectionTitle: {
    fontSize: 12, fontWeight: '900', color: colors.textMuted,
    letterSpacing: 2, marginTop: 20, marginBottom: 8, marginLeft: 4,
  },

  card: {
    backgroundColor: colors.cardBg, borderRadius: 16, overflow: 'hidden',
    borderBottomWidth: 4, borderBottomColor: colors.imgPlaceholder,
  },

  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingVertical: 14, minHeight: 56,
  },
  rowLabelBox: { flex: 1, paddingRight: 12 },
  rowLabel: { fontSize: 16, fontWeight: '700', color: colors.text },
  rowDesc: { fontSize: 12, color: colors.textMuted, marginTop: 2, fontWeight: '500' },
  rowValue: { fontSize: 14, color: colors.textMuted, fontWeight: '700' },
  chevron: { fontSize: 28, color: colors.textMuted, fontWeight: '700' },
  danger: { color: '#EF4444' },
  divider: { height: 1, backgroundColor: 'rgba(128,0,128,0.1)', marginHorizontal: 18 },

  logoutBtn: {
    marginTop: 28, borderWidth: 2, borderColor: '#EF4444',
    borderBottomWidth: 5, borderRadius: 16,
    paddingTop: 14, paddingBottom: 10, alignItems: 'center',
  },
  logoutText: { color: '#EF4444', fontWeight: '900', fontSize: 16, letterSpacing: 2 },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { backgroundColor: colors.background, borderRadius: 20, padding: 24, width: '85%' },
  modalTitle: { fontSize: 18, fontWeight: '900', color: colors.text, marginBottom: 16 },
  modalInput: {
    borderWidth: 1.5, borderColor: '#B8B0BC', borderRadius: 12,
    padding: 12, fontSize: 15, backgroundColor: colors.white,
  },
  modalBtns: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 20 },
  modalCancel: { paddingVertical: 10, paddingHorizontal: 18 },
  modalCancelText: { fontSize: 15, color: colors.textMuted, fontWeight: '600' },
  modalSave: { backgroundColor: colors.magenta, paddingVertical: 10, paddingHorizontal: 22, borderRadius: 12 },
  modalSaveText: { fontSize: 15, color: colors.white, fontWeight: '800' },
});
