import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { ProductoDistribucion } from '../types';

// import IcCheck  from '@/assets/icons/ui/check.svg';
// import IcEdit   from '@/assets/icons/ui/edit.svg';

interface Props {
  producto: ProductoDistribucion;
  index:    number;
  onConfirmar: (idProducto: string) => void;
  onEditar:    (producto: ProductoDistribucion) => void;
}

// Determina el color de la cantidad recibida
const getCantidadColor = (recibir: string, surtir: string, maximo: string): string => {
  const r = parseFloat(recibir) || 0;
  const s = parseFloat(surtir)  || 0;
  const m = parseFloat(maximo)  || 0;
  if (r === 0)      return '#1E293B'; // sin capturar — color normal (no se muestra)
  if (r === s)      return '#16A34A'; // exacto — verde
  if (r < s)        return '#DC2626'; // menor — rojo
  if (r <= m)       return '#F59E0B'; // entre surtir y maximo — naranja
  return '#DC2626';                   // sobrepasa máximo — rojo
};

const ProductoFormRow: React.FC<Props> = ({
  producto,
  index,
  onConfirmar,
  onEditar,
}) => {
  const isEven      = index % 2 === 0;
  const cantRecibir = parseFloat(producto.CantidadRecibir) || 0;
  const tieneCantidad = cantRecibir > 0;
  const cantidadColor = getCantidadColor(
    producto.CantidadRecibir,
    producto.CantidadASurtir,
    producto.MaximoASurtir,
  );

  return (
    <View style={[styles.row, isEven && styles.rowEven]}>

      {/* Código */}
      <Text style={[styles.cell, styles.colCodigo, styles.cellCodigo]} numberOfLines={1}>
        {producto.CodigoProducto}
      </Text>

      {/* Producto */}
      <Text style={[styles.cell, styles.colProducto]} numberOfLines={3}>
        {producto.NombreProducto}
      </Text>

      {/* Dist. */}
      <Text style={[styles.cell, styles.colDist]} numberOfLines={1}>
        {parseFloat(producto.CantidadASurtir).toFixed(0)}
      </Text>

      {/* Recibido / Cantidad capturada */}
      <View style={styles.colRecibido}>
        {tieneCantidad ? (
          <Text style={[styles.cell, styles.cantidadText, { color: cantidadColor }]}>
            {parseFloat(producto.CantidadRecibir).toFixed(0)}
          </Text>
        ) : (
          // Botón confirmar (100%) — solo cuando no hay cantidad capturada
          <TouchableOpacity
            style={styles.btnConfirmar}
            onPress={() => onConfirmar(producto.ID_Producto)}
            activeOpacity={0.7}
          >
            {/* <IcCheck width={16} height={16} color="#FFFFFF" /> */}
            <Text style={styles.btnIcon}>✓</Text>
          </TouchableOpacity>
        )}

        {/* Botón editar — siempre visible */}
        <TouchableOpacity
          style={styles.btnEditar}
          onPress={() => onEditar(producto)}
          activeOpacity={0.7}
        >
          {/* <IcEdit width={16} height={16} color="#FFFFFF" /> */}
          <Text style={styles.btnIcon}>✎</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingVertical:   10,
    paddingHorizontal: 12,
    backgroundColor:   '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap:               6,
  },
  rowEven: {
    backgroundColor: '#F8FAFC',
  },
  cell: {
    fontSize: 12,
    color:    '#1E293B',
  },
  colCodigo: {
    width: 76,
  },
  colProducto: {
    flex:     1,
    fontSize: 12,
    color:    '#1E293B',
  },
  colDist: {
    width:     38,
    textAlign: 'right',
    color:     '#64748B',
  },
  colRecibido: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           6,
    flexShrink:    0,
  },
  cellCodigo: {
    color:      '#2563EB',
    fontWeight: '600',
  },
  cantidadText: {
    fontSize:   13,
    fontWeight: '700',
    width:      32,
    textAlign:  'center',
  },
  btnConfirmar: {
    width:           32,
    height:          32,
    borderRadius:    16,
    backgroundColor: '#22C55E',
    alignItems:      'center',
    justifyContent:  'center',
  },
  btnEditar: {
    width:           32,
    height:          32,
    borderRadius:    16,
    backgroundColor: '#94A3B8',
    alignItems:      'center',
    justifyContent:  'center',
  },
  btnIcon: {
    color:      '#FFFFFF',
    fontSize:   14,
    fontWeight: '700',
  },
});

export default ProductoFormRow;