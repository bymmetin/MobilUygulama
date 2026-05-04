import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../config/theme';

export default function DailyScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.emoji}>📜</Text>
        <Text style={styles.text}>{'Günlük aktivite\nyakında!'}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20 },
  emoji: { fontSize: 72 },
  text: {
    fontSize: 26,
    fontWeight: '800',
    color: '#9B8FA0',
    textAlign: 'center',
    lineHeight: 38,
  },
});
