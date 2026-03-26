import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ScreenHeader from '@/shared/components/layout/ScreenHeader';
import ComboBox from '@/shared/components/ui/ComboBox';
import Paginador from '@/shared/components/ui/Paginador';
import EditarCantidadModal, { type EditarCantidadItem } from '@/shared/components/ui/EditarCantidadModal';
import EntregaDirectaFormRow from '../components/EntregaDirectaFormRow';
import { useEntregaDirectaForm, FILTRO_CAMPO_OPCIONES } from '../hooks/useEntregaDirectaForm';
import { useSerieFolio } from '@/shared/hooks/useSerieFolio';
import toast from '@/shared/utils/toast';
import type { EntregaDirectaItem, EntregaDirectaProductoForm } from '../types';
import type { SerieOption } from '@/shared/hooks/useSerieFolio';

import IcSearch from '@/assets/icons/ui/search.svg';

type StackParams = {
  EntregaDirecta:        undefined;
  EntregaDirectaDetalle: { item: EntregaDirectaItem };
  EntregaDirectaForm:    { item: EntregaDirectaItem };
};

const SERIE_FIELDS  = { valueKey: 'ID_ConfiguracionSerie' as keyof SerieOption, labelKey: 'Serie' as keyof SerieOption };
const FILTRO_FIELDS = { valueKey: 'id' as const, labelKey: 'nombre' as const };

const EntregaDirectaForm = () => {
  const navigation = useNavigation<NativeStackNavigationProp<StackParams>>();
  const route      = useRoute<RouteProp<StackParams, 'EntregaDirectaForm'>>();
  const { item }   = route.params;

  const {
    productos, isLoading,
    filtroCampo, filtroTexto, soloPendientes,
    hayProductosCapturados,
    currentPage, totalPages,
    cargarProductos, updateProducto, confirmarProducto,
    handleFiltroCampoChange, handleFiltroTextoChange,
    setSoloPendientes, goToPage, nextPage, prevPage,
  } = useEntregaDirectaForm(Number(item.ID_OrdenCompra));

  const {
    series, serieSelected, folio,
    loadingSeries, loadingFolio, handleSerieChange,
  } = useSerieFolio('RED');

  // Inputs de remisión
  const [remisionSerie, setRemisionSerie] = useState('');
  const [remisionFolio, setRemisionFolio] = useState('');

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [modalVisible,   setModalVisible]   = React.useState(false);
  const [productoEditar, setProductoEditar] = React.useState<EditarCantidadItem | null>(null);

  useEffect(() => { cargarProductos(); }, []);

  const handleTextoChange = (texto: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => handleFiltroTextoChange(texto), 300);
  };

  const handleEditar = (producto: EntregaDirectaProductoForm) => {
    setProductoEditar(producto);
    setModalVisible(true);
  };

  const handleModalCancel = () => { setModalVisible(false); setProductoEditar(null); };

  const handleModalApply = (idProducto: string, cantidad: string, observaciones: string) => {
    updateProducto(idProducto, { CantidadRecibir: cantidad, Observaciones: observaciones });
    setModalVisible(false);
    setProductoEditar(null);
  };

  const handleConfirmarRecepcion = () => {
    Alert.alert(
      'Confirmar Recepción',
      '¿Deseas guardar la recepción con los productos capturados?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => toast.info({ title: 'Guardado de prueba', message: 'La recepción será guardada aquí' }),
        },
      ],
    );
  };

  // Separar fecha y hora
  const splitFecha = (f: string) => {
    const p = f.trim().split(' ');
    return { fecha: p[0] ?? '', hora: p.slice(1).join(' ') };
  };
  const { fecha, hora } = splitFecha(item.FechaCompleta);

  return (
    <View style={styles.root}>
      <ScreenHeader title="Nueva Recepción" onBack={() => navigation.goBack()} />

      {/* ── Sección 1: Datos de la orden ─────────────────────────────── */}
      <View style={styles.seccionDatos}>
        <View style={styles.datosTopRow}>
          <View style={styles.datoBloque}>
            <Text style={styles.datoLabel}>Folio</Text>
            <Text style={styles.datoValor}>{item.FolioOrdenCompra}</Text>
          </View>
          <View style={styles.datoSeparador} />
          <View style={styles.datoBloque}>
            <Text style={styles.datoLabel}>Fecha O.C.</Text>
            <Text style={styles.datoValor}>{fecha}</Text>
            <Text style={styles.datoSubValor}>{hora}</Text>
          </View>
          <View style={styles.datoSeparador} />
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Pendientes</Text>
            <Switch
              value={!soloPendientes}
              onValueChange={v => setSoloPendientes(!v)}
              trackColor={{ false: '#94A3B8', true: '#94A3B8' }}
              thumbColor={soloPendientes ? '#F59E0B' : '#22C55E'}
            />
            <Text style={styles.switchLabel}>Todos</Text>
          </View>
        </View>

        {/* Proveedor */}
        <Text style={styles.proveedorText}>
          <Text style={styles.datoLabel}>Proveedor: </Text>
          <Text style={styles.proveedorValor}>{item.NombreProveedor}</Text>
        </Text>
        {item.NombreProveedorSucursal !== item.NombreProveedor && (
          <Text style={styles.proveedorSucursal}>({item.NombreProveedorSucursal})</Text>
        )}
      </View>

      {/* ── Sección 2: Remisión ───────────────────────────────────────── */}
      <View style={styles.seccionRemision}>
        <Text style={styles.seccionTitulo}>── Remisión</Text>
        <View style={styles.remisionRow}>
          <TextInput
            style={styles.remisionInputSerie}
            value={remisionSerie}
            onChangeText={setRemisionSerie}
            placeholder="Serie remisión"
            placeholderTextColor="#94A3B8"
            autoCapitalize="characters"
            returnKeyType="next"
            multiline={false}
          />
          <TextInput
            style={[styles.remisionInputFolio, { flex: 1 }]}
            value={remisionFolio}
            onChangeText={t => setRemisionFolio(t.replace(/[^0-9]/g, ''))}
            placeholder="Folio remisión"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
            returnKeyType="done"
            multiline={false}
          />
        </View>
      </View>

      {/* ── Sección 3: Recepción — Serie y Folio ─────────────────────── */}
      <View style={styles.seccionSerie}>
        <Text style={styles.seccionTitulo}>── Recepción</Text>
        <View style={styles.serieRow}>
          <View style={styles.comboOutline}>
            <ComboBox<SerieOption>
              data={series}
              isLoading={loadingSeries}
              fieldConfig={SERIE_FIELDS}
              value={serieSelected}
              onChange={handleSerieChange}
              placeholder="Sin Serie"
              mode="select"
              clearable={false}
              variant="outline"
              iconColor="#64748B"
            />
          </View>
          <View style={styles.folioContainer}>
            <Text style={styles.folioLabel}>Folio Recepción Entrega Directa: </Text>
            {loadingFolio
              ? <ActivityIndicator size="small" color="#1C57B5" />
              : <Text style={styles.folioValor}>{folio || '—'}</Text>
            }
          </View>
        </View>
      </View>

      {/* ── Sección 4: Filtros ────────────────────────────────────────── */}
      <View style={styles.seccionFiltros}>
        <View style={styles.comboOutline}>
          <ComboBox
            data={FILTRO_CAMPO_OPCIONES}
            isLoading={false}
            fieldConfig={FILTRO_FIELDS}
            value={filtroCampo}
            onChange={handleFiltroCampoChange}
            placeholder="Código"
            mode="select"
            clearable={false}
            variant="outline"
            iconColor="#64748B"
          />
        </View>
        <View style={styles.inputBusqueda}>
          <TextInput
            style={styles.inputText}
            placeholder={filtroCampo.id === 'CodigoProducto' ? 'Ej. 100010001' : 'Ej. Azúcar'}
            placeholderTextColor="#94A3B8"
            onChangeText={handleTextoChange}
            returnKeyType="search"
            multiline={false}
          />
          <IcSearch width={18} height={18} color="#64748B" />
        </View>
      </View>

      {/* ── Grid ─────────────────────────────────────────────────────── */}
      <View style={styles.listContainer}>
        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#1C57B5" />
          </View>
        ) : (
          <FlashList
            data={productos}
            keyExtractor={p => p.ID_OrdenCompraDetalle}
            renderItem={({ item: producto, index }) => (
              <EntregaDirectaFormRow
                producto={producto}
                index={index}
                onConfirmar={confirmarProducto}
                onEditar={handleEditar}
                onCostoChange={(id, costo) => updateProducto(id, { CostoUnitario: costo })}
              />
            )}
            ListHeaderComponent={() => (
              <View style={styles.tableHeader}>
                <Text style={[styles.colHeader, { width: 68 }]}>Código</Text>
                <Text style={[styles.colHeader, { flex: 1 }]}>Producto</Text>
                <Text style={[styles.colHeader, { width: 72, textAlign: 'right' }]}>C/U</Text>
                <Text style={[styles.colHeader, { width: 44, textAlign: 'right' }]}>C. OC</Text>
                <Text style={[styles.colHeader, { width: 70, textAlign: 'center' }]}>Recibido</Text>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.centered}>
                <Text style={styles.emptyText}>Sin productos</Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <Paginador
        currentPage={currentPage}
        totalPages={totalPages}
        onPrev={prevPage}
        onNext={nextPage}
        onGoToPage={goToPage}
      />

      <EditarCantidadModal
        producto={productoEditar}
        visible={modalVisible}
        onCancel={handleModalCancel}
        onApply={handleModalApply}
      />

      {hayProductosCapturados && (
        <TouchableOpacity
          style={styles.btnConfirmarRecepcion}
          onPress={handleConfirmarRecepcion}
          activeOpacity={0.85}
        >
          <Text style={styles.btnConfirmarText}>✓  Confirmar</Text>
        </TouchableOpacity>
      )}

    </View>
  );
};

// useState necesita importarse explícitamente
const { useState } = React;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },

  // ── Datos ────────────────────────────────────────────────────────────
  seccionDatos: {
    backgroundColor:   '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical:   10,
    gap:               4,
  },
  datosTopRow: { flexDirection: 'row', alignItems: 'stretch', gap: 8 },
  datoBloque:  { flex: 1, gap: 2, justifyContent: 'center' },
  datoLabel:   { fontSize: 11, color: '#94A3B8', fontWeight: '500' },
  datoValor:   { fontSize: 12, color: '#1E293B', fontWeight: '700' },
  datoSubValor: { fontSize: 11, color: '#64748B' },
  datoSeparador: { width: 1, alignSelf: 'stretch', backgroundColor: '#E2E8F0' },
  switchContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 0, justifyContent: 'center' },
  switchLabel: { fontSize: 11, color: '#64748B', fontWeight: '500' },
  proveedorText:   { fontSize: 12, color: '#64748B' },
  proveedorValor:  { color: '#1E293B', fontWeight: '700' },
  proveedorSucursal: { fontSize: 11, color: '#94A3B8', fontStyle: 'italic' },

  // ── Remisión ─────────────────────────────────────────────────────────
  seccionRemision: {
    backgroundColor:   '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical:   8,
    gap:               6,
  },
  seccionTitulo: { fontSize: 11, color: '#94A3B8', fontStyle: 'italic' },
  remisionRow:   { flexDirection: 'row', gap: 8 },
  remisionInputSerie: {
    width:             120,
    height:            40,
    borderWidth:       1,
    borderColor:       '#CBD5E1',
    borderRadius:      6,
    paddingHorizontal: 10,
    paddingVertical:   0,
    fontSize:          13,
    color:             '#1E293B',
    textAlign:         'center',
  },
  remisionInputFolio: {
    height:            40,
    borderWidth:       1,
    borderColor:       '#CBD5E1',
    borderRadius:      6,
    paddingHorizontal: 10,
    paddingVertical:   0,
    fontSize:          13,
    color:             '#1E293B',
  },

  // ── Serie / Folio ─────────────────────────────────────────────────────
  seccionSerie: {
    backgroundColor:   '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical:   8,
    gap:               6,
  },
  serieRow:     { flexDirection: 'row', alignItems: 'center', gap: 12 },
  folioContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 },
  folioLabel:   { fontSize: 12, color: '#64748B' },
  folioValor:   { fontSize: 12, color: '#1E293B', fontWeight: '700', fontStyle: 'italic' },

  // ── Filtros ───────────────────────────────────────────────────────────
  seccionFiltros: {
    flexDirection:     'row',
    alignItems:        'center',
    backgroundColor:   '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical:   8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap:               8,
  },
  comboOutline: {
    borderWidth:       1,
    borderColor:       '#CBD5E1',
    borderRadius:      6,
    height:            40,
    justifyContent:    'center',
    paddingHorizontal: 4,
    width:             120,
  },
  inputBusqueda: {
    flex: 1, height: 40,
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 6,
    paddingHorizontal: 10, backgroundColor: '#FFFFFF', gap: 6,
  },
  inputText: { flex: 1, fontSize: 13, color: '#1E293B', padding: 0, height: '100%' },

  // ── Tabla ─────────────────────────────────────────────────────────────
  tableHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 2, borderBottomColor: '#E2E8F0', gap: 6,
  },
  colHeader: { fontSize: 11, fontWeight: '600', color: '#94A3B8', letterSpacing: 0.2 },
  listContainer: { flex: 1 },
  centered:      { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyText:     { fontSize: 15, color: '#94A3B8' },

  // ── Botón flotante ────────────────────────────────────────────────────
  btnConfirmarRecepcion: {
    position: 'absolute', bottom: 24, left: 32, right: 32,
    height: 52, borderRadius: 26,
    backgroundColor: 'rgba(28, 87, 181, 0.88)',
    alignItems: 'center', justifyContent: 'center',
    elevation: 6,
  },
  btnConfirmarText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
});

export default EntregaDirectaForm;