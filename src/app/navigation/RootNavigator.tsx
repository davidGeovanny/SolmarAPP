import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import useAuthStore from '@/features/auth/store/authStore';
import { ComboOpenProvider } from '@/shared/context/ComboOpenContext';

const RootNavigator = () => {
  const isAuthenticated = useAuthStore(store => store.isAuthenticated);

  return (
    <ComboOpenProvider>
      <NavigationContainer>
        { isAuthenticated ? <MainNavigator /> : <AuthNavigator /> }
        {/* { false ? <MainNavigator /> : <AuthNavigator /> } */}
      </NavigationContainer>
    </ComboOpenProvider>
  );
}

export default RootNavigator;