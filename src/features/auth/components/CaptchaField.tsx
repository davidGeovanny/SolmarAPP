import React, { forwardRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import type { CaptchaFieldProps } from '../types';

import IcRefresh from '@/assets/icons/ui/refresh.png';

const CaptchaField = forwardRef<TextInput, CaptchaFieldProps>(
  ({ value, onChange, onBlur, onRefresh, operandA, operandB, hasError, errorMessage }, ref) => (
    <View>
      <View style={ styles.row }>
        <Text style={ styles.label }>{ operandA } + { operandB } =</Text>

        <View style={[ styles.inputWrapper, hasError && styles.inputWrapperError ]}>
          <TextInput
            ref={ ref }
            value={ value }
            onChangeText={ onChange }
            onBlur={ onBlur }
            placeholder='Respuesta'
            placeholderTextColor='rgba(255,255,255,0.5)'
            keyboardType='number-pad'
            returnKeyType='done'
            style={ styles.input }
          />

          <TouchableOpacity
            onPress={ onRefresh }
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={ styles.refreshButton }
            activeOpacity={ 0.7 }
          >
            <Image
              source={ IcRefresh }
              style={ styles.refreshIcon }
              resizeMode='contain'
            />
          </TouchableOpacity>
        </View>
      </View>

      { hasError && errorMessage ? (
        <Text style={ styles.errorText }>{ errorMessage }</Text>
      ) : null}
    </View>
  ),
);

CaptchaField.displayName = 'CaptchaField';

const GLASS_BG     = 'rgba(255, 255, 255, 0.15)';
const GLASS_BORDER = 'rgba(255, 255, 255, 0.35)';
const ERROR_COLOR  = '#FF6B6B';

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    minWidth: 70,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    backgroundColor: GLASS_BG,
    overflow: 'hidden',
    height: 52,
    paddingHorizontal: 20,
  },
  inputWrapperError: {
    borderColor: ERROR_COLOR,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    height: '100%',
    padding: 0,
  },
  refreshButton: {
    marginLeft: 8,
    padding: 2,
  },
  refreshIcon: {
    width: 20,
    height: 20,
  },
  errorText: {
    color: ERROR_COLOR,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 8,
  },
});

export default CaptchaField;