import { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Image, Dimensions, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getQuestionsByLesson } from '../services/dataService';
import { saveProgress, addXP } from '../services/contentService';
import { getCurrentUser } from '../services/authService';
import { colors } from '../config/theme';

const { width: W } = Dimensions.get('window');
const MAX_LIVES = 3;
const XP_PER_CORRECT = 10;

export default function LessonScreen({ route, navigation }) {
  const { lesson } = route.params;
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [correct, setCorrect] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [user, setUser] = useState(null);

  useEffect(() => {
    getQuestionsByLesson(lesson.id).then(setQuestions);
    getCurrentUser().then(setUser);
  }, []);

  const question = questions[index];
  const isLast = index === questions.length - 1;
  // option_a yoksa bu bir bilgi kartı (info card)
  const isInfoCard = !question?.option_a;

  const OPTIONS = [
    { key: 'A', value: question?.option_a },
    { key: 'B', value: question?.option_b },
    { key: 'C', value: question?.option_c },
    { key: 'D', value: question?.option_d },
  ].filter(o => o.value);

  const handleSelect = (key) => {
    if (selected) return;
    setSelected(key);
    if (key === question.correct_answer) {
      setCorrect(c => c + 1);
    } else {
      setLives(l => Math.max(0, l - 1));
    }
  };

  const handleNext = async () => {
    if (isLast) {
      // correct state bu noktada güncel (handleSelect farklı event cycle'da çalıştı)
      const score = questions.length > 0
        ? Math.round((correct / questions.length) * 100)
        : 100;
      const earnedXP = correct * XP_PER_CORRECT;
      if (user) {
        await saveProgress(user.id, lesson.id, score);
        await addXP(user.id, earnedXP);
      }
      navigation.replace('Result', {
        lesson, score, correct, total: questions.length, earnedXP,
      });
    } else {
      setIndex(i => i + 1);
      setSelected(null);
    }
  };

  if (!question) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Bu ders için henüz soru eklenmemiş.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backLink}>Geri Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isCorrect = selected && selected === question.correct_answer;
  const canContinue = isInfoCard || !!selected;

  return (
    <View style={styles.safe}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: colors.background }}>
        {/* Üst bar: kapat + can bilgisi */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
          <View style={styles.livesRow}>
            <Text style={styles.heartEmoji}>❤️</Text>
            <Text style={styles.livesLabel}>
              CAN BİLGİSİ{'  '}{lives}/{MAX_LIVES}
            </Text>
          </View>
        </View>
      </SafeAreaView>

      {/* İçerik */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        showsVerticalScrollIndicator={false}
      >
        {/* Resim alanı */}
        {question.image_url ? (
          <Image
            source={{ uri: question.image_url }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imgPlaceholder}>
            <Text style={styles.imgPlaceholderText}>IMAGE SIZE</Text>
          </View>
        )}

        {/* Soru / bilgi metni */}
        <Text style={[styles.questionText, isInfoCard && styles.infoText]}>
          {question.question_text}
        </Text>

        {/* Şıklar — 2x2 ızgara */}
        {!isInfoCard && (
          <View style={styles.optionsGrid}>
            {OPTIONS.map(({ key, value }) => {
              const isSelected = selected === key;
              const isCorrectOption = question.correct_answer === key;

              let bg = colors.magentaBtn;
              let shadow = colors.magentaBtnShadow;
              if (selected) {
                if (isCorrectOption) { bg = '#00BB00'; shadow = '#007700'; }
                else if (isSelected) { bg = '#CC2020'; shadow = '#880000'; }
                else { bg = '#CC00AA'; shadow = '#880070'; } // diğerleri soluk
              }

              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.optionBtn, { backgroundColor: bg, shadowColor: shadow }]}
                  onPress={() => handleSelect(key)}
                  disabled={!!selected}
                  activeOpacity={0.85}
                >
                  <Text style={styles.optionText}>{value}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Alt panel */}
      <SafeAreaView edges={['bottom']} style={styles.bottomPanelWrap}>
        <View style={styles.checkRow}>
          <View style={[styles.checkCircle, isCorrect && styles.checkCircleActive]}>
            <Text style={[styles.checkMark, isCorrect && styles.checkMarkActive]}>✓</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.continueBtn, !canContinue && styles.continueBtnOff]}
          onPress={canContinue ? handleNext : undefined}
          activeOpacity={canContinue ? 0.85 : 1}
        >
          <Text style={styles.continueBtnText}>DEVAM</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  closeBtn: { padding: 6 },
  closeBtnText: { fontSize: 20, color: '#888', fontWeight: 'bold' },
  livesRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heartEmoji: { fontSize: 22 },
  livesLabel: { fontSize: 13, fontWeight: '700', color: '#555' },

  content: { flex: 1 },
  contentInner: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },

  image: {
    width: '100%',
    height: W * 0.42,
    borderRadius: 20,
    marginBottom: 20,
  },
  imgPlaceholder: {
    width: '100%',
    height: W * 0.42,
    borderRadius: 20,
    backgroundColor: colors.imgPlaceholder,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  imgPlaceholderText: {
    fontSize: 18,
    color: '#888',
    fontWeight: '700',
    transform: [{ rotate: '-20deg' }],
  },

  questionText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#6A6070',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 30,
  },
  infoText: { fontSize: 38, lineHeight: 50 },

  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  optionBtn: {
    width: (W - 44) / 2,
    paddingVertical: 22,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  optionText: { fontSize: 20, fontWeight: '900', color: colors.white },

  bottomPanelWrap: {
    backgroundColor: colors.bottomPanel,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 8,
    gap: 12,
  },
  checkRow: { flexDirection: 'row' },
  checkCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#C8C0CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircleActive: { backgroundColor: '#C8C0CC' },
  checkMark: { fontSize: 26, color: '#A098A8', fontWeight: 'bold' },
  checkMarkActive: { color: '#00CC00' },

  continueBtn: {
    backgroundColor: colors.btnGreen,
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: 'center',
    shadowColor: colors.btnGreenDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  continueBtnOff: {
    backgroundColor: '#A0A0A0',
    shadowColor: '#606060',
  },
  continueBtnText: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: 3,
  },

  emptyContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  emptyText: { fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 20 },
  backLink: { fontSize: 16, color: colors.primary, fontWeight: '600' },
});
