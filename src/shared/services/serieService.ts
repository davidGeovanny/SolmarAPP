import httpClient from '@/shared/services/httpClient';
import useAuthStore from '@/features/auth/store/authStore';
import { ENDPOINTS } from '@/shared/constants/endpoints';
import { isSuccessResponse } from '@/shared/types/api';
import { ApiBusinessError } from '@/shared/services/httpClient';
import type { ApiWrapper, ApiRequest, ApiParams } from '@/shared/types/api';

export interface SerieDTO {
  ID_ConfiguracionSerie: string;
  Serie:                 string;
}

export interface SeriesResponse {
  Count:   number;
  Data:    SerieDTO[];
  Success: true;
}

export interface FolioResponse {
  Count:   number;
  Data:    { Folio: string }[];
  Success: true;
}

export const getSeries = async (codigoOpcion: string): Promise<SeriesResponse> => {
  const { ssid, ID_UsuarioAtica } = useAuthStore.getState();
  const sesion = useAuthStore.getState().sesion;

  const body: ApiRequest<ApiParams> = {
    Params: {
      Accion:             'ObtenerSeries',
      SSID:               ssid!,
      ID_Usuario:         ID_UsuarioAtica!,
      CodigoOpcion:       codigoOpcion,
      ID_Empresa:         sesion?.ID_Empresa,
      ID_EmpresaSucursal: sesion?.ID_EmpresaSucursal,
    },
  };

  const response = await httpClient.post<ApiWrapper<SeriesResponse>>(ENDPOINTS.api, body);
  const result = response.data.d;
  if (!isSuccessResponse(result)) throw new ApiBusinessError((result as any).Message);
  return result;
};

export const getSiguienteFolio = async (serie: string): Promise<string> => {
  const { ssid, ID_UsuarioAtica } = useAuthStore.getState();

  const body: ApiRequest<ApiParams> = {
    Params: {
      Accion:     'ObtenerSiguienteFolio',
      SSID:       ssid!,
      ID_Usuario: ID_UsuarioAtica!,
      Serie:      serie,
    },
  };

  const response = await httpClient.post<ApiWrapper<FolioResponse>>(ENDPOINTS.api, body);
  const result = response.data.d;
  if (!isSuccessResponse(result)) throw new ApiBusinessError((result as any).Message);
  return result.Data[0]?.Folio ?? '';
};