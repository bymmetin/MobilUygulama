import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getTopics, getLessonsByTopic } from '../services/dataService';
import { getUserProgress } from '../services/contentService';
import { getCurrentUser } from '../services/authService';
import { colors } from '../config/theme';

import MesaleSvg from '../../assets/mesale.svg';
import KilitSvg from '../../assets/kilit.svg';

const { width: W } = Dimensions.get('window');
const COIN = 96;
const STEP = 126;
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
        <MesaleSvg width={32} height={32} />
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
                const left = ZIGZAG[lIdx % ZIGZAG.length] * W - COIN / 2;
                const top = lIdx * STEP;
                const isGray = progress && !isPerfect; // tamamlandı ama mükemmel değil

                return (
                  <TouchableOpacity
                    key={lesson.id}
                    style={[styles.coin, { left, top }]}
                    onPress={() => handleCoinPress(lesson, unlocked)}
                    activeOpacity={unlocked ? 0.8 : 1}
                  >
                    {/* Para.png her durumda arka plan olarak göster */}
                    <Image
                      source={require('../../assets/Para.png')}
                      style={[
                        styles.paraImg,
                        !unlocked && styles.paraFaded,   // kilitli → soluk
                        isGray && styles.paraGray,       // tamamlandı ama mükemmel değil → gri
                      ]}
                    />
                    {/* Kilitli → kilit ikonu üstte */}
                    {!unlocked && (
                      <View style={styles.lockOverlay}>
                        <KilitSvg width={34} height={34} />
                      </View>
                    )}
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Para.png tam alanı doldurur — arka plan veya daire yok
  paraImg: {
    width: COIN,
    height: COIN,
    resizeMode: 'contain',
  },
  paraFaded: { opacity: 0.45 },   // kilitli coinler
  paraGray: { opacity: 0.35 },    // tamamlandı, mükemmel değil
  // Kilit ikonu Para.png'nin üstünde ortalanmış
  lockOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 16, color: '#9B8FA0', fontWeight: '600' },
});
