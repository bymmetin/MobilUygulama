import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getCurrentUser } from '../services/authService';
import { getDB } from '../db/database';
import { fonts } from '../config/theme';
import { useTheme } from '../context/ThemeContext';

const FAKE_RIVALS = [
  { id: 'fake_1', username: 'Ömer Özçelik',  xp: 450 },
  { id: 'fake_2', username: 'Erdal Korkmaz',  xp: 380 },
  { id: 'fake_3', username: 'Burak Yıldız',   xp: 320 },
  { id: 'fake_4', username: 'Selin Kaya',     xp: 270 },
  { id: 'fake_5', username: 'Mert Öztürk',    xp: 210 },
  { id: 'fake_6', username: 'Ayşe Çelik',     xp: 180 },
  { id: 'fake_7', username: 'Kaan Şahin',     xp: 140 },
  { id: 'fake_8', username: 'Elif Yılmaz',    xp: 90  },
  { id: 'fake_9', username: 'Tarık Demirci',  xp: 50  },
];

const MEDALS = ['🥇', '🥈', '🥉'];

export default function LeaguesScreen() {
  const { colors } = useTheme();
  const [user, setUser] = useState(null);
  const [board, setBoard] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const u = await getCurrentUser();
        setUser(u);
        const db = await getDB();
        const realUsers = await db.getAllAsync('SELECT id, username, xp FROM users');
        const merged = [...realUsers, ...FAKE_RIVALS].sort(
          (a, b) => (b.xp ?? 0) - (a.xp ?? 0)
        );
        setBoard(merged);
      };
      load();
    }, [])
  );

  const renderItem = ({ item, index }) => {
    const isMe = user && String(item.id) === String(user.id);
    const medal = MEDALS[index];

    return (
      <View style={[styles.row, isMe && styles.rowMe]}>
        <View style={styles.rankBox}>
          {medal ? (
            <Text style={styles.medal}>{medal}</Text>
          ) : (
            <Text style={styles.rankText}>{index + 1}</Text>
          )}
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.username?.slice(0, 1).toUpperCase() ?? '?'}
          </Text>
        </View>
        <Text style={[styles.username, isMe && styles.usernameMe]} numberOfLines={1}>
          {item.username}{isMe ? '  (Sen)' : ''}
        </Text>
        <Text style={[styles.xp, isMe && styles.xpMe]}>{item.xp ?? 0} XP</Text>
      </View>
    );
  };

  const styles = makeStyles(colors);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerText}>ELMAS LİGİ 💎</Text>
        <Text style={styles.subHeader}>Hafta sonu sıralama yenilenir</Text>
      </View>

      <FlatList
        data={board}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
      />
    </SafeAreaView>
  );
}

const makeStyles = (c) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.background },

  header: {
    backgroundColor: c.magenta,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 6,
    borderBottomColor: c.magentaDark,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '900',
    color: c.white,
    letterSpacing: 2,
    fontFamily: fonts.poppinsExtraBold,
  },
  subHeader: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
    fontWeight: '600',
  },

  list: { padding: 16, paddingBottom: 40 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.cardBg,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 4,
    borderBottomColor: '#A098A8',
  },
  rowMe: {
    backgroundColor: c.magenta,
    borderBottomColor: c.magentaDark,
  },

  rankBox: { width: 36, alignItems: 'center', justifyContent: 'center' },
  rankText: { fontSize: 18, fontWeight: '900', color: c.textMuted },
  medal: { fontSize: 26 },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: c.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '900', color: c.text },

  username: { flex: 1, fontSize: 16, fontWeight: '800', color: c.text },
  usernameMe: { color: c.white },

  xp: { fontSize: 15, fontWeight: '900', color: c.xp },
  xpMe: { color: 'rgba(255,255,255,0.9)' },

  sep: { height: 8 },
});
