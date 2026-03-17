import { useState, useCallback, useRef } from 'react';
import { TextInput } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormValues } from '../schemas/loginSchema';
import authService from '../services/authService';
import useAuthStore from '../store/authStore';
import {
  ApiBusinessError,
  NetworkError,
  UnexpectedResponseError,
} from '@/shared/services/httpClient';
import type { Captcha } from '../types';

const randomDigit = (): number => Math.floor(Math.random() * 9) + 1;
const generateCaptcha = (): Captcha => ({ a: randomDigit(), b: randomDigit() });

export const useLogin = (onLoginSuccess: () => void) => {
  const [captcha, setCaptcha] = useState<Captcha>(generateCaptcha);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const passwordRef = useRef<TextInput>(null);
  const captchaRef  = useRef<TextInput>(null);

  const setCredentials = useAuthStore(state => state.setCredentials);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '', captchaAnswer: '' },
  });

  const refreshCaptcha = useCallback(() => {
    setCaptcha(generateCaptcha());
    form.resetField('captchaAnswer');
  }, [form]);

  const togglePassword = useCallback(() => {
    setShowPassword(v => !v);
  }, []);

  const onSubmit = useCallback(
    async (values: LoginFormValues) => {
      setApiError(null);

      const expectedAnswer = captcha.a + captcha.b;
      if (parseInt(values.captchaAnswer, 10) !== expectedAnswer) {
        form.setError('captchaAnswer', { message: 'La respuesta es incorrecta' });
        refreshCaptcha();
        return;
      }

      try {
        setIsLoading(true);

        const session = await authService.login({
          username: values.username,
          password: values.password,
        });

        setCredentials(session);
        onLoginSuccess();
      } catch (err) {
        refreshCaptcha();

        if (err instanceof ApiBusinessError) {
          //-> Error controlado (ej: credenciales incorrectas)
          setApiError(err.message);
        } else if (err instanceof NetworkError) {
          setApiError('No se pudo conectar con el servidor. Verifica tu conexión.');
        } else if (err instanceof UnexpectedResponseError) {
          setApiError('El servidor respondió de forma inesperada. Intenta nuevamente más tarde.');
        } else {
          setApiError('Ocurrió un error desconocido. Intenta nuevamente.');
        }
      } finally {
        setIsLoading(false);
      }
    },
    [captcha, form, onLoginSuccess, refreshCaptcha],
  );

  return {
    form,
    captcha,
    showPassword,
    isLoading,
    apiError,
    passwordRef,
    captchaRef,
    refreshCaptcha,
    togglePassword,
    onSubmit,
  };
};