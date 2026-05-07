import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getTopics, getLessonsByTopic } from '../services/dataService';
import { getUserProgress } from '../services/contentService';
import { getCurrentUser } from '../services/authService';
import { colors, fonts } from '../config/theme';

import MesaleSvg from '../../assets/mesale.svg';
import KilitSvg from '../../assets/kilit.svg';

const { width: W } = Dimensions.get('window');
const COIN    = 66;
const STEP    = 96;
const LABEL_W = COIN + 48;
const ZIGZAG  = [0.50, 0.30, 0.50, 0.70];

export default function HomeScreen({ navigation }) {
  const [topicsData, setTopicsData] = useState([]);
  const [progressMap, setProgressMap] = useState({});
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
        setTopicsData(data.filter(({ lessons }) => lessons.length > 0));
        if (u) {
          const progress = await getUserProgress(u.id);
          const map = {};
          for (const p of progress) map[p.lesson_id] = p;
          setProgressMap(map);
        }
      };
      load();
    }, [])
  );

  // Her ünitenin İLK aşaması her zaman açık.
  // Sonrakiler: önceki aşama %50+ geçilince açılır.
  const isUnlocked = (tIdx, lIdx) => {
    if (lIdx === 0) return true;
    const prevId = topicsData[tIdx]?.lessons[lIdx - 1]?.id;
    return (progressMap[prevId]?.score ?? 0) >= 50;
  };

  const handleCoinPress = (lesson, unlocked, tIdx, lIdx) => {
    if (!unlocked) return;

    // Önceki aşama → LessonScreen'e gönder (önceki ders sorusu için)
    const prevLesson = lIdx > 0 ? topicsData[tIdx]?.lessons[lIdx - 1] : null;

    const p = progressMap[lesson.id];

    if (!p) {
      navigation.navigate('Lesson', { lesson, prevLesson });
    } else if (p.score === 100) {
      // Tamamlandı → sonuç ekranı (review modunda)
      navigation.navigate('Result', {
        lesson,
        score: p.score,
        correct: p.correct_count ?? 0,
        total: p.total_count ?? 0,
        earnedXP: p.earned_xp ?? 0,
        review: true,
      });
    } else if (p.score >= 50) {
      let wrongIds = [];
      try { wrongIds = p.wrong_question_ids ? JSON.parse(p.wrong_question_ids) : []; } catch (_) {}
      if (wrongIds.length > 0) {
        navigation.navigate('Lesson', {
          lesson,
          prevLesson,
          questionIds: wrongIds,
          isRetry: true,
          originalTotal: p.total_count ?? 0,
        });
      } else {
        navigation.navigate('Lesson', { lesson, prevLesson });
      }
    } else {
      navigation.navigate('Lesson', { lesson, prevLesson });
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Üst çubuk */}
      <View style={styles.topBar}>
        <MesaleSvg width={28} height={28} />
        <Text style={styles.streakText}>{user?.streak ?? 0}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {topicsData.map(({ topic, lessons }, tIdx) => {
          const pathHeight = lessons.length * STEP + 24;
          return (
            <View key={topic.id} style={styles.unitBlock}>
              {/* Ünite başlık kartı */}
              <View style={styles.unitBanner}>
                <Text style={styles.unitLabel}>ÜNİTE {tIdx + 1}</Text>
                <Text style={styles.unitTitle}>{topic.title}</Text>
              </View>

              {/* Aşama yolu — zigzag */}
              <View style={{ height: pathHeight, position: 'relative', marginTop: 20 }}>
                {lessons.map((lesson, lIdx) => {
                  const unlocked    = isUnlocked(tIdx, lIdx);
                  const progress    = progressMap[lesson.id];
                  const score       = progress?.score ?? 0;
                  const isCompleted = !!progress && score >= 50;
                  const left = ZIGZAG[lIdx % ZIGZAG.length] * W - COIN / 2;
                  const top  = lIdx * STEP;

                  return (
                    <React.Fragment key={lesson.id}>
                      <TouchableOpacity
                        style={[styles.coin, { left, top }]}
                        onPress={() => handleCoinPress(lesson, unlocked, tIdx, lIdx)}
                        activeOpacity={unlocked ? 0.8 : 1}
                      >
                        {/* Coin */}
                        <View style={[
                          styles.coinWrap,
                          !unlocked  && styles.coinFaded,
                          isCompleted && styles.coinDone,
                        ]}>
                          <Image
                            source={require('../../assets/Para.png')}
                            style={[styles.paraImg, isCompleted && { opacity: 0.4 }]}
                          />
                        </View>

                        {/* Kilitli → kilit ikonu */}
                        {!unlocked && (
                          <View style={styles.lockOverlay}>
                            <KilitSvg width={24} height={24} />
                          </View>
                        )}

                        {/* Tamamlandı → tik rozeti */}
                        {isCompleted && (
                          <View style={styles.tickBadge}>
                            <Text style={styles.tickText}>✓</Text>
                          </View>
                        )}
                      </TouchableOpacity>

                      {/* Aşama etiketi — coin merkezinin tam altında */}
                      <Text
                        style={[styles.stageLabel, {
                          left: left - (LABEL_W - COIN) / 2,
                          top: top + COIN + 4,
                        }]}
                        numberOfLines={2}
                      >
                        {lesson.title}
                      </Text>
                    </React.Fragment>
                  );
                })}
              </View>
            </View>
          );
        })}

        {topicsData.length === 0 && (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>İçerik yükleniyor…</Text>
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
    paddingTop: 12,
    paddingBottom: 8,
    gap: 8,
    borderBottomWidth: 5,
    borderBottomColor: colors.magentaDark,
    elevation: 8,
    shadowColor: colors.magentaDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 0,
  },
  streakText: { fontSize: 20, fontWeight: '900', color: colors.white },

  scroll: { paddingBottom: 60 },

  unitBlock: {
    marginBottom: 8,
  },

  unitBanner: {
    backgroundColor: colors.magenta,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 4,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 6,
    borderBottomColor: colors.magentaDark,
    elevation: 5,
    shadowColor: colors.magentaDark,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  unitLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.70)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  unitTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.white,
    marginTop: 2,
  },

  // ── Coin ──────────────────────────────────────────────────────────────────
  coin: {
    position: 'absolute',
    width: COIN,
    height: COIN,
    justifyContent: 'center',
    alignItems: 'center',
  },

  coinWrap: {
    width: COIN,
    height: COIN,
    borderRadius: COIN / 2,
    backgroundColor: '#D4A800',
    elevation: 5,
    shadowColor: '#7A5000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinFaded: { opacity: 0.45 },
  coinDone:  { backgroundColor: '#909090' },

  paraImg: {
    width: COIN * 1.22,
    height: COIN * 1.22,
    resizeMode: 'contain',
  },

  lockOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },

  tickBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#00CC44',
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tickText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    lineHeight: 13,
  },

  stageLabel: {
    position: 'absolute',
    width: LABEL_W,
    fontSize: 10,
    fontWeight: '700',
    color: '#7A6080',
    textAlign: 'center',
  },

  emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 15, color: '#9B8FA0', fontWeight: '600' },
});
