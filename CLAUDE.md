# CLAUDE.md — Mnemo Projesi

## Proje Özeti
**Mnemo** — Duolingo tarzı tarih öğrenme mobil uygulaması.
- Platform: React Native + Expo
- Veritabanı: SQLite (expo-sqlite)
- GitHub: https://github.com/bymmetin/MobilUygulama
- Yerel klasör: `C:\Users\bymme\Documents\mnemo`

## İş Bölümü
- **Ben (kod):** Mantık, veritabanı, fonksiyonlar, navigation
- **Arkadaşım (tasarım):** Renkler, stiller, görseller, animasyon detayları

---

## Klasör Yapısı
```
mnemo/
├── src/
│   ├── screens/
│   │   ├── LoginScreen.js       ✅ tamamlandı
│   │   ├── RegisterScreen.js    ✅ tamamlandı
│   │   ├── HomeScreen.js        ✅ tamamlandı (iskelet)
│   │   ├── TopicDetailScreen.js ❌ yapılmadı
│   │   ├── LessonScreen.js      ❌ yapılmadı
│   │   └── QuizScreen.js        ❌ yapılmadı
│   ├── components/              ❌ henüz boş
│   ├── navigation/
│   │   ├── AppNavigator.js      ✅ tamamlandı
│   │   ├── AuthStack.js         ✅ tamamlandı
│   │   └── MainStack.js         ✅ tamamlandı
│   ├── db/
│   │   ├── database.js          ✅ tamamlandı
│   │   └── seedData.js          ✅ tamamlandı (App.js içine taşındı)
│   └── services/
│       └── authService.js       ✅ tamamlandı
├── App.js                       ✅ tamamlandı
└── package.json
```

---

## Tamamlanan Adımlar

### ✅ Kurulum
- node.js, Expo CLI kurulu
- GitHub repo bağlandı (`git remote add origin https://github.com/bymmetin/MobilUygulama.git`)
- Klasör yapısı oluşturuldu
- .gitignore ayarlandı

### ✅ Veritabanı (`src/db/database.js`)
Tablolar:
- `users` — id, username, email, password (SHA256 hash), xp, streak, last_login
- `topics` — id, title, description, order_num
- `lessons` — id, topic_id, title, order_num
- `questions` — id, lesson_id, question_text, option_a/b/c/d, correct_answer
- `user_progress` — id, user_id, lesson_id, completed, score

Seed data (App.js içinde başlangıçta çalışır):
- 3 topic eklendi (Osmanlı Kurulus, Kurtulus Savasi, Cumhuriyet)
- Lessons ve questions tabloları dolduruldu

### ✅ Auth (`src/services/authService.js`)
- `register(username, email, password)` — SHA256 hash, AsyncStorage'a kaydeder
- `login(email, password)` — hash karşılaştırır, AsyncStorage'a kaydeder
- `logout()` — AsyncStorage temizler
- `getCurrentUser()` — AsyncStorage'dan okur
- `setUserSetter(fn)` — AppNavigator'a state setter bağlar (ekran geçişi için)

### ✅ Navigation (`src/navigation/`)
- `AppNavigator.js` — AsyncStorage'a bakarak Auth veya Main Stack gösterir
- `AuthStack.js` — Login → Register
- `MainStack.js` — Home (şimdilik sadece bu)
- Giriş yapınca Ana Sayfa'ya, çıkınca Login'e geçiyor ✅
- Uygulama kapanıp açılınca oturum korunuyor ✅

---

## Kurulu Paketler
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

export const setUserSetter = (fn) => {
  setGlobalUser = fn;
};

const hashPassword = async (password) => {
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password
  );
  return hash;
};

export const register = async (username, email, password) => {
  try {
    const db = await getDB();
    const existing = await db.getFirstAsync(
      'SELECT * FROM users WHERE email = ?', [email]
    );
    if (existing) {
      return { success: false, message: 'Bu email zaten kayıtlı' };
    }
    const hashedPassword = await hashPassword(password);
    await db.runAsync(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );
    const newUser = await db.getFirstAsync(
      'SELECT * FROM users WHERE email = ?', [email]
    );
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
    const user = await db.getFirstAsync(
      'SELECT * FROM users WHERE email = ? AND password = ?',
      [email, hashedPassword]
    );
    if (!user) {
      return { success: false, message: 'Email veya şifre hatalı' };
    }
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

### `src/screens/LoginScreen.js`
```javascript
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { login } from '../services/authService';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Giriş Yap</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Şifre"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
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
    if (!username || !email || !password) {
      Alert.alert('Hata', 'Tüm alanları doldur');
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
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
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
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 16 },
  button: { backgroundColor: '#4F46E5', padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { textAlign: 'center', marginTop: 16, color: '#4F46E5' },
});
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

---

## Sıradaki Adımlar (Yapılmadı)

### UI Ekranları
1. **HomeScreen** — DB'den topics çek, FlatList ile listele, kullanıcı adı ve XP göster
2. **TopicDetailScreen** — Seçilen konunun lessons listesi
3. **LessonScreen / QuizScreen** — Sorular, A/B/C/D seçenekleri, doğru/yanlış mantığı, XP güncelleme

### MainStack'e eklenecek ekranlar
```javascript
<Stack.Screen name="TopicDetail" component={TopicDetailScreen} />
<Stack.Screen name="Quiz" component={QuizScreen} />
```

### VFX (Animasyonlar)
- `react-native-reanimated` kurulumu
- Doğru cevap: yeşil parlama + tik
- Yanlış cevap: kırmızı shake
- XP kazanma: +XP yazısı yukarı uçar
- Konfeti: ders tamamlandığında

### Test
- XP birikiyor mu?
- İlerleme kaydediliyor mu?
- Streak sistemi çalışıyor mu?

### Sunum
- Branch'leri merge et
- Expo QR kodu üret
- README güncelle

---

## Önemli Notlar
- Windows kullanıyorsun — terminalde `echo.` değil `New-Item` kullan
- PowerShell kullanıyorsun
- Expo Go telefonda test için kullanılıyor
- Türkçe karakter sorun çıkarabilir — DB insert'lerde dikkatli ol
- `DROP TABLE` satırları database.js'den kaldırıldı (sadece ilk sıfırlama için kullanıldı)

---

## Sonraki Görev: Supabase Entegrasyonu

### Karar
Veriler (topics, lessons, questions, görseller, sesler) Supabase'den çekilecek.
SQLite cache olarak kalacak — internet yoksa offline çalışsın diye.
Auth (kullanıcı kayıt/giriş) SQLite'ta kalmaya devam edecek.

### Claude Code'a Verilecek Prompt

```
CLAUDE.md dosyasını oku ve aşağıdaki görevi yap:

Mevcut SQLite yapısını koruyarak Supabase entegrasyonu ekle.
Uygulama önce Supabase'den veri çeksin, internet yoksa SQLite cache'den çalışsın.

Yapılacaklar:

1. Supabase kurulumu:
   npx expo install @supabase/supabase-js
   npx expo install expo-secure-store

2. src/config/supabase.js oluştur — bağlantı dosyası
   (SUPABASE_URL ve SUPABASE_ANON_KEY için yer bırak, ben dolduracağım)

3. Supabase'de şu tabloları oluşturmak için SQL çıktısı ver:
   - topics (id, title, description, order_num)
   - lessons (id, topic_id, title, order_num)
   - questions (id, lesson_id, question_text, option_a, option_b,
     option_c, option_d, correct_answer, image_url, audio_url)

4. src/services/dataService.js oluştur:
   - getTopics() — önce Supabase'den çek, başarısız olursa SQLite'tan dön
   - getLessons(topicId) — aynı mantık
   - getQuestions(lessonId) — aynı mantık
   - Supabase'den gelen veri SQLite'a cache'lensin

5. src/screens/HomeScreen.js güncelle:
   - topics listesini dataService üzerinden çek
   - FlatList ile listele
   - kullanıcı adı ve XP göster

6. src/screens/TopicDetailScreen.js oluştur:
   - seçilen konunun lessons listesi

7. src/navigation/MainStack.js güncelle:
   - TopicDetail ekranını ekle

Önemli notlar:
- Windows + PowerShell kullanıyorum, dosya oluştururken New-Item kullan
- Türkçe karakter sorunlarına dikkat et
- Mevcut auth sistemi (authService.js) ve AppNavigator bozulmasın
- Her adımda ne yaptığını açıkla
```

### Supabase Kurulum Adımları (Manuel)
Claude Code prompt'u çalıştırmadan önce şunları yap:

1. supabase.com'a git, ücretsiz hesap aç
2. "New Project" oluştur, isim: `mnemo`
3. Project Settings → API sekmesine git
4. `Project URL` ve `anon public` key'i kopyala
5. `src/config/supabase.js` içindeki ilgili alanlara yapıştır

### Eklenecek Klasör/Dosyalar
```
src/
├── config/
│   └── supabase.js          ❌ yapılacak
└── services/
    ├── authService.js        ✅ mevcut — dokunma
    └── dataService.js        ❌ yapılacak
```
