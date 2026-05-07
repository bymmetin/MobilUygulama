# 🏛️ Mnemo — Tarih Öğrenme Uygulaması

Duolingo tarzında tasarlanmış, gamification odaklı mobil tarih öğrenme uygulaması.

## 📱 Teknoloji Yığını

| Katman | Teknoloji |
|---|---|
| Mobil | React Native + Expo SDK 54 |
| Navigasyon | React Navigation (Stack + Bottom Tabs) |
| Bulut DB | Supabase (PostgreSQL + RLS) |
| Yerel Cache | expo-sqlite |
| Auth | Yerel SHA-256 hash + AsyncStorage |
| Fontlar | Nunito, Poppins (expo-google-fonts) |
| Görseller | react-native-svg-transformer |

## 🗺️ Uygulama Mimarisi

```
Supabase (kaynak)
      │
      ├─ topics      → Üniteler (ör: "Birinci Dünya Savaşı")
      ├─ lessons     → Aşamalar (her ünitenin alt bölümleri)
      └─ questions   → Sorular (çoktan seçmeli, eşleştirme, boşluk doldurma)
            │
            ▼
      SQLite Cache   ← Offline / hızlı yükleme
            │
            ▼
      React Native UI
```

### Veri Akışı
1. Uygulama başlarken Supabase'den güncel veri çeker
2. Veri SQLite'a cache'lenir
3. Supabase erişilemezse SQLite cache devreye girer
4. İlerleme (XP, skor, yanlış sorular) sadece yerel SQLite'a kaydedilir

## 📂 Klasör Yapısı

```
mnemo/
├── assets/                  # SVG ve PNG görseller
├── src/
│   ├── config/
│   │   ├── supabase.js      # Supabase client yapılandırması
│   │   └── theme.js         # Renkler ve font tanımları
│   ├── db/
│   │   └── database.js      # SQLite şeması ve init
│   ├── navigation/
│   │   ├── AppNavigator.js  # Auth durumuna göre stack yönlendirme
│   │   ├── AuthStack.js     # Login / Register ekranları
│   │   └── MainStack.js     # Ana uygulama + bottom tab
│   ├── screens/
│   │   ├── HomeScreen.js        # Ünite haritası (zigzag coin yolu)
│   │   ├── LessonScreen.js      # Soru çözme ekranı (3 can sistemi)
│   │   ├── ResultScreen.js      # Ders sonu sonuç ekranı
│   │   ├── ProfileScreen.js     # Kullanıcı profili ve XP/level
│   │   ├── LeaguesScreen.js     # Liderlik tablosu (yapım aşamasında)
│   │   ├── DailyScreen.js       # Günlük görevler (yapım aşamasında)
│   │   ├── LoginScreen.js       # E-posta ile giriş
│   │   ├── RegisterScreen.js    # Kayıt ekranı
│   │   ├── LoginSelectScreen.js # Giriş yöntemi seçimi
│   │   └── OnboardingScreen.js  # İlk açılış ekranı
│   ├── services/
│   │   ├── authService.js    # Kayıt, giriş, oturum yönetimi
│   │   ├── dataService.js    # Supabase → SQLite veri çekme
│   │   └── contentService.js # İlerleme kaydetme ve XP güncelleme
│   └── components/
│       ├── QuestionMatching.js  # Eşleştirme soru tipi
│       └── QuestionFillBlank.js # Boşluk doldurma soru tipi
└── App.js
```

## 🎮 Oyun Mekaniği

### Aşama Kilitleme
- Her ünitenin **ilk aşaması** baştan açıktır
- Sonraki aşamalar, önceki aşama **%50 veya üzeri** puanla geçilince açılır
- Başarısız ders (%50 altı) bir sonraki aşamayı kilitli tutar

### İlerleme Sistemi
| Durum | Görünüm |
|---|---|
| Kilitli | Soluk coin + kilit ikonu |
| Açık (çözülmemiş) | Parlak coin |
| Geçildi (%50–99) | Gri coin + yeşil tik (yanlış sorular yeniden çözülebilir) |
| Mükemmel (%100) | Gri coin + yeşil tik (sonuç ekranı gösterilir) |

### XP & Can
- Her doğru cevap: **+10 XP**
- Her derste **3 can** hakkı
- Can bitince ders sona erer

## ⚙️ Kurulum

### Gereksinimler
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Android Studio veya Xcode (fiziksel cihaz da kullanılabilir)

### Adımlar

```bash
# Repo'yu klonla
git clone https://github.com/bymmetin/MobilUygulama.git
cd MobilUygulama

# Bağımlılıkları yükle
npm install

# Uygulamayı başlat
npx expo start
```

### Supabase Yapılandırması
`src/config/supabase.js` dosyasında URL ve anahtar zaten tanımlıdır.  
Kendi Supabase projenizi kullanmak isterseniz Backend repo'sundaki SQL dosyalarını çalıştırın:  
👉 [bymmetin/Back-end](https://github.com/bymmetin/Back-end)

## 🌿 Git Workflow

```
main (korumalı — direkt push yok)
 └── feature-branch
       └── PR → Code Review → Merge
```

```bash
# Yeni özellik başlat
git checkout -b ozellik-adi

# Değişiklikleri kaydet
git add .
git commit -m "açıklayıcı mesaj"
git push origin ozellik-adi

# GitHub'da PR aç ve merge et
```

## 🔗 İlgili Repolar
- **Backend / Veritabanı:** [bymmetin/Back-end](https://github.com/bymmetin/Back-end)
