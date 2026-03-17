import React from 'react';
import AuthLayout from '../components/AuthLayout';
import LoginForm from '../components/LoginForm';
import { AuthStackScreenProps } from '@/app/navigation/types';

type Props = AuthStackScreenProps<'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => (
  <AuthLayout>
    <LoginForm
      onLoginSuccess={ () => navigation.navigate('CompanySelect') }
      onForgotPassword={ () => {  } }
    />
  </AuthLayout>
);

export default LoginScreen;