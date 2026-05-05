import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts } from '../config/theme';

function ShadowBtn({ bg, shadow, onPress, children }) {
  return (
    <TouchableOpacity
      style={[styles.btn, { backgroundColor: bg, shadowColor: shadow }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {children}
    </TouchableOpacity>
  );
}

export default function LoginSelectScreen({ navigation }) {
  const comingSoon = () => Alert.alert('Yakında', 'Bu özellik yakında eklenecek.');

  return (
    <SafeAreaView style={styles.safe}>
      {/* Geri butonu */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>

      <View style={styles.container}>
        <Text style={styles.title}>
          {'DERS TAKİBİNİ\nYAPMAK İÇİN\nGİRİŞ YAP'}
        </Text>

        <View style={styles.buttons}>
          {/* Email */}
          <ShadowBtn
            bg={colors.emailBtn}
            shadow={colors.emailBtnShadow}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.btnText}>Email ve şifre ile giriş yap</Text>
          </ShadowBtn>

          {/* Google */}
          <ShadowBtn
            bg={colors.googleBtn}
            shadow={colors.googleBtnShadow}
            onPress={comingSoon}
          >
            <View style={styles.iconRow}>
              <View style={styles.gCircle}>
                <Text style={styles.gText}>G</Text>
              </View>
              <Text style={styles.btnText}>Google ile giriş yap</Text>
            </View>
          </ShadowBtn>

          {/* Apple */}
          <ShadowBtn
            bg={colors.appleBtn}
            shadow={colors.appleBtnShadow}
            onPress={comingSoon}
          >
            <View style={styles.iconRow}>
              <Text style={styles.appleIcon}></Text>
              <Text style={styles.btnText}>Apple ile giriş yap</Text>
            </View>
          </ShadowBtn>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  backBtn: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 4 },
  backArrow: { fontSize: 28, color: colors.text, fontWeight: '300' },

  container: { flex: 1, paddingHorizontal: 24, paddingTop: 28 },
  title: {
    fontFamily: fonts.poppinsExtraBold,
    fontSize: 30,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 42,
    marginBottom: 60,
  },

  buttons: { gap: 28 },
  btn: {
    borderRadius: 50,
    paddingVertical: 22,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 7,
  },
  btnText: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: colors.white,
  },
  iconRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  gCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gText: {
    fontFamily: fonts.poppinsBold,
    fontSize: 16,
    color: colors.googleBtn,
    lineHeight: 20,
  },
  appleIcon: { fontSize: 24, color: colors.white, lineHeight: 28 },
});
