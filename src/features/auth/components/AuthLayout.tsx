import React from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useComboOpen } from '@/shared/context/ComboOpenContext';

import BgImage   from '@/assets/images/auth/fondo.jpg';
import LogoImage from '@/assets/images/auth/aticalogo.png';
import IcBack    from '@/assets/icons/ui/back.png';

interface AuthLayoutProps {
  children: React.ReactNode;
  onBack?:  () => void;
}

// ── Layout interno — consume el contexto ──────────────────────────────────────
const AuthLayoutInner: React.FC<AuthLayoutProps> = ({ children, onBack }) => {
  const { isAnyComboOpen } = useComboOpen();

  return (
    <>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ImageBackground
        source={BgImage}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay} />

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            // Bloquear scroll del padre cuando un combo está abierto,
            // así el FlatList de la lista puede recibir los gestos
            scrollEnabled={!isAnyComboOpen}
          >
            {/* Header */}
            <View style={styles.headerRow}>
              {onBack ? (
                <TouchableOpacity
                  onPress={onBack}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={styles.backButton}
                  activeOpacity={0.7}
                >
                  <Image
                    source={IcBack}
                    style={styles.backIcon}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              ) : null}

              <Image
                source={LogoImage}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            {/* Título */}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Bienvenido</Text>
              <Text style={styles.subtitle}>I N G R E S A R</Text>
            </View>

            {/* Contenido */}
            <View style={styles.formWrapper}>
              {children}
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Diseñado y Desarrollado por UPC Technologies</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </>
  );
};

const AuthLayout: React.FC<AuthLayoutProps> = (props) => (
    <AuthLayoutInner {...props} />
);

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  background: {
    flex:   1,
    width:  '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 20, 50, 0.45)',
  },
  scroll: {
    flexGrow:          1,
    paddingHorizontal: 28,
    paddingTop:        56,
    paddingBottom:     32,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems:    'center',
    marginBottom:  32,
    gap:           12,
  },
  backButton: {
    width:          36,
    height:         36,
    alignItems:     'center',
    justifyContent: 'center',
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  logo: {
    width:  80,
    height: 40,
  },
  titleContainer: {
    alignItems:   'center',
    marginBottom: 36,
  },
  title: {
    fontSize:     34,
    fontWeight:   '300',
    color:        '#FFFFFF',
    letterSpacing: 1,
    marginBottom: 12,
  },
  subtitle: {
    fontSize:     13,
    fontWeight:   '500',
    color:        'rgba(255,255,255,0.85)',
    letterSpacing: 6,
  },
  formWrapper: {
    flex: 1,
  },
  footer: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    marginTop:      40,
  },
  footerText: {
    color:    'rgba(255,255,255,0.55)',
    fontSize: 11,
  },
  devLogo: {
    width:   60,
    height:  16,
    opacity: 0.6,
  },
});

export default AuthLayout;