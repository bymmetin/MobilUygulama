import { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { getCurrentUser } from '../services/authService';
import { addXP } from '../services/contentService';
import { colors, fonts } from '../config/theme';

const DAILY_BONUS = 10;

const DAILY_FACTS = [
  { date: '29 Mayıs 1453', title: 'İstanbul\'un Fethi', text: 'Fatih Sultan Mehmet, 53 günlük kuşatmanın ardından İstanbul\'u fethetti ve Bizans İmparatorluğu sona erdi.' },
  { date: '23 Nisan 1920', title: 'TBMM\'nin Açılışı', text: 'Türkiye Büyük Millet Meclisi, Ankara\'da Mustafa Kemal Atatürk başkanlığında açıldı.' },
  { date: '30 Ağustos 1922', title: 'Büyük Taarruz', text: 'Başkomutanlık Meydan Muharebesi kazanıldı; Kurtuluş Savaşı\'nın dönüm noktası oldu.' },
  { date: '29 Ekim 1923', title: 'Cumhuriyet İlanı', text: 'Türkiye Cumhuriyeti resmen ilan edildi; Mustafa Kemal Atatürk ilk cumhurbaşkanı seçildi.' },
  { date: '10 Kasım 1938', title: 'Atatürk\'ün Vefatı', text: 'Cumhuriyetin kurucusu Mustafa Kemal Atatürk, Dolmabahçe Sarayı\'nda hayatını kaybetti.' },
  { date: '26 Ağustos 1071', title: 'Malazgirt Zaferi', text: 'Sultan Alparslan, Bizans ordusunu Malazgirt\'te bozguna uğrattı ve Anadolu\'nun kapıları Türklere açıldı.' },
  { date: '19 Mayıs 1919', title: 'Milli Mücadelenin Başlangıcı', text: 'Mustafa Kemal Paşa, Samsun\'a çıkarak Kurtuluş Savaşı\'nı resmen başlattı.' },
];

function getTodayFact() {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today - new Date(today.getFullYear(), 0, 0)) / 86400000
  );
  return DAILY_FACTS[dayOfYear % DAILY_FACTS.length];
}

export default function DailyScreen() {
  const [user, setUser] = useState(null);
  const [claimed, setClaimed] = useState(false);
  const fact = getTodayFact();
  const today = new Date().toISOString().slice(0, 10);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const u = await getCurrentUser();
        setUser(u);
        if (u) {
          const lastClaim = await AsyncStorage.getItem(`daily_claim_${u.id}`);
          setClaimed(lastClaim === today);
        }
      };
      load();
    }, [])
  );

  const handleClaim = async () => {
    if (!user || claimed) return;
    try {
      await addXP(user.id, DAILY_BONUS);
      await AsyncStorage.setItem(`daily_claim_${user.id}`, today);
      setClaimed(true);
      Alert.alert('Tebrikler!', `+${DAILY_BONUS} XP kazandın`);
    } catch (e) {
      Alert.alert('Hata', 'XP eklenirken bir sorun oluştu.');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>

        <Text style={styles.header}>GÜNÜN BİLGİSİ</Text>

        <View style={styles.card}>
          <View style={styles.dateBadge}>
            <Text style={styles.dateText}>{fact.date}</Text>
          </View>
          <Text style={styles.title}>{fact.title}</Text>
          <Text style={styles.body}>{fact.text}</Text>
        </View>

        <TouchableOpacity
          style={[styles.claimBtn, claimed && styles.claimBtnDone]}
          onPress={handleClaim}
          disabled={claimed}
          activeOpacity={0.85}
        >
          <Text style={styles.claimBtnText}>
            {claimed ? 'BUGÜN ALINDI ✓' : `+${DAILY_BONUS} XP KAZAN`}
          </Text>
        </TouchableOpacity>

        {claimed && (
          <Text style={styles.hint}>Yarın yeni bir bilgi seni bekliyor!</Text>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 20, paddingTop: 24, paddingBottom: 40 },

  header: {
    fontSize: 22,
    fontWeight: '900',
    color: '#7A7080',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: fonts.poppinsExtraBold,
  },

  card: {
    backgroundColor: colors.cardBg,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderBottomWidth: 6,
    borderBottomColor: '#A098A8',
    elevation: 4,
    shadowColor: '#A098A8',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  dateBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.magenta,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 14,
  },
  dateText: {
    color: colors.white,
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#3A3040',
    marginBottom: 10,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: '#5A5060',
    fontWeight: '500',
  },

  claimBtn: {
    backgroundColor: colors.btnGreen,
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: 'center',
    borderBottomWidth: 6,
    borderBottomColor: colors.btnGreenDark,
    elevation: 4,
  },
  claimBtnDone: {
    backgroundColor: '#9B8FA0',
    borderBottomColor: '#6B5F70',
  },
  claimBtnText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
  },

  hint: {
    textAlign: 'center',
    marginTop: 16,
    color: '#9A9098',
    fontSize: 13,
    fontWeight: '600',
  },
});
