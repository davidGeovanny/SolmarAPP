import httpClient from '@/shared/services/httpClient';
import useAuthStore from '@/features/auth/store/authStore';
import { ENDPOINTS } from '@/shared/constants/endpoints';
import { isSuccessResponse } from '@/shared/types/api';
import { ApiBusinessError } from '@/shared/services/httpClient';
import type { ApiWrapper, ApiRequest, ApiParams } from '@/shared/types/api';
import type { EntregaDirectaProductosFormResponse } from '../types';

export const getEntregaDirectaProductos = async (
  idOrdenCompra: number,
): Promise<EntregaDirectaProductosFormResponse> => {
  const { ssid, ID_UsuarioAtica } = useAuthStore.getState();

  const body: ApiRequest<ApiParams> = {
    Params: {
      Accion:        'ObtenerEntregasDirectasProductos',
      SSID:          ssid!,
      ID_Usuario:    ID_UsuarioAtica!,
      ID_OrdenCompra: idOrdenCompra,
    },
  };

  const response = await httpClient.post<ApiWrapper<EntregaDirectaProductosFormResponse>>(
    ENDPOINTS.api,
    body,
  );

  const result = response.data.d;
  if (!isSuccessResponse(result)) throw new ApiBusinessError((result as any).Message);
  return result;
};