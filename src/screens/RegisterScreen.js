import { useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  Alert, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { register } from '../services/authService';
import { colors, fonts } from '../config/theme';

const GMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

function getEmailError(email) {
  if (!email) return null;
  if (!GMAIL_REGEX.test(email)) return 'Geçerli bir @gmail.com adresi gir';
  return null;
}

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const emailError = emailTouched ? getEmailError(email) : null;

  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert('Hata', 'Tüm alanları doldur');
      return;
    }
    if (getEmailError(email)) {
      setEmailTouched(true);
      return;
    }
    const sonuc = await register(username, email, password);
    if (!sonuc.success) Alert.alert('Hata', sonuc.message);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <Text style={styles.title}>KAYIT OL</Text>

        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            placeholder="Kullanıcı adı"
            placeholderTextColor={colors.textMuted}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
          />
          <View style={styles.divider} />
          <TextInput
            ref={emailRef}
            style={[styles.input, emailError && styles.inputError]}
            placeholder="Email (@gmail.com)"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={(v) => { setEmail(v); if (emailTouched) setEmailTouched(false); }}
            onBlur={() => setEmailTouched(true)}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
            onSubmitEditing={() => { setEmailTouched(true); passwordRef.current?.focus(); }}
          />
          <View style={styles.divider} />
          <View style={styles.passwordRow}>
            <TextInput
              ref={passwordRef}
              style={[styles.input, { flex: 1 }]}
              placeholder="Şifre"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              returnKeyType="done"
              onSubmitEditing={handleRegister}
            />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(v => !v)}>
              <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {emailError && <Text style={styles.errorText}>{emailError}</Text>}

        <TouchableOpacity style={styles.registerBtn} onPress={handleRegister} activeOpacity={0.85}>
          <Text style={styles.registerBtnText}>KAYIT OL</Text>
        </TouchableOpacity>

        <View style={styles.loginRow}>
          <Text style={styles.loginLabel}>Zaten hesabın var mı? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Giriş yap</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.spacer} />

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1, paddingHorizontal: 24 },

  backBtn: { paddingTop: 8, paddingBottom: 4, alignSelf: 'flex-start' },
  backArrow: { fontSize: 28, color: colors.text, fontWeight: '300' },

  title: {
    fontFamily: fonts.poppinsExtraBold,
    fontSize: 32,
    color: colors.text,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 28,
  },

  inputBox: {
    backgroundColor: colors.white,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 8,
    borderBottomWidth: 5,
    borderBottomColor: '#D0D0D0',
    elevation: 3,
  },
  input: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.text,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  inputError: { backgroundColor: '#FEE2E2' },
  divider: { height: 1, backgroundColor: colors.inputBorder, marginHorizontal: 20 },
  passwordRow: { flexDirection: 'row', alignItems: 'center' },
  eyeBtn: { paddingHorizontal: 16, paddingVertical: 18 },
  eyeIcon: { fontSize: 18 },

  errorText: { color: '#EF4444', fontSize: 13, marginBottom: 12, marginLeft: 4 },

  registerBtn: {
    backgroundColor: colors.primary,
    borderRadius: 50,
    paddingTop: 18,
    paddingBottom: 13,
    alignItems: 'center',
    marginTop: 16,
    borderBottomWidth: 6,
    borderBottomColor: colors.primaryDark,
    elevation: 3,
  },
  registerBtnText: {
    fontFamily: fonts.poppinsBold,
    fontSize: 16,
    color: colors.white,
    letterSpacing: 2,
  },

  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  loginLabel: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted },
  loginLink: { fontFamily: fonts.bold, fontSize: 14, color: colors.success },

  spacer: { flex: 1 },
});
