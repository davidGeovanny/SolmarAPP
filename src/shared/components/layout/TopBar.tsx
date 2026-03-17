import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ComboBox from '@/shared/components/ui/ComboBox';
import { useDrawer } from '@/shared/components/layout/DrawerContext';
import { useTopBarSession } from '@/shared/components/layout/useTopBarSession';
import useAuthStore from '@/features/auth/store/authStore';
import type { Empresa, Sucursal } from '@/features/auth/hooks/useCompanySelect';

import IcMenu        from '@/assets/icons/ui/menu.png';
import IcEmpresa  from '@/assets/icons/menu/empresa.png';
import IcSucursal from '@/assets/icons/menu/entrega_directa.png';

const TOPBAR_BG   = '#1A73E8';
const STATUS_H    = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;

const EMPRESA_FIELDS = {
  valueKey: 'ID_Empresa'     as keyof Empresa,
  labelKey: 'Descripcion' as keyof Empresa,
};

const SUCURSAL_FIELDS = {
  valueKey: 'ID_EmpresaSucursal'     as keyof Sucursal,
  labelKey: 'NombreEmpresaSucursal' as keyof Sucursal,
  subtitleKey: 'NombreAlmacen'       as keyof Sucursal,
};

const TopBar: React.FC = () => {
  const insets        = useSafeAreaInsets();
  const { toggleDrawer } = useDrawer();
  const {
    empresas,
    sucursales,
    empresaSelected,
    sucursalSelected,
    loadingEmpresas,
    loadingSucursales,
    handleEmpresaChange,
    handleSucursalChange,
    fetchEmpresas,
    refreshSucursales,
  } = useTopBarSession();

  const topPadding = Platform.OS === 'ios' ? insets.top : STATUS_H;

  const nombreUsuario = useAuthStore(s => s.nombreUsuario);

  return (
    <View style={[styles.container, { paddingTop: topPadding + 8 }]}>
      <View style={styles.row}>

        {/* Botón hamburguesa */}
        <TouchableOpacity
          onPress={toggleDrawer}
          style={styles.menuButton}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Image source={IcMenu} style={{ width: 22, height: 22, tintColor: '#FFFFFF' }} resizeMode='contain' />
          {/* <IcMenu width={22} height={22} color="#FFFFFF" /> */}
          {/* <View style={styles.hamburger}>
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
          </View> */}
        </TouchableOpacity>

        {/* Nombre de usuario */}
        <Text style={styles.userName} numberOfLines={2}>
          {nombreUsuario ?? ''}
        </Text>

        {/* Combos empresa / sucursal */}
        <View style={styles.combosContainer}>

          {/* Empresa */}
          <View style={styles.comboRow}>
            <Image source={IcEmpresa} style={styles.comboIcon} />
            <ComboBox<Empresa>
              data={empresas}
              isLoading={loadingEmpresas}
              onRefresh={fetchEmpresas}
              fieldConfig={EMPRESA_FIELDS}
              value={empresaSelected}
              onChange={handleEmpresaChange}
              placeholder="Empresa"
              mode="select"
              clearable={false}
              direction="bottom"
              variant='transparent'
              useModal
            />
          </View>

          {/* Sucursal */}
          <View style={styles.comboRow}>
            <Image source={IcSucursal} style={styles.comboIcon} />
            <ComboBox<Sucursal>
              data={sucursales}
              isLoading={loadingSucursales}
              onRefresh={refreshSucursales}
              fieldConfig={SUCURSAL_FIELDS}
              value={sucursalSelected}
              onChange={handleSucursalChange}
              placeholder="Plaza - Sucursal"
              mode="select"
              clearable={false}
              direction="bottom"
              variant='transparent'
              useModal
            />
          </View>

        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor:  TOPBAR_BG,
    paddingHorizontal: 12,
    paddingBottom:     10,
    elevation:         4,
    shadowColor:       '#000',
    shadowOffset:      { width: 0, height: 2 },
    shadowOpacity:     0.2,
    shadowRadius:      4,
    zIndex:            5,
  },
  row: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           8,
  },
  menuButton: {
    padding: 4,
    flexShrink: 0,
  },
  hamburger: {
    gap:   4,
    width: 22,
  },
  hamburgerLine: {
    height:          2,
    backgroundColor: '#FFFFFF',
    borderRadius:    1,
  },
  userName: {
    flexShrink: 1,        // puede encogerse si falta espacio
    maxWidth:   130,      // nunca ocupa más de 130px
    color:      '#FFFFFF',
    fontSize:   14,
    fontWeight: '500',
    lineHeight: 19,
  },
  combosContainer: {
    flex:    1,           // ocupa el espacio restante después del hamburger y nombre
    maxWidth: 200,        // tope para pantallas grandes
    gap:     2,
  },
  comboRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           4,
    alignSelf:     'stretch', // ocupa el ancho del combosContainer
  },
  comboIconPlaceholder: {
    width:           18,
    height:          18,
    borderRadius:    3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    flexShrink:      0,
  },
  comboIcon: {
    width:      18,
    height:     18,
    tintColor:  'rgba(255,255,255,0.85)',
    flexShrink: 0,
    resizeMode: 'contain',
  },
});

export default TopBar;