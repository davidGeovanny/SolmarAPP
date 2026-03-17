import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { comboBoxStyles as styles } from './ComboBox.styles';
import type { ComboBoxListProps } from './ComboBox.types';

const ITEM_HEIGHT = 44;

function ComboBoxList<T>({
  items,
  selectedValue,
  fieldConfig,
  direction,
  excludeSelected,
  onSelect,
  inModal = false,
}: ComboBoxListProps<T>) {
  const scrollRef = useRef<ScrollView>(null);

  const displayItems = excludeSelected
    ? items.filter(item => item[fieldConfig.valueKey] !== selectedValue)
    : items;

  const selectedIndex = displayItems.findIndex(item => item[fieldConfig.valueKey] === selectedValue);

  //-> Al abrir la lista, hacer scroll al elemento seleccionado
  useEffect(() => {
    if (selectedIndex <= 0 || !scrollRef.current) return;
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: selectedIndex * ITEM_HEIGHT,
        animated: true,
      });
    }, 100); //-> Se agrega un delay para asegurar que el FlatList haya renderizado los items antes de hacer scroll
  }, [selectedIndex]);

  const renderItem = (item: T) => {
    const isSelected = item[fieldConfig.valueKey] === selectedValue;
    const label      = String(item[fieldConfig.labelKey] ?? '');
    const subtitle   = fieldConfig.subtitleKey
      ? String(item[fieldConfig.subtitleKey] ?? '')
      : null;

    return (
      <TouchableOpacity
        key={ String(item[fieldConfig.valueKey]) }
        onPress={ () => onSelect(item) }
        style={[ styles.item, isSelected && styles.itemSelected ]}
        activeOpacity={ 0.7 }
      >
        <Text style={[ styles.itemLabel, isSelected && styles.itemLabelSelected ]}>
          { label }
        </Text>
        {subtitle ? (
          <Text style={ styles.itemSubtitle }>{ subtitle }</Text>
        ) : null}
      </TouchableOpacity>
    );
  };

  const listWrapperStyle = inModal
    ? [styles.listWrapperModal]
    : [
        styles.listWrapper,
        direction === 'bottom' ? styles.listWrapperBottom : null,
        direction === 'top'    ? styles.listWrapperTop : null,
        direction === 'right'  ? styles.listWrapperRight : null,
        direction === 'left'   ? styles.listWrapperLeft : null,
      ];

  return (
    <View style={listWrapperStyle}>
      {displayItems.length === 0 ? (
        <View style={ styles.emptyContainer }>
          <Text style={ styles.emptyText }>Sin resultados</Text>
        </View>
      ) : (
        <ScrollView
          ref={ scrollRef }
          keyboardShouldPersistTaps='handled'
          showsVerticalScrollIndicator={ false }
          bounces={ false }
        >
          { displayItems.map(renderItem) }
        </ScrollView>
      )}
    </View>
  );
}

export default ComboBoxList;