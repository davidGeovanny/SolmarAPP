import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  Image,
  Modal,
  StatusBar,
  Platform,
} from 'react-native';
import ComboBoxList from './ComboBoxList';
import { useComboOpen } from '@/shared/context/ComboOpenContext';
import { comboBoxStyles as styles } from './ComboBox.styles';
import type { ComboBoxProps } from './ComboBox.types';

import IcSearch  from '@/assets/icons/ui/search.png';
import IcClear   from '@/assets/icons/ui/clear.png';
import IcRefresh from '@/assets/icons/ui/refresh.png';
import { StyleSheet } from 'react-native';

function ComboBox<T>({
  data,
  isLoading,
  onRefresh,
  fieldConfig,
  value,
  onChange,
  placeholder,
  mode        = 'search',
  direction   = 'bottom',
  icon,
  clearable   = true,
  excludeSelected = false,
  hasError    = false,
  debounceMs  = 300,
  variant     = 'glass',
  useModal    = false,
}: ComboBoxProps<T>) {
  const [isOpen,       setIsOpen]       = useState(false);
  const [inputText,    setInputText]    = useState('');
  const [filteredData, setFilteredData] = useState<T[]>(data);

  // Posición calculada del input para el modal
  const [listLayout, setListLayout] = useState<{
    top: number; left: number; width: number;
  } | null>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef      = useRef<TextInput>(null);
  const wrapperRef    = useRef<View>(null);

  const comboId = useRef(`combo-${ Math.random().toString(36).slice(2) }`).current; //-> ID único para este combo
  const { activeComboId, requestOpen, notifyClose } = useComboOpen();

  //-> Cerrar lista si se abre otro combo en la app (controlado por contexto)
  useEffect(() => {
    if (isOpen && activeComboId !== comboId) {
      setIsOpen(false);
      setFilteredData(data);
    }
  }, [activeComboId, comboId, isOpen, data]);

  //-> Limpiar al desmontar
  useEffect(() => {
    return () => { notifyClose(comboId); };
  }, [comboId, notifyClose]);

  // ── Medir posición del input para el modal ────────────────────────────
  const measureInput = useCallback((): Promise<{
    top: number; left: number; width: number; height: number;
  }> => {
    return new Promise(resolve => {
      wrapperRef.current?.measureInWindow((x, y, width, height) => {
        resolve({ left: x, top: y, width, height });
      });
    });
  }, []);

   // ── Helpers open/close ────────────────────────────────────────────────
  const openList = useCallback(async () => {
    if (useModal) {
      const { left, top, width, height } = await measureInput();
      setListLayout({
        left,
        top:   top + (height * 2) + 8, //-> Se posiciona debajo del input, con un pequeño gap
        width: Math.max(width, 200),
      });
    }
    requestOpen(comboId);
    setIsOpen(true);
  }, [useModal, measureInput, requestOpen, comboId]);

  const closeList = useCallback(() => {
    notifyClose(comboId);
    setIsOpen(false);
  }, [notifyClose, comboId]);

  const getDisplayText = useCallback((item: T): string => {
    const key = fieldConfig.displayKey ?? fieldConfig.labelKey;
    return String(item[key] ?? '');
  }, [fieldConfig]);

  //-> Sincronizar texto del input cuando cambia el valor seleccionado externamente
  useEffect(() => {
    setInputText(value ? getDisplayText(value) : '');
  }, [value, getDisplayText]);

  //-> Sincronizar datos filtrados cuando cambia la data original
  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  //-> Filtro con debounce
  const filterData = useCallback((text: string) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      if (!text.trim()) {
        setFilteredData(data);
        return;
      }

      const lower = text.toLowerCase();
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

  //-> Manejar cambio de texto en el input (solo en modo search)
  const handleTextChange = useCallback((text: string) => {
    setInputText(text);
    if (!isOpen) openList();
    filterData(text);
  }, [filterData, isOpen, openList]);

  //-> Seleccionar un elemento de la lista
  const handleSelect = useCallback((item: T) => {
    onChange(item);
    setInputText(getDisplayText(item));
    setFilteredData(data);
    closeList();
  }, [onChange, getDisplayText, data, closeList]);

  //-> Limpiar selección
  const handleClear = useCallback(() => {
    onChange(null);
    setInputText('');
    setFilteredData(data);

    if (isOpen) closeList();
  }, [onChange, data, isOpen, closeList]);

  //-> Blur del input: restaurar texto al valor seleccionado
  const handleBlur = useCallback(() => {
    //-> Pequeño delay para permitir que onPress de la lista se ejecute antes
    setTimeout(() => {
      setInputText(value ? getDisplayText(value) : '');
    }, 150);
  }, [value, getDisplayText]);

  //-> Toggle de la lista (modo select o ícono lupa)
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

  //-> Presionar el input en modo select
  const handleInputPress = useCallback(() => {
    if (mode === 'select') handleToggleList();
  }, [mode, handleToggleList]);

  //-> Refresh
  const handleRefresh = useCallback(() => {
    onChange(null);
    setInputText('');
    setFilteredData([]);
    if (isOpen) closeList();
    onRefresh?.();
  }, [onChange, onRefresh, isOpen, closeList]);

  //-> Ícono derecho del input
  const renderRightIcon = () => {
    // 1. Cargando
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

  // ── Lista en Modal (para combos dentro del TopBar) ────────────────────
  const renderModalList = () => {
    if (!isOpen || !listLayout) return null;

    const { width: SCREEN_W } = require('react-native').Dimensions.get('window');
    const listRight = listLayout.left + listLayout.width;
    const adjustedLeft = listRight > SCREEN_W
      ? SCREEN_W - listLayout.width - 8
      : listLayout.left;

    return (
      <Modal
        visible
        transparent
        animationType="none"
        onRequestClose={closeList}
        statusBarTranslucent
      >
        {/* Backdrop independiente — no envuelve la lista */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={closeList}
          activeOpacity={1}
        />

        {/* Lista fuera del TouchableOpacity — recibe gestos sin interferencia */}
        <View
          style={{
            position:  'absolute',
            top:       listLayout.top,
            left:      adjustedLeft,
            width:     listLayout.width,
            elevation: 20,
            zIndex:   200,
          }}
        >
          <ComboBoxList
            items={filteredData}
            selectedValue={selectedValue}
            fieldConfig={fieldConfig}
            direction="bottom"
            excludeSelected={excludeSelected}
            onSelect={handleSelect}
            inModal
          />
        </View>
      </Modal>
    );
  };

  return (
    <View ref={wrapperRef} style={ styles.wrapper } collapsable={false}>
      {/* Input */}
      <TouchableOpacity
        activeOpacity={ 1 }
        onPress={ handleInputPress }
        disabled={ mode === 'search' }
      >
        <View style={[
          styles.inputContainer,
          variant === 'transparent' && styles.inputContainerTransparent,
          hasError  && styles.inputContainerError,
          isLoading && styles.inputContainerDisabled,
        ]}>
          <TextInput
            ref={ inputRef }
            value={ inputText }
            onChangeText={ mode === 'search' ? handleTextChange : undefined }
            onBlur={ mode === 'search' ? handleBlur : undefined }
            onFocus={ mode === 'search' ? () => { if (!isOpen) openList(); } : undefined }
            placeholder={ placeholder }
            placeholderTextColor='rgba(255,255,255,0.5)'
            editable={ mode === 'search' && !isLoading }
            style={[ styles.textInput, variant === 'transparent' && styles.textInputTransparent ]}
            returnKeyType='done'
          />
          {renderRightIcon()}
        </View>
      </TouchableOpacity>

      {/* Lista desplegable */}
      {!useModal && isOpen && !isLoading && (
        <ComboBoxList
          items={ filteredData }
          selectedValue={ selectedValue }
          fieldConfig={ fieldConfig }
          direction={ direction }
          excludeSelected={ excludeSelected }
          onSelect={ handleSelect }
        />
      )}

      {/* Lista en modal (combos del TopBar) */}
      {useModal && renderModalList()}
    </View>
  );
}

export default ComboBox;