import type { DistribucionEstatus } from '@/features/recepcion-distribucion/types';

// ─── Tipos del listado ────────────────────────────────────────────────────────

export interface EntregaDirectaItem {
  ID_OrdenCompra:               string;
  ID_RecepcionEntregaDirecta:   string;
  NombreProveedor:              string;
  NombreProveedorSucursal:      string;
  FechaCompleta:                string;
  FolioOrdenCompra:             string;
  FolioRecepcionEntregaDirecta: string;
}

export interface EntregaDirectaListResponse {
  Count:   number;
  Data:    EntregaDirectaItem[];
  Success: true;
}

// ─── Tipos de filtro ──────────────────────────────────────────────────────────

export interface EntregaDirectaFiltros {
  estatus:    DistribucionEstatus;
  anio:       string;
  mes:        { id: number; nombre: string } | null;
  folioTipo:  { id: string; nombre: string } | null;
  folioValor: string;
}

export const FOLIO_OPCIONES_ENTREGA_DIRECTA = [
  { id: 'FolioOrdenCompra',             nombre: 'F. O. Compra' },
  { id: 'FolioRecepcionEntregaDirecta', nombre: 'F. Recepción' },
];

// ─── Tipos del detalle de recepción ──────────────────────────────────────────

export interface EntregaDirectaProducto {
  ID_RecepcionEntregaDirectaDetalle: string;
  ID_Producto:                       string;
  CodigoProducto:                    string;
  NombreProducto:                    string;
  CantidadRecibida:                  string;
}

export interface EntregaDirectaDetalle {
  ID_RecepcionEntregaDirecta: string;
  Folio:                      string;
  PersonaRecibe:              string;
  Fecha:                      string;
  SerieFolioMovimiento:       string;
  Productos:                  EntregaDirectaProducto[];
}

export interface EntregaDirectaDetalleResponse {
  Count:   number;
  Data:    EntregaDirectaDetalle[];
  Success: true;
}

// ─── Tipos del formulario de recepción ───────────────────────────────────────

export interface EntregaDirectaProductoForm {
  ID_OrdenCompraDetalle: string;
  ID_OrdenCompra:        string;
  ID_Producto:           string;
  CodigoProducto:        string;
  NombreProducto:        string;
  CantidadASurtir:       string;
  MaximoASurtir:         string;
  CostoUnitario:         string;
  // Campos locales
  CantidadRecibir:       string;
  Observaciones:         string;
}

export interface EntregaDirectaProductosFormResponse {
  Count:   number;
  Data:    Omit<EntregaDirectaProductoForm, 'CantidadRecibir' | 'Observaciones'>[];
  Success: true;
}