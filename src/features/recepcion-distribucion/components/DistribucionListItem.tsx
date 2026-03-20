import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { DistribucionItem, DistribucionEstatus } from '../types';

// import IcChevron  from '@/assets/icons/ui/ic_chevron_right.png';
import IcDownload from '@/assets/icons/ui/download.svg';

interface Props {
  item:    DistribucionItem;
  index:   number;
  estatus: DistribucionEstatus;
  onPress: (item: DistribucionItem) => void;
  onPdf?:  (item: DistribucionItem) => void;
}

// Divide "01/12/2025 11:01 AM" en { fecha: "01/12/2025", hora: "11:01 AM" }
const splitFecha = (fechaStr: string) => {
  const partes = fechaStr.trim().split(' ');
  const fecha  = partes[0] ?? '';
  const hora   = partes.slice(1).join(' '); // "11:01 AM"
  return { fecha, hora };
};

const DistribucionListItem: React.FC<Props> = ({
  item,
  index,
  estatus,
  onPress,
  onPdf,
}) => {
  const isEven      = index % 2 === 0;
  const esRecibidas = estatus === 'Recibidas';
  const { fecha, hora } = splitFecha(item.Fecha);

  return (
    <TouchableOpacity
      style={[styles.row, isEven && styles.rowEven]}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      {/* ── Columna Folios ─────────────────────────────────────────────── */}
      {esRecibidas ? (
        // Recibidas: dos renglones con etiqueta
        <View style={styles.cellFolios}>
          <Text style={styles.folioLabel}>
            Recepción: <Text style={styles.folioValor}>{item.FolioRecepcion}</Text>
          </Text>
          <Text style={styles.folioLabel}>
            Distribución: <Text style={styles.folioValor}>{item.Folio}</Text>
          </Text>
        </View>
      ) : (
        // Pendientes: solo folio distribución
        <Text style={styles.cellFolio} numberOfLines={2}>
          {item.Folio}
        </Text>
      )}

      {/* ── Columna Fecha / Hora ────────────────────────────────────────── */}
      <View style={styles.cellFechaContainer}>
        <Text style={styles.fechaTexto}>{fecha}</Text>
        {hora ? <Text style={styles.horaTexto}>{hora}</Text> : null}
      </View>

      {/* ── Ícono PDF (solo Recibidas) ─────────────────────────────────── */}
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

      {/* ── Chevron ─────────────────────────────────────────────────────── */}
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

  // ── Folios ──────────────────────────────────────────────────────────────
  cellFolios: {
    flex: 1.6,
    gap:  3,
  },
  folioLabel: {
    fontSize:   12,
    color:      '#94A3B8',
    fontWeight: '400',
  },
  folioValor: {
    fontSize:   12,
    color:      '#1E293B',
    fontWeight: '600',
  },
  cellFolio: {
    flex:       1.6,
    fontSize:   13,
    color:      '#1E293B',
    fontWeight: '600',
  },

  // ── Fecha / Hora ────────────────────────────────────────────────────────
  cellFechaContainer: {
    flex: 0.7,
    gap:  2,
  },
  fechaTexto: {
    fontSize:   13,
    color:      '#1E293B',
    fontWeight: '500',
  },
  horaTexto: {
    fontSize:   12,
    color:      '#64748B',
  },

  // ── PDF ────────────────────────────────────────────────────────────────
  pdfBtn: {
    width:          26,
    height:         26,
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
  },

  // ── Chevron ────────────────────────────────────────────────────────────
  chevron: {
    fontSize:   20,
    color:      '#CBD5E1',
    flexShrink: 0,
  },
});

export default DistribucionListItem;