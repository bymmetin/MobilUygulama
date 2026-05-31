import { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getCurrentUser, logout } from '../services/authService';
import { getUserProgress } from '../services/contentService';
import { getDB } from '../db/database';
import { useTheme } from '../context/ThemeContext';

export default function ProfileScreen({ navigation }) {
  const { colors } = useTheme();
  const [user, setUser] = useState(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [avgScore, setAvgScore] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const u = await getCurrentUser();
        if (!u) return;

        // XP ve streak'i her zaman DB'den taze çek (AsyncStorage geride kalabilir)
        const db = await getDB();
        const fresh = await db.getFirstAsync(
          'SELECT xp, streak FROM users WHERE id = ?', [u.id]
        );
        const updatedUser = { ...u, xp: fresh?.xp ?? u.xp, streak: fresh?.streak ?? u.streak };
        setUser(updatedUser);

        const progress = await getUserProgress(u.id);
        const completed = progress.filter(p => p.completed);
        setCompletedCount(completed.length);
        if (completed.length > 0) {
          const total = completed.reduce((s, p) => s + p.score, 0);
          setAvgScore(Math.round(total / completed.length));
        }
      };
      load();
    }, [])
  );

  const initials = user?.username?.slice(0, 2).toUpperCase() ?? '??';
  const level = Math.floor((user?.xp ?? 0) / 100) + 1;
  const xpInLevel = (user?.xp ?? 0) % 100;

  const styles = makeStyles(colors);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Ayarlar butonu */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => navigation.navigate('Settings')}
          activeOpacity={0.7}
        >
          <Text style={styles.settingsIcon}>⚙</Text>
        </TouchableOpacity>
      </View>

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

const makeStyles = (c) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.background },
  topBar: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 16, paddingTop: 10 },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.cardBg,
    // iOS gölge
    shadowColor: '#3A2A4A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 4,
    // Android gölge
    elevation: 5,
  },
  settingsIcon: { fontSize: 22, color: '#5A5060' },
  scroll: { padding: 20, paddingTop: 8, paddingBottom: 40 },

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
    backgroundColor: c.cardBg,
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
    backgroundColor: c.cardBg,
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
    backgroundColor: c.cardBg,
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
    backgroundColor: c.magenta,
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
