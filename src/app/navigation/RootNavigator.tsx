import React from 'react';
import { View } from 'react-native';
import type { GestureResponderEvent } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import useAuthStore from '@/features/auth/store/authStore';
import { ComboOpenProvider, useComboOpen } from '@/shared/context/ComboOpenContext';
import ComboDropdownPortal from '@/shared/components/ui/ComboBox/ComboDropdownPortal';

/**
 * Contenido interior del navegador. Necesita estar dentro de ComboOpenProvider
 * para poder leer el estado del portal via useComboOpen().
 */
const RootNavigatorContent = () => {
  const isAuthenticated = useAuthStore(store => store.isAuthenticated);
  const { dropdownPortal, closeDropdown } = useComboOpen();

  /**
   * Intercepta el inicio de cualquier toque durante la fase de captura (top-down).
   * Si hay un portal abierto y el toque cae FUERA de sus límites, cierra el portal
   * y devuelve false para NO consumir el toque — el elemento bajo el dedo
   * (botón, TextInput, etc.) lo recibe en el mismo gesto: primer clic funciona.
   */
  const handleCapture = (evt: GestureResponderEvent): boolean => {
    if (!dropdownPortal) return false;
    const { pageX, pageY } = evt.nativeEvent;
    const { top, left, width, estimatedHeight } = dropdownPortal;
    const isOutside =
      pageX < left ||
      pageX > left + width ||
      pageY < top ||
      pageY > top + estimatedHeight;
    if (isOutside) closeDropdown();
    return false; // nunca consumir — dejar pasar el toque al elemento destino
  };

  return (
    <View style={{ flex: 1 }}>
      {/*
        Wrapper con el handler de captura. ComboDropdownPortal está FUERA de este
        View para que los toques sobre la lista no sean interceptados por handleCapture.
      */}
      <View style={{ flex: 1 }} onStartShouldSetResponderCapture={handleCapture}>
        <NavigationContainer>
          { isAuthenticated ? <MainNavigator /> : <AuthNavigator /> }
          {/* { false ? <MainNavigator /> : <AuthNavigator /> } */}
        </NavigationContainer>
      </View>
      {/* Portal del dropdown posicionado absolutamente sobre toda la UI */}
      <ComboDropdownPortal />
    </View>
  );
};

const RootNavigator = () => (
  <ComboOpenProvider>
    <RootNavigatorContent />
  </ComboOpenProvider>
);

export default RootNavigator;