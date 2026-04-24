import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCurrentUser, logout } from '../services/authService';
import { getUserProgress } from '../services/contentService';

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      const u = await getCurrentUser();
      setUser(u);
      if (u) {
        const progress = await getUserProgress(u.id);
        setCompletedCount(progress.filter(p => p.completed).length);
      }
    };
    load();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.username?.[0]?.toUpperCase() ?? '?'}</Text>
        </View>
        <Text style={styles.username}>{user?.username ?? '...'}</Text>
        <Text style={styles.email}>{user?.email ?? ''}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{user?.xp ?? 0}</Text>
            <Text style={styles.statLabel}>⚡ XP</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{user?.streak ?? 0}</Text>
            <Text style={styles.statLabel}>🔥 Seri</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{completedCount}</Text>
            <Text style={styles.statLabel}>📚 Ders</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { flex: 1, alignItems: 'center', padding: 24, paddingTop: 48 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: { fontSize: 36, fontWeight: 'bold', color: '#fff' },
  username: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  email: { fontSize: 14, color: '#6B7280', marginBottom: 36 },
  statsRow: { flexDirection: 'row', gap: 16, marginBottom: 48 },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    minWidth: 90,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statNum: { fontSize: 26, fontWeight: 'bold', color: '#111827' },
  statLabel: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  logoutBtn: {
    borderWidth: 2,
    borderColor: '#EF4444',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 40,
  },
  logoutText: { color: '#EF4444', fontWeight: '700', fontSize: 16 },
});
