import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { comboBoxStyles as styles } from './ComboBox.styles';
import type { ComboBoxListProps } from './ComboBox.types';

const ITEM_HEIGHT = 44; // altura estimada por ítem para el auto-scroll

function ComboBoxList<T>({
  items,
  selectedValue,
  fieldConfig,
  direction,
  excludeSelected,
  onSelect,
  inModal     = false,
  inputHeight = 52,
}: ComboBoxListProps<T>) {
  const scrollRef = useRef<ScrollView>(null);

  const displayItems = excludeSelected
    ? items.filter(item => item[fieldConfig.valueKey] !== selectedValue)
    : items;

  const selectedIndex = displayItems.findIndex(
    item => item[fieldConfig.valueKey] === selectedValue,
  );

  // Auto-scroll al elemento seleccionado al abrir la lista
  useEffect(() => {
    if (selectedIndex > 0 && scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          y:        selectedIndex * ITEM_HEIGHT,
          animated: true,
        });
      }, 100);
    }
  }, [selectedIndex]);

  const listWrapperStyle = inModal
    ? [
        styles.listWrapperModal
      ]
    : [
        styles.listWrapper,
        direction === 'bottom' && { top: inputHeight + 4 },
        direction === 'top'    && { bottom: inputHeight + 4 },
        direction === 'right'  && styles.listWrapperRight,
        direction === 'left'   && styles.listWrapperLeft,
      ];

  return (
    <View style={listWrapperStyle}>
      {displayItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Sin resultados</Text>
        </View>
      ) : (
        <ScrollView
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {displayItems.map(item => {
            const isSelected = item[fieldConfig.valueKey] === selectedValue;
            const label      = String(item[fieldConfig.labelKey] ?? '');
            const subtitle   = fieldConfig.subtitleKey
              ? String(item[fieldConfig.subtitleKey] ?? '')
              : null;

            return (
              <TouchableOpacity
                key={String(item[fieldConfig.valueKey])}
                onPress={() => onSelect(item)}
                style={[styles.item, isSelected && styles.itemSelected]}
                activeOpacity={0.7}
              >
                <Text style={[styles.itemLabel, isSelected && styles.itemLabelSelected]}>
                  {label}
                </Text>
                {subtitle ? (
                  <Text style={styles.itemSubtitle}>{subtitle}</Text>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

export default ComboBoxList;