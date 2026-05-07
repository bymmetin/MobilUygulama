import { useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { login } from '../services/authService';
import { colors, fonts } from '../config/theme';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const passwordRef = useRef(null);

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
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
          <View style={styles.divider} />
          <View style={styles.passwordRow}>
            <TextInput
              ref={passwordRef}
              style={[styles.input, styles.passwordInput]}
              placeholder="Password"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
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

        {/* Kayıt ol linki */}
        <View style={styles.registerRow}>
          <Text style={styles.registerLabel}>Hesabın yok mu? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Kayıt ol</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.spacer} />

        {/* Google & Apple */}
        <View style={styles.socialRow}>
          <TouchableOpacity
            style={[styles.socialBtn, { backgroundColor: colors.googleBtn, borderBottomColor: colors.googleBtnShadow }]}
            onPress={comingSoon}
            activeOpacity={0.85}
          >
            <Text style={styles.gText}>G</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.socialBtn, { backgroundColor: colors.appleBtn, borderBottomColor: colors.appleBtnShadow }]}
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
    paddingTop: 18,
    paddingBottom: 13,
    alignItems: 'center',
    borderBottomWidth: 6,
    borderBottomColor: colors.primaryDark,
    elevation: 3,
  },
  loginBtnText: {
    fontFamily: fonts.poppinsBold,
    fontSize: 16,
    color: colors.white,
    letterSpacing: 2,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  registerLabel: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted },
  registerLink: { fontFamily: fonts.bold, fontSize: 14, color: colors.success },

  spacer: { flex: 1 },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingBottom: 8,
  },
  socialBtn: {
    width: 80,
    height: 74,         // 80 - borderBottom 6
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 6,
    elevation: 3,
    // borderBottomColor → inline set ediliyor
  },
  gText: {
    fontFamily: fonts.poppinsExtraBold,
    fontSize: 34,
    color: colors.white,
    lineHeight: 40,
  },
  appleIcon: {
    fontSize: 36,
    color: colors.white,
    lineHeight: 42,
  },
});
