import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import ComboBox from '@/shared/components/ui/ComboBox';
import { useCompanySelect } from '../hooks/useCompanySelect';
import type { Empresa, Sucursal } from '../hooks/useCompanySelect';

import IcArrowRight from '@/assets/icons/ui/back.png';
import IcLogin from '@/assets/icons/ui/submit.png';

// ─── Configuración de campos para cada combo ──────────────────────────────────

const EMPRESA_FIELD_CONFIG = {
  valueKey: 'ID_Empresa'  as keyof Empresa,
  labelKey: 'Descripcion' as keyof Empresa,
};

const SUCURSAL_FIELD_CONFIG = {
  valueKey:    'ID_EmpresaSucursal'    as keyof Sucursal,
  labelKey:    'NombreEmpresaSucursal' as keyof Sucursal,
  subtitleKey: 'NombreAlmacen'         as keyof Sucursal,
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  onSuccess: () => void;
}

const PRIMARY_BLUE = '#1A73E8';

// ─── Componente ───────────────────────────────────────────────────────────────

const CompanySelectForm: React.FC<Props> = ({ onSuccess }) => {
  const {
    empresas,
    sucursales,
    empresaSelected,
    sucursalSelected,
    loadingEmpresas,
    loadingSucursales,
    isSubmitting,
    canSubmit,
    setEmpresaSelected,
    setSucursalSelected,
    fetchEmpresas,
    fetchSucursales,
    refreshSucursales,
    onSubmit,
  } = useCompanySelect();

  return (
    <View style={styles.container}>

      {/* Empresa */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Empresa</Text>
        <ComboBox<Empresa>
          data={empresas}
          isLoading={loadingEmpresas}
          onRefresh={fetchEmpresas}
          fieldConfig={EMPRESA_FIELD_CONFIG}
          value={empresaSelected}
          onChange={setEmpresaSelected}
          placeholder="Selecciona una empresa"
          mode="search"
          clearable
        />
      </View>

      {/* Plaza - Sucursal */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Plaza - Sucursal</Text>
        <ComboBox<Sucursal>
          data={sucursales}
          isLoading={loadingSucursales}
          onRefresh={refreshSucursales}
          fieldConfig={SUCURSAL_FIELD_CONFIG}
          value={sucursalSelected}
          onChange={setSucursalSelected}
          placeholder="Selecciona una sucursal"
          mode="search"
          clearable
        />
      </View>

      {/* Botón Ingresar */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          (!canSubmit || isSubmitting) && styles.submitButtonDisabled,
        ]}
        onPress={() => onSubmit(onSuccess)}
        disabled={!canSubmit || isSubmitting}
        activeOpacity={0.85}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text style={styles.submitText}>Ingresar</Text>
            <Image source={IcLogin} style={styles.submitArrow} resizeMode="contain" />
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
    fontSize:      14,
    color:         'rgba(255,255,255,0.9)',
    marginBottom:  8,
    fontWeight:    '400',
    letterSpacing: 0.3,
  },
  submitButton: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY_BLUE,
    borderRadius:   28,
    height:         54,
    marginTop:      24,
    gap:            10,
    shadowColor:    PRIMARY_BLUE,
    shadowOffset:   { width: 0, height: 6 },
    shadowOpacity:  0.45,
    shadowRadius:   12,
    elevation:      8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitText: {
    color:         '#FFFFFF',
    fontSize:      17,
    fontWeight:    '600',
    letterSpacing: 0.5,
  },
  submitArrow: {
    width: 20,
    height: 20,
    position: 'absolute',
    right: 20,
  },
});

export default CompanySelectForm;