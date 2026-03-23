import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import IcDownload from '@/assets/icons/ui/download.svg';
import type { EntregaDirectaItem } from '../types';
import type { DistribucionEstatus } from '@/features/recepcion-distribucion/types';

interface Props {
  item:     EntregaDirectaItem;
  index:    number;
  estatus:  DistribucionEstatus;
  onPress:  (item: EntregaDirectaItem) => void;
  onPdf?:   (item: EntregaDirectaItem) => void;
}

const splitFecha = (fechaStr: string) => {
  const partes = fechaStr.trim().split(' ');
  return { fecha: partes[0] ?? '', hora: partes.slice(1).join(' ') };
};

const EntregaDirectaListItem: React.FC<Props> = ({
  item, index, estatus, onPress, onPdf,
}) => {
  const isEven      = index % 2 === 0;
  const esRecibidas = estatus === 'Recibidas';
  const { fecha, hora } = splitFecha(item.FechaCompleta);

  return (
    <TouchableOpacity
      style={[styles.row, isEven && styles.rowEven]}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      {/* ── Columna Folios ─────────────────────────────────────────── */}
      {esRecibidas ? (
        <View style={styles.cellFolios}>
          <Text style={styles.folioLabel} numberOfLines={1}>
            Recepción: <Text style={styles.folioValor}>{item.FolioRecepcionEntregaDirecta}</Text>
          </Text>
          <Text style={styles.folioLabel} numberOfLines={1}>
            O. Compra: <Text style={styles.folioValor}>{item.FolioOrdenCompra}</Text>
          </Text>
        </View>
      ) : (
        <Text style={styles.cellFolio} numberOfLines={1}>
          {item.FolioOrdenCompra}
        </Text>
      )}

      {/* ── Fecha / Hora ───────────────────────────────────────────── */}
      <View style={styles.cellFechaContainer}>
        <Text style={styles.fechaTexto}>{fecha}</Text>
        {hora ? <Text style={styles.horaTexto}>{hora}</Text> : null}
      </View>

      {/* ── Proveedor (solo Pendientes) ────────────────────────────── */}
      {!esRecibidas && (
        <View style={styles.cellProveedorContainer}>
          <Text style={styles.proveedorNombre}>
            {item.NombreProveedor}
          </Text>
          {item.NombreProveedorSucursal !== item.NombreProveedor && (
            <Text style={styles.proveedorSucursal}>
              {item.NombreProveedorSucursal}
            </Text>
          )}
        </View>
      )}

      {/* ── Ícono PDF (solo Recibidas) ────────────────────────────── */}
      {esRecibidas && (
        <TouchableOpacity
          style={styles.pdfBtn}
          onPress={() => onPdf?.(item)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
        >
          <IcDownload width={20} height={20} color="#1C57B5" />
        </TouchableOpacity>
      )}

      {/* ── Chevron ────────────────────────────────────────────────── */}
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingVertical:   12,
    paddingHorizontal: 16,
    backgroundColor:   '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap:               8,
  },
  rowEven: {
    backgroundColor: '#F8FAFC',
  },
  cellFolios: {
    flex: 1.4,
    gap:  3,
  },
  folioLabel: {
    fontSize:   12,
    color:      '#94A3B8',
  },
  folioValor: {
    fontSize:   12,
    color:      '#1E293B',
    fontWeight: '600',
  },
  cellFolio: {
    flex:       1.4,
    fontSize:   13,
    color:      '#1E293B',
    fontWeight: '600',
  },
  cellFechaContainer: {
    flex: 0.9,
    gap:  2,
  },
  fechaTexto: {
    fontSize:   12,
    color:      '#1E293B',
    fontWeight: '500',
  },
  horaTexto: {
    fontSize: 11,
    color:    '#64748B',
  },
  cellProveedorContainer: {
    flex: 1.2,
    gap:  2,
  },
  proveedorNombre: {
    fontSize:   12,
    color:      '#1E293B',
    fontWeight: '500',
  },
  proveedorSucursal: {
    fontSize: 11,
    color:    '#64748B',
  },
  pdfBtn: {
    width:          26,
    height:         26,
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
  },
  chevron: {
    fontSize:   20,
    color:      '#CBD5E1',
    flexShrink: 0,
  },
});

export default EntregaDirectaListItem;