import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fonts } from '../config/theme';
import { useTheme } from '../context/ThemeContext';
import TacSvg from '../../assets/tac.svg';
import KurukafaSvg from '../../assets/kurukafa.svg';

export default function ResultScreen({ route, navigation }) {
  const { colors } = useTheme();
  const { lesson, score, correct, total, earnedXP, review } = route.params;
  const passed = score >= 50;

  const goHome = () => navigation.navigate('HomeTabs');
  const restart = () => navigation.replace('Lesson', { lesson, isRetry: true });

  const styles = makeStyles(colors);

  if (passed) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>

          {/* Kazanma grafiği — taç */}
          <View style={styles.graphicWrap}>
            <TacSvg width={220} height={220} />
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
              <Text style={styles.retryNote}>Tekrar oynamada her doğru +5 XP verir</Text>
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

        {/* Kaybetme grafiği — kurukafa */}
        <View style={styles.graphicWrap}>
          <KurukafaSvg width={200} height={200} />
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
            <Text style={styles.retryNote}>Tekrar oynamada her doğru +5 XP verir</Text>
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

const makeStyles = (c) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.background },
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
    color: c.winColor,
    letterSpacing: 6,
    marginTop: 12,
    fontFamily: fonts.poppinsExtraBold,
  },

  // ── Kaybetme ──
  xRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: -8 },
  xStar: { fontSize: 24, color: c.loseColor },
  xStarBig: { fontSize: 40 },
  skullEmoji: { fontSize: 110 },
  loseLabel: {
    fontSize: 32,
    fontWeight: '900',
    color: c.loseColor,
    letterSpacing: 3,
    marginTop: 8,
    fontFamily: fonts.poppinsExtraBold,
  },

  // ── Ortak ──
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: c.textMuted,
    letterSpacing: 2,
    marginBottom: 16,
    fontFamily: fonts.poppinsExtraBold,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: c.statRowBg,
    borderRadius: 20,
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderBottomWidth: 5,
    borderBottomColor: c.statRowDivider,
    elevation: 4,
  },
  stat: { alignItems: 'center' },
  statNum: { fontSize: 26, fontWeight: '900', color: c.statRowText },
  statLabel: { fontSize: 12, color: c.textMuted, marginTop: 4, fontWeight: '600' },
  statDivider: { width: 1, height: 36, backgroundColor: c.statRowDivider },

  spacer: { flex: 1 },

  winBtn: {
    backgroundColor: c.btnGreen,
    width: '100%',
    paddingTop: 22,
    paddingBottom: 17,
    borderRadius: 20,
    alignItems: 'center',
    borderBottomWidth: 7,
    borderBottomColor: c.btnGreenDark,
    elevation: 3,
  },
  loseBtn: {
    backgroundColor: c.loseColor,
    width: '100%',
    paddingTop: 22,
    paddingBottom: 17,
    borderRadius: 20,
    alignItems: 'center',
    borderBottomWidth: 7,
    borderBottomColor: c.loseShadow,
    elevation: 3,
  },
  devamText: {
    fontSize: 24,
    fontWeight: '900',
    color: c.white,
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
    color: c.textMuted,
    textDecorationLine: 'underline',
  },
  retryNote: {
    fontSize: 13,
    fontWeight: '600',
    color: c.textMuted,
    marginBottom: 12,
    textAlign: 'center',
  },
});
