import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { comboBoxStyles as styles } from './ComboBox.styles';
import ComboBoxList from './ComboBoxList';
import { useComboOpen } from '@/shared/context/ComboOpenContext';
import type { ComboBoxProps } from './ComboBox.types';

import IcSearch  from '@/assets/icons/ui/search.png';
import IcClear   from '@/assets/icons/ui/clear.png';
import IcRefresh from '@/assets/icons/ui/ic_refresh.svg';

function ComboBox<T>({
  data,
  isLoading,
  onRefresh,
  fieldConfig,
  value,
  onChange,
  placeholder,
  mode            = 'search',
  direction       = 'bottom',
  icon,
  clearable       = true,
  excludeSelected = false,
  hasError        = false,
  variant         = 'glass',
  debounceMs      = 300,
}: ComboBoxProps<T>) {
  const [isOpen,       setIsOpen]       = useState(false);
  const [inputText,    setInputText]    = useState('');
  const [filteredData, setFilteredData] = useState<T[]>(data);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef      = useRef<TextInput>(null);

  // ID estable por instancia — identifica este combo en el contexto
  const comboId = useRef(`combo-${Math.random().toString(36).slice(2)}`).current;

  const { activeComboId, requestOpen, notifyClose } = useComboOpen();

  // ── Abrir / cerrar lista notificando al contexto ──────────────────────
  const openList = useCallback(() => {
    requestOpen(comboId);
    setIsOpen(true);
  }, [requestOpen, comboId]);

  const closeList = useCallback(() => {
    notifyClose(comboId);
    setIsOpen(false);
  }, [notifyClose, comboId]);

  // Cerrarse si otro combo se abrió
  useEffect(() => {
    if (isOpen && activeComboId !== comboId) {
      setIsOpen(false);
    }
  }, [activeComboId, comboId, isOpen]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => { notifyClose(comboId); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Texto a mostrar en el input cuando hay valor seleccionado ─────────
  const getDisplayText = useCallback((item: T): string => {
    const key = fieldConfig.displayKey ?? fieldConfig.labelKey;
    return String(item[key] ?? '');
  }, [fieldConfig]);

  // ── Sincronizar inputText con el valor externo ────────────────────────
  useEffect(() => {
    setInputText(value ? getDisplayText(value) : '');
  }, [value, getDisplayText]);

  // ── Sincronizar filteredData cuando cambia data externamente ──────────
  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  // ── Filtrado con debounce ─────────────────────────────────────────────
  const filterData = useCallback((text: string) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      if (!text.trim()) { setFilteredData(data); return; }
      const lower    = text.toLowerCase();
      const filtered = data.filter(item => {
        const label    = String(item[fieldConfig.labelKey] ?? '').toLowerCase();
        const subtitle = fieldConfig.subtitleKey
          ? String(item[fieldConfig.subtitleKey] ?? '').toLowerCase()
          : '';
        return label.includes(lower) || subtitle.includes(lower);
      });
      setFilteredData(filtered);
    }, debounceMs);
  }, [data, fieldConfig, debounceMs]);

  // ── Cambio de texto (modo search) ─────────────────────────────────────
  const handleTextChange = useCallback((text: string) => {
    setInputText(text);
    if (!isOpen) openList();
    filterData(text);
  }, [filterData, isOpen, openList]);

  // ── Seleccionar elemento ──────────────────────────────────────────────
  const handleSelect = useCallback((item: T) => {
    onChange(item);
    setInputText(getDisplayText(item));
    setFilteredData(data);
    closeList();
  }, [onChange, getDisplayText, data, closeList]);

  // ── Limpiar selección ─────────────────────────────────────────────────
  const handleClear = useCallback(() => {
    onChange(null);
    setInputText('');
    setFilteredData(data);
    if (isOpen) closeList();
  }, [onChange, data, isOpen, closeList]);

  // ── Blur: restaurar texto al valor seleccionado ───────────────────────
  const handleBlur = useCallback(() => {
    setTimeout(() => {
      setInputText(value ? getDisplayText(value) : '');
    }, 150);
  }, [value, getDisplayText]);

  // ── Toggle lista (lupa o modo select) ────────────────────────────────
  const handleToggleList = useCallback(() => {
    if (isLoading) return;
    if (isOpen) {
      setFilteredData(data);
      closeList();
    } else {
      setFilteredData(data);
      openList();
    }
  }, [isLoading, isOpen, data, openList, closeList]);

  // ── Presionar input en modo select ────────────────────────────────────
  const handleInputPress = useCallback(() => {
    if (mode === 'select') handleToggleList();
  }, [mode, handleToggleList]);

  // ── Refresh ───────────────────────────────────────────────────────────
  const handleRefresh = useCallback(() => {
    onChange(null);
    setInputText('');
    setFilteredData([]);
    if (isOpen) closeList();
    onRefresh?.();
  }, [onChange, onRefresh, isOpen, closeList]);

  // ── \u00cdcono derecho ─────────────────────────────────────────────────────
  const renderRightIcon = () => {
    if (isLoading) {
      return <ActivityIndicator size='small' color='rgba(255,255,255,0.7)' style={ styles.iconButton } />;
    }

    return (
      <>
        {/* Mostrar ícono de cerrar cuando hay valor seleccionado y clearable = true */}
        {value && clearable ? (
          <TouchableOpacity
            onPress={ handleClear }
            style={ styles.iconButton }
            activeOpacity={ 0.7 }
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Image
              source={ IcClear }
              style={{ width: 16, height: 16, tintColor: 'rgba(255,255,255,0.7)' }}
              resizeMode='contain'
            />
          </TouchableOpacity>
        ) : null}

        {/* Lupa / Ícono personalizado (siempre visible) */}
        <TouchableOpacity
          onPress={ handleToggleList }
          style={ styles.iconButton }
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {icon ?? (
            <Image
              source={ IcSearch }
              style={{ width: 18, height: 18, tintColor: 'rgba(255,255,255,0.7)' }}
              resizeMode='contain'
            />
          )}
        </TouchableOpacity>
      </>
    );
  };

  const selectedValue = value ? value[fieldConfig.valueKey] : null;

  return (
    <View style={styles.wrapper}>
      {/* Input */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleInputPress}
        disabled={mode === 'search'}
      >
        <View style={[
          styles.inputContainer,
          variant === 'transparent' && styles.inputContainerTransparent,
          hasError  && styles.inputContainerError,
          isLoading && styles.inputContainerDisabled,
        ]}>
          <TextInput
            ref={inputRef}
            value={inputText}
            onChangeText={mode === 'search' ? handleTextChange : undefined}
            onBlur={mode === 'search' ? handleBlur : undefined}
            onFocus={mode === 'search' ? () => { if (!isOpen) openList(); } : undefined}
            placeholder={placeholder}
            placeholderTextColor="rgba(255,255,255,0.5)"
            editable={mode === 'search' && !isLoading}
            style={[styles.textInput, variant === 'transparent' && styles.textInputTransparent]}
            returnKeyType="done"
          />
          {renderRightIcon()}
        </View>
      </TouchableOpacity>

      {/* Lista desplegable */}
      {isOpen && !isLoading && (
        <ComboBoxList
          items={filteredData}
          selectedValue={selectedValue}
          fieldConfig={fieldConfig}
          direction={direction}
          excludeSelected={excludeSelected}
          onSelect={handleSelect}
        />
      )}
    </View>
  );
}

export default ComboBox;