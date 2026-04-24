import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { login } from '../services/authService';
import { colors, fonts } from '../config/theme';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'Tüm alanları doldur');
      return;
    }
    const sonuc = await login(email, password);
    if (!sonuc.success) {
      Alert.alert('Hata', sonuc.message);
    }
  };

  const comingSoon = () => Alert.alert('Yakında', 'Bu özellik yakında eklenecek.');

  return (
    <SafeAreaView style={styles.safe}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>

      <View style={styles.container}>
        <Text style={styles.title}>GİRİŞ YAP</Text>

        {/* Input kartı */}
        <View style={styles.inputCard}>
          <TextInput
            style={styles.input}
            placeholder="Email or username"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View style={styles.divider} />
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Password"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword((v) => !v)}>
              <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Şifremi unuttum */}
        <TouchableOpacity onPress={comingSoon}>
          <Text style={styles.forgotText}>Şifremi unuttum</Text>
        </TouchableOpacity>

        {/* Giriş butonu */}
        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} activeOpacity={0.85}>
          <Text style={styles.loginBtnText}>GİRİŞ YAP</Text>
        </TouchableOpacity>

        <View style={styles.spacer} />

        {/* Google & Apple */}
        <View style={styles.socialRow}>
          <TouchableOpacity
            style={[styles.socialBtn, { backgroundColor: colors.googleBtn, shadowColor: colors.googleBtnShadow }]}
            onPress={comingSoon}
            activeOpacity={0.85}
          >
            <View style={styles.gCircle}>
              <Text style={styles.gText}>G</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.socialBtn, { backgroundColor: colors.appleBtn, shadowColor: colors.appleBtnShadow }]}
            onPress={comingSoon}
            activeOpacity={0.85}
          >
            <Text style={styles.appleIcon}></Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backBtn: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backArrow: {
    fontSize: 28,
    color: colors.text,
    fontWeight: '300',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
  },
  title: {
    fontFamily: fonts.poppinsExtraBold,
    fontSize: 30,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 32,
  },
  inputCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  input: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.text,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  divider: {
    height: 1,
    backgroundColor: colors.inputBorder,
    marginHorizontal: 20,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
  },
  eyeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  eyeIcon: {
    fontSize: 18,
  },
  forgotText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: '#E00000',
    textAlign: 'center',
    marginBottom: 28,
  },
  loginBtn: {
    backgroundColor: colors.primary,
    borderRadius: 50,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  loginBtnText: {
    fontFamily: fonts.poppinsBold,
    fontSize: 16,
    color: colors.white,
    letterSpacing: 2,
  },
  spacer: { flex: 1 },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingBottom: 8,
  },
  socialBtn: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  gCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gText: {
    fontFamily: fonts.poppinsBold,
    fontSize: 22,
    color: colors.googleBtn,
    lineHeight: 26,
  },
  appleIcon: {
    fontSize: 36,
    color: colors.white,
    lineHeight: 42,
  },
});
