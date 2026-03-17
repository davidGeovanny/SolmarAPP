import React from 'react';
import {
  Image,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import IcBack from '@/assets/icons/ui/back.png';

interface ScreenHeaderProps {
  title:   string;
  onBack?: () => void;
}

const HEADER_BG = '#4A5568'; // gris oscuro como en la imagen

const ScreenHeader: React.FC<ScreenHeaderProps> = ({ title, onBack }) => (
  <View style={styles.container}>
    {onBack ? (
      <TouchableOpacity
        onPress={onBack}
        style={styles.backButton}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Image source={IcBack} style={{ width: 20, height: 20 }} resizeMode='contain' />
      </TouchableOpacity>
    ) : null}
    <Text style={styles.title}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection:    'row',
    alignItems:       'center',
    backgroundColor:  HEADER_BG,
    paddingVertical:  14,
    paddingHorizontal: 16,
    gap:              10,
  },
  backButton: {
    padding: 2,
  },
  title: {
    flex:          1,
    color:         '#FFFFFF',
    fontSize:      16,
    fontWeight:    '700',
    textAlign:     'center',
    letterSpacing: 0.3,
  },
});

export default ScreenHeader;