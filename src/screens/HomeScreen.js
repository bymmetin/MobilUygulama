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

  // Bir sonraki ders yalnızca önceki ders %50+ ile geçilmişse açılır
  const isUnlocked = (tIdx, lIdx) => {
    if (tIdx === 0 && lIdx === 0) return true;
    if (lIdx > 0) {
      const prevId = topicsData[tIdx]?.lessons[lIdx - 1]?.id;
      return (progressMap[prevId]?.score ?? 0) >= 50;
    }
    const prev = topicsData[tIdx - 1];
    if (!prev) return false;
    const prevLastId = prev.lessons[prev.lessons.length - 1]?.id;
    return (progressMap[prevLastId]?.score ?? 0) >= 50;
  };

  const handleCoinPress = (lesson, unlocked) => {
    if (!unlocked) return;
    const p = progressMap[lesson.id];

    if (!p) {
      // Hiç çözülmemiş → baştan başla
      navigation.navigate('Lesson', { lesson });
    } else if (p.score === 100) {
      // Mükemmel → sonuç ekranını göster
      navigation.navigate('Result', {
        lesson,
        score: p.score,
        correct: p.correct_count ?? 0,
        total: p.total_count ?? 0,
        earnedXP: p.earned_xp ?? 0,
        review: true,
      });
    } else if (p.score >= 50) {
      // Geçildi ama eksik var → yanlış soruları tekrar çöz
      let wrongIds = [];
      try { wrongIds = p.wrong_question_ids ? JSON.parse(p.wrong_question_ids) : []; } catch (_) {}
      if (wrongIds.length > 0) {
        navigation.navigate('Lesson', {
          lesson,
          questionIds: wrongIds,
          isRetry: true,
          originalTotal: p.total_count ?? 0,
        });
      } else {
        // wrong_question_ids yoksa dersi baştan başlat
        navigation.navigate('Lesson', { lesson });
      }
    } else {
      // Başarısız (< %50) → dersi baştan başlat
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
                const score    = progress?.score ?? 0;
                const isCompleted = progress && score >= 50;   // geçildi → gri + tik
                const left = ZIGZAG[lIdx % ZIGZAG.length] * W - COIN / 2;
                const top  = lIdx * STEP;

                return (
                  <TouchableOpacity
                    key={lesson.id}
                    style={[styles.coin, { left, top }]}
                    onPress={() => handleCoinPress(lesson, unlocked)}
                    activeOpacity={unlocked ? 0.8 : 1}
                  >
                    {/* 3D katman: dış View elevation ile dairesel gölge oluşturur */}
                    <View style={[
                      styles.coinShadow,
                      !unlocked  && styles.coinFaded,
                      isCompleted && styles.coinDone,
                    ]}>
                      {/* İç View Para.png'yi daireye kırpar */}
                      <View style={styles.coinClip}>
                        <Image
                          source={require('../../assets/Para.png')}
                          style={[styles.paraImg, isCompleted && { opacity: 0.4 }]}
                        />
                      </View>
                    </View>

                    {/* Kilitli → kilit ikonu */}
                    {!unlocked && (
                      <View style={styles.lockOverlay}>
                        <KilitSvg width={34} height={34} />
                      </View>
                    )}
                    {/* Tamamlandı → yeşil tik rozeti */}
                    {isCompleted && (
                      <View style={styles.tickBadge}>
                        <Text style={styles.tickText}>✓</Text>
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
    paddingTop: 18,
    paddingBottom: 13,
    borderBottomWidth: 7,
    borderBottomColor: colors.magentaDark,
    elevation: 6,
    shadowColor: colors.magentaDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
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

  // Dış View → dairesel gölge (elevation arka plan rengini gerektiriyor)
  coinShadow: {
    width: COIN,
    height: COIN,
    borderRadius: COIN / 2,
    backgroundColor: '#E0B800',   // altın taban rengi → Android elevation görünür
    elevation: 10,
    shadowColor: '#806000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.65,
    shadowRadius: 4,
  },
  coinFaded: { opacity: 0.45 },
  coinDone:  { backgroundColor: '#A0A0A0' },  // tamamlandı → gri taban

  // İç View → Para.png'yi daireye kırpar
  coinClip: {
    width: COIN,
    height: COIN,
    borderRadius: COIN / 2,
    overflow: 'hidden',
  },

  paraImg: {
    width: COIN,
    height: COIN,
    resizeMode: 'contain',
  },

  lockOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Tamamlandı rozeti — sağ alt köşe
  tickBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#00CC44',
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tickText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 16,
  },

  emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 16, color: '#9B8FA0', fontWeight: '600' },
});
