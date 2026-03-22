import httpClient from '@/shared/services/httpClient';
import useAuthStore from '@/features/auth/store/authStore';
import { ENDPOINTS } from '@/shared/constants/endpoints';
import { isSuccessResponse } from '@/shared/types/api';
import { ApiBusinessError } from '@/shared/services/httpClient';
import type { ApiWrapper, ApiRequest, ApiParams } from '@/shared/types/api';
import type { RecepcionDetalleResponse } from '../types';

export const getRecepcionDetalle = async (
  idOrdenDistribucion: number,
): Promise<RecepcionDetalleResponse> => {
  const { ssid, ID_UsuarioAtica } = useAuthStore.getState();

  const body: ApiRequest<ApiParams> = {
    Params: {
      Accion:               'ObtenerRecepcionesDistribucion',
      SSID:                 ssid!,
      ID_Usuario:           ID_UsuarioAtica!,
      ID_OrdenDistribucion: idOrdenDistribucion,
    },
  };

  const response = await httpClient.post<ApiWrapper<RecepcionDetalleResponse>>(
    ENDPOINTS.api,
    body,
  );

  const result = response.data.d;

  if (!isSuccessResponse(result)) {
    throw new ApiBusinessError((result as any).Message);
  }

  return result;
};