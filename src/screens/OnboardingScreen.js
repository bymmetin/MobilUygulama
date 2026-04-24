import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts } from '../config/theme';
import DinoSvg from '../../assets/dino.svg';

export default function OnboardingScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* Başlık */}
        <Text style={styles.logo}>MNEMO</Text>

        {/* Maskot */}
        <DinoSvg width={220} height={220} style={styles.dino} />

        {/* Slogan */}
        <Text style={styles.slogan}>
          {'Eğlen\nİlerle\nTarih\nÖğren!'}
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
    paddingTop: 24,
    paddingBottom: 16,
  },
  logo: {
    fontFamily: fonts.poppinsExtraBold,
    fontSize: 48,
    color: colors.accent,
    letterSpacing: 4,
    marginBottom: 8,
  },
  dino: {
    marginBottom: 16,
  },
  slogan: {
    fontFamily: fonts.extraBold,
    fontSize: 40,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 52,
  },
  spacer: { flex: 1 },
  startBtn: {
    backgroundColor: colors.primary,
    width: '100%',
    paddingVertical: 18,
    borderRadius: 50,
    alignItems: 'center',
    // 3D gölge efekti
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
    marginBottom: 20,
  },
  startBtnText: {
    fontFamily: fonts.poppinsBold,
    fontSize: 16,
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
  },
});
