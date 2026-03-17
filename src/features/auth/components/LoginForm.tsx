import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
} from 'react-native';
import { Controller } from 'react-hook-form';
import GlassInput from '@/shared/components/ui/GlassInput';
import CaptchaField from './CaptchaField';
import { useLogin } from '../hooks/useLogin';
import type { LoginFormProps } from '../types';

import IcEye        from '@/assets/icons/ui/visible.svg';
import IcEyeOff     from '@/assets/icons/ui/oculto.svg';
import IcArrowRight from '@/assets/icons/ui/siguiente.png';

const PRIMARY_BLUE = '#1A73E8';
const ERROR_COLOR  = '#FF6B6B';

interface Props extends LoginFormProps {
  onLoginSuccess: () => void;
}

const LoginForm: React.FC<Props> = ({ onLoginSuccess, onForgotPassword }) => {
  const {
    form: { control, handleSubmit, formState: { errors } },
    captcha,
    showPassword,
    isLoading,
    apiError,
    passwordRef,
    captchaRef,
    refreshCaptcha,
    togglePassword,
    onSubmit,
  } = useLogin(onLoginSuccess);

  return (
    <View style={ styles.container }>

      {/* Error global de API */}
      {apiError ? (
        <View style={ styles.apiErrorBox }>
          <Text style={ styles.apiErrorText }>{ apiError }</Text>
        </View>
      ) : null}

      {/* Usuario */}
      <View style={ styles.fieldGroup }>
        <Text style={ styles.label }>Usuario</Text>
        <Controller
          control={control}
          name="username"
          render={({ field: { onChange, onBlur, value } }) => (
            <GlassInput
              value={ value }
              onChangeText={ onChange }
              onBlur={ onBlur }
              placeholder="usuario@upc.tax"
              placeholderTextColor="rgba(255,255,255,0.5)"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={ false }
              returnKeyType="next"
              onSubmitEditing={ () => passwordRef.current?.focus() }
              hasError={ !!errors.username }
            />
          )}
        />
        {errors.username ? (
          <Text style={ styles.errorText }>{errors.username.message}</Text>
        ) : null}
      </View>

      {/* Contraseña */}
      <View style={ styles.fieldGroup }>
        <Text style={ styles.label }>Contraseña</Text>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <GlassInput
              ref={ passwordRef }
              value={ value }
              onChangeText={ onChange }
              onBlur={ onBlur }
              placeholder="••••••••••••••••"
              placeholderTextColor="rgba(255,255,255,0.5)"
              secureTextEntry={!showPassword}
              returnKeyType="next"
              onSubmitEditing={ () => captchaRef.current?.focus() }
              hasError={ !!errors.password }
              rightElement={
                <TouchableOpacity
                  onPress={ togglePassword }
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  activeOpacity={ 0.7 }
                >
                  {/* Reemplaza con los SVGs cuando estén configurados: */}
                      {showPassword
                        ? <IcEyeOff width={20} height={20} fill="rgba(255,255,255,0.7)" />
                        : <IcEye    width={20} height={20} fill="rgba(255,255,255,0.7)" />
                      }
                </TouchableOpacity>
              }
            />
          )}
        />
        {errors.password ? (
          <Text style={ styles.errorText }>{ errors.password.message }</Text>
        ) : null}
      </View>

      {/* ¿Olvidaste tu contraseña? */}
      <TouchableOpacity
        style={ styles.forgotButton }
        onPress={ onForgotPassword }
        activeOpacity={ 0.7 }
      >
        <Text style={ styles.forgotText }>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>

      {/* Captcha */}
      <View style={ styles.fieldGroup }>
        <Controller
          control={ control }
          name="captchaAnswer"
          render={({ field: { onChange, onBlur, value } }) => (
            <CaptchaField
              ref={ captchaRef }
              value={ value }
              onChange={ onChange }
              onBlur={ onBlur }
              onRefresh={ refreshCaptcha }
              operandA={ captcha.a }
              operandB={ captcha.b }
              hasError={ !!errors.captchaAnswer }
              errorMessage={ errors.captchaAnswer?.message }
            />
          )}
        />
      </View>

      {/* Botón Siguiente */}
      <TouchableOpacity
        style={[ styles.submitButton, isLoading && styles.submitButtonDisabled ]}
        onPress={ handleSubmit(onSubmit) }
        disabled={ isLoading }
        activeOpacity={ 0.85 }
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text style={ styles.submitText }>Siguiente</Text>
            <Image
              source={ IcArrowRight }
              style={ styles.rightIcon }
              resizeMode='contain'
            />
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  errorText: {
    color: ERROR_COLOR,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 8,
  },
  apiErrorBox: {
    backgroundColor: 'rgba(255,107,107,0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ERROR_COLOR,
    padding: 12,
    marginBottom: 16,
  },
  apiErrorText: {
    color: ERROR_COLOR,
    fontSize: 13,
    textAlign: 'center',
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 16,
    marginTop: -4,
  },
  forgotText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  eyeIcon: {
    fontSize: 16,
    marginLeft: 8,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY_BLUE,
    borderRadius: 28,
    height: 54,
    marginTop: 24,
    gap: 10,
    shadowColor: PRIMARY_BLUE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  rightIcon: {
    width: 20,
    height: 20,
    position: 'absolute',
    right: 20,
  },
  submitArrow: {
    color: '#FFFFFF',
    fontSize: 18,
  },
});

export default LoginForm;