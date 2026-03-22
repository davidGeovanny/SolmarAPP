import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import IcCheck from '@/assets/icons/ui/check.png';
import IcEdit  from '@/assets/icons/ui/edit.png';
import type { ProductoDistribucion } from '../types';

interface Props {
  producto: ProductoDistribucion;
  index:    number;
  onConfirmar: (idProducto: string) => void;
  onEditar:    (producto: ProductoDistribucion) => void;
}

// Determina el color de la cantidad recibida

// Formatea a máximo 2 decimales eliminando ceros finales
const fmt2 = (val: string): string =>
  parseFloat(parseFloat(val).toFixed(2)).toString();

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
        {fmt2(producto.CantidadASurtir)}
      </Text>

      {/* Recibido / Cantidad capturada */}
      <View style={styles.colRecibido}>
        {tieneCantidad ? (
          <Text style={[styles.cell, styles.cantidadText, { color: cantidadColor }]}>
            {fmt2(producto.CantidadRecibir)}
          </Text>
        ) : (
          // Botón confirmar (100%) — solo cuando no hay cantidad capturada
          <TouchableOpacity
            style={styles.btnConfirmar}
            onPress={() => onConfirmar(producto.ID_Producto)}
            activeOpacity={0.7}
          >
            <Image source={IcCheck} style={{ width: 13, height: 13 }} resizeMode="contain" />
          </TouchableOpacity>
        )}

        {/* Botón editar — siempre visible */}
        <TouchableOpacity
          style={styles.btnEditar}
          onPress={() => onEditar(producto)}
          activeOpacity={0.7}
        >
          <Image source={IcEdit} style={{ width: 13, height: 13 }} resizeMode="contain" />
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
    width: 72,
  },
  colProducto: {
    flex:     1,
    fontSize: 12,
    color:    '#1E293B',
  },
  colDist: {
    width:     50,
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
    width:      70,
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
});

export default ProductoFormRow;