import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ResultScreen({ route, navigation }) {
  const { lesson, score, correct, total, earnedXP } = route.params;
  const passed = score >= 60;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.emoji}>{passed ? '🎉' : '😅'}</Text>
        <Text style={styles.resultTitle}>{passed ? 'Harika!' : 'Neredeyse!'}</Text>
        <Text style={styles.lessonName}>{lesson.title}</Text>

        <View style={styles.scoreBox}>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreNum}>{correct}/{total}</Text>
            <Text style={styles.scoreLabel}>Doğru</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.scoreItem}>
            <Text style={[styles.scoreNum, { color: '#D97706' }]}>+{earnedXP}</Text>
            <Text style={styles.scoreLabel}>XP</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.scoreItem}>
            <Text style={[styles.scoreNum, { color: passed ? '#059669' : '#DC2626' }]}>%{score}</Text>
            <Text style={styles.scoreLabel}>Puan</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.retryBtn}
          onPress={() => navigation.replace('Lesson', { lesson })}
        >
          <Text style={styles.retryBtnText}>Tekrar Dene</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => navigation.navigate('HomeTabs')}
        >
          <Text style={styles.homeBtnText}>Ana Sayfaya Dön</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emoji: { fontSize: 72, marginBottom: 12 },
  resultTitle: { fontSize: 32, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  lessonName: { fontSize: 15, color: '#6B7280', marginBottom: 40 },
  scoreBox: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    marginBottom: 40,
  },
  scoreItem: { alignItems: 'center' },
  scoreNum: { fontSize: 28, fontWeight: 'bold', color: '#111827' },
  scoreLabel: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  divider: { width: 1, height: 40, backgroundColor: '#E5E7EB' },
  retryBtn: {
    backgroundColor: '#4F46E5',
    borderRadius: 14,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  retryBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  homeBtn: {
    borderWidth: 2,
    borderColor: '#4F46E5',
    borderRadius: 14,
    padding: 14,
    width: '100%',
    alignItems: 'center',
  },
  homeBtnText: { color: '#4F46E5', fontWeight: '700', fontSize: 16 },
});
