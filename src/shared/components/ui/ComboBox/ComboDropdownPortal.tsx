import React from 'react';
import { View } from 'react-native';
import ComboBoxList from './ComboBoxList';
import { useComboOpen } from '@/shared/context/ComboOpenContext';
import type { ComboBoxFieldConfig } from './ComboBox.types';

/**
 * Renderiza el dropdown de un ComboBox con useModal=true como un View
 * posicionado absolutamente dentro del árbol nativo normal (sin Modal).
 * Debe estar fuera del wrapper con onStartShouldSetResponderCapture para que
 * los toques sobre la lista no sean interceptados por ese handler.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ComboDropdownPortal() {
  const { dropdownPortal } = useComboOpen();

  if (!dropdownPortal) return null;

  const {
    top, left, width,
    items, selectedValue, fieldConfig, excludeSelected, onSelect,
  } = dropdownPortal;

  return (
    <View
      style={{
        position:  'absolute',
        top,
        left,
        width,
        elevation: 20,
        zIndex:    999,
      }}
    >
      <ComboBoxList
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        items={items as any[]}
        selectedValue={selectedValue}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fieldConfig={fieldConfig as ComboBoxFieldConfig<any>}
        direction="bottom"
        excludeSelected={excludeSelected}
        onSelect={onSelect}
        inModal
      />
    </View>
  );
}

export default ComboDropdownPortal;
