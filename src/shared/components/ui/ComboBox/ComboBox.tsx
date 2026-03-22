import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { comboBoxStyles as styles } from './ComboBox.styles';
import ComboBoxList from './ComboBoxList';
import { useComboOpen } from '@/shared/context/ComboOpenContext';
import type { ComboBoxProps } from './ComboBox.types';

import IcSearch from '@/assets/icons/ui/search.svg';
import IcClear   from '@/assets/icons/ui/clear.svg';
// import IcRefresh from '@/assets/icons/ui/ic_refresh.svg';

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
  iconColor,
  useModal        = false,
  debounceMs      = 300,
}: ComboBoxProps<T>) {
  // Color de íconos: usa el prop si se pasa, si no infiere según variante
  const resolvedIconColor = iconColor
    ?? (variant === 'outline' ? '#64748B' : 'rgba(255,255,255,0.7)');

  const [isOpen,       setIsOpen]       = useState(false);
  const [inputText,    setInputText]    = useState('');
  const [filteredData, setFilteredData] = useState<T[]>(data);
  const [inputHeight,  setInputHeight]  = useState(52); // altura real del inputContainer

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef      = useRef<TextInput>(null);
  const wrapperRef    = useRef<View>(null);
  const inputContainerRef = useRef<View>(null);

  // ID estable por instancia — identifica este combo en el contexto
  const comboId = useRef(`combo-${Math.random().toString(36).slice(2)}`).current;

  // Ref de reenvío para handleSelect — permite que openList use siempre la versión
  // más reciente del callback sin agregarlo a sus deps (evita closures obsoletos).
  const handleSelectRef = useRef<(item: T) => void>(() => {});

  const { activeComboId, requestOpen, notifyClose,
          openDropdown, closeDropdown, updatePortalItems } = useComboOpen();

  // ── Medir posición del inputContainer — para la lista normal (no modal) ──
  const measureInput = useCallback((): Promise<{
    top: number; left: number; width: number; height: number;
  }> => new Promise(resolve => {
    inputContainerRef.current?.measureInWindow((x, y, width, height) => {
      resolve({ left: x, top: y, width, height });
    });
  }), []);

  // ── Medir posición del wrapper — para el portal (modal) ───────────────
  // El wrapper siempre tiene la altura real visible sin importar la variante
  const measureWrapper = useCallback((): Promise<{
    top: number; left: number; width: number; height: number;
  }> => new Promise(resolve => {
    wrapperRef.current?.measureInWindow((x, y, width, height) => {
      resolve({ left: x, top: y, width, height });
    });
  }), []);

  // ── Abrir / cerrar lista ──────────────────────────────────────────────
  const openList = useCallback(async () => {
    if (useModal) {
      const { left, top, width } = await measureWrapper();
      const SCREEN_W = Dimensions.get('window').width;
      const listWidth = Math.max(width, 200);
      const adjustedLeft = left + listWidth > SCREEN_W
        ? SCREEN_W - listWidth - 8
        : left - 4;

      // Height estático por variante — las mediciones dinámicas fallan
      // por overflow/collapsing del inputContainer según la variante
      const inputH = variant === 'transparent' ? 35 : 52; // outline y glass tienen la misma altura real de 52

      const portalTop = top + inputH + 20;
      openDropdown({
        top:             portalTop,
        left:            adjustedLeft,
        width:           listWidth,
        estimatedHeight: Math.min(filteredData.length * 44 + 16, 250),
        items:           filteredData as unknown[],
        selectedValue:   value ? value[fieldConfig.valueKey] : null,
        fieldConfig,
        excludeSelected,
        onSelect:        (item: unknown) => handleSelectRef.current(item as T),
        comboId,
      });
    } else {
      // Medir el inputContainer para calcular el top dinámico de la lista normal
      const { height } = await measureInput();
      setInputHeight(height);
      requestOpen(comboId);
    }
    setIsOpen(true);
  }, [useModal, measureWrapper, measureInput, openDropdown, filteredData, value, fieldConfig,
      excludeSelected, comboId, requestOpen, variant]);

  const closeList = useCallback(() => {
    if (useModal) {
      closeDropdown(); // también limpia activeComboId
    } else {
      notifyClose(comboId);
    }
    setIsOpen(false);
  }, [useModal, closeDropdown, notifyClose, comboId]);

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

  // ── Sincronizar items del portal cuando filteredData cambia (modo search) ──
  useEffect(() => {
    if (useModal && isOpen) {
      updatePortalItems(
        filteredData as unknown[],
        value ? value[fieldConfig.valueKey] : null,
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredData, useModal, isOpen]);

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

  // Mantener el ref siempre apuntando a la versión más reciente
  handleSelectRef.current = handleSelect;

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
      return <ActivityIndicator size='small' color={resolvedIconColor} style={ styles.iconButton } />;
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
            <IcClear width={16} height={16} color={resolvedIconColor} />
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
            <IcSearch width={18} height={18} color={resolvedIconColor} />
          )}
        </TouchableOpacity>
      </>
    );
  };

  const selectedValue = value ? value[fieldConfig.valueKey] : null;

  return (
    <View ref={wrapperRef} style={styles.wrapper} collapsable={!useModal}>
      {/* Input */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleInputPress}
        disabled={mode === 'search'}
      >
        <View
          ref={inputContainerRef}
          collapsable={false}
          style={[
            styles.inputContainer,
            variant === 'outline'     && styles.inputContainerOutline,
            variant === 'transparent' && styles.inputContainerTransparent,
            hasError  && styles.inputContainerError,
            isLoading && styles.inputContainerDisabled,
          ]}
        >
          <TextInput
            ref={inputRef}
            value={inputText}
            onChangeText={mode === 'search' ? handleTextChange : undefined}
            onBlur={mode === 'search' ? handleBlur : undefined}
            onFocus={mode === 'search' ? () => { if (!isOpen) openList(); } : undefined}
            placeholder={placeholder}
            placeholderTextColor="rgba(255,255,255,0.5)"
            editable={mode === 'search' && !isLoading}
            style={[
              styles.textInput,
              variant === 'outline'     && styles.textInputOutline,
              variant === 'transparent' && styles.textInputTransparent,
            ]}
            returnKeyType="done"
          />
          {renderRightIcon()}
        </View>
      </TouchableOpacity>

      {/* Lista normal (combos fuera del TopBar) */}
      {!useModal && isOpen && !isLoading && (
        <ComboBoxList
          items={filteredData}
          selectedValue={selectedValue}
          fieldConfig={fieldConfig}
          direction={direction}
          excludeSelected={excludeSelected}
          onSelect={handleSelect}
          inputHeight={inputHeight}
        />
      )}

    </View>
  );
}

export default ComboBox;