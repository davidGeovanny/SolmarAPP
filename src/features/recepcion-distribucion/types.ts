// ─── Tipos de filtro ──────────────────────────────────────────────────────────

export type DistribucionEstatus = 'Pendientes' | 'Recibidas';

export type FolioTipo = 'Folio' | 'FolioRecepcion';

export interface FolioTipoOption {
  id:     FolioTipo;
  nombre: string;
}

export const FOLIO_OPCIONES: FolioTipoOption[] = [
  { id: 'Folio',         nombre: 'F. Distribución' },
  { id: 'FolioRecepcion', nombre: 'F. Recepción' },
];

export const MESES: { id: number; nombre: string }[] = [
  { id: 1,  nombre: 'ENERO' },
  { id: 2,  nombre: 'FEBRERO' },
  { id: 3,  nombre: 'MARZO' },
  { id: 4,  nombre: 'ABRIL' },
  { id: 5,  nombre: 'MAYO' },
  { id: 6,  nombre: 'JUNIO' },
  { id: 7,  nombre: 'JULIO' },
  { id: 8,  nombre: 'AGOSTO' },
  { id: 9,  nombre: 'SEPTIEMBRE' },
  { id: 10, nombre: 'OCTUBRE' },
  { id: 11, nombre: 'NOVIEMBRE' },
  { id: 12, nombre: 'DICIEMBRE' },
];

export interface DistribucionFiltros {
  estatus:    DistribucionEstatus;
  anio:       string;
  mes:        { id: number; nombre: string } | null;
  folioTipo:  FolioTipoOption | null;
  folioValor: string;
}

// ─── Tipos de respuesta API ───────────────────────────────────────────────────

export interface DistribucionItem {
  ID_OrdenDistribucion:    string;
  ID_RecepcionDistribucion: string;
  Fecha:                   string;
  Folio:                   string;   // Folio de Distribución
  FolioRecepcion:          string;   // '0' cuando está pendiente
  Status:                  string;   // '1' = pendiente, '2' = recibida (según servidor)
}

export interface DistribucionListResponse {
  Count:   number;
  Data:    DistribucionItem[];
  Success: true;
}

// ─── Tipos para el detalle de recepción ──────────────────────────────────────

export interface RecepcionProducto {
  ID_RecepcionDistribucion: string;
  ID_Producto:              string;
  CodigoProducto:           string;
  NombreProducto:           string;
  CantidadRecibida:         string;
}

export interface RecepcionDetalle {
  ID_RecepcionDistribucion: string;
  Folio:                    string;
  PersonaRecibe:            string;
  Fecha:                    string;
  SerieFolioMovimiento:     string;
  FolioOrdenDistribucion:   string;
  Productos:                RecepcionProducto[];
}

export interface RecepcionDetalleResponse {
  Count:   number;
  Data:    RecepcionDetalle[];
  Success: true;
}