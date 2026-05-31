import { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { getCurrentUser } from '../services/authService';
import { addXP } from '../services/contentService';
import { fonts } from '../config/theme';
import { useTheme } from '../context/ThemeContext';

const DAILY_BONUS = 10;

const DAILY_FACTS = [
  { date: '28 Haziran 1914', title: 'Savaşı Başlatan Suikast', text: 'Avusturya-Macaristan Veliahtı Arşidük Franz Ferdinand, Saraybosna\'da Sırp milliyetçisi Gavrilo Princip tarafından öldürüldü. Bu suikast Birinci Dünya Savaşı\'nın fitilini ateşledi.' },
  { date: '1 Ağustos 1914', title: 'Almanya Savaş İlan Etti', text: 'Almanya, Rusya\'nın seferberliğini gerekçe göstererek önce Rusya\'ya, ardından Fransa\'ya savaş ilan etti. İngiltere de Belçika\'nın işgali üzerine savaşa katıldı.' },
  { date: '18 Mart 1915', title: 'Çanakkale Deniz Zaferi', text: 'İtilaf Devletleri\'nin güçlü deniz kuvvetleri Çanakkale Boğazı\'nı zorladı; Türk topçusu 3 savaş gemisini batırarak taarruzu püskürttü. Bu zafer savunmanın dönüm noktasıydı.' },
  { date: '25 Nisan 1915', title: 'Çanakkale Kara Çıkarması', text: 'İtilaf kuvvetleri Gelibolu Yarımadası\'na çıkarma yaptı. Mustafa Kemal\'in 57. Alay\'a "Ölmeyi emrediyorum!" sözüyle yönettiği savunma, çıkarmayı durma noktasına getirdi.' },
  { date: '29 Ekim 1914', title: 'Osmanlı Savaşa Girdi', text: 'Osmanlı donanması Karadeniz\'deki Rus limanlarını bombaladı. Bu saldırı Osmanlı\'nın İttifak Devletleri yanında resmen savaşa girmesi anlamına geliyordu.' },
  { date: '11 Kasım 1918', title: 'Birinci Dünya Savaşı Sona Erdi', text: 'Saat 11:00\'de Batı Cephesi\'nde silahlar sustu. 4 yıl 3 ay süren savaşta yaklaşık 20 milyon kişi hayatını kaybetti; dört imparatorluk tarih sahnesinden çekildi.' },
  { date: '30 Ekim 1918', title: 'Mondros Mütarekesi', text: 'Osmanlı İmparatorluğu, İtilaf Devletleri ile Mondros Mütarekesi\'ni imzalayarak savaştan çekildi. Boğazlar açıldı, ordu terhis edildi ve işgaller başladı.' },
  { date: '28 Haziran 1919', title: 'Versay Antlaşması', text: 'Paris\'teki Versay Sarayı\'nda imzalanan antlaşmayla Almanya savaşın sorumluluğunu üstlendi, topraklarının yüzde 13\'ünü kaybetti ve ağır tazminat ödemeyi kabul etti.' },
  { date: '19 Mayıs 1919', title: 'Kurtuluş Savaşı Başladı', text: 'Mustafa Kemal Paşa Samsun\'a çıkarak Milli Mücadele\'yi başlattı. Bu tarih Türk bağımsızlık hareketinin resmi kıvılcımı olarak tarihe geçti.' },
  { date: '23 Nisan 1920', title: 'TBMM\'nin Açılışı', text: 'Türkiye Büyük Millet Meclisi Ankara\'da açıldı. Millet egemenliğini temsil eden bu meclis, İstanbul hükümetinden bağımsız olarak Kurtuluş Savaşı\'nı yönetti.' },
  { date: '10 Ocak 1920', title: 'Milletler Cemiyeti Kuruldu', text: 'Versay Antlaşması\'nın yürürlüğe girmesiyle Milletler Cemiyeti resmen kuruldu. Uluslararası barışı korumayı hedefleyen bu örgüt, BM\'nin öncülüydü.' },
  { date: '26 Ağustos 1922', title: 'Büyük Taarruz', text: 'Türk kuvvetleri Afyonkarahisar\'dan başlattığı büyük saldırıyla Yunan savunmasını yardı. 30 Ağustos\'ta kazanılan Başkomutanlık Meydan Muharebesi Kurtuluş Savaşı\'nın askeri sürecini noktaladı.' },
  { date: '24 Temmuz 1923', title: 'Lozan Antlaşması', text: 'Lozan\'da imzalanan antlaşma Türkiye\'yi uluslararası alanda tanıdı, Sevr\'i geçersiz kıldı ve kapitülasyonları tarihe gömdü. Türk Kurtuluş Savaşı\'nın diplomatik zaferi olarak kabul edilir.' },
  { date: '29 Ekim 1923', title: 'Cumhuriyet İlan Edildi', text: 'TBMM anayasa değişikliğiyle Türkiye Cumhuriyeti\'ni resmen ilan etti. Mustafa Kemal ilk Cumhurbaşkanı seçildi; İsmet Paşa ilk Başbakan oldu.' },
  { date: '3 Mart 1924', title: 'Halifelik Kaldırıldı', text: 'TBMM kararıyla halifelik kurumu kaldırıldı. Bu karar, din ve devlet işlerinin ayrılması yolundaki en önemli inkılaplardan biriydi.' },
  { date: '1 Kasım 1928', title: 'Harf İnkılabı', text: 'Arap alfabesinin yerini Latin kökenli Türk alfabesi aldı. Atatürk bizzat "Millet Mektepleri"nde köy köy dolaşarak yeni alfabeyi öğretti.' },
  { date: '26 Ağustos 1071', title: 'Malazgirt Zaferi', text: 'Sultan Alparslan, Bizans İmparatoru IV. Romanos Diogenes\'i Malazgirt\'te esir aldı. Bu zafer Anadolu\'nun kapılarını Türklere açtı ve tarihin seyrini değiştirdi.' },
  { date: '29 Mayıs 1453', title: 'İstanbul\'un Fethi', text: 'Fatih Sultan Mehmet 21 yaşında, 53 günlük kuşatmanın ardından İstanbul\'u fethetti. Bizans İmparatorluğu sona erdi; Orta Çağ kapandı ve Yeni Çağ başladı.' },
  { date: '10 Kasım 1938', title: 'Atatürk\'ün Vefatı', text: 'Mustafa Kemal Atatürk, Dolmabahçe Sarayı\'nda sabah 09:05\'te hayatını kaybetti. Türkiye\'nin kurucusunun ölümü tüm dünyada derin bir üzüntüyle karşılandı.' },
  { date: '5 Haziran 1916', title: 'Arap İsyanı', text: 'İngilizlerin kışkırtmasıyla Mekke Şerifi Hüseyin Osmanlı\'ya karşı ayaklandı. Arap İsyanı, Orta Doğu cephesinde Osmanlı\'nın gücünü ciddi biçimde sarstı.' },
  { date: '6 Nisan 1917', title: 'ABD Savaşa Girdi', text: 'Amerika Birleşik Devletleri, Almanya\'nın sınırsız denizaltı savaşını gerekçe göstererek İtilaf Devletleri safına katıldı. Bu gelişme savaşın dengesini kesin biçimde İtilaf lehine çevirdi.' },
  { date: '1 Temmuz 1916', title: 'Somme Muharebesi\'nin İlk Günü', text: 'Somme Muharebesi\'nin ilk gününde 57.000 İngiliz askeri hayatını kaybetti. Tarihte tek bir günde yaşanan en büyük kayıp olarak kayıtlara geçti.' },
  { date: '21 Şubat 1916', title: 'Verdun Muharebesi Başladı', text: 'Almanya\'nın "Fransa\'yı kan kaybettirme" stratejisiyle başlattığı Verdun Muharebesi 10 ay sürdü. 700.000\'den fazla kayıpla tarihin en uzun ve en kanlı muharebelerinden biri oldu.' },
  { date: '7 Mayıs 1915', title: 'Lusitania Battı', text: 'Alman denizaltısının torpillemesiyle İngiliz yolcu gemisi Lusitania battı; 1.198 kişi öldü. Bu olay kamuoyunu Almanya aleyhine döndürdü ve ABD\'nin savaşa girişini hızlandırdı.' },
  { date: '22 Nisan 1915', title: 'İlk Kimyasal Saldırı', text: 'Almanya, Belçika\'nın Ypres kentinde klor gazını kitlesel olarak ilk kez kullandı. Binlerce asker hayatını kaybetti; kimyasal silahlar modern savaşın en karanlık yüzü oldu.' },
  { date: '15 Eylül 1916', title: 'Tank İlk Kez Kullanıldı', text: 'İngilizler Somme Muharebesi\'nde tankı savaş meydanında tarihte ilk kez kullandı. Başlangıçta sınırlı etkili olan bu araç, sonraki savaşlarda taktikleri kökten değiştirdi.' },
  { date: '4 Ekim 1918', title: 'Almanya Ateşkes İstedi', text: 'Almanya ve Avusturya-Macaristan, ABD Başkanı Wilson\'a ateşkes talebinde bulundu. 11 Kasım\'a kadar süren müzakereler sonunda Birinci Dünya Savaşı\'nı noktalayan ateşkes imzalandı.' },
  { date: '9 Kasım 1918', title: 'Alman İmparatorluğu Çöktü', text: 'Kaiser II. Wilhelm tahttan çekildi ve Almanya\'da cumhuriyet ilan edildi. İmparatorluğun bu çöküşü Birinci Dünya Savaşı\'nın sona ermesinden iki gün önce yaşandı.' },
  { date: '16 Ocak 1920', title: 'Meclis-i Mebusan\'ın Son Toplantısı', text: 'Osmanlı Meclis-i Mebusanı son kez toplandı ve Misak-ı Millî kararlarını kabul etti. İngilizler bunun üzerine İstanbul\'u işgal etti ve meclisi kapattı.' },
  { date: '10 Ağustos 1920', title: 'Sevr Antlaşması', text: 'Osmanlı hükümeti Sevr Antlaşması\'nı imzaladı; Anadolu büyük güçler arasında paylaşılıyordu. Türk Millî Hareketi bu antlaşmayı tanımadı ve Kurtuluş Savaşı\'nı sürdürdü.' },
  { date: '9 Eylül 1922', title: 'İzmir\'in Kurtuluşu', text: 'Türk kuvvetleri İzmir\'e girdi. Uzun yıllar süren işgalin sona ermesi Kurtuluş Savaşı\'nın fiilen tamamlandığını simgeliyordu.' },
];

function getTodayFact() {
  // Bugünün tarihini YYYY-MM-DD olarak al, hash ile sabit bir indeks üret
  const today = new Date().toISOString().slice(0, 10); // "2026-05-31"
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = (hash * 31 + today.charCodeAt(i)) & 0xffff;
  }
  return DAILY_FACTS[hash % DAILY_FACTS.length];
}

export default function DailyScreen() {
  const { colors } = useTheme();
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

  const styles = makeStyles(colors);

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

const makeStyles = (c) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.background },
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
    backgroundColor: c.cardBg,
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
    backgroundColor: c.magenta,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 14,
  },
  dateText: {
    color: c.white,
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: c.text,
    marginBottom: 10,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: c.text,
    fontWeight: '500',
  },

  claimBtn: {
    backgroundColor: c.btnGreen,
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: 'center',
    borderBottomWidth: 6,
    borderBottomColor: c.btnGreenDark,
    elevation: 4,
  },
  claimBtnDone: {
    backgroundColor: '#9B8FA0',
    borderBottomColor: '#6B5F70',
  },
  claimBtnText: {
    color: c.white,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
  },

  hint: {
    textAlign: 'center',
    marginTop: 16,
    color: c.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
});
