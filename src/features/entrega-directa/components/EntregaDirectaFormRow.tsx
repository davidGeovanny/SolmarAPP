import React, { useState, useRef, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { formatMoneda } from '../hooks/useEntregaDirectaForm';
import type { EntregaDirectaProductoForm } from '../types';

import IcCheck from '@/assets/icons/ui/check.png';
import IcEdit  from '@/assets/icons/ui/edit.png';

interface Props {
  producto:        EntregaDirectaProductoForm;
  index:           number;
  onConfirmar:     (idProducto: string) => void;
  onEditar:        (producto: EntregaDirectaProductoForm) => void;
  onCostoChange:   (idProducto: string, costo: string) => void;
}

const MAX_DECIMALES = 4;

const fmt2 = (val: string): string =>
  parseFloat(parseFloat(val).toFixed(2)).toString();

const getCantidadColor = (recibir: string, surtir: string, maximo: string): string => {
  const r = parseFloat(recibir) || 0;
  const s = parseFloat(surtir)  || 0;
  const m = parseFloat(maximo)  || 0;
  if (r === s)  return '#16A34A';
  if (r < s)    return '#DC2626';
  if (r <= m)   return '#F59E0B';
  return '#DC2626';
};

const EntregaDirectaFormRow: React.FC<Props> = ({
  producto, index, onConfirmar, onEditar, onCostoChange,
}) => {
  const isEven       = index % 2 === 0;
  const cantRecibir  = parseFloat(producto.CantidadRecibir) || 0;
  const tieneCantidad = cantRecibir > 0;
  const cantidadColor = getCantidadColor(
    producto.CantidadRecibir, producto.CantidadASurtir, producto.MaximoASurtir,
  );
  const costo        = parseFloat(producto.CostoUnitario) || 0;
  const costoColor   = costo > 0 ? '#16A34A' : '#DC2626';

  // ── Edición de costo unitario ──────────────────────────────────────
  const [editandoCosto, setEditandoCosto] = useState(false);
  const [costoInput,    setCostoInput]    = useState('');
  const inputRef = useRef<TextInput>(null);

  const handleCostoPress = useCallback(() => {
    const val = parseFloat(producto.CostoUnitario);
    const normalizado = isNaN(val) ? '0' : parseFloat(val.toFixed(MAX_DECIMALES)).toString();
    setCostoInput(normalizado);
    setEditandoCosto(true);
    // Seleccionar todo al enfocar (setTimeout para esperar el render)
    setTimeout(() => inputRef.current?.setSelection?.(0, normalizado.length), 50);
  }, [producto.CostoUnitario]);

  const handleCostoChange = useCallback((text: string) => {
    // Solo números y punto decimal, máximo 4 decimales
    const cleaned = text.replace(/[^0-9.]/g, '');
    const parts   = cleaned.split('.');
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > MAX_DECIMALES) return;
    setCostoInput(cleaned);
  }, []);

  const handleCostoBlur = useCallback(() => {
    setEditandoCosto(false);
    const val = parseFloat(costoInput);
    const final = isNaN(val) || val < 0 ? '0' : costoInput;
    onCostoChange(producto.ID_Producto, final);
  }, [costoInput, producto.ID_Producto, onCostoChange]);

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

      {/* C/U — costo unitario editable */}
      <TouchableOpacity
        style={styles.colCosto}
        onPress={handleCostoPress}
        activeOpacity={0.7}
      >
        {editandoCosto ? (
          <TextInput
            ref={inputRef}
            style={[styles.costoInput, { color: costoColor }]}
            value={costoInput}
            onChangeText={handleCostoChange}
            onBlur={handleCostoBlur}
            keyboardType="decimal-pad"
            autoFocus
            selectTextOnFocus
          />
        ) : (
          <Text style={[styles.costoText, { color: costoColor }]}>
            {formatMoneda(producto.CostoUnitario)}
          </Text>
        )}
      </TouchableOpacity>

      {/* Cantidad O.C. */}
      <Text style={[styles.cell, styles.colDist]} numberOfLines={1}>
        {fmt2(producto.CantidadASurtir)}
      </Text>

      {/* Recibido */}
      <View style={styles.colRecibido}>
        {tieneCantidad ? (
          <Text style={[styles.cell, styles.cantidadText, { color: cantidadColor }]}>
            {fmt2(producto.CantidadRecibir)}
          </Text>
        ) : (
          <TouchableOpacity
            style={styles.btnConfirmar}
            onPress={() => onConfirmar(producto.ID_Producto)}
            activeOpacity={0.7}
          >
            <Image source={IcCheck} style={{ width: 13, height: 13 }} resizeMode="contain" />
          </TouchableOpacity>
        )}
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
  rowEven: { backgroundColor: '#F8FAFC' },
  cell:    { fontSize: 12, color: '#1E293B' },
  colCodigo:    { width: 68 },
  colProducto:  { flex: 1, fontSize: 12, color: '#1E293B' },
  colCosto:     { width: 72, alignItems: 'flex-end' },
  colDist:      { width: 44, textAlign: 'right', color: '#64748B', fontSize: 12 },
  colRecibido:  { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 0 },
  cellCodigo:   { color: '#2563EB', fontWeight: '600' },
  costoText:    { fontSize: 11, fontWeight: '600', textAlign: 'right' },
  costoInput: {
    fontSize:      12,
    fontWeight:    '600',
    textAlign:     'right',
    padding:       0,
    width:         '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
  },
  cantidadText: { fontSize: 13, fontWeight: '700', width: 44, textAlign: 'center' },
  btnConfirmar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#22C55E', alignItems: 'center', justifyContent: 'center',
  },
  btnEditar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#94A3B8', alignItems: 'center', justifyContent: 'center',
  },
});

export default EntregaDirectaFormRow;