import { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { fonts } from '../config/theme';
import { useTheme } from '../context/ThemeContext';

const WRONG_THRESHOLD = 2; // Bu kadar veya daha fazla yanlışta soru "yanlış" sayılır

export default function QuestionMatching({ question, onAnswered }) {
  const { colors } = useTheme();
  const pairs = useMemo(() => {
    try {
      const parsed = JSON.parse(question.extra_data);
      if (Array.isArray(parsed)) return parsed;
      return parsed?.pairs ?? [];
    } catch { return []; }
  }, [question.id]);

  const rightItems = useMemo(
    () => pairs.map((p, i) => ({ value: p.right, origIdx: i }))
               .sort(() => Math.random() - 0.5),
    [question.id]
  );

  const [selectedLeft,    setSelectedLeft]    = useState(null);
  const [correctSet,      setCorrectSet]      = useState(new Set());
  const [flashWrongRight, setFlashWrongRight] = useState(null);
  const [flashWrongLeft,  setFlashWrongLeft]  = useState(null);
  const [hintOrigIdx,     setHintOrigIdx]     = useState(null);
  const [wrongCount,      setWrongCount]      = useState(0);
  const [wrongPairs,      setWrongPairs]      = useState([]); // [{left, wrongVal, correctVal}]
  const [done,            setDone]            = useState(false);

  const isFlashing = flashWrongRight !== null;

  const tapLeft = (left) => {
    if (done || isFlashing) return;
    setSelectedLeft(prev => (prev === left ? null : left));
  };

  const tapRight = (origIdx) => {
    if (done || !selectedLeft || correctSet.has(origIdx) || isFlashing) return;

    const isCorrect = pairs[origIdx].left === selectedLeft;

    if (isCorrect) {
      const next = new Set(correctSet);
      next.add(origIdx);
      setCorrectSet(next);
      setSelectedLeft(null);

      if (next.size === pairs.length) {
        setDone(true);
        onAnswered(wrongCount < WRONG_THRESHOLD);
      }
    } else {
      // Yanlış eşleşme
      const correctIdx  = pairs.findIndex(p => p.left === selectedLeft);
      const wrongVal    = pairs[origIdx].right;
      const correctVal  = pairs[correctIdx]?.right ?? '?';

      setFlashWrongRight(origIdx);
      setFlashWrongLeft(selectedLeft);
      setHintOrigIdx(correctIdx);
      const newWrongCount = wrongCount + 1;
      setWrongCount(newWrongCount);
      setWrongPairs(prev => [...prev, { left: selectedLeft, wrongVal, correctVal }]);

      setTimeout(() => {
        setFlashWrongRight(null);
        setFlashWrongLeft(null);
        setHintOrigIdx(null);
        setSelectedLeft(null);
      }, 1100);
    }
  };

  const s = makeStyles(colors);

  return (
    <View style={s.container}>
      <View style={s.grid}>
        {/* Sol kolon */}
        <View style={s.col}>
          {pairs.map((pair, pairIdx) => {
            const isMatched    = correctSet.has(pairIdx);
            const isSelected   = selectedLeft === pair.left;
            const isWrongFlash = flashWrongLeft === pair.left;
            return (
              <TouchableOpacity
                key={pair.left}
                style={[
                  s.chip,
                  isSelected   && s.chipSelected,
                  isMatched    && s.chipCorrect,
                  isWrongFlash && s.chipWrong,
                ]}
                onPress={() => tapLeft(pair.left)}
                disabled={done || isMatched}
                activeOpacity={0.75}
              >
                <Text style={s.chipText}>{pair.left}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Sağ kolon */}
        <View style={s.col}>
          {rightItems.map(({ value, origIdx }) => {
            const isMatched    = correctSet.has(origIdx);
            const isWrongFlash = flashWrongRight === origIdx;
            const isHint       = hintOrigIdx === origIdx;
            const isHighlight  = !isMatched && !isWrongFlash && !isHint && !!selectedLeft;
            return (
              <TouchableOpacity
                key={`right-${origIdx}`}
                style={[
                  s.chip,
                  s.chipRight,
                  isHighlight  && s.chipHighlight,
                  isMatched    && s.chipCorrect,
                  isWrongFlash && s.chipWrong,
                  isHint       && s.chipHint,
                ]}
                onPress={() => tapRight(origIdx)}
                disabled={done || isMatched || isFlashing}
                activeOpacity={0.75}
              >
                <Text style={s.chipText}>{value}</Text>
                {isHint && <Text style={s.hintLabel}>✓ Doğru cevap</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Yanlış özeti — soru bitti ve en az 1 yanlış varsa göster */}
      {done && wrongPairs.length > 0 && (
        <View style={s.wrongSummary}>
          <Text style={s.wrongSummaryTitle}>Yanlış eşleştirdiklerin:</Text>
          {wrongPairs.map((wp, i) => (
            <Text key={i} style={s.wrongSummaryRow}>
              <Text style={s.boldText}>{wp.left}</Text>
              {' → '}
              <Text style={s.wrongText}>{wp.wrongVal}</Text>
              {'  değil  '}
              <Text style={s.correctText}>{wp.correctVal}</Text>
              {' doğru'}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const makeStyles = (c) => StyleSheet.create({
  container: { flex: 1 },
  grid:      { flexDirection: 'row', gap: 10 },
  col:       { flex: 1, gap: 10 },

  chip: {
    borderWidth: 2,
    borderColor: c.inputBorder,
    borderRadius: 12,
    padding: 12,
    minHeight: 64,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: c.white,
  },
  chipRight:     { backgroundColor: c.inputBg },
  chipSelected:  { borderColor: c.primary, backgroundColor: c.inputBg },
  chipHighlight: { borderColor: '#A5B4FC',       backgroundColor: '#F5F3FF' },
  chipCorrect:   { borderColor: '#10B981', backgroundColor: c.correct },
  chipWrong:     { borderColor: '#EF4444', backgroundColor: c.wrong },
  chipHint:      { borderColor: '#F59E0B',       backgroundColor: '#FEF3C7', borderWidth: 2.5 },

  chipText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: '#111827',
    textAlign: 'center',
  },
  hintLabel: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
    textAlign: 'center',
  },

  wrongSummary: {
    marginTop: 16,
    backgroundColor: c.wrong,
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    gap: 6,
  },
  wrongSummaryTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: c.wrongText,
    marginBottom: 4,
  },
  wrongSummaryRow: {
    fontSize: 13,
    color: c.text,
    lineHeight: 20,
  },
  boldText:    { fontWeight: '700' },
  wrongText:   { color: '#EF4444', fontWeight: '700' },
  correctText: { color: '#10B981', fontWeight: '700' },
});
