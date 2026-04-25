import { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fonts } from '../config/theme';

export default function QuestionMatching({ question, onAnswered }) {
  const pairs = useMemo(() => JSON.parse(question.extra_data).pairs, [question.id]);

  const rightItems = useMemo(
    () => [...pairs.map(p => p.right)].sort(() => Math.random() - 0.5),
    [question.id]
  );

  const [selectedLeft, setSelectedLeft] = useState(null);
  const [matches, setMatches] = useState({});   // { leftItem: rightItem }
  const [checked, setChecked] = useState(false);

  const tapLeft = (item) => {
    if (checked) return;
    setSelectedLeft(prev => (prev === item ? null : item));
  };

  const tapRight = (item) => {
    if (checked || !selectedLeft) return;
    // Daha önce bu sağ kutuya eşleşme yapıldıysa kaldır
    const updated = Object.fromEntries(
      Object.entries(matches).filter(([, v]) => v !== item)
    );
    updated[selectedLeft] = item;
    setMatches(updated);
    setSelectedLeft(null);
  };

  const allMatched = pairs.every(p => matches[p.left]);

  const handleCheck = () => {
    setChecked(true);
    const correct = pairs.every(p => matches[p.left] === p.right);
    onAnswered(correct);
  };

  const getStatus = (pair) => {
    if (!checked) return null;
    return matches[pair.left] === pair.right ? 'correct' : 'wrong';
  };

  const getRightStatus = (item) => {
    if (!checked) return null;
    const pair = pairs.find(p => matches[p.left] === item);
    return pair ? getStatus(pair) : null;
  };

  return (
    <View style={s.container}>
      <View style={s.grid}>
        {/* Sol kolon */}
        <View style={s.col}>
          {pairs.map(pair => {
            const status = getStatus(pair);
            const isSelected = selectedLeft === pair.left;
            const isMatched = !!matches[pair.left];
            return (
              <TouchableOpacity
                key={pair.left}
                style={[
                  s.chip,
                  isSelected && s.chipSelected,
                  isMatched && !checked && s.chipMatched,
                  status === 'correct' && s.chipCorrect,
                  status === 'wrong' && s.chipWrong,
                ]}
                onPress={() => tapLeft(pair.left)}
                disabled={checked}
              >
                <Text style={s.chipText}>{pair.left}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Sağ kolon */}
        <View style={s.col}>
          {rightItems.map(item => {
            const isUsed = Object.values(matches).includes(item);
            const status = getRightStatus(item);
            return (
              <TouchableOpacity
                key={item}
                style={[
                  s.chip,
                  s.chipRight,
                  isUsed && !checked && s.chipMatched,
                  !isUsed && selectedLeft && s.chipHighlight,
                  status === 'correct' && s.chipCorrect,
                  status === 'wrong' && s.chipWrong,
                ]}
                onPress={() => tapRight(item)}
                disabled={checked || isUsed}
              >
                <Text style={s.chipText}>{item}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {allMatched && !checked && (
        <TouchableOpacity style={s.checkBtn} onPress={handleCheck}>
          <Text style={s.checkBtnText}>Kontrol Et</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  grid: { flexDirection: 'row', gap: 10 },
  col: { flex: 1, gap: 10 },
  chip: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    minHeight: 64,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  chipRight: { backgroundColor: '#F9FAFB' },
  chipSelected: { borderColor: colors.primary, backgroundColor: '#EEF2FF' },
  chipHighlight: { borderColor: '#A5B4FC' },
  chipMatched: { borderColor: '#6366F1', backgroundColor: '#EEF2FF' },
  chipCorrect: { borderColor: '#10B981', backgroundColor: '#D1FAE5' },
  chipWrong: { borderColor: '#EF4444', backgroundColor: '#FEE2E2' },
  chipText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: '#111827',
    textAlign: 'center',
  },
  checkBtn: {
    marginTop: 20,
    backgroundColor: colors.primary,
    borderRadius: 50,
    padding: 16,
    alignItems: 'center',
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  checkBtnText: {
    fontFamily: fonts.poppinsBold,
    color: '#fff',
    fontSize: 15,
    letterSpacing: 1,
  },
});
