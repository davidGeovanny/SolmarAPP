import React, { useCallback } from 'react';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AuthLayout from '../components/AuthLayout';
import CompanySelectForm from '../components/CompanySelectForm';
import useAuthStore from '../store/authStore';
import { AuthStackScreenProps } from '@/app/navigation/types';

type Props = AuthStackScreenProps<'CompanySelect'>;

const CompanySelectScreen: React.FC<Props> = ({ navigation }) => {
  const clearSession = useAuthStore(s => s.clearSession);

  const handleBack = useCallback(() => {
    clearSession();
    navigation.goBack();
  }, [clearSession, navigation]);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        handleBack();
        return true; //-> true = consumir el evento, no propagar
      });
      return () => subscription.remove();
    }, [handleBack]),
  );

  const handleSubmit = useCallback(() => {
    console.log('Empresa y Plaza seleccionados, navegando al siguiente paso...');
  }, []);

  return (
    <AuthLayout onBack={ handleBack }>
      <CompanySelectForm onSuccess={ handleSubmit } />
    </AuthLayout>
  );
};

export default CompanySelectScreen;