import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ScreenHeader from '@/shared/components/layout/ScreenHeader';
import { useEntregaDirectaDetalle } from '../hooks/useEntregaDirectaDetalle';
import { usePdfReporte } from '@/shared/hooks/usePdfReporte';
import { TIPO_REPORTE } from '@/shared/services/reporteService';
import type { EntregaDirectaItem, EntregaDirectaProducto } from '../types';

import IcDownload from '@/assets/icons/ui/download.svg';

type StackParams = {
  EntregaDirecta:        undefined;
  EntregaDirectaDetalle: { item: EntregaDirectaItem };
  EntregaDirectaForm:    { item: EntregaDirectaItem };
};

const EntregaDirectaDetalle = () => {
  const navigation = useNavigation<NativeStackNavigationProp<StackParams>>();
  const route      = useRoute<RouteProp<StackParams, 'EntregaDirectaDetalle'>>();
  const { item }   = route.params;

  const { detalle, isLoading, cargar } = useEntregaDirectaDetalle(
    Number(item.ID_OrdenCompra),
  );
  const { descargarPdf } = usePdfReporte();

  useEffect(() => {
    cargar();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDescargarPdf = () => {
    if (!detalle) return;
    descargarPdf(
      {
        TipoReporte:                TIPO_REPORTE.ENTREGA_DIRECTA,
        ID_RecepcionEntregaDirecta: Number(detalle.ID_RecepcionEntregaDirecta),
      },
      `recepcion_ed_${detalle.Folio}`,
    );
  };

  return (
    <View style={styles.root}>
      <ScreenHeader
        title="Detalle de Recepción"
        onBack={() => navigation.goBack()}
      />

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1C57B5" />
        </View>
      ) : !detalle ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Sin información</Text>
        </View>
      ) : (
        <View style={styles.content}>

          {/* ── Encabezado ─────────────────────────────────────────── */}
          <View style={styles.header}>
            <View style={styles.headerTopRow}>
              <View style={styles.headerInfo}>
                <Text style={styles.headerLine}>
                  <Text style={styles.headerLabel}>Recepción Entrega Directa: </Text>
                  <Text style={styles.headerValue}>{detalle.Folio}</Text>
                </Text>
                <Text style={styles.headerLine}>
                  <Text style={styles.headerLabel}>Orden de Compra: </Text>
                  <Text style={styles.headerValue}>{item.FolioOrdenCompra}</Text>
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleDescargarPdf}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <IcDownload width={22} height={22} color="#1C57B5" />
              </TouchableOpacity>
            </View>

            <View style={styles.headerFooterRow}>
              <Text style={[styles.headerLine, { flex: 1 }]}>
                <Text style={styles.headerLabel}>Recibió: </Text>
                <Text style={styles.headerValue}>{detalle.PersonaRecibe}</Text>
              </Text>
              <Text style={styles.headerFecha}>{detalle.Fecha}</Text>
            </View>
          </View>

          {/* ── Encabezado columnas ────────────────────────────────── */}
          <View style={styles.tableHeader}>
            <Text style={[styles.colHeader, styles.colCodigo]}>Código</Text>
            <Text style={[styles.colHeader, styles.colProducto]}>Producto</Text>
            <Text style={[styles.colHeader, styles.colRecibidas]}>Recibidas</Text>
            <Text style={[styles.colHeader, styles.colMovimiento]}>Movimiento</Text>
          </View>

          {/* ── Grid de productos ──────────────────────────────────── */}
          <FlashList
            data={detalle.Productos}
            keyExtractor={p => p.ID_RecepcionEntregaDirectaDetalle}
            renderItem={({ item: producto, index }) => (
              <ProductoRow
                producto={producto}
                index={index}
                movimiento={detalle.SerieFolioMovimiento}
              />
            )}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.centered}>
                <Text style={styles.emptyText}>Sin productos</Text>
              </View>
            }
          />

        </View>
      )}
    </View>
  );
};

const ProductoRow = ({
  producto,
  index,
  movimiento,
}: {
  producto:   EntregaDirectaProducto;
  index:      number;
  movimiento: string;
}) => {
  const isEven = index % 2 === 0;
  return (
    <View style={[styles.row, isEven && styles.rowEven]}>
      <Text style={[styles.cell, styles.colCodigo, styles.cellCodigo]}>
        {producto.CodigoProducto}
      </Text>
      <Text style={[styles.cell, styles.colProducto]}>
        {producto.NombreProducto}
      </Text>
      <Text style={[styles.cell, styles.colRecibidas, styles.cellRecibidas]}>
        {parseFloat(producto.CantidadRecibida).toFixed(2).replace(/\.?0+$/, '')}
      </Text>
      <Text style={[styles.cell, styles.colMovimiento]} numberOfLines={2}>
        {movimiento}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: '#F8FAFC' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyText: { fontSize: 15, color: '#94A3B8' },
  content: { flex: 1 },

  // ── Header ──────────────────────────────────────────────────────────
  header: {
    backgroundColor:   '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical:   12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap:               6,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems:    'flex-start',
    gap:           8,
  },
  headerInfo: { flex: 1, gap: 4 },
  headerLine: { fontSize: 13, color: '#64748B', flexShrink: 1 },
  headerLabel: { color: '#94A3B8', fontWeight: '400' },
  headerValue: { color: '#1E293B', fontWeight: '700', fontStyle: 'italic' },
  headerFooterRow: {
    flexDirection:  'row',
    alignItems:     'flex-start',
    justifyContent: 'space-between',
    gap:            8,
    marginTop:      2,
  },
  headerFecha: { fontSize: 12, color: '#64748B', fontStyle: 'italic', textAlign: 'right', flexShrink: 0 },

  // ── Tabla ────────────────────────────────────────────────────────────
  tableHeader: {
    flexDirection:     'row',
    paddingHorizontal: 12,
    paddingVertical:   8,
    backgroundColor:   '#FFFFFF',
    borderBottomWidth: 2,
    borderBottomColor: '#E2E8F0',
    gap:               4,
  },
  row: {
    flexDirection:     'row',
    paddingHorizontal: 12,
    paddingVertical:   10,
    backgroundColor:   '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap:               4,
    alignItems:        'center',
  },
  rowEven: { backgroundColor: '#F8FAFC' },
  colHeader: { fontSize: 11, fontWeight: '600', color: '#94A3B8', letterSpacing: 0.2 },
  cell:      { fontSize: 12, color: '#1E293B' },
  colCodigo:     { width: 80 },
  colProducto:   { flex: 0.8 },
  colRecibidas:  { width: 68, textAlign: 'right' },
  colMovimiento: { width: 100, textAlign: 'right' },
  cellCodigo:    { color: '#2563EB', fontWeight: '600' },
  cellRecibidas: { color: '#16A34A', fontWeight: '600' },
});

export default EntregaDirectaDetalle;