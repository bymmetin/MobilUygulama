# CLAUDE.md — Mnemo Projesi

## Proje Özeti
**Mnemo** — Duolingo tarzı tarih öğrenme mobil uygulaması.
- Platform: React Native + Expo
- Veritabanı: SQLite (cache) + Supabase (ana veri kaynağı)
- GitHub Mobil: https://github.com/bymmetin/MobilUygulama
- GitHub Backend: https://github.com/bymmetin/Back-end
- Yerel klasör: `C:\Users\bymme\Documents\mnemo`
- OS: Windows, PowerShell

## Supabase Bilgileri
```
SUPABASE_URL=https://gyucxqpvrczuqqqhtrkm.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_oj-CdLV4DVpn2ZMb_ot7Jg_RmpcYzMZ
```

## İş Bölümü
- **Ben (kod):** Mantık, veritabanı, fonksiyonlar, navigation
- **Arkadaşım (tasarım):** Renkler, stiller, görseller, animasyon detayları

## GitHub Kuralları
- main'e direkt push yapılamaz, PR zorunlu
- Her özellik için yeni branch: `git checkout -b ozellik-adi`
- Bitince push et, GitHub'da PR aç, merge et
- Her commit anlamlı mesaj içermeli (hoca activity'e bakıyor)

---

## Klasör Yapısı (Güncel)
```
mnemo/
├── src/
│   ├── screens/
│   │   ├── LoginScreen.js          ✅ tamamlandı
│   │   ├── RegisterScreen.js       ✅ tamamlandı
│   │   ├── HomeScreen.js           ✅ iskelet — güncellenecek
│   │   ├── TopicDetailScreen.js    ❌ yapılmadı
│   │   ├── LessonScreen.js         ❌ yapılmadı
│   │   └── QuizScreen.js           ❌ yapılmadı
│   ├── components/                 ❌ henüz boş
│   ├── config/
│   │   └── supabase.js             ❌ yapılmadı
│   ├── navigation/
│   │   ├── AppNavigator.js         ✅ tamamlandı — dokunma
│   │   ├── AuthStack.js            ✅ tamamlandı — dokunma
│   │   └── MainStack.js            ✅ tamamlandı — güncellenecek
│   ├── db/
│   │   └── database.js             ✅ tamamlandı — dokunma
│   └── services/
│       ├── authService.js          ✅ tamamlandı — dokunma
│       └── dataService.js          ❌ yapılmadı
├── App.js                          ✅ tamamlandı
└── package.json
```

---

## Tamamlanan Adımlar

### ✅ Kurulum
- node.js, Expo CLI kurulu
- GitHub repo bağlandı
- Klasör yapısı oluşturuldu
- Branch koruma aktif (main'e direkt push kapalı)

### ✅ Supabase (bulut veritabanı)
- Proje adı: mnemo, Region: Europe
- Tablolar oluşturuldu: topics, lessons, questions
- topics tablosunda 3 örnek kayıt var
- GitHub Back-end reposuna bağlandı
- RLS aktif

### ✅ Veritabanı — `src/db/database.js`
Tablolar: users, topics, lessons, questions, user_progress

### ✅ Auth — `src/services/authService.js`
- register, login, logout, getCurrentUser, setUserSetter fonksiyonları

### ✅ Navigation
- AppNavigator, AuthStack, MainStack çalışıyor
- Giriş/çıkış/oturum koruması çalışıyor

### ✅ Kurulu Paketler
```
expo-sqlite
expo-crypto
@react-native-async-storage/async-storage
@react-navigation/native
@react-navigation/native-stack
@react-navigation/bottom-tabs
react-native-screens
react-native-safe-area-context
```

---

## Mevcut Dosya İçerikleri

### `App.js`
```javascript
import { useEffect } from 'react';
import { initDB } from './src/db/database';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  useEffect(() => {
    initDB();
  }, []);

  return <AppNavigator />;
}
```

### `src/db/database.js`
```javascript
import * as SQLite from 'expo-sqlite';

let db;

export const getDB = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('mnemo.db');
  }
  return db;
};

export const initDB = async () => {
  const db = await getDB();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      xp INTEGER DEFAULT 0,
      streak INTEGER DEFAULT 0,
      last_login TEXT
    );
    CREATE TABLE IF NOT EXISTS topics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      order_num INTEGER
    );
    CREATE TABLE IF NOT EXISTS lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      order_num INTEGER,
      FOREIGN KEY (topic_id) REFERENCES topics(id)
    );
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lesson_id INTEGER NOT NULL,
      question_text TEXT NOT NULL,
      option_a TEXT,
      option_b TEXT,
      option_c TEXT,
      option_d TEXT,
      correct_answer TEXT NOT NULL,
      FOREIGN KEY (lesson_id) REFERENCES lessons(id)
    );
    CREATE TABLE IF NOT EXISTS user_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      lesson_id INTEGER NOT NULL,
      completed INTEGER DEFAULT 0,
      score INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (lesson_id) REFERENCES lessons(id)
    );
  `);
  console.log('Veritabanı hazır');
};
```

### `src/services/authService.js`
```javascript
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDB } from '../db/database';

let setGlobalUser = null;

export const setUserSetter = (fn) => { setGlobalUser = fn; };

const hashPassword = async (password) => {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256, password
  );
};

export const register = async (username, email, password) => {
  try {
    const db = await getDB();
    const existing = await db.getFirstAsync('SELECT * FROM users WHERE email = ?', [email]);
    if (existing) return { success: false, message: 'Bu email zaten kayıtlı' };
    const hashedPassword = await hashPassword(password);
    await db.runAsync('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword]);
    const newUser = await db.getFirstAsync('SELECT * FROM users WHERE email = ?', [email]);
    await AsyncStorage.setItem('user', JSON.stringify(newUser));
    if (setGlobalUser) setGlobalUser(newUser);
    return { success: true, user: newUser };
  } catch (hata) {
    return { success: false, message: hata.message };
  }
};

export const login = async (email, password) => {
  try {
    const db = await getDB();
    const hashedPassword = await hashPassword(password);
    const user = await db.getFirstAsync('SELECT * FROM users WHERE email = ? AND password = ?', [email, hashedPassword]);
    if (!user) return { success: false, message: 'Email veya şifre hatalı' };
    await AsyncStorage.setItem('user', JSON.stringify(user));
    if (setGlobalUser) setGlobalUser(user);
    return { success: true, user };
  } catch (hata) {
    return { success: false, message: hata.message };
  }
};

export const logout = async () => {
  await AsyncStorage.removeItem('user');
  if (setGlobalUser) setGlobalUser(null);
};

export const getCurrentUser = async () => {
  const user = await AsyncStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};
```

### `src/navigation/AppNavigator.js`
```javascript
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { getCurrentUser, setUserSetter } from '../services/authService';
import AuthStack from './AuthStack';
import MainStack from './MainStack';

export default function AppNavigator() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUserSetter(setUser);
    const kontrol = async () => {
      const mevcutUser = await getCurrentUser();
      setUser(mevcutUser);
      setLoading(false);
    };
    kontrol();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
```

### `src/navigation/AuthStack.js`
```javascript
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}
```

### `src/navigation/MainStack.js`
```javascript
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';

const Stack = createNativeStackNavigator();

export default function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
  );
}
```

### `src/screens/HomeScreen.js`
```javascript
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { logout } from '../services/authService';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mnemo</Text>
      <Text style={styles.subtitle}>Ana Sayfa</Text>
      <TouchableOpacity style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 18, color: '#666', marginBottom: 32 },
  button: { backgroundColor: '#EF4444', padding: 16, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
```

### `src/screens/LoginScreen.js`
```javascript
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { login } from '../services/authService';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert('Hata', 'Tüm alanları doldur'); return; }
    const sonuc = await login(email, password);
    if (!sonuc.success) Alert.alert('Hata', sonuc.message);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Giriş Yap</Text>
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Şifre" value={password} onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Giriş Yap</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Hesabın yok mu? Kayıt ol</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 32, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 16 },
  button: { backgroundColor: '#4F46E5', padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { textAlign: 'center', marginTop: 16, color: '#4F46E5' },
});
```

### `src/screens/RegisterScreen.js`
```javascript
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { register } from '../services/authService';

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (!username || !email || !password) { Alert.alert('Hata', 'Tüm alanları doldur'); return; }
    const sonuc = await register(username, email, password);
    if (!sonuc.success) Alert.alert('Hata', sonuc.message);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kayıt Ol</Text>
      <TextInput style={styles.input} placeholder="Kullanıcı adı" value={username} onChangeText={setUsername} autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Şifre" value={password} onChangeText={setPassword} secureTextEntry />
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
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 16 },
  button: { backgroundColor: '#4F46E5', padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { textAlign: 'center', marginTop: 16, color: '#4F46E5' },
});
```

---

## Sıradaki Görev: Supabase + UI Entegrasyonu

### Claude Code Promptu

```
CLAUDE.md dosyasını oku. Aşağıdaki görevleri sırayla yap.
Her adım bittikten sonra dur ve "devam edeyim mi?" diye sor.

--- ADIM 1: Supabase kurulumu ---

Terminalde çalıştır:
  npx expo install @supabase/supabase-js
  npx expo install expo-secure-store

Sonra src/config/supabase.js dosyasını oluştur:

import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = 'https://gyucxqpvrczuqqqhtrkm.supabase.co';
const supabaseKey = 'sb_publishable_oj-CdLV4DVpn2ZMb_ot7Jg_RmpcYzMZ';

const ExpoSecureStoreAdapter = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

--- ADIM 2: dataService.js ---

src/services/dataService.js oluştur.
Önce Supabase'den veri çek, hata alırsa SQLite cache'den dön.
Supabase'den gelen veriyi SQLite'a cache'le.

Fonksiyonlar:
- getTopics()
- getLessons(topicId)
- getQuestions(lessonId)
- updateUserXP(userId, xpToAdd)

--- ADIM 3: HomeScreen güncelle ---

src/screens/HomeScreen.js güncelle:
- getTopics() ile konuları çek
- FlatList ile listele
- AsyncStorage'dan kullanıcının username ve xp bilgisini göster
- Konuya tıklanınca navigation.navigate('TopicDetail', { topicId, title }) ile geç

--- ADIM 4: TopicDetailScreen oluştur ---

src/screens/TopicDetailScreen.js oluştur:
- route.params.topicId ile dersleri çek
- getLessons(topicId) kullan
- FlatList ile listele
- Derse tıklanınca navigation.navigate('Quiz', { lessonId, title }) ile geç

--- ADIM 5: QuizScreen oluştur ---

src/screens/QuizScreen.js oluştur:
- route.params.lessonId ile soruları çek
- getQuestions(lessonId) kullan
- Soruları sırayla göster (currentIndex state ile)
- A/B/C/D seçenekleri buton olarak göster
- Doğru cevaba basınca yeşil, yanlışa kırmızı
- Her doğru cevap +10 XP
- Tüm sorular bitince sonuç ekranı göster
- Sonuçta: kaç doğru, kazanılan XP, Ana Sayfaya dön butonu
- updateUserXP ile kullanıcının XP'sini güncelle

--- ADIM 6: MainStack güncelle ---

src/navigation/MainStack.js güncelle:
- TopicDetailScreen ekle
- QuizScreen ekle

--- ADIM 7: Git ---

git checkout -b supabase-ui-entegrasyonu
git add .
git commit -m "supabase entegrasyonu ve quiz sistemi tamamlandi"
git push origin supabase-ui-entegrasyonu

Önemli notlar:
- Windows + PowerShell — dosya oluştururken New-Item kullan
- Türkçe karakter sorunlarına dikkat et
- authService.js, AppNavigator.js, database.js dosyalarına dokunma
- Her adımda ne yaptığını kısaca açıkla
```

---

## Önemli Notlar
- Windows + PowerShell — `New-Item` kullan, `echo.` çalışmaz
- Türkçe karakter DB insert'lerde sorun çıkarır
- Branch koruma aktif — main'e direkt push yapılamaz
- Her özellik: branch aç → commit → push → PR → merge
- Hoca GitHub activity'e bakıyor, düzenli commit şart
