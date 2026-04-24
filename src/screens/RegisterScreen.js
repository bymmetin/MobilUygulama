import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { register } from '../services/authService';

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
    if (!sonuc.success) {
      Alert.alert('Hata', sonuc.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kayıt Ol</Text>
      <TextInput
        style={styles.input}
        placeholder="Kullanıcı adı"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={[styles.input, emailError && styles.inputError]}
        placeholder="Email (@gmail.com)"
        value={email}
        onChangeText={(v) => { setEmail(v); setEmailTouched(true); }}
        onBlur={() => setEmailTouched(true)}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {emailError && <Text style={styles.errorText}>{emailError}</Text>}
      <TextInput
        style={styles.input}
        placeholder="Şifre"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Kayıt Ol</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Zaten hesabın var mı? Giriş yap</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 32, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 4 },
  inputError: { borderColor: '#EF4444', marginBottom: 2 },
  errorText: { color: '#EF4444', fontSize: 12, marginBottom: 12, marginLeft: 4 },
  button: { backgroundColor: '#4F46E5', padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { textAlign: 'center', marginTop: 16, color: '#4F46E5' },
});