import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCurrentUser, logout } from '../services/authService';
import { getUserProgress } from '../services/contentService';
import { colors } from '../config/theme';

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [avgScore, setAvgScore] = useState(0);

  useEffect(() => {
    const load = async () => {
      const u = await getCurrentUser();
      setUser(u);
      if (u) {
        const progress = await getUserProgress(u.id);
        const completed = progress.filter(p => p.completed);
        setCompletedCount(completed.length);
        if (completed.length > 0) {
          const total = completed.reduce((s, p) => s + p.score, 0);
          setAvgScore(Math.round(total / completed.length));
        }
      }
    };
    load();
  }, []);

  const initials = user?.username?.slice(0, 2).toUpperCase() ?? '??';
  const level = Math.floor((user?.xp ?? 0) / 100) + 1;
  const xpInLevel = (user?.xp ?? 0) % 100;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Üst satır: avatar + bilgiler başlığı */}
        <View style={styles.topRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoBoxTitle}>BİLGİLER</Text>
            <Text style={styles.infoBoxName} numberOfLines={1}>
              {user?.username ?? '...'}
            </Text>
            <Text style={styles.infoBoxEmail} numberOfLines={1}>
              {user?.email ?? ''}
            </Text>
          </View>
        </View>

        {/* Ders bilgisi kartı */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>DERS BİLGİSİ</Text>
          <View style={styles.cardRow}>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{completedCount}</Text>
              <Text style={styles.statLabel}>Tamamlanan{'\n'}Ders</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>%{avgScore}</Text>
              <Text style={styles.statLabel}>Ortalama{'\n'}Başarı</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>{user?.streak ?? 0}</Text>
              <Text style={styles.statLabel}>Günlük{'\n'}Seri 🔥</Text>
            </View>
          </View>
        </View>

        {/* XP ve level kartı */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>XP VE LEVEL BİLGİSİ</Text>
          <View style={styles.cardRow}>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{user?.xp ?? 0}</Text>
              <Text style={styles.statLabel}>Toplam XP{'\n'}⚡</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>{level}</Text>
              <Text style={styles.statLabel}>Level{'\n'}🏆</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>{xpInLevel}/100</Text>
              <Text style={styles.statLabel}>Sonraki{'\n'}Level</Text>
            </View>
          </View>
          {/* XP bar */}
          <View style={styles.xpTrack}>
            <View style={[styles.xpFill, { width: `${xpInLevel}%` }]} />
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 20, paddingTop: 24, paddingBottom: 40 },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 24,
  },
  // Avatar: solid arka plan + elevation → Android dairesel gölge
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    elevation: 12,
    shadowColor: '#4A4060',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 7,
  },
  avatarText: { fontSize: 32, fontWeight: '900', color: '#5A4868' },
  infoBox: {
    flex: 1,
    backgroundColor: colors.cardBg,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 9,
    justifyContent: 'center',
    minHeight: 90,
    borderBottomWidth: 5,
    borderBottomColor: '#A098A8',
    elevation: 4,
    shadowColor: '#A098A8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  infoBoxTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#7A7080',
    letterSpacing: 1,
  },
  infoBoxName: { fontSize: 15, fontWeight: '700', color: '#5A5060', marginTop: 4 },
  infoBoxEmail: { fontSize: 12, color: '#9A9098', marginTop: 2 },

  card: {
    backgroundColor: colors.cardBg,
    borderRadius: 20,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 17,
    marginBottom: 20,
    borderBottomWidth: 6,
    borderBottomColor: '#A098A8',
    elevation: 4,
    shadowColor: '#A098A8',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#7A7080',
    letterSpacing: 1,
    marginBottom: 18,
    textAlign: 'center',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  stat: { alignItems: 'center', flex: 1 },
  statNum: { fontSize: 26, fontWeight: '900', color: '#5A5060' },
  statLabel: {
    fontSize: 11,
    color: '#9A9098',
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 16,
  },
  divider: { width: 1, height: 44, backgroundColor: '#B8B0BC' },

  xpTrack: {
    marginTop: 16,
    height: 8,
    backgroundColor: '#B8B0BC',
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpFill: {
    height: 8,
    backgroundColor: colors.magenta,
    borderRadius: 4,
  },

  logoutBtn: {
    backgroundColor: '#FFF0F0',
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderTopColor: '#EF4444',
    borderLeftColor: '#EF4444',
    borderRightColor: '#EF4444',
    borderBottomWidth: 5,
    borderBottomColor: '#EF4444',
    borderRadius: 16,
    paddingTop: 14,
    paddingBottom: 10,
    alignItems: 'center',
    marginTop: 4,
    elevation: 2,
  },
  logoutText: { color: '#EF4444', fontWeight: '700', fontSize: 16 },
});
