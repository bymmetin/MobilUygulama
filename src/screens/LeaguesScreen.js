import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../config/theme';

export default function LeaguesScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.text}>{'LİGLER SONRA\nEKLENECEKTİR'}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: {
    fontSize: 34,
    fontWeight: '900',
    color: '#9B8FA0',
    textAlign: 'center',
    lineHeight: 48,
    letterSpacing: 2,
    transform: [{ rotate: '-20deg' }],
  },
});
