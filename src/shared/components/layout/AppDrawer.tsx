import React, { useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useComboOpen } from '@/shared/context/ComboOpenContext';
import useAuthStore from '@/features/auth/store/authStore';

import IcHome   from '@/assets/icons/menu/home.svg';
import IcPower  from '@/assets/icons/menu/power_off.svg';
import IcRecepDist   from '@/assets/icons/menu/recepciondistribucion.png';
import IcEntregaDir  from '@/assets/icons/menu/entrega_directa.png';
import IcEntregaMerc from '@/assets/icons/menu/recepciondemercancia.png';
import IcConsig      from '@/assets/icons/menu/consig.png';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH  = SCREEN_WIDTH * 0.8;
const SWIPE_EDGE    = 24;   // px desde el borde izquierdo que activa el swipe de apertura
const SWIPE_THRESHOLD = 60; // px mínimos para confirmar apertura/cierre

const DRAWER_BG     = '#1C57B5';
const ACTIVE_BG     = 'rgba(255,255,255,0.18)';
const ACTIVE_TEXT   = '#FFFFFF';
const INACTIVE_TEXT = 'rgba(255,255,255,0.75)';

export type DrawerRoute =
  | 'Home'
  | 'RecepcionDistribucion'
  | 'EntregaDirecta'
  | 'EntregaMercancia'
  | 'ConsignacionDirecta';

interface MenuItem {
  key:   DrawerRoute;
  label: string;
  icon: any; // ImageSourcePropType
  type?: 'png' | 'svg'; // Para diferenciar cómo renderizar el ícono
}

const MENU_ITEMS: MenuItem[] = [
  { key: 'Home',                  label: 'Inicio', icon: IcHome, type: 'svg' },
  { key: 'RecepcionDistribucion', label: 'Recepción de Distribución', icon: IcRecepDist, type: 'png' },
  { key: 'EntregaDirecta',        label: 'Recepción Entrega Directa', icon: IcEntregaDir, type: 'png' },
  { key: 'EntregaMercancia',      label: 'Entrega de Mercancía Centro de Costos', icon: IcEntregaMerc, type: 'png' },
  { key: 'ConsignacionDirecta',   label: 'Consignación Directa', icon: IcConsig, type: 'png' },
];

interface AppDrawerProps {
  isOpen:       boolean;
  activeRoute:  DrawerRoute;
  onNavigate:   (route: DrawerRoute) => void;
  onClose:      () => void;
  onOpen:       () => void;
  children:     React.ReactNode;
}

const AppDrawer: React.FC<AppDrawerProps> = ({
  isOpen,
  activeRoute,
  onNavigate,
  onClose,
  onOpen,
  children,
}) => {
  const insets      = useSafeAreaInsets();
  const sesion      = useAuthStore(s => s.sesion);
  const clearSession = useAuthStore(s => s.clearSession);

  const translateX  = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const isOpenRef   = useRef(false);

  // ── Sincronizar animación con prop isOpen ─────────────────────────────
  useEffect(() => {
    isOpenRef.current = isOpen;
    Animated.timing(translateX, {
      toValue:         isOpen ? 0 : -DRAWER_WIDTH,
      duration:        280,
      useNativeDriver: true,
    }).start();
  }, [isOpen, translateX]);

  // ── Opacidad del overlay de fondo ─────────────────────────────────────
  const overlayOpacity = translateX.interpolate({
    inputRange:  [-DRAWER_WIDTH, 0],
    outputRange: [0, 0.5],
    extrapolate: 'clamp',
  });

  // ── PanResponder para abrir — solo activo en la franja del borde izquierdo ──
  const openPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dx, dy }) => {
        if (isOpenRef.current) return false;
        return dx > 8 && Math.abs(dx) > Math.abs(dy) * 1.5;
      },
      onPanResponderMove: (_, { dx }) => {
        const next = Math.min(0, Math.max(-DRAWER_WIDTH, -DRAWER_WIDTH + dx));
        translateX.setValue(next);
      },
      onPanResponderRelease: (_, { dx, vx }) => {
        if (dx > SWIPE_THRESHOLD || vx > 0.5) { onOpen(); return; }
        Animated.spring(translateX, {
          toValue: -DRAWER_WIDTH, useNativeDriver: true, bounciness: 0,
        }).start();
      },
    }),
  ).current;

  // ── PanResponder para cerrar — activo en el overlay cuando drawer está abierto ──
  const closePanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dx, dy }) => {
        if (!isOpenRef.current) return false;
        return dx < -8 && Math.abs(dx) > Math.abs(dy) * 1.5;
      },
      onPanResponderMove: (_, { dx }) => {
        const next = Math.min(0, Math.max(-DRAWER_WIDTH, dx));
        translateX.setValue(next);
      },
      onPanResponderRelease: (_, { dx, vx }) => {
        if (dx < -SWIPE_THRESHOLD || vx < -0.5) { onClose(); return; }
        Animated.spring(translateX, {
          toValue: 0, useNativeDriver: true, bounciness: 0,
        }).start();
      },
    }),
  ).current;

  const handleNavigate = useCallback((route: DrawerRoute) => {
    onClose();
    // Pequeño delay para que la animación de cierre se vea antes de navegar
    setTimeout(() => onNavigate(route), 50);
  }, [onClose, onNavigate]);

  const handleLogout = useCallback(() => {
    onClose();
    setTimeout(() => clearSession(), 50);
  }, [onClose, clearSession]);

  return (
    <View style={styles.root}>
      {/* Contenido principal */}
      <View style={styles.content}>
        {children}
      </View>

      {/* Franja invisible en el borde izquierdo — solo para abrir el drawer */}
      <View
        style={styles.swipeEdge}
        {...openPanResponder.panHandlers}
      />

      {/* Overlay oscuro al abrir el drawer */}
      <Animated.View
        pointerEvents={isOpen ? 'auto' : 'none'}
        style={[styles.overlay, { opacity: overlayOpacity }]}
        {...closePanResponder.panHandlers}
      >
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
      </Animated.View>

      {/* Drawer */}
      <Animated.View
        style={[
          styles.drawer,
          {
            width:     DRAWER_WIDTH,
            transform: [{ translateX }],
            paddingTop: (Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : insets.top) + 16,
            paddingBottom: insets.bottom + 16,
          },
        ]}
      >
        {/* Encabezado — nombre del almacén */}
        <View style={styles.drawerHeader}>
          <Text style={styles.drawerHeaderLabel}>Almacén:</Text>
          <Text style={styles.drawerHeaderValue}>
            {sesion?.NombreAlmacen ?? '—'}
          </Text>
        </View>

        {/* Ítems del menú */}
        <View style={styles.menuItems}>
          {MENU_ITEMS.map(item => {
            const isActive = activeRoute === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                onPress={() => handleNavigate(item.key)}
                style={[styles.menuItem, isActive && styles.menuItemActive]}
                activeOpacity={0.75}
              >
                {/* Ícono PNG (blanco siempre, el fondo diferencia activo/inactivo) */}
                {item.type === 'svg' ? (
                  <item.icon width={28} height={28} color='#FFF' />
                ) : (
                  <Image source={item.icon} style={styles.menuIcon} resizeMode='contain' />
                )}

                <Text style={[styles.menuLabel, isActive && styles.menuLabelActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Spacer */}
        <View style={styles.flex} />

        {/* Cerrar sesión */}
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.logoutButton}
          activeOpacity={0.75}
        >
          <IcPower width={20} height={20} color="#CC0000" />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  swipeEdge: {
    position: 'absolute',
    left:     0,
    top:      0,
    bottom:   0,
    width:    SWIPE_EDGE,
    zIndex:   9,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex:          10,
  },
  drawer: {
    position:          'absolute',
    left:              0,
    top:               0,
    bottom:            0,
    backgroundColor:   DRAWER_BG,
    zIndex:            20,
    elevation:         20,
    shadowColor:       '#000',
    shadowOffset:      { width: 4, height: 0 },
    shadowOpacity:     0.3,
    shadowRadius:      8,
    paddingHorizontal: 0,
  },
  drawerHeader: {
    backgroundColor:   'rgba(0,0,0,0.2)',
    marginHorizontal:  16,
    borderRadius:      10,
    paddingVertical:   12,
    paddingHorizontal: 16,
    marginBottom:      24,
  },
  drawerHeaderLabel: {
    color:        'rgba(255,255,255,0.7)',
    fontSize:     12,
    fontWeight:   '400',
    marginBottom: 2,
  },
  drawerHeaderValue: {
    color:         '#FFFFFF',
    fontSize:      15,
    fontWeight:    '700',
    fontStyle:     'italic',
    letterSpacing: 0.3,
  },
  menuItems: {
    gap:              4,
    paddingHorizontal: 12,
  },
  menuItem: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingVertical:   13,
    paddingHorizontal: 12,
    borderRadius:      10,
    gap:               14,
  },
  menuItemActive: {
    backgroundColor: ACTIVE_BG,
  },
  menuIconPlaceholder: {
    width:           28,
    height:          28,
    borderRadius:    4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    flexShrink:      0,
  },
  menuIcon: {
    width:      28,
    height:     28,
    flexShrink: 0,
    tintColor:  '#FFFFFF',
  },
  menuLabel: {
    flex:       1,
    color:      INACTIVE_TEXT,
    fontSize:   14,
    fontWeight: '500',
    lineHeight: 20,
  },
  menuLabelActive: {
    color:      ACTIVE_TEXT,
    fontWeight: '700',
  },
  flex: {
    flex: 1,
  },
  logoutButton: {
    flexDirection:     'row',
    alignItems:        'center',
    marginHorizontal:  12,
    paddingVertical:   13,
    paddingHorizontal: 12,
    borderRadius:      10,
    backgroundColor:   'rgba(255,255,255,0.12)',
    gap:               14,
  },
  logoutIcon: {
    backgroundColor: 'rgba(255,100,100,0.5)',
  },
  logoutText: {
    color:      '#FFFFFF',
    fontSize:   14,
    fontWeight: '600',
  },
});

export default AppDrawer;