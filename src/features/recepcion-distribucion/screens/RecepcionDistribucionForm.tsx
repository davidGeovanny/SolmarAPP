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
import ProductoFormRow from '../components/ProductoFormRow';
import EditarCantidadModal, { type EditarCantidadItem } from '@/shared/components/ui/EditarCantidadModal';
import { useRecepcionForm, FILTRO_CAMPO_OPCIONES } from '../hooks/useRecepcionForm';
import { useSerieFolio } from '@/shared/hooks/useSerieFolio';
import Paginador from '@/shared/components/ui/Paginador';
import toast from '@/shared/utils/toast';
import type { DistribucionItem, ProductoDistribucion } from '../types';
import type { SerieOption } from '@/shared/hooks/useSerieFolio';

import IcSearch from '@/assets/icons/ui/search.svg';

type StackParams = {
  RecepcionDistribucion:     undefined;
  RecepcionDistribucionForm: { item: DistribucionItem };
};

const SERIE_FIELDS = {
  valueKey: 'ID_ConfiguracionSerie' as keyof SerieOption,
  labelKey: 'Serie'                 as keyof SerieOption,
};

const FILTRO_FIELDS = {
  valueKey: 'id'     as const,
  labelKey: 'nombre' as const,
};

const RecepcionDistribucionForm = () => {
  const navigation = useNavigation<NativeStackNavigationProp<StackParams>>();
  const route      = useRoute<RouteProp<StackParams, 'RecepcionDistribucionForm'>>();
  const { item }   = route.params!;

  const {
    productos,
    isLoading,
    filtroCampo,
    filtroTexto,
    soloPendientes,
    hayProductosCapturados,
    cargarProductos,
    confirmarProducto,
    updateProducto,
    handleFiltroCampoChange,
    handleFiltroTextoChange,
    setSoloPendientes,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
  } = useRecepcionForm(Number(item.ID_OrdenDistribucion));

  const {
    series,
    serieSelected,
    folio,
    loadingSeries,
    loadingFolio,
    handleSerieChange,
  } = useSerieFolio('RDIST');

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [modalVisible,    setModalVisible]    = React.useState(false);
  const [productoEditar,  setProductoEditar]  = React.useState<EditarCantidadItem | null>(null);

  useEffect(() => {
    cargarProductos();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filtro con debounce
  const handleTextoChange = (texto: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      handleFiltroTextoChange(texto);
    }, 300);
  };

  const handleEditar = (producto: ProductoDistribucion) => {
    setProductoEditar(producto);
    setModalVisible(true);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setProductoEditar(null);
  };

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
          style: 'default',
          onPress: () => {
            // TODO: implementar guardado
            toast.info({ title: 'Guardado de prueba', message: 'La recepción será guardada aquí' });
          },
        },
      ],
    );
  };

  return (
    <View style={styles.root}>
      <ScreenHeader
        title="Nueva Recepción"
        onBack={() => navigation.goBack()}
      />

      {/* ── Sección 1: Datos de la distribución ─────────────────────── */}
      <View style={styles.seccionDatos}>
        <View style={styles.datosRow}>
          <View style={styles.datoDato}>
            <Text style={styles.datoLabel}>Folio</Text>
            <Text style={styles.datoValor}>{item.Folio}</Text>
          </View>
          <View style={styles.datoSeparador} />
          <View style={styles.datoDato}>
            <Text style={styles.datoLabel}>Fecha</Text>
            <Text style={styles.datoValor}>{item.Fecha}</Text>
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
      </View>

      {/* ── Sección 2: Serie y Folio ─────────────────────────────────── */}
      <View style={styles.seccionSerie}>
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
            direction="bottom"
            variant="outline"
            iconColor="#64748B"
          />
        </View>
        <View style={styles.folioContainer}>
          <Text style={styles.folioLabel}>Folio Recepción: </Text>
          {loadingFolio ? (
            <ActivityIndicator size="small" color="#1C57B5" />
          ) : (
            <Text style={styles.folioValor}>{folio || '—'}</Text>
          )}
        </View>
      </View>

      {/* ── Sección 3: Filtros de búsqueda ───────────────────────────── */}
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
            direction="bottom"
            variant="outline"
            iconColor="#64748B"
          />
        </View>
        <View style={styles.inputBusqueda}>
          <TextInput
            style={styles.inputText}
            placeholder={`Ej. ${filtroCampo.id === 'CodigoProducto' ? '100010001' : 'Azúcar'}`}
            placeholderTextColor="#94A3B8"
            onChangeText={handleTextoChange}
            returnKeyType="search"
            multiline={false}
          />
          <IcSearch width={18} height={18} color="#64748B" />
        </View>
      </View>

      {/* ── Encabezado del grid ───────────────────────────────────────── */}
      <View style={styles.tableHeader}>
        <Text style={[styles.colHeader, { width: 72 }]}>Código</Text>
        <Text style={[styles.colHeader, { flex: 1 }]}>Producto</Text>
        <Text style={[styles.colHeader, { width: 50, textAlign: 'right' }]}>Dist.</Text>
        <Text style={[styles.colHeader, { width: 70, textAlign: 'center' }]}>Recibido</Text>
      </View>

      {/* ── Grid de productos ─────────────────────────────────────────── */}
      <View style={styles.listContainer}>
        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#1C57B5" />
          </View>
        ) : (
          <FlashList
            data={productos}
            keyExtractor={p => p.ID_Producto}
            renderItem={({ item: producto, index }) => (
              <ProductoFormRow
                producto={producto}
                index={index}
                onConfirmar={confirmarProducto}
                onEditar={handleEditar}
              />
            )}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.centered}>
                <Text style={styles.emptyText}>Sin productos</Text>
              </View>
            }
          />
        )}
      <Paginador
          currentPage={currentPage}
          totalPages={totalPages}
          onPrev={prevPage}
          onNext={nextPage}
          onGoToPage={goToPage}
        />
      </View>

      {/* ── Botón flotante Confirmar ─────────────────────────────────── */}
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

const styles = StyleSheet.create({
  root: {
    flex:            1,
    backgroundColor: '#F8FAFC',
  },

  // ── Sección datos distribución ──────────────────────────────────────────
  seccionDatos: {
    backgroundColor:   '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical:   10,
  },
  datosRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           8,
  },
  datoDato: {
    flex: 1,
  },
  datoLabel: {
    fontSize:   11,
    color:      '#94A3B8',
    fontWeight: '500',
  },
  datoValor: {
    fontSize:   12,
    color:      '#1E293B',
    fontWeight: '700',
  },
  datoSeparador: {
    width:           1,
    height:          36,
    backgroundColor: '#E2E8F0',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           4,
    flexShrink:    0,
  },
  switchLabel: {
    fontSize:   11,
    color:      '#64748B',
    fontWeight: '500',
  },

  // ── Sección serie y folio ───────────────────────────────────────────────
  seccionSerie: {
    flexDirection:     'row',
    alignItems:        'center',
    backgroundColor:   '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical:   8,
    gap:               12,
  },
  folioContainer: {
    flex:          1,
    flexDirection: 'row',
    alignItems:    'center',
    gap:           4,
  },
  folioLabel: {
    fontSize:   13,
    color:      '#64748B',
  },
  folioValor: {
    fontSize:   13,
    color:      '#1E293B',
    fontWeight: '700',
    fontStyle:  'italic',
  },

  // ── Sección filtros ────────────────────────────────────────────────────
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
    flex:              1,
    height:            40,
    flexDirection:     'row',
    alignItems:        'center',
    borderWidth:       1,
    borderColor:       '#CBD5E1',
    borderRadius:      6,
    paddingHorizontal: 10,
    backgroundColor:   '#FFFFFF',
    gap:               6,
  },
  inputText: {
    flex:      1,
    fontSize:  13,
    color:     '#1E293B',
    padding:   0,
    height:    '100%',
  },

  // ── Tabla ─────────────────────────────────────────────────────────────
  tableHeader: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: 12,
    paddingVertical:   8,
    backgroundColor:   '#FFFFFF',
    borderBottomWidth: 2,
    borderBottomColor: '#E2E8F0',
    gap:               6,
  },
  colHeader: {
    fontSize:      11,
    fontWeight:    '600',
    color:         '#94A3B8',
    letterSpacing: 0.2,
  },
  listContainer: {
    flex: 1,
  },
  centered: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    paddingTop:     60,
  },
  emptyText: {
    fontSize: 15,
    color:    '#94A3B8',
  },

  // ── Botón flotante ────────────────────────────────────────────────────
  btnConfirmarRecepcion: {
    position:          'absolute',
    bottom:            24,
    left:              32,
    right:             32,
    height:            52,
    borderRadius:      26,
    backgroundColor:   'rgba(28, 87, 181, 0.88)',
    alignItems:        'center',
    justifyContent:    'center',
    elevation:         6,
    shadowColor:       '#000',
    shadowOffset:      { width: 0, height: 3 },
    shadowOpacity:     0.2,
    shadowRadius:      6,
  },
  btnConfirmarText: {
    color:         '#FFFFFF',
    fontSize:      16,
    fontWeight:    '700',
    letterSpacing: 0.5,
  },
});

export default RecepcionDistribucionForm;