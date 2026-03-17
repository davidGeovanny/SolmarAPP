import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { glassInputStyles as styles } from './GlassInput.styles';
import { BlurView } from '@react-native-community/blur';

export interface GlassInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  placeholderTextColor?: string;
  secureTextEntry?: boolean;
  keyboardType?: TextInput['props']['keyboardType'];
  autoCapitalize?: TextInput['props']['autoCapitalize'];
  autoCorrect?: boolean;
  returnKeyType?: TextInput['props']['returnKeyType'];
  onSubmitEditing?: () => void;
  hasError?: boolean;
  rightElement?: React.ReactNode;
}

const GlassInput = React.forwardRef<TextInput, GlassInputProps>(
  ({ rightElement, hasError, ...textInputProps }, ref) => (
    <View style={[ styles.container, hasError && styles.containerError ]}>
      <BlurView
        style={ StyleSheet.absoluteFill }
        blurType='light'
        blurAmount={ 8 }
        reducedTransparencyFallbackColor='rgba(255,255,255,0.15)'
      />
      <TextInput ref={ ref } style={ styles.input } { ...textInputProps } />
      {rightElement}
    </View>
  ),
);

GlassInput.displayName = 'GlassInput';

export default GlassInput;