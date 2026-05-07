import { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Image, Dimensions, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getQuestionsByLesson } from '../services/dataService';
import { saveProgress, addXP } from '../services/contentService';
import { getCurrentUser } from '../services/authService';
import QuestionMatching from '../components/QuestionMatching';
import QuestionFillBlank from '../components/QuestionFillBlank';
import { colors } from '../config/theme';

const { width: W } = Dimensions.get('window');
const MAX_LIVES = 3;
const XP_PER_CORRECT = 10;

export default function LessonScreen({ route, navigation }) {
  const { lesson } = route.params;
  // Retry modu: yalnızca yanlış soruları çöz
  const questionIds = route.params?.questionIds ?? null;   // null = tüm sorular
  const isRetry    = route.params?.isRetry    ?? false;
  const originalTotal = route.params?.originalTotal ?? null;

  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [user, setUser] = useState(null);

  // Cevap durumu
  const [answered, setAnswered] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(false);

  // Çoktan seçmeli için seçilen şık
  const [selected, setSelected] = useState(null);

  // Bitiş tetiklendi mi
  const [finishing, setFinishing] = useState(false);

  // Yanlış cevaplanan soru ID'leri (stale closure sorununu önlemek için ref)
  const wrongIdsRef = useRef([]);

  useEffect(() => {
    getQuestionsByLesson(lesson.id).then(allQs => {
      if (questionIds && questionIds.length > 0) {
        // Retry: sadece daha önce yanlış yapılan soruları yükle
        setQuestions(allQs.filter(q => questionIds.includes(q.id)));
      } else {
        setQuestions(allQs);
      }
    });
    getCurrentUser().then(setUser);
  }, []);

  const question = questions[index];
  const isLast = index === questions.length - 1;
  const questionType = question?.question_type ?? 'multiple_choice';
  const isInfoCard = questionType === 'multiple_choice' && !question?.option_a;

  const finishLesson = async (finalCorrect, explicitWrongIds) => {
    if (finishing) return;
    setFinishing(true);

    // Retry modunda tüm sorular doğruysa → tam tamamlandı (100%)
    const allRetryCorrect = isRetry && finalCorrect === questions.length;
    const finalWrongIds   = explicitWrongIds ?? wrongIdsRef.current;
    const wrongIdsToSave  = allRetryCorrect ? [] : finalWrongIds;

    // Skor hesabı
    const displayTotal   = allRetryCorrect ? (originalTotal ?? questions.length) : questions.length;
    const displayCorrect = allRetryCorrect ? displayTotal : finalCorrect;
    const score = allRetryCorrect
      ? 100
      : (questions.length > 0 ? Math.round((finalCorrect / questions.length) * 100) : 0);

    const earnedXP = finalCorrect * XP_PER_CORRECT;

    try {
      if (user) {
        await saveProgress(
          user.id, lesson.id, score,
          displayCorrect, displayTotal, earnedXP,
          wrongIdsToSave
        );
        await addXP(user.id, earnedXP);
      }
    } catch (e) {
      console.warn('finishLesson DB hatası (navigation devam ediyor):', e.message);
    }

    navigation.replace('Result', {
      lesson, score, correct: displayCorrect, total: displayTotal, earnedXP,
    });
  };

  // Cevap callback
  const handleAnswered = (isCorrect) => {
    if (answered) return;
    setAnswered(true);
    setLastCorrect(isCorrect);
    const newCorrect = isCorrect ? correct + 1 : correct;
    if (isCorrect) {
      setCorrect(newCorrect);
    } else {
      // Yanlış cevap → soru ID'sini kaydet
      wrongIdsRef.current = [...wrongIdsRef.current, question.id];
      const newLives = Math.max(0, lives - 1);
      setLives(newLives);
      // Can bitti → direkt kaybetme ekranına git
      if (newLives === 0) {
        const captured = wrongIdsRef.current;
        setTimeout(() => finishLesson(newCorrect, captured), 700);
      }
    }
  };

  // Sonraki / bitir
  const handleNext = () => {
    if (isLast) {
      finishLesson(correct);
    } else {
      setIndex(i => i + 1);
      setAnswered(false);
      setLastCorrect(false);
      setSelected(null);
    }
  };

  const handleSelectMC = (key) => {
    if (answered) return;
    setSelected(key);
    handleAnswered(key === question.correct_answer);
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

  const hasImage = !!question.image_url;
  const showBottomPanel = answered || isInfoCard;
  const panelBg = isInfoCard
    ? colors.bottomPanel
    : lastCorrect ? '#00C853' : '#FF2020';

  const OPTIONS = [
    { key: 'A', value: question.option_a },
    { key: 'B', value: question.option_b },
    { key: 'C', value: question.option_c },
    { key: 'D', value: question.option_d },
  ].filter(o => o.value);

  return (
    <View style={styles.safe}>
      {/* Üst bar + progress bar */}
      <SafeAreaView edges={['top']} style={{ backgroundColor: colors.background }}>
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

        {/* Duolingo tarzı progress bar */}
        {questions.length > 0 && (
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.round(
                    (index + (answered ? 1 : 0)) / questions.length * 100
                  )}%`,
                },
              ]}
            />
          </View>
        )}
      </SafeAreaView>

      {/* İçerik */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        showsVerticalScrollIndicator={false}
      >
        {questionType === 'multiple_choice' && (
          <>
            {/* Resim sadece varsa */}
            {hasImage && (
              <Image
                source={{ uri: question.image_url }}
                style={styles.image}
                resizeMode="cover"
              />
            )}

            <Text style={[
              styles.questionText,
              isInfoCard && styles.infoText,
              !hasImage && !isInfoCard && styles.questionTextNoImage,
            ]}>
              {question.question_text}
            </Text>

            {!isInfoCard && (
              <View style={styles.optionsGrid}>
                {OPTIONS.map(({ key, value }) => {
                  const isSelected = selected === key;
                  const isCorrectOpt = question.correct_answer === key;
                  let bg = colors.magentaBtn;
                  let shadow = colors.magentaBtnShadow;
                  if (answered) {
                    if (isCorrectOpt) { bg = '#00BB00'; shadow = '#007700'; }
                    else if (isSelected) { bg = '#CC2020'; shadow = '#880000'; }
                    else { bg = '#CC00AA'; shadow = '#880070'; }
                  }
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[styles.optionBtn, { backgroundColor: bg, shadowColor: shadow }]}
                      onPress={() => handleSelectMC(key)}
                      disabled={answered}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.optionText} numberOfLines={3} adjustsFontSizeToFit>
                        {value}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </>
        )}

        {questionType === 'matching' && (
          <View style={styles.altWrap}>
            <Text style={styles.questionText}>{question.question_text}</Text>
            <QuestionMatching question={question} onAnswered={handleAnswered} />
          </View>
        )}

        {questionType === 'fill_blank' && (
          <View style={styles.altWrap}>
            <QuestionFillBlank question={question} onAnswered={handleAnswered} />
          </View>
        )}
      </ScrollView>

      {/* Alt panel — yalnızca cevap verildikten sonra (bilgi kartları hariç) */}
      {showBottomPanel && (
        <SafeAreaView edges={['bottom']} style={[styles.bottomPanelWrap, { backgroundColor: panelBg }]}>
          {answered && !isInfoCard && (
            <View style={styles.feedbackRow}>
              <Text style={styles.feedbackIcon}>{lastCorrect ? '✓' : '✗'}</Text>
              <Text style={styles.feedbackText}>
                {lastCorrect ? 'Doğru!' : 'Yanlış'}
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={[
              styles.continueBtn,
              { backgroundColor: isInfoCard ? colors.btnGreen : colors.white },
            ]}
            onPress={handleNext}
            activeOpacity={0.85}
          >
            <Text style={[
              styles.continueBtnText,
              { color: isInfoCard ? colors.white : panelBg },
            ]}>
              {isLast ? 'BİTİR' : 'DEVAM'}
            </Text>
          </TouchableOpacity>
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  progressTrack: {
    height: 10,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 5,
    marginHorizontal: 16,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: 10,
    backgroundColor: colors.btnGreen,
    borderRadius: 5,
    minWidth: 10,
  },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  closeBtn: { padding: 6 },
  closeBtnText: { fontSize: 22, color: '#888', fontWeight: 'bold' },
  livesRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heartEmoji: { fontSize: 22 },
  livesLabel: { fontSize: 13, fontWeight: '700', color: '#555' },

  content: { flex: 1 },
  contentInner: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 },

  image: {
    width: '100%',
    height: W * 0.5,
    borderRadius: 20,
    marginBottom: 20,
  },

  questionText: {
    fontSize: 20, fontWeight: '800', color: '#4A4050',
    textAlign: 'center', marginBottom: 24, lineHeight: 28,
  },
  questionTextNoImage: { fontSize: 24, marginTop: 24, marginBottom: 32, lineHeight: 34 },
  infoText: { fontSize: 32, lineHeight: 44, color: '#3A3040' },

  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  optionBtn: {
    width: (W - 44) / 2,
    minHeight: 76,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.white,
    textAlign: 'center',
    lineHeight: 19,
  },

  altWrap: { paddingTop: 4 },

  bottomPanelWrap: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 14,
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  feedbackIcon: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
  },
  feedbackText: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: 1,
  },

  continueBtn: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  continueBtnText: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 3,
  },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyText: { fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 20 },
  backLink: { fontSize: 16, color: colors.primary, fontWeight: '600' },
});
