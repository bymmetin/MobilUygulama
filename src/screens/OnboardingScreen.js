import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts } from '../config/theme';
import DinoSvg from '../../assets/dino.svg';

export default function OnboardingScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* Logo */}
        <Text style={styles.logo}>MNEMO</Text>

        {/* Maskot */}
        <DinoSvg width={240} height={240} style={styles.dino} />

        {/* Slogan */}
        <Text style={styles.slogan}>
          {'E ğ l e n\nİ l e r l e\nT a r i h\nÖ ğ r e n !'}
        </Text>

        <View style={styles.spacer} />

        {/* Başla butonu */}
        <TouchableOpacity
          style={styles.startBtn}
          onPress={() => navigation.navigate('LoginSelect')}
          activeOpacity={0.85}
        >
          <Text style={styles.startBtnText}>HEMEN BAŞLA</Text>
        </TouchableOpacity>

        {/* Giriş linki */}
        <View style={styles.loginRow}>
          <Text style={styles.loginLabel}>Zaten bir kaydın var mı ? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>giriş yap</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  logo: {
    fontFamily: fonts.poppinsExtraBold,
    fontSize: 52,
    color: colors.accent,
    letterSpacing: 4,
    marginBottom: 4,
  },
  dino: {
    marginBottom: 8,
  },
  slogan: {
    fontFamily: fonts.extraBold,
    fontSize: 36,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 52,
    letterSpacing: 2,
  },
  spacer: { flex: 1 },
  startBtn: {
    backgroundColor: colors.primary,
    width: '100%',
    paddingTop: 20,
    paddingBottom: 15,
    borderRadius: 50,
    alignItems: 'center',
    borderBottomWidth: 7,
    borderBottomColor: colors.primaryDark,
    elevation: 3,
    marginBottom: 22,
  },
  startBtnText: {
    fontFamily: fonts.poppinsBold,
    fontSize: 17,
    color: colors.white,
    letterSpacing: 2,
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  loginLabel: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
  },
  loginLink: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.success,
    borderBottomWidth: 2,
    borderBottomColor: colors.success,
    paddingBottom: 1,
  },
});
