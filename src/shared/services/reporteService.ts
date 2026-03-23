import useAuthStore from '@/features/auth/store/authStore';
import { ENDPOINTS } from '@/shared/constants/endpoints';
import { ApiBusinessError } from '@/shared/services/httpClient';
import httpClient from '@/shared/services/httpClient';

// ─── Tipos de reporte ─────────────────────────────────────────────────────────

export const TIPO_REPORTE = {
  ORDEN_DISTRIBUCION:              1,
  ENTREGA_DIRECTA:                 2,
  ENTREGA_CENTRO_COSTO:            3,
  LISTADO_ORDENES_DISTRIBUCION:    4,
  LISTADO_ENTREGAS_DIRECTAS:       5,
  LISTADO_ENTREGAS_CENTRO_COSTO:   6,
  CONSIGNACION_DIRECTA:            7,
  LISTADO_CONSIGNACION_DIRECTA:    8,
} as const;

export type TipoReporte = typeof TIPO_REPORTE[keyof typeof TIPO_REPORTE];

export interface ReporteParams {
  TipoReporte:                TipoReporte;
  // Para reportes de listado
  Anio?:                      number;
  Mes?:                       number;
  Status?:                    number;
  // IDs de recepción — solo el correspondiente va con valor, los demás en 0
  ID_RecepcionDistribucion?:     number;
  ID_RecepcionEntregaDirecta?:   number;
  ID_EntregaCentroCosto?:        number;
  ID_ConsignacionDirecta?:       number;
}

interface ReporteResponse {
  d: {
    Success: boolean;
    PDF64:   string;
  };
}

// ─── Servicio ─────────────────────────────────────────────────────────────────

export const getPdfBase64 = async (params: ReporteParams): Promise<string> => {
  const { ssid, ID_UsuarioAtica } = useAuthStore.getState();
  const sesion = useAuthStore.getState().sesion;

  const body = {
    Params: {
      SSID:               ssid!,
      ID_Usuario:         ID_UsuarioAtica!,
      ID_Empresa:         sesion?.ID_Empresa,
      ID_EmpresaSucursal: sesion?.ID_EmpresaSucursal,
      ID_Almacen:         sesion?.ID_Almacen,
      // Valores por defecto en 0 para los IDs de recepción
      ID_RecepcionDistribucion:   0,
      ID_RecepcionEntregaDirecta: 0,
      ID_EntregaCentroCosto:      0,
      ID_ConsignacionDirecta:     0,
      ...params,
    },
  };

  const response = await httpClient.post<ReporteResponse>(ENDPOINTS.report, body);
  const result = response.data.d;

  if (!result.Success) {
    throw new ApiBusinessError('No se pudo generar el reporte');
  }

  return result.PDF64;
};