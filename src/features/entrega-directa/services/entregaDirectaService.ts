import httpClient from '@/shared/services/httpClient';
import useAuthStore from '@/features/auth/store/authStore';
import { ENDPOINTS } from '@/shared/constants/endpoints';
import { isSuccessResponse } from '@/shared/types/api';
import { ApiBusinessError } from '@/shared/services/httpClient';
import type { ApiWrapper, ApiRequest, ApiParams } from '@/shared/types/api';
import type { EntregaDirectaFiltros, EntregaDirectaListResponse } from '../types';

const estatusToNumber = (estatus: string): number =>
  estatus === 'Pendientes' ? 0 : 1;

export const getEntregasDirectas = async (
  filtros: EntregaDirectaFiltros,
): Promise<EntregaDirectaListResponse> => {
  const { ssid, ID_UsuarioAtica } = useAuthStore.getState();
  const sesion = useAuthStore.getState().sesion;

  const body: ApiRequest<ApiParams> = {
    Params: {
      Accion:     'ObtenerEntregasDirectas',
      SSID:       ssid!,
      ID_Usuario: ID_UsuarioAtica!,
      ID_Almacen: sesion?.ID_Almacen,
      Status:     estatusToNumber(filtros.estatus),
      Mes:        filtros.mes?.id,
      Anio:       Number(filtros.anio),
    },
  };

  const response = await httpClient.post<ApiWrapper<EntregaDirectaListResponse>>(
    ENDPOINTS.api,
    body,
  );

  const result = response.data.d;
  if (!isSuccessResponse(result)) throw new ApiBusinessError((result as any).Message);
  return result;
};