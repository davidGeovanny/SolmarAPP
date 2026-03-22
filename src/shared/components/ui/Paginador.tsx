import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

interface Props {
  currentPage: number;
  totalPages:  number;
  onPrev:      () => void;
  onNext:      () => void;
  onGoToPage:  (page: number) => void;
}

const Paginador: React.FC<Props> = ({
  currentPage,
  totalPages,
  onPrev,
  onNext,
  onGoToPage,
}) => {
  // Input controlado localmente — solo se valida al perder foco o al presionar done
  const [inputValue, setInputValue] = useState(String(currentPage));

  // Sincronizar input cuando currentPage cambia externamente (flechas)
  React.useEffect(() => {
    setInputValue(String(currentPage));
  }, [currentPage]);

  const handleCommit = useCallback(() => {
    const parsed = parseInt(inputValue, 10);
    if (isNaN(parsed) || parsed < 1 || parsed > totalPages) {
      // Página inválida — restaurar al valor actual
      // El hook clampea automáticamente — restauramos el input al valor válido actual
      setInputValue(String(currentPage));
      return;
    }
    onGoToPage(parsed);
  }, [inputValue, currentPage, totalPages, onGoToPage]);

  // No mostrar si solo hay una página
  if (totalPages <= 1) return null;

  const isFirst = currentPage === 1;
  const isLast  = currentPage === totalPages;

  return (
    <View style={styles.container}>

      {/* Botón anterior */}
      <TouchableOpacity
        style={[styles.btn, isFirst && styles.btnDisabled]}
        onPress={onPrev}
        disabled={isFirst}
        activeOpacity={0.7}
      >
        <Text style={[styles.btnText, isFirst && styles.btnTextDisabled]}>‹</Text>
      </TouchableOpacity>

      {/* Input de página */}
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={inputValue}
          onChangeText={setInputValue}
          keyboardType="numeric"
          returnKeyType="done"
          selectTextOnFocus
          onBlur={handleCommit}
          onSubmitEditing={handleCommit}
        />
        <Text style={styles.totalText}>/ {totalPages}</Text>
      </View>

      {/* Botón siguiente */}
      <TouchableOpacity
        style={[styles.btn, isLast && styles.btnDisabled]}
        onPress={onNext}
        disabled={isLast}
        activeOpacity={0.7}
      >
        <Text style={[styles.btnText, isLast && styles.btnTextDisabled]}>›</Text>
      </TouchableOpacity>

    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'center',
    paddingVertical:   12,
    paddingHorizontal: 16,
    backgroundColor:   '#FFFFFF',
    borderTopWidth:    1,
    borderTopColor:    '#E2E8F0',
    gap:               12,
  },
  btn: {
    width:           40,
    height:          40,
    borderRadius:    8,
    borderWidth:     1,
    borderColor:     '#CBD5E1',
    alignItems:      'center',
    justifyContent:  'center',
    backgroundColor: '#F8FAFC',
  },
  btnDisabled: {
    borderColor:     '#E2E8F0',
    backgroundColor: '#F8FAFC',
    opacity:         0.4,
  },
  btnText: {
    fontSize:   22,
    color:      '#1C57B5',
    lineHeight: 26,
  },
  btnTextDisabled: {
    color: '#94A3B8',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           6,
  },
  input: {
    width:             52,
    height:            40,
    borderWidth:       1,
    borderColor:       '#CBD5E1',
    borderRadius:      8,
    textAlign:         'center',
    fontSize:          15,
    fontWeight:        '600',
    color:             '#1E293B',
    backgroundColor:   '#FFFFFF',
    paddingVertical:   0,
  },
  totalText: {
    fontSize:   14,
    color:      '#94A3B8',
    fontWeight: '500',
  },
});

export default Paginador;