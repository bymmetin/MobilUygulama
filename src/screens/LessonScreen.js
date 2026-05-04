import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getQuestionsByLesson } from '../services/dataService';
import { saveProgress, addXP } from '../services/contentService';
import { getCurrentUser } from '../services/authService';
import QuestionMatching from '../components/QuestionMatching';
import QuestionFillBlank from '../components/QuestionFillBlank';
import { colors, fonts } from '../config/theme';

const OPTIONS = ['A', 'B', 'C', 'D'];
const XP_PER_CORRECT = 10;

export default function LessonScreen({ route, navigation }) {
  const { lesson } = route.params;
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [user, setUser] = useState(null);

  // Ortak cevap sonrası durum
  const [answered, setAnswered] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(false);

  // Çoktan seçmeli
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getQuestionsByLesson(lesson.id).then(setQuestions);
    getCurrentUser().then(setUser);
  }, []);

  const question = questions[index];
  const isLast = index === questions.length - 1;
  const questionType = question?.question_type ?? 'multiple_choice';

  // ── Ortak cevap callback ──────────────────────────────────
  const handleAnswered = (isCorrect) => {
    setAnswered(true);
    setLastCorrect(isCorrect);
    if (isCorrect) setCorrect(c => c + 1);
  };

  // ── Sonraki soru / Bitir ──────────────────────────────────
  const handleNext = async () => {
    const totalCorrect = correct + (lastCorrect && !answered ? 0 : 0); // already counted
    if (isLast) {
      const score = Math.round((correct / questions.length) * 100);
      const earnedXP = correct * XP_PER_CORRECT;
      if (user) {
        await saveProgress(user.id, lesson.id, score);
        await addXP(user.id, earnedXP);
      }
      navigation.replace('Result', {
        lesson,
        score,
        correct,
        total: questions.length,
        earnedXP,
      });
    } else {
      setIndex(i => i + 1);
      setAnswered(false);
      setLastCorrect(false);
      setSelected(null);
    }
  };

  // ── Çoktan seçmeli seçim ─────────────────────────────────
  const handleSelect = (letter) => {
    if (answered) return;
    setSelected(letter);
    const isCorrect = letter === question.correct_answer;
    handleAnswered(isCorrect);
  };

  const optionText = (q, letter) =>
    ({ A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d }[letter]);

  // ── Boş ekran ─────────────────────────────────────────────
  if (!question) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.empty}>Bu ders için henüz soru eklenmemiş.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Geri Dön</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Üst bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${((index + 1) / questions.length) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.counter}>{index + 1}/{questions.length}</Text>
      </View>

      {/* Gövde */}
      <View style={styles.body}>
        <Text style={styles.lessonName}>{lesson.title}</Text>
        <Text style={styles.questionText}>{question.question_text}</Text>

        {/* ── Çoktan seçmeli ── */}
        {questionType === 'multiple_choice' && (
          <View style={styles.options}>
            {OPTIONS.map(letter => {
              const text = optionText(question, letter);
              if (!text) return null;
              const isSelected = selected === letter;
              const isCorrect = question.correct_answer === letter;
              let bg = '#fff';
              if (answered) {
                if (isCorrect) bg = '#D1FAE5';
                else if (isSelected) bg = '#FEE2E2';
              }
              return (
                <TouchableOpacity
                  key={letter}
                  style={[styles.option, { backgroundColor: bg }, isSelected && styles.optionSelected]}
                  onPress={() => handleSelect(letter)}
                  disabled={answered}
                >
                  <View style={styles.optionLetter}>
                    <Text style={styles.optionLetterText}>{letter}</Text>
                  </View>
                  <Text style={styles.optionText}>{text}</Text>
                  {answered && isCorrect && <Text style={styles.tick}>✓</Text>}
                  {answered && isSelected && !isCorrect && <Text style={styles.cross}>✗</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* ── Eşleştirme ── */}
        {questionType === 'matching' && (
          <QuestionMatching question={question} onAnswered={handleAnswered} />
        )}

        {/* ── Boşluk doldurma ── */}
        {questionType === 'fill_blank' && (
          <QuestionFillBlank question={question} onAnswered={handleAnswered} />
        )}
      </View>

      {/* Alt bar — cevap verildikten sonra */}
      {answered && (
        <View style={styles.footer}>
          <View style={[
            styles.feedbackBar,
            { backgroundColor: lastCorrect ? '#D1FAE5' : '#FEE2E2' },
          ]}>
            <Text style={[
              styles.feedbackText,
              { color: lastCorrect ? '#065F46' : '#991B1B' },
            ]}>
              {lastCorrect ? '✓ Doğru!' : '✗ Yanlış'}
            </Text>
          </View>
          <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
            <Text style={styles.nextBtnText}>{isLast ? 'Bitir' : 'Devam'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 12,
  },
  closeText: { fontSize: 18, color: '#6B7280', fontWeight: 'bold' },
  progressTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: { height: 8, backgroundColor: colors.primary, borderRadius: 4 },
  counter: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: '#6B7280',
    minWidth: 36,
    textAlign: 'right',
  },
  body: { flex: 1, padding: 20 },
  lessonName: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  questionText: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: '#111827',
    lineHeight: 28,
    marginBottom: 24,
  },
  options: { gap: 12 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  optionSelected: { borderColor: colors.primary },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionLetterText: { fontFamily: fonts.bold, color: colors.primary },
  optionText: { flex: 1, fontFamily: fonts.regular, fontSize: 15, color: '#111827' },
  tick: { fontSize: 18, color: '#059669' },
  cross: { fontSize: 18, color: '#DC2626' },
  footer: { paddingHorizontal: 20, paddingBottom: 24 },
  feedbackBar: { borderRadius: 10, padding: 12, marginBottom: 12 },
  feedbackText: { fontFamily: fonts.bold, fontSize: 15 },
  nextBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  nextBtnText: { fontFamily: fonts.poppinsBold, color: '#fff', fontSize: 16 },
  empty: { textAlign: 'center', marginTop: 80, fontSize: 16, color: '#6B7280', padding: 20 },
  backBtn: { alignSelf: 'center', marginTop: 20 },
  backText: { color: colors.primary, fontSize: 16, fontFamily: fonts.bold },
});
