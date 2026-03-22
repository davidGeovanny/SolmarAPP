import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  StyleSheet,
} from 'react-native';
import ComboBox from '@/shared/components/ui/ComboBox';
import { MESES, FOLIO_OPCIONES } from '../types';
import type { DistribucionFiltros, FolioTipoOption } from '../types';

// import IcFiltro   from '@/assets/icons/ui/ic_filtro.png';
import IcExportar from '@/assets/icons/ui/download.svg';

interface Props {
  filtros:            DistribucionFiltros;
  onEstatusChange:    (v: 'Pendientes' | 'Recibidas') => void;
  onAnioChange:       (v: string) => void;
  onMesChange:        (v: { id: number; nombre: string } | null) => void;
  onFolioTipoChange:  (v: FolioTipoOption | null) => void;
  onFolioValorChange: (v: string) => void;
  onAplicar:          () => void;
  onExportar:         () => void;
}

const MES_FIELDS    = { valueKey: 'id' as const, labelKey: 'nombre' as const };
const FOLIO_FIELDS  = { valueKey: 'id' as const, labelKey: 'nombre' as const };

const DistribucionFiltrosBar: React.FC<Props> = ({
  filtros,
  onEstatusChange,
  onAnioChange,
  onMesChange,
  onFolioTipoChange,
  onFolioValorChange,
  onAplicar,
  onExportar,
}) => {
  const [expandido, setExpandido] = useState(false);
  const esPendientes = filtros.estatus === 'Pendientes';

  // Pendientes: solo FolioDistribucion. Recibidas: ambas opciones
  const folioOpciones = esPendientes ? [FOLIO_OPCIONES[0]] : FOLIO_OPCIONES;

  return (
    <View style={styles.container}>

      {/* ── Fila 1: Switch Pendientes / Recibidas (alineado a la derecha) ── */}
      <View style={styles.filaSwitchRow}>
        <Text style={[styles.switchLabel, esPendientes && styles.switchLabelActive]}>
          Pendientes
        </Text>
        <Switch
          value={!esPendientes}
          onValueChange={v => onEstatusChange(v ? 'Recibidas' : 'Pendientes')}
          trackColor={{ false: '#94A3B8', true: '#94A3B8' }}
          thumbColor="#22C55E"
        />
        <Text style={[styles.switchLabel, !esPendientes && styles.switchLabelActive]}>
          Recibidas
        </Text>
      </View>

      {/* ── Fila 2: Año + Mes + Botones ── */}
      <View style={styles.filaFiltros}>

        {/* Año */}
        <TextInput
          style={styles.anioInput}
          value={filtros.anio}
          onChangeText={onAnioChange}
          keyboardType="numeric"
          maxLength={4}
          placeholder="Año"
          placeholderTextColor="#94A3B8"
          returnKeyType="done"
          multiline={false}
          onSubmitEditing={onAplicar}
        />

        {/* Mes */}
        <View style={[styles.comboOutline, { flex: 1 }]}>
          <ComboBox
            data={MESES}
            isLoading={false}
            fieldConfig={MES_FIELDS}
            value={filtros.mes}
            onChange={onMesChange}
            placeholder="Mes"
            mode="select"
            clearable={false}
            direction="bottom"
            variant="outline"
          />
        </View>

        {/* Botón expandir */}
        <TouchableOpacity
          style={[styles.iconBtn, expandido && styles.iconBtnActive]}
          onPress={() => setExpandido(e => !e)}
          activeOpacity={0.7}
        >
          {/* <Image source={IcFiltro} style={styles.iconImg} /> */}
          <Text style={[styles.iconText, expandido && styles.iconTextActive]}>⚙</Text>
        </TouchableOpacity>

        {/* Botón exportar */}
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={onExportar}
          activeOpacity={0.7}
        >
          <IcExportar width={22} height={22} color="#1C57B5" />
        </TouchableOpacity>

      </View>

      {/* ── Fila 3 (expandible): Tipo folio + Valor + Buscar ── */}
      {expandido && (
        <View style={styles.filaExpandida}>

          <View style={[styles.comboOutline, { flex: 1.2, opacity: esPendientes ? 0.6 : 1 }]}>
            <ComboBox
              data={folioOpciones}
              isLoading={false}
              fieldConfig={FOLIO_FIELDS}
              value={filtros.folioTipo}
              onChange={esPendientes ? () => {} : onFolioTipoChange}
              placeholder="Tipo de folio"
              mode="select"
              clearable={false}
              direction="bottom"
              variant="outline"
              excludeSelected
            />
          </View>

          <TextInput
            style={styles.folioInput}
            value={filtros.folioValor}
            onChangeText={onFolioValorChange}
            placeholder="Folio..."
            placeholderTextColor="#94A3B8"
            returnKeyType="search"
            multiline={false}
            onSubmitEditing={onAplicar}
          />

        </View>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor:   '#FFFFFF',
    paddingHorizontal: 12,
    paddingTop:        8,
    paddingBottom:     10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap:               8,
    // elevation: 11,
    // zIndex: 11,
  },

  // ── Fila 1: Switch ────────────────────────────────────────────────────
  filaSwitchRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'flex-end',  // alineado a la derecha
    gap:            6,
  },
  switchLabel: {
    fontSize:   13,
    color:      '#94A3B8',
    fontWeight: '500',
  },
  switchLabelActive: {
    color: '#1E293B',
  },

  // ── Fila 2: Año + Mes + Botones ───────────────────────────────────────
  filaFiltros: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           6,
  },
  anioInput: {
    width:             62,
    height:            40,
    borderWidth:       1,
    borderColor:       '#CBD5E1',
    borderRadius:      6,
    paddingHorizontal: 8,
    paddingVertical:   0,
    fontSize:          13,
    color:             '#1E293B',
    textAlign:         'center',
    flexShrink:        0,
  },
  comboOutline: {
    borderWidth:       1,
    borderColor:       '#CBD5E1',
    borderRadius:      6,
    height:            40,
    justifyContent:    'center',
    paddingHorizontal: 4,
    // Sin overflow:hidden — la lista desplegable debe poder salir del contenedor
  },
  iconBtn: {
    width:           40,
    height:          40,
    borderRadius:    6,
    borderWidth:     1,
    borderColor:     '#CBD5E1',
    alignItems:      'center',
    justifyContent:  'center',
    backgroundColor: '#F8FAFC',
    flexShrink:      0,
  },
  iconBtnActive: {
    backgroundColor: '#EFF6FF',
    borderColor:     '#3B82F6',
  },
  iconImg: {
    width:     18,
    height:    18,
    tintColor: '#64748B',
  },
  iconText: {
    fontSize: 16,
    color:    '#64748B',
  },
  iconTextActive: {
    color: '#3B82F6',
  },

  // ── Fila 3: Expandible ────────────────────────────────────────────────
  filaExpandida: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           6,
  },
  folioInput: {
    flex:              1,
    height:            40,
    borderWidth:       1,
    borderColor:       '#CBD5E1',
    borderRadius:      6,
    paddingHorizontal: 10,
    paddingVertical:   0,
    fontSize:          13,
    color:             '#1E293B',
  },
});

export default DistribucionFiltrosBar;