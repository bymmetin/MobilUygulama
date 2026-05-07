import { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Image, Dimensions, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getQuestionsByLesson, getRandomAnswerableQuestion } from '../services/dataService';
import { saveProgress, addXP } from '../services/contentService';
import { getCurrentUser } from '../services/authService';
import QuestionMatching from '../components/QuestionMatching';
import QuestionFillBlank from '../components/QuestionFillBlank';
import { colors } from '../config/theme';

const { width: W } = Dimensions.get('window');
const MAX_LIVES     = 3;
const XP_PER_CORRECT = 10;

// Bilgi kartı mı? (şık yok → cevaplanamaz kart)
const isInfoCard = (q) =>
  q?.question_type === 'multiple_choice' && !q?.option_a;

export default function LessonScreen({ route, navigation }) {
  const { lesson }    = route.params;
  const prevLesson    = route.params?.prevLesson    ?? null;
  const questionIds   = route.params?.questionIds   ?? null;
  const isRetry       = route.params?.isRetry       ?? false;
  const originalTotal = route.params?.originalTotal ?? null;

  const [questions,  setQuestions]  = useState([]);
  const [index,      setIndex]      = useState(0);
  const [correct,    setCorrect]    = useState(0);
  const [lives,      setLives]      = useState(MAX_LIVES);
  const [user,       setUser]       = useState(null);
  const [answered,   setAnswered]   = useState(false);
  const [lastCorrect,setLastCorrect]= useState(false);
  const [selected,   setSelected]   = useState(null);
  const [finishing,  setFinishing]  = useState(false);

  const wrongIdsRef = useRef([]);

  useEffect(() => {
    const load = async () => {
      // Soruları ID sırasıyla çek (bilgi kartı → soru sırası korunuyor)
      let allQs = await getQuestionsByLesson(lesson.id);

      // Önceki aşamadan 1 rastgele soru ekle (retry modunda ekleme)
      if (prevLesson && !isRetry) {
        const prevQ = await getRandomAnswerableQuestion(prevLesson.id);
        if (prevQ) {
          allQs = [
            ...allQs,
            { ...prevQ, _isPrevStage: true, _prevTitle: prevLesson.title },
          ];
        }
      }

      if (questionIds && questionIds.length > 0) {
        setQuestions(allQs.filter(q => questionIds.includes(q.id)));
      } else {
        setQuestions(allQs);
      }
    };
    load();
    getCurrentUser().then(setUser);
  }, []);

  const question     = questions[index];
  const isLast       = index === questions.length - 1;
  const questionType = question?.question_type ?? 'multiple_choice';
  const infoCard     = isInfoCard(question);
  const isPrevStage  = !!question?._isPrevStage;

  // Cevaplanabilir sorular (bilgi kartı ve önceki aşama sorusu hariç)
  const answerableCount = questions.filter(
    q => !isInfoCard(q) && !q._isPrevStage
  ).length;

  const finishLesson = async (finalCorrect, explicitWrongIds) => {
    if (finishing) return;
    setFinishing(true);

    const allRetryCorrect  = isRetry && finalCorrect === (questionIds?.length ?? 0);
    const finalWrongIds    = explicitWrongIds ?? wrongIdsRef.current;
    const wrongIdsToSave   = allRetryCorrect ? [] : finalWrongIds;

    // Skor — bilgi kartları ve önceki aşama sorusu sayılmaz
    const scoreBase    = answerableCount || 1;
    const displayTotal = allRetryCorrect
      ? (originalTotal ?? scoreBase)
      : scoreBase;
    const displayCorrect = allRetryCorrect ? displayTotal : finalCorrect;
    const score = allRetryCorrect
      ? 100
      : Math.round((finalCorrect / scoreBase) * 100);

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
      console.warn('finishLesson DB hatası:', e.message);
    }

    navigation.replace('Result', {
      lesson, score, correct: displayCorrect, total: displayTotal, earnedXP,
    });
  };

  const handleAnswered = (isCorrect) => {
    if (answered) return;
    setAnswered(true);
    setLastCorrect(isCorrect);

    // Önceki aşama sorusu: skoru / canı etkileme, sadece geri bildirim göster
    if (isPrevStage) return;

    const newCorrect = isCorrect ? correct + 1 : correct;
    if (isCorrect) {
      setCorrect(newCorrect);
    } else {
      wrongIdsRef.current = [...wrongIdsRef.current, question.id];
      const newLives = Math.max(0, lives - 1);
      setLives(newLives);
      if (newLives === 0) {
        const captured = wrongIdsRef.current;
        setTimeout(() => finishLesson(newCorrect, captured), 700);
      }
    }
  };

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

  const hasImage     = !!question.image_url;
  const showBottomPanel = answered || infoCard;
  const panelBg = infoCard
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
        {/* Önceki aşama rozeti */}
        {isPrevStage && (
          <View style={styles.prevStageBadge}>
            <Text style={styles.prevStageBadgeText}>
              🔄  {question._prevTitle} tekrarı
            </Text>
          </View>
        )}

        {questionType === 'multiple_choice' && (
          <>
            {hasImage && (
              <Image
                source={{ uri: question.image_url }}
                style={styles.image}
                resizeMode="cover"
              />
            )}

            <Text style={[
              styles.questionText,
              infoCard && styles.infoText,
              !hasImage && !infoCard && styles.questionTextNoImage,
            ]}>
              {question.question_text}
            </Text>

            {!infoCard && (
              <View style={styles.optionsGrid}>
                {OPTIONS.map(({ key, value }) => {
                  const isSelected   = selected === key;
                  const isCorrectOpt = question.correct_answer === key;
                  let bg     = colors.magentaBtn;
                  let shadow = colors.magentaBtnShadow;
                  if (answered) {
                    if (isCorrectOpt)       { bg = '#00BB00'; shadow = '#007700'; }
                    else if (isSelected)    { bg = '#CC2020'; shadow = '#880000'; }
                    else                    { bg = '#CC00AA'; shadow = '#880070'; }
                  }
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[styles.optionBtn, { backgroundColor: bg, shadowColor: shadow, borderBottomColor: shadow }]}
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

      {/* Alt panel */}
      {showBottomPanel && (
        <SafeAreaView edges={['bottom']} style={[styles.bottomPanelWrap, { backgroundColor: panelBg }]}>
          {answered && !infoCard && (
            <View style={styles.feedbackRow}>
              <Text style={styles.feedbackIcon}>{lastCorrect ? '✓' : '✗'}</Text>
              <Text style={styles.feedbackText}>
                {lastCorrect
                  ? (isPrevStage ? 'Harika, hatırladın!' : 'Doğru!')
                  : (isPrevStage ? 'Unutmuşsun!' : 'Yanlış')}
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={[
              styles.continueBtn,
              {
                backgroundColor: infoCard ? colors.btnGreen : colors.white,
                borderBottomColor: infoCard ? colors.btnGreenDark : 'rgba(0,0,0,0.15)',
              },
            ]}
            onPress={handleNext}
            activeOpacity={0.85}
          >
            <Text style={[
              styles.continueBtnText,
              { color: infoCard ? colors.white : panelBg },
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

  // Önceki aşama rozeti
  prevStageBadge: {
    alignSelf: 'center',
    backgroundColor: '#EDE0FF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#C8A8FF',
  },
  prevStageBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7030A0',
  },

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

  // Bilgi kartı — font küçük ve okunabilir
  infoText: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 26,
    color: '#3A3040',
    textAlign: 'left',
    marginTop: 8,
    marginBottom: 8,
  },

  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  optionBtn: {
    width: (W - 44) / 2,
    minHeight: 76,
    paddingTop: 14,
    paddingBottom: 10,
    paddingHorizontal: 12,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 6,
    elevation: 3,
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
  feedbackIcon: { fontSize: 28, fontWeight: 'bold', color: colors.white },
  feedbackText: { fontSize: 22, fontWeight: '900', color: colors.white, letterSpacing: 1 },

  continueBtn: {
    borderRadius: 16,
    paddingTop: 18,
    paddingBottom: 14,
    alignItems: 'center',
    borderBottomWidth: 5,
    elevation: 3,
  },
  continueBtnText: { fontSize: 22, fontWeight: '900', letterSpacing: 3 },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyText: { fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 20 },
  backLink: { fontSize: 16, color: colors.primary, fontWeight: '600' },
});
