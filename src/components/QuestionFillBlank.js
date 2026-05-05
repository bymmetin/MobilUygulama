import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fonts } from '../config/theme';

export default function QuestionFillBlank({ question, onAnswered }) {
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [checked, setChecked] = useState(false);

  const parts = question.question_text.split('_____');
  const before = parts[0] ?? '';
  const after = parts[1] ?? '';

  const options = [
    question.option_a,
    question.option_b,
    question.option_c,
    question.option_d,
  ].filter(Boolean);

  const correctIdx = { A: 0, B: 1, C: 2, D: 3 }[question.correct_answer];
  const isCorrect = selectedIdx === correctIdx;

  const handleSelect = (idx) => {
    if (checked) return;
    setSelectedIdx(prev => (prev === idx ? null : idx));
  };

  const handleCheck = () => {
    setChecked(true);
    onAnswered(selectedIdx === correctIdx);
  };

  return (
    <View style={s.container}>
      {/* Cümle + boşluk */}
      <View style={s.sentenceBox}>
        <Text style={s.sentenceText}>
          {before}
          <Text
            style={[
              s.blank,
              selectedIdx !== null && s.blankFilled,
              checked && isCorrect && s.blankCorrect,
              checked && !isCorrect && s.blankWrong,
            ]}
          >
            {selectedIdx !== null
              ? `  ${options[selectedIdx]}  `
              : '              '}
          </Text>
          {after}
        </Text>
      </View>

      {/* Kelime seçenekleri */}
      <View style={s.wordGrid}>
        {options.map((word, idx) => {
          const isSelected = selectedIdx === idx;
          const isCorrectOption = idx === correctIdx;
          return (
            <TouchableOpacity
              key={idx}
              style={[
                s.wordBox,
                isSelected && s.wordBoxSelected,
                checked && isCorrectOption && s.wordBoxCorrect,
                checked && isSelected && !isCorrect && s.wordBoxWrong,
              ]}
              onPress={() => handleSelect(idx)}
              disabled={checked}
              activeOpacity={0.7}
            >
              <Text style={s.wordText}>{word}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Kontrol butonu */}
      {selectedIdx !== null && !checked && (
        <TouchableOpacity style={s.checkBtn} onPress={handleCheck}>
          <Text style={s.checkBtnText}>Kontrol Et</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  sentenceBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sentenceText: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: '#111827',
    lineHeight: 32,
    flexWrap: 'wrap',
  },
  blank: {
    borderBottomWidth: 2,
    borderBottomColor: '#9CA3AF',
    color: 'transparent',
    letterSpacing: 1,
  },
  blankFilled: {
    borderBottomColor: colors.primary,
    color: colors.primary,
    backgroundColor: '#EEF2FF',
    borderRadius: 6,
  },
  blankCorrect: {
    borderBottomColor: '#10B981',
    color: '#065F46',
    backgroundColor: '#D1FAE5',
  },
  blankWrong: {
    borderBottomColor: '#EF4444',
    color: '#991B1B',
    backgroundColor: '#FEE2E2',
  },
  wordGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    marginBottom: 24,
  },
  wordBox: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  wordBoxSelected: {
    borderColor: colors.primary,
    backgroundColor: '#EEF2FF',
  },
  wordBoxCorrect: {
    borderColor: '#10B981',
    backgroundColor: '#D1FAE5',
  },
  wordBoxWrong: {
    borderColor: '#EF4444',
    backgroundColor: '#FEE2E2',
  },
  wordText: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: '#111827',
  },
  checkBtn: {
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
