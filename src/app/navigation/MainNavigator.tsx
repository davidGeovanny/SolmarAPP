import React, { useState, useCallback } from 'react';
import { View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppDrawer, { type DrawerRoute } from '@/shared/components/layout/AppDrawer';
import TopBar from '@/shared/components/layout/TopBar';
import { DrawerProvider } from '@/shared/components/layout/DrawerContext';

// Pantallas
import HomeScreen               from '@/features/home/screens/HomeScreen';
import RecepcionDistribucionScreen  from '@/features/recepcion-distribucion/screens/RecepcionDistribucionScreen';
import RecepcionDistribucionDetalle from '@/features/recepcion-distribucion/screens/RecepcionDistribucionDetalle';
import RecepcionDistribucionForm    from '@/features/recepcion-distribucion/screens/RecepcionDistribucionForm';
import EntregaDirectaScreen     from '@/features/entrega-directa/screens/EntregaDirectaScreen';
import EntregaDirectaForm       from '@/features/entrega-directa/screens/EntregaDirectaForm';
import EntregaMercanciaScreen   from '@/features/entrega-mercancia/screens/EntregaMercanciaScreen';
import EntregaMercanciaForm     from '@/features/entrega-mercancia/screens/EntregaMercanciaForm';
import ConsignacionDirectaScreen from '@/features/consignacion-directa/screens/ConsignacionDirectaScreen';
import ConsignacionDirectaForm   from '@/features/consignacion-directa/screens/ConsignacionDirectaForm';

import type { DistribucionItem } from '@/features/recepcion-distribucion/types';

// ─── Param lists ──────────────────────────────────────────────────────────────

type HomeStack            = { Home: undefined };
type RecepDistStack       = {
  RecepcionDistribucion:        undefined;
  RecepcionDistribucionDetalle: { item: DistribucionItem };
  RecepcionDistribucionForm:    undefined;
};
type EntregaDirStack      = { EntregaDirecta: undefined; EntregaDirectaForm: undefined };
type EntregaMercStack     = { EntregaMercancia: undefined; EntregaMercanciaForm: undefined };
type ConsignacionStack    = { ConsignacionDirecta: undefined; ConsignacionDirectaForm: undefined };

// ─── Stacks individuales ──────────────────────────────────────────────────────

const HomeStack         = createNativeStackNavigator<HomeStack>();
const RecepDistStack    = createNativeStackNavigator<RecepDistStack>();
const EntregaDirStack   = createNativeStackNavigator<EntregaDirStack>();
const EntregaMercStack  = createNativeStackNavigator<EntregaMercStack>();
const ConsignStack      = createNativeStackNavigator<ConsignacionStack>();

// Opciones comunes para formularios:
// unmountOnBlur:  true  → se destruye al salir
// gestureEnabled: false → no se puede deslizar para volver (fuerza usar botón)
const FORM_OPTIONS = {
  headerShown:    false,
  unmountOnBlur:  true,
  gestureEnabled: false,
  animation:      'slide_from_right',
} as const;

const HomeSt = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false, animation: 'none' }}>
    <HomeStack.Screen name="Home" component={HomeScreen} />
  </HomeStack.Navigator>
);

const RecepDistSt = () => (
  <RecepDistStack.Navigator screenOptions={{ headerShown: false, animation: 'none' }}>
    <RecepDistStack.Screen name="RecepcionDistribucion"        component={RecepcionDistribucionScreen} />
    <RecepDistStack.Screen name="RecepcionDistribucionDetalle" component={RecepcionDistribucionDetalle} options={FORM_OPTIONS} />
    <RecepDistStack.Screen name="RecepcionDistribucionForm"    component={RecepcionDistribucionForm}    options={FORM_OPTIONS} />
  </RecepDistStack.Navigator>
);

const EntregaDirSt = () => (
  <EntregaDirStack.Navigator screenOptions={{ headerShown: false, animation: 'none' }}>
    <EntregaDirStack.Screen name="EntregaDirecta"     component={EntregaDirectaScreen} />
    <EntregaDirStack.Screen name="EntregaDirectaForm" component={EntregaDirectaForm} options={FORM_OPTIONS} />
  </EntregaDirStack.Navigator>
);

const EntregaMercSt = () => (
  <EntregaMercStack.Navigator screenOptions={{ headerShown: false, animation: 'none' }}>
    <EntregaMercStack.Screen name="EntregaMercancia"     component={EntregaMercanciaScreen} />
    <EntregaMercStack.Screen name="EntregaMercanciaForm" component={EntregaMercanciaForm} options={FORM_OPTIONS} />
  </EntregaMercStack.Navigator>
);

const ConsignSt = () => (
  <ConsignStack.Navigator screenOptions={{ headerShown: false, animation: 'none' }}>
    <ConsignStack.Screen name="ConsignacionDirecta"     component={ConsignacionDirectaScreen} />
    <ConsignStack.Screen name="ConsignacionDirectaForm" component={ConsignacionDirectaForm} options={FORM_OPTIONS} />
  </ConsignStack.Navigator>
);

// ─── Componente de contenido según ruta activa ────────────────────────────────

const RouteContent = ({ route }: { route: DrawerRoute }) => {
  switch (route) {
    case 'Home':                  return <HomeSt />;
    case 'RecepcionDistribucion': return <RecepDistSt />;
    case 'EntregaDirecta':        return <EntregaDirSt />;
    case 'EntregaMercancia':      return <EntregaMercSt />;
    case 'ConsignacionDirecta':   return <ConsignSt />;
  }
};

// ─── MainNavigator ────────────────────────────────────────────────────────────

const MainNavigator = () => {
  const [isDrawerOpen,  setIsDrawerOpen]  = useState(false);
  const [activeRoute,   setActiveRoute]   = useState<DrawerRoute>('Home');

  const openDrawer  = useCallback(() => setIsDrawerOpen(true),  []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setIsDrawerOpen(v => !v), []);

  const handleNavigate = useCallback((route: DrawerRoute) => {
    setActiveRoute(route);
  }, []);

  return (
    <DrawerProvider onOpen={openDrawer} onClose={closeDrawer} onToggle={toggleDrawer}>
      <AppDrawer
        isOpen={isDrawerOpen}
        activeRoute={activeRoute}
        onNavigate={handleNavigate}
        onClose={closeDrawer}
        onOpen={openDrawer}
      >
        <View style={{ flex: 1 }}>
          <TopBar />
          <RouteContent route={activeRoute} />
        </View>
      </AppDrawer>
    </DrawerProvider>
  );
};

export default MainNavigator;