import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '@/features/auth/screens/LoginScreen';
import CompanySelectScreen from '@/features/auth/screens/CompanySelectScreen';
import type { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, animation: 'none' }}>
    <Stack.Screen name='Login' component={ LoginScreen } />
    <Stack.Screen name='CompanySelect' component={ CompanySelectScreen } />
  </Stack.Navigator>
);

export default AuthNavigator;