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
import { MESES } from '@/features/recepcion-distribucion/types';
import type { ListadoFiltrosProps, FolioOpcion } from './ListadoFiltros.types';

import IcFiltro   from '@/assets/icons/ui/filter.svg';
import IcExportar from '@/assets/icons/ui/download.svg';

const MES_FIELDS   = { valueKey: 'id'     as const, labelKey: 'nombre' as const };
const FOLIO_FIELDS = { valueKey: 'id'     as const, labelKey: 'nombre' as const };

const ListadoFiltros: React.FC<ListadoFiltrosProps> = ({
  anio,
  mes,
  estatus,
  folioTipo,
  folioValor,
  folioOpciones,
  switchConfig,
  onEstatusChange,
  onAnioChange,
  onMesChange,
  onFolioTipoChange,
  onFolioValorChange,
  onAplicar,
  onExportar,
}) => {
  const [expandido, setExpandido] = useState(false);

  const esPendientes     = estatus === 'Pendientes';
  const tieneSwitch      = !!switchConfig;

  // Cuando está en Pendientes y hay más de una opción, solo mostrar la primera
  const folioOpcionesActivas: FolioOpcion[] = tieneSwitch && esPendientes && folioOpciones.length > 1
    ? [folioOpciones[0]]
    : folioOpciones;

  const comboBloqueado = tieneSwitch && esPendientes && folioOpciones.length > 1;

  return (
    <View style={styles.container}>

      {/* ── Fila 1: Switch (solo si switchConfig está definido) ── */}
      {tieneSwitch && (
        <View style={styles.filaSwitchRow}>
          <Text style={[styles.switchLabel, esPendientes && styles.switchLabelActive]}>
            {switchConfig!.labelIzquierda}
          </Text>
          <Switch
            value={!esPendientes}
            onValueChange={v => onEstatusChange(v ? 'Recibidas' : 'Pendientes')}
            trackColor={{ false: '#94A3B8', true: '#94A3B8' }}
            thumbColor="#22C55E"
          />
          <Text style={[styles.switchLabel, !esPendientes && styles.switchLabelActive]}>
            {switchConfig!.labelDerecha}
          </Text>
        </View>
      )}

      {/* ── Fila 2: Año + Mes + Botones ── */}
      <View style={styles.filaFiltros}>

        <TextInput
          style={styles.anioInput}
          value={anio}
          onChangeText={onAnioChange}
          keyboardType="numeric"
          maxLength={4}
          placeholder="Año"
          placeholderTextColor="#94A3B8"
          returnKeyType="done"
          multiline={false}
          onSubmitEditing={onAplicar}
        />

        <View style={[styles.comboOutline, { flex: 1 }]}>
          <ComboBox
            data={MESES}
            isLoading={false}
            fieldConfig={MES_FIELDS}
            value={mes}
            onChange={onMesChange}
            placeholder="Mes"
            mode="select"
            clearable={false}
            direction="bottom"
            variant="outline"
          />
        </View>

        <TouchableOpacity
          style={[styles.iconBtn, expandido && styles.iconBtnActive]}
          onPress={() => setExpandido(e => !e)}
          activeOpacity={0.7}
        >
          <IcFiltro width={18} height={18} color={expandido ? '#3B82F6' : '#64748B'} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconBtn}
          onPress={onExportar}
          activeOpacity={0.7}
        >
          <IcExportar width={22} height={22} color="#1C57B5" />
        </TouchableOpacity>

      </View>

      {/* ── Fila 3 (expandible): Tipo folio + Input folio ── */}
      {expandido && (
        <View style={styles.filaExpandida}>

          <View style={[styles.comboOutline, { flex: 1.2, opacity: comboBloqueado ? 0.6 : 1 }]}>
            <ComboBox
              data={folioOpcionesActivas}
              isLoading={false}
              fieldConfig={FOLIO_FIELDS}
              value={folioTipo}
              onChange={comboBloqueado ? () => {} : onFolioTipoChange}
              placeholder="Tipo de folio"
              mode="select"
              clearable={false}
              direction="bottom"
              variant="outline"
            />
          </View>

          <TextInput
            style={styles.folioInput}
            value={folioValor}
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
  },
  filaSwitchRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'flex-end',
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

export default ListadoFiltros;