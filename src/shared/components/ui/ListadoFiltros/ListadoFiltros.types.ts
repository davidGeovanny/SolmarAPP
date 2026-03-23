import type { DistribucionEstatus } from '@/features/recepcion-distribucion/types';
import type { TipoReporte } from '@/shared/services/reporteService';

export interface FolioOpcion {
  id:     string;
  nombre: string;
}

export interface SwitchConfig {
  labelIzquierda: string; // ej. 'Pendientes'
  labelDerecha:   string; // ej. 'Recibidas' | 'Entregadas'
}

export interface ListadoFiltrosProps {
  // Valores actuales
  anio:       string;
  mes:        { id: number; nombre: string } | null;
  estatus:    DistribucionEstatus;
  folioTipo:  FolioOpcion | null;
  folioValor: string;

  // Configuración
  folioOpciones: FolioOpcion[];
  switchConfig?: SwitchConfig; // si no se pasa, no muestra switch
  tipoReporte:   TipoReporte;

  // Handlers
  onEstatusChange:    (v: DistribucionEstatus) => void;
  onAnioChange:       (v: string) => void;
  onMesChange:        (v: { id: number; nombre: string } | null) => void;
  onFolioTipoChange:  (v: FolioOpcion | null) => void;
  onFolioValorChange: (v: string) => void;
  onAplicar:          () => void;
  onExportar:         () => void;
}