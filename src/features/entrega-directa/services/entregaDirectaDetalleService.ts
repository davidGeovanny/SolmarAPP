import httpClient from '@/shared/services/httpClient';
import useAuthStore from '@/features/auth/store/authStore';
import { ENDPOINTS } from '@/shared/constants/endpoints';
import { isSuccessResponse } from '@/shared/types/api';
import { ApiBusinessError } from '@/shared/services/httpClient';
import type { ApiWrapper, ApiRequest, ApiParams } from '@/shared/types/api';
import type { EntregaDirectaDetalleResponse } from '../types';

export const getEntregaDirectaDetalle = async (
  idOrdenCompra: number,
): Promise<EntregaDirectaDetalleResponse> => {
  const { ssid, ID_UsuarioAtica } = useAuthStore.getState();

  const body: ApiRequest<ApiParams> = {
    Params: {
      Accion:        'ObtenerRecepcionesEntregasDirectas',
      SSID:          ssid!,
      ID_Usuario:    ID_UsuarioAtica!,
      ID_OrdenCompra: idOrdenCompra,
    },
  };

  const response = await httpClient.post<ApiWrapper<EntregaDirectaDetalleResponse>>(
    ENDPOINTS.api,
    body,
  );

  const result = response.data.d;
  if (!isSuccessResponse(result)) throw new ApiBusinessError((result as any).Message);
  return result;
};