import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getLessonsByTopic } from '../services/dataService';
import { getUserProgress } from '../services/contentService';
import { getCurrentUser } from '../services/authService';

export default function TopicDetailScreen({ route, navigation }) {
  const { topic } = route.params;
  const [lessons, setLessons] = useState([]);
  const [completedIds, setCompletedIds] = useState(new Set());

  useEffect(() => {
    const load = async () => {
      const [lessonList, user] = await Promise.all([
        getLessonsByTopic(topic.id),
        getCurrentUser(),
      ]);
      setLessons(lessonList);
      if (user) {
        const progress = await getUserProgress(user.id);
        setCompletedIds(new Set(progress.filter(p => p.completed).map(p => p.lesson_id)));
      }
    };
    load();
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation]);

  const renderLesson = ({ item, index }) => {
    const done = completedIds.has(item.id);
    return (
      <TouchableOpacity
        style={[styles.card, done && styles.cardDone]}
        onPress={() => navigation.navigate('Lesson', { lesson: item })}
      >
        <View style={[styles.circle, done && styles.circleDone]}>
          <Text style={styles.circleText}>{done ? '✓' : index + 1}</Text>
        </View>
        <Text style={[styles.lessonTitle, done && styles.lessonTitleDone]}>{item.title}</Text>
        {done && <Text style={styles.doneLabel}>Tamamlandı</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>‹ Geri</Text>
      </TouchableOpacity>
      <Text style={styles.title}>{topic.title}</Text>
      <Text style={styles.sub}>{topic.description}</Text>
      <FlatList
        data={lessons}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderLesson}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Bu konuda henüz ders yok.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  backBtn: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 },
  backText: { fontSize: 17, color: '#4F46E5', fontWeight: '600' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#111827', paddingHorizontal: 20, marginTop: 4 },
  sub: { fontSize: 13, color: '#6B7280', paddingHorizontal: 20, marginTop: 4, marginBottom: 16 },
  list: { paddingHorizontal: 20, paddingBottom: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardDone: { backgroundColor: '#F0FDF4' },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  circleDone: { backgroundColor: '#10B981' },
  circleText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  lessonTitle: { flex: 1, fontSize: 15, fontWeight: '600', color: '#111827' },
  lessonTitleDone: { color: '#059669' },
  doneLabel: { fontSize: 11, color: '#10B981', fontWeight: '700' },
  empty: { textAlign: 'center', color: '#9CA3AF', marginTop: 40, fontSize: 15 },
});
