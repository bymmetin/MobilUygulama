import { useCallback, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getTopics, getLessonsByTopic } from '../services/dataService';
import { getUserProgress } from '../services/contentService';
import { getCurrentUser } from '../services/authService';
import { colors } from '../config/theme';

const { width: W } = Dimensions.get('window');
const COIN = 72;
const STEP = 110;
// Zigzag X pozisyonları: ekran genişliğinin yüzdesi olarak coin merkezi
const ZIGZAG = [0.52, 0.34, 0.52, 0.68];

export default function HomeScreen({ navigation }) {
  const [topicsData, setTopicsData] = useState([]);
  const [progressMap, setProgressMap] = useState({}); // lessonId -> { score, correct_count, total_count, earned_xp }
  const [user, setUser] = useState(null);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const [u, topics] = await Promise.all([getCurrentUser(), getTopics()]);
        setUser(u);
        const data = await Promise.all(
          topics.map(async (topic) => ({
            topic,
            lessons: await getLessonsByTopic(topic.id),
          }))
        );
        setTopicsData(data);
        if (u) {
          const progress = await getUserProgress(u.id);
          const map = {};
          for (const p of progress) {
            map[p.lesson_id] = p;
          }
          setProgressMap(map);
        }
      };
      load();
    }, [])
  );

  const isUnlocked = (tIdx, lIdx) => {
    if (tIdx === 0 && lIdx === 0) return true;
    if (lIdx > 0) {
      const prevLessonId = topicsData[tIdx]?.lessons[lIdx - 1]?.id;
      return prevLessonId in progressMap;
    }
    const prev = topicsData[tIdx - 1];
    if (!prev) return false;
    const prevLastLessonId = prev.lessons[prev.lessons.length - 1]?.id;
    return prevLastLessonId in progressMap;
  };

  const handleCoinPress = (lesson, unlocked) => {
    if (!unlocked) return;
    const p = progressMap[lesson.id];
    if (p) {
      // Daha önce çözülmüş — son sonucu göster, "Tekrardan başla" seçeneğiyle
      navigation.navigate('Result', {
        lesson,
        score: p.score,
        correct: p.correct_count ?? 0,
        total: p.total_count ?? 0,
        earnedXP: p.earned_xp ?? 0,
        review: true,
      });
    } else {
      navigation.navigate('Lesson', { lesson });
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Üst çubuk */}
      <View style={styles.topBar}>
        <Text style={styles.torchEmoji}>🔦</Text>
        <Text style={styles.streakText}>{user?.streak ?? 0}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {topicsData.map(({ topic, lessons }, tIdx) => (
          <View key={topic.id}>
            {/* Ünite başlık kartı */}
            <View style={styles.unitBanner}>
              <Text style={styles.unitLabel}>ÜNİTE {tIdx + 1}:</Text>
              <Text style={styles.unitTitle}>{topic.title}</Text>
            </View>

            {/* Ders yolu — zigzag */}
            <View style={{ height: lessons.length * STEP + COIN + 16, position: 'relative' }}>
              {lessons.map((lesson, lIdx) => {
                const unlocked = isUnlocked(tIdx, lIdx);
                const progress = progressMap[lesson.id];
                const isPerfect = progress?.score === 100;
                const isFirstEver = tIdx === 0 && lIdx === 0;
                const left = ZIGZAG[lIdx % ZIGZAG.length] * W - COIN / 2;
                const top = lIdx * STEP;

                // Renk: tamamen doğru (100%) → altın, diğer her durum → gri
                const coinStyle = isPerfect ? styles.coinUnlocked : styles.coinLocked;

                return (
                  <TouchableOpacity
                    key={lesson.id}
                    style={[styles.coin, coinStyle, { left, top }]}
                    onPress={() => handleCoinPress(lesson, unlocked)}
                    activeOpacity={unlocked ? 0.8 : 1}
                  >
                    {isFirstEver && unlocked ? (
                      <Image
                        source={require('../../assets/logo.png')}
                        style={styles.coinLogo}
                        resizeMode="contain"
                      />
                    ) : !unlocked ? (
                      <Text style={styles.coinEmoji}>🔒</Text>
                    ) : isPerfect ? (
                      <Text style={styles.coinEmoji}>⭐</Text>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        {topicsData.length === 0 && (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Konular yükleniyor...</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  topBar: {
    backgroundColor: colors.magenta,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  torchEmoji: { fontSize: 26 },
  streakText: { fontSize: 22, fontWeight: '900', color: colors.white },

  scroll: { paddingBottom: 48 },

  unitBanner: {
    backgroundColor: colors.magenta,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 8,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 18,
    shadowColor: colors.magentaDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  unitLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  unitTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.white,
    marginTop: 4,
  },

  coin: {
    position: 'absolute',
    width: COIN,
    height: COIN,
    borderRadius: COIN / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinUnlocked: {
    backgroundColor: colors.coinGold,
    borderWidth: 4,
    borderColor: colors.coinGoldBorder,
    shadowColor: colors.coinGoldShadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  coinLocked: {
    backgroundColor: colors.coinLocked,
    borderWidth: 4,
    borderColor: colors.coinLockedBorder,
    shadowColor: '#888070',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 0,
    elevation: 4,
  },
  coinEmoji: { fontSize: 30 },
  coinLogo: { width: 56, height: 56 },

  emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 16, color: '#9B8FA0', fontWeight: '600' },
});
