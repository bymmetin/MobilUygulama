import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getQuestionsByLesson } from '../services/dataService';
import { saveProgress, addXP } from '../services/contentService';
import { getCurrentUser } from '../services/authService';

const OPTIONS = ['A', 'B', 'C', 'D'];
const XP_PER_CORRECT = 10;

export default function LessonScreen({ route, navigation }) {
  const { lesson } = route.params;
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [correct, setCorrect] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    getQuestionsByLesson(lesson.id).then(setQuestions);
    getCurrentUser().then(setUser);
  }, []);

  const question = questions[index];
  const isLast = index === questions.length - 1;

  const optionText = (q, letter) => {
    const map = { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d };
    return map[letter];
  };

  const handleSelect = (letter) => {
    if (selected) return;
    setSelected(letter);
    if (letter === question.correct_answer) setCorrect((c) => c + 1);
  };

  const handleNext = async () => {
    if (isLast) {
      const score = Math.round(((correct + (selected === question?.correct_answer ? 1 : 0)) / questions.length) * 100);
      const earnedXP = (correct + (selected === question?.correct_answer ? 1 : 0)) * XP_PER_CORRECT;
      if (user) {
        await saveProgress(user.id, lesson.id, score);
        await addXP(user.id, earnedXP);
      }
      navigation.replace('Result', {
        lesson,
        score,
        correct: correct + (selected === question?.correct_answer ? 1 : 0),
        total: questions.length,
        earnedXP,
      });
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
    }
  };

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
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${((index) / questions.length) * 100}%` }]} />
        </View>
        <Text style={styles.counter}>{index + 1}/{questions.length}</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.lessonName}>{lesson.title}</Text>
        <Text style={styles.questionText}>{question.question_text}</Text>

        <View style={styles.options}>
          {OPTIONS.map((letter) => {
            const text = optionText(question, letter);
            if (!text) return null;
            const isSelected = selected === letter;
            const isCorrect = question.correct_answer === letter;
            let bg = '#fff';
            if (selected) {
              if (isCorrect) bg = '#D1FAE5';
              else if (isSelected) bg = '#FEE2E2';
            }
            return (
              <TouchableOpacity
                key={letter}
                style={[styles.option, { backgroundColor: bg }, isSelected && styles.optionSelected]}
                onPress={() => handleSelect(letter)}
                disabled={!!selected}
              >
                <View style={styles.optionLetter}>
                  <Text style={styles.optionLetterText}>{letter}</Text>
                </View>
                <Text style={styles.optionText}>{text}</Text>
                {selected && isCorrect && <Text style={styles.tick}>✓</Text>}
                {selected && isSelected && !isCorrect && <Text style={styles.cross}>✗</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {selected && (
        <View style={styles.footer}>
          <View style={[styles.feedbackBar, { backgroundColor: selected === question.correct_answer ? '#D1FAE5' : '#FEE2E2' }]}>
            <Text style={[styles.feedbackText, { color: selected === question.correct_answer ? '#065F46' : '#991B1B' }]}>
              {selected === question.correct_answer ? '✓ Doğru!' : `✗ Doğru cevap: ${question.correct_answer}`}
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
  progressTrack: { flex: 1, height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: 8, backgroundColor: '#4F46E5', borderRadius: 4 },
  counter: { fontSize: 13, color: '#6B7280', fontWeight: '600', minWidth: 36, textAlign: 'right' },
  body: { flex: 1, padding: 20 },
  lessonName: { fontSize: 13, color: '#6B7280', fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  questionText: { fontSize: 20, fontWeight: '700', color: '#111827', lineHeight: 28, marginBottom: 28 },
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
  optionSelected: { borderColor: '#4F46E5' },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionLetterText: { fontWeight: 'bold', color: '#4F46E5' },
  optionText: { flex: 1, fontSize: 15, color: '#111827' },
  tick: { fontSize: 18, color: '#059669' },
  cross: { fontSize: 18, color: '#DC2626' },
  footer: { paddingHorizontal: 20, paddingBottom: 24 },
  feedbackBar: { borderRadius: 10, padding: 12, marginBottom: 12 },
  feedbackText: { fontSize: 15, fontWeight: '700' },
  nextBtn: { backgroundColor: '#4F46E5', borderRadius: 12, padding: 16, alignItems: 'center' },
  nextBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  empty: { textAlign: 'center', marginTop: 80, fontSize: 16, color: '#6B7280', padding: 20 },
  backBtn: { alignSelf: 'center', marginTop: 20 },
  backText: { color: '#4F46E5', fontSize: 16, fontWeight: '600' },
});
