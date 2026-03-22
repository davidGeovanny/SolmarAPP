import React, { useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
// import IcClose from '@/assets/icons/ui/clear.svg';
// import IcCheck from '@/assets/icons/ui/check.svg';

export interface EditarCantidadItem {
  ID_Producto:      string;
  NombreProducto:   string;
  CantidadASurtir:  string;
  MaximoASurtir:    string;
  CantidadRecibir:  string;
  Observaciones:    string;
}

interface Props {
  producto:  EditarCantidadItem | null;
  visible:   boolean;
  onCancel:  () => void;
  onApply:   (idProducto: string, cantidad: string, observaciones: string) => void;
}

const MAX_DECIMALES = 4;

// Formatea a máximo 4 decimales eliminando ceros finales
const formatCantidad = (val: number): string => {
  if (val === 0) return '0';
  return parseFloat(val.toFixed(MAX_DECIMALES)).toString();
};

const EditarCantidadModal: React.FC<Props> = ({
  producto,
  visible,
  onCancel,
  onApply,
}) => {
  const [cantidad,      setCantidad]      = useState('0');
  const [observaciones, setObservaciones] = useState('');

  // Inicializar con los valores actuales del producto al abrir
  React.useEffect(() => {
    if (visible && producto) {
      setCantidad(formatCantidad(parseFloat(producto.CantidadRecibir || '0')));
      setObservaciones(producto.Observaciones || '');
    }
  }, [visible, producto]);

  const maxSurtir  = parseFloat(producto?.CantidadASurtir  ?? '0');
  const maxMaximo  = parseFloat(producto?.MaximoASurtir    ?? '0');

  // ── Botón menos ───────────────────────────────────────────────────────
  const handleMenos = useCallback(() => {
    const actual = parseFloat(cantidad) || 0;
    const nuevo  = Math.max(0, Math.floor(actual) - 1);
    setCantidad(formatCantidad(nuevo));
  }, [cantidad]);

  // ── Botón más ─────────────────────────────────────────────────────────
  const handleMas = useCallback(() => {
    const actual = parseFloat(cantidad) || 0;
    const nuevo  = Math.min(maxSurtir, Math.floor(actual) + 1);
    setCantidad(formatCantidad(nuevo));
  }, [cantidad, maxSurtir]);

  // ── Cambio manual del input ───────────────────────────────────────────
  const handleCantidadChange = useCallback((text: string) => {
    // Permitir solo números y punto decimal
    const cleaned = text.replace(/[^0-9.]/g, '');
    // Evitar más de un punto
    const parts = cleaned.split('.');
    if (parts.length > 2) return;
    // Limitar a 4 decimales
    if (parts[1] && parts[1].length > MAX_DECIMALES) return;
    setCantidad(cleaned);
  }, []);

  // ── Validar y aplicar ─────────────────────────────────────────────────
  const handleApply = useCallback(() => {
    const valor = parseFloat(cantidad);

    if (isNaN(valor) || valor < 0) {
      // Valor inválido — mostrar en rojo pero no cerrar
      setCantidad('0');
      return;
    }

    if (valor > maxMaximo) {
      setCantidad(formatCantidad(maxMaximo));
      return;
    }

    onApply(producto!.ID_Producto, formatCantidad(valor), observaciones);
  }, [cantidad, observaciones, maxMaximo, producto, onApply]);

  if (!producto) return null;

  const valorActual  = parseFloat(cantidad) || 0;
  const puedeRestar  = valorActual > 0;
  const puedeSumar   = valorActual < maxSurtir;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {}} // bloqueado — solo Cancelar o Aplicar
      statusBarTranslucent
    >
      {/* Fondo oscuro no interactivo */}
      <View style={styles.overlay} pointerEvents="box-none">

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.centrado}
        >
          <View style={styles.modal}>

            {/* Título */}
            <Text style={styles.titulo}>Editar cantidad</Text>

            {/* Nombre del producto */}
            <Text style={styles.nombreProducto} numberOfLines={2}>
              {producto.NombreProducto}
            </Text>

            {/* Controles de cantidad */}
            <View style={styles.cantidadRow}>
              <TouchableOpacity
                style={[styles.btnCircle, styles.btnMenos, !puedeRestar && styles.btnDisabled]}
                onPress={handleMenos}
                disabled={!puedeRestar}
                activeOpacity={0.7}
              >
                <Text style={styles.btnCircleText}>−</Text>
              </TouchableOpacity>

              <TextInput
                style={styles.inputCantidad}
                value={cantidad}
                onChangeText={handleCantidadChange}
                keyboardType="decimal-pad"
                selectTextOnFocus
                textAlign="center"
              />

              <TouchableOpacity
                style={[styles.btnCircle, styles.btnMas, !puedeSumar && styles.btnDisabled]}
                onPress={handleMas}
                disabled={!puedeSumar}
                activeOpacity={0.7}
              >
                <Text style={styles.btnCircleText}>+</Text>
              </TouchableOpacity>
            </View>

            {/* Referencia de cantidades */}
            <Text style={styles.referencia}>
              Surtir: <Text style={styles.referenciaValor}>{formatCantidad(maxSurtir)}</Text>
            </Text>

            {/* Observaciones */}
            <Text style={styles.obsLabel}>Observaciones:</Text>
            <TextInput
              style={styles.inputObs}
              value={observaciones}
              onChangeText={setObservaciones}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholder="Opcional..."
              placeholderTextColor="#94A3B8"
            />

            {/* Botones */}
            <View style={styles.botonesRow}>
              <TouchableOpacity
                style={styles.btnCancelar}
                onPress={onCancel}
                activeOpacity={0.8}
              >
                {/* <IcClose width={16} height={16} color="#FFFFFF" /> */}
                <Text style={styles.btnCancelarText}>✕  Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnAplicar}
                onPress={handleApply}
                activeOpacity={0.8}
              >
                {/* <IcCheck width={16} height={16} color="#FFFFFF" /> */}
                <Text style={styles.btnAplicarText}>✓  Aplicar</Text>
              </TouchableOpacity>
            </View>

          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex:            1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent:  'center',
    alignItems:      'center',
  },
  centrado: {
    width:      '100%',
    alignItems: 'center',
  },
  modal: {
    width:           '88%',
    backgroundColor: '#2D3748',
    borderRadius:    16,
    padding:         20,
    gap:             12,
  },
  titulo: {
    color:      '#FFFFFF',
    fontSize:   17,
    fontWeight: '700',
    textAlign:  'center',
  },
  nombreProducto: {
    color:     'rgba(255,255,255,0.7)',
    fontSize:  12,
    textAlign: 'center',
  },

  // ── Cantidad ───────────────────────────────────────────────────────────
  cantidadRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            16,
    marginVertical: 4,
  },
  btnCircle: {
    width:          52,
    height:         52,
    borderRadius:   26,
    alignItems:     'center',
    justifyContent: 'center',
  },
  btnMenos: {
    backgroundColor: '#E05050',
  },
  btnMas: {
    backgroundColor: '#22C55E',
  },
  btnDisabled: {
    opacity: 0.35,
  },
  btnCircleText: {
    color:      '#FFFFFF',
    fontSize:   26,
    fontWeight: '300',
    lineHeight: 30,
  },
  inputCantidad: {
    width:           110,
    height:          52,
    borderRadius:    10,
    backgroundColor: '#FFFFFF',
    fontSize:        22,
    fontWeight:      '700',
    color:           '#1C57B5',
    textAlign:       'center',
    paddingVertical: 0,
  },
  referencia: {
    color:     'rgba(255,255,255,0.5)',
    fontSize:  11,
    textAlign: 'center',
  },
  referenciaValor: {
    color:      'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },

  // ── Observaciones ──────────────────────────────────────────────────────
  obsLabel: {
    color:      'rgba(255,255,255,0.8)',
    fontSize:   13,
    fontWeight: '500',
  },
  inputObs: {
    backgroundColor: '#F1F5F9',
    borderRadius:    8,
    padding:         10,
    fontSize:        13,
    color:           '#1E293B',
    minHeight:       90,
  },

  // ── Botones ────────────────────────────────────────────────────────────
  botonesRow: {
    flexDirection: 'row',
    gap:           10,
    marginTop:     4,
  },
  btnCancelar: {
    flex:            1,
    height:          46,
    borderRadius:    23,
    backgroundColor: '#4A5568',
    alignItems:      'center',
    justifyContent:  'center',
  },
  btnCancelarText: {
    color:      '#FFFFFF',
    fontSize:   14,
    fontWeight: '600',
  },
  btnAplicar: {
    flex:            1,
    height:          46,
    borderRadius:    23,
    backgroundColor: '#1C57B5',
    alignItems:      'center',
    justifyContent:  'center',
  },
  btnAplicarText: {
    color:      '#FFFFFF',
    fontSize:   14,
    fontWeight: '600',
  },
});

export default EditarCantidadModal;