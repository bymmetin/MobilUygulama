import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts } from '../config/theme';

export default function ResultScreen({ route, navigation }) {
  const { lesson, score, correct, total, earnedXP, review } = route.params;
  const passed = score >= 50;

  const goHome = () => navigation.navigate('HomeTabs');
  const restart = () => navigation.replace('Lesson', { lesson });

  if (passed) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>

          {/* Kazanma grafiği — defne çelengi */}
          <View style={styles.graphicWrap}>
            <Text style={styles.starTop}>⭐</Text>
            <View style={styles.starRow}>
              <Text style={styles.starSide}>⭐</Text>
              <View style={styles.wreathBox}>
                <Text style={styles.wreathEmoji}>🌿</Text>
                <Text style={styles.wreathEmoji}>🌿</Text>
              </View>
              <Text style={styles.starSide}>⭐</Text>
            </View>
            <View style={styles.wreathBottom}>
              <Text style={styles.leafBig}>🌿🌿🌿🌿🌿</Text>
            </View>
            <Text style={styles.winLabel}>{'B A Ş A R I L I'}</Text>
          </View>

          {/* Ders bilgileri */}
          <Text style={styles.sectionTitle}>DERS BİLGİLERİ</Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{correct}/{total}</Text>
              <Text style={styles.statLabel}>Doğru</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>%{score}</Text>
              <Text style={styles.statLabel}>Puan</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={[styles.statNum, { color: colors.xp }]}>+{earnedXP}</Text>
              <Text style={styles.statLabel}>XP</Text>
            </View>
          </View>

          <View style={styles.spacer} />

          {review ? (
            <>
              <TouchableOpacity style={styles.winBtn} onPress={restart} activeOpacity={0.85}>
                <Text style={styles.devamText}>TEKRARDAN BAŞLA</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryBtn} onPress={goHome} activeOpacity={0.85}>
                <Text style={styles.secondaryBtnText}>Ana Sayfa</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.winBtn} onPress={goHome} activeOpacity={0.85}>
              <Text style={styles.devamText}>DEVAM</Text>
            </TouchableOpacity>
          )}

        </View>
      </SafeAreaView>
    );
  }

  // ─── BAŞARISIZ ─────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* Kaybetme grafiği — kafatası */}
        <View style={styles.graphicWrap}>
          <View style={styles.xRow}>
            <Text style={styles.xStar}>⭐✖</Text>
            <Text style={styles.xStarBig}>⭐</Text>
            <Text style={styles.xStar}>✖⭐</Text>
          </View>
          <Text style={styles.skullEmoji}>💀</Text>
          <Text style={styles.loseLabel}>BAŞARISIZ</Text>
        </View>

        {/* Ders bilgileri */}
        <Text style={styles.sectionTitle}>DERS BİLGİLERİ</Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{correct}/{total}</Text>
            <Text style={styles.statLabel}>Doğru</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNum}>%{score}</Text>
            <Text style={styles.statLabel}>Puan</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={[styles.statNum, { color: colors.xp }]}>+{earnedXP}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>
        </View>

        <View style={styles.spacer} />

        {review ? (
          <>
            <TouchableOpacity style={styles.loseBtn} onPress={restart} activeOpacity={0.85}>
              <Text style={styles.devamText}>TEKRARDAN BAŞLA</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={goHome} activeOpacity={0.85}>
              <Text style={styles.secondaryBtnText}>Ana Sayfa</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.loseBtn} onPress={goHome} activeOpacity={0.85}>
            <Text style={styles.devamText}>DEVAM</Text>
          </TouchableOpacity>
        )}

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },

  graphicWrap: { alignItems: 'center', marginBottom: 24 },

  // ── Kazanma ──
  starTop: { fontSize: 52, marginBottom: -8 },
  starRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  starSide: { fontSize: 40 },
  wreathBox: { flexDirection: 'row', gap: 4 },
  wreathEmoji: { fontSize: 36, transform: [{ scaleX: -1 }] },
  wreathBottom: { marginTop: -8 },
  leafBig: { fontSize: 28, letterSpacing: -4 },
  winLabel: {
    fontSize: 26,
    fontWeight: '900',
    color: '#C8B000',
    letterSpacing: 6,
    marginTop: 12,
    fontFamily: fonts.poppinsExtraBold,
  },

  // ── Kaybetme ──
  xRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: -8 },
  xStar: { fontSize: 24, color: '#FF2020' },
  xStarBig: { fontSize: 40 },
  skullEmoji: { fontSize: 110 },
  loseLabel: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FF2020',
    letterSpacing: 3,
    marginTop: 8,
    fontFamily: fonts.poppinsExtraBold,
  },

  // ── Ortak ──
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#9B8FA0',
    letterSpacing: 2,
    marginBottom: 16,
    fontFamily: fonts.poppinsExtraBold,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  stat: { alignItems: 'center' },
  statNum: { fontSize: 26, fontWeight: '900', color: '#3A3040' },
  statLabel: { fontSize: 12, color: '#9A9098', marginTop: 4, fontWeight: '600' },
  statDivider: { width: 1, height: 36, backgroundColor: '#C8C0CC' },

  spacer: { flex: 1 },

  winBtn: {
    backgroundColor: colors.btnGreen,
    width: '100%',
    paddingVertical: 22,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: colors.btnGreenDark,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 7,
  },
  loseBtn: {
    backgroundColor: '#FF2020',
    width: '100%',
    paddingVertical: 22,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#AA0000',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 7,
  },
  devamText: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: 2,
    fontFamily: fonts.poppinsExtraBold,
  },
  secondaryBtn: {
    marginTop: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#7A6080',
    textDecorationLine: 'underline',
  },
});
