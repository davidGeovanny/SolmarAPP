import httpClient from '@/shared/services/httpClient';
import useAuthStore from '@/features/auth/store/authStore';
import { ENDPOINTS } from '@/shared/constants/endpoints';
import { isSuccessResponse } from '@/shared/types/api';
import { ApiBusinessError } from '@/shared/services/httpClient';
import type { ApiWrapper, ApiRequest, ApiParams } from '@/shared/types/api';
import type { ProductosDistribucionResponse } from '../types';

export const getProductosDistribucion = async (
  idOrdenDistribucion: number,
): Promise<ProductosDistribucionResponse> => {
  const { ssid, ID_UsuarioAtica } = useAuthStore.getState();

  const body: ApiRequest<ApiParams> = {
    Params: {
      Accion:               'ObtenerOrdenesDistribucionProductos',
      SSID:                 ssid!,
      ID_Usuario:           ID_UsuarioAtica!,
      ID_OrdenDistribucion: idOrdenDistribucion,
    },
  };

  const response = await httpClient.post<ApiWrapper<ProductosDistribucionResponse>>(
    ENDPOINTS.api,
    body,
  );

  const result = response.data.d;
  if (!isSuccessResponse(result)) throw new ApiBusinessError((result as any).Message);
  return result;
};