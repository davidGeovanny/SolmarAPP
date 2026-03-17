import { StyleSheet } from 'react-native';

const GLASS_BG      = 'rgba(255, 255, 255, 0.15)';
const GLASS_BORDER  = 'rgba(255, 255, 255, 0.35)';
const ERROR_COLOR   = '#FF6B6B';
const RADIUS        = 28;

export const glassInputStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    backgroundColor: GLASS_BG,
    overflow: 'hidden',
    height: 52,
    paddingHorizontal: 20,
  },
  containerError: {
    borderColor: ERROR_COLOR,
  },
  input: {
    flex: 1,
    color: '#FFF',
    fontSize: 15,
    height: '100%',
    padding: 0,
  }
});