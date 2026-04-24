import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getTopics } from '../services/dataService';
import { getCurrentUser } from '../services/authService';

export default function HomeScreen({ navigation }) {
  const [topics, setTopics] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    getTopics().then(setTopics);
    getCurrentUser().then(setUser);
  }, []);

  const renderTopic = ({ item, index }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('TopicDetail', { topic: item })}
    >
      <View style={styles.cardLeft}>
        <View style={[styles.badge, { backgroundColor: COLORS[index % COLORS.length] }]}>
          <Text style={styles.badgeText}>{index + 1}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardSub}>{item.description}</Text>
        </View>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Merhaba, {user?.username ?? '...'} 👋</Text>
        <View style={styles.xpBadge}>
          <Text style={styles.xpText}>⚡ {user?.xp ?? 0} XP</Text>
        </View>
      </View>
      <Text style={styles.sectionTitle}>Konular</Text>
      <FlatList
        data={topics}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderTopic}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const COLORS = ['#4F46E5', '#0891B2', '#059669', '#D97706', '#DC2626'];

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: { fontSize: 18, fontWeight: '600', color: '#111827' },
  xpBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  xpText: { color: '#D97706', fontWeight: '700', fontSize: 14 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#111827', paddingHorizontal: 20, marginTop: 12, marginBottom: 8 },
  list: { paddingHorizontal: 20, paddingBottom: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  badgeText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 2 },
  cardSub: { fontSize: 12, color: '#6B7280' },
  arrow: { fontSize: 24, color: '#9CA3AF' },
});
