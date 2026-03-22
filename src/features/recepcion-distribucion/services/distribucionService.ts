import httpClient from '@/shared/services/httpClient';
import useAuthStore from '@/features/auth/store/authStore';
import { ENDPOINTS } from '@/shared/constants/endpoints';
import { isSuccessResponse } from '@/shared/types/api';
import { ApiBusinessError } from '@/shared/services/httpClient';
import type { ApiWrapper, ApiRequest, ApiParams } from '@/shared/types/api';
import type { DistribucionFiltros, DistribucionListResponse, DistribucionEstatus } from '../types';

const estatusToNumber = (estatus: DistribucionEstatus): number =>
  estatus === 'Pendientes' ? 0 : 1;

export const getDistribuciones = async (
  filtros: DistribucionFiltros,
): Promise<DistribucionListResponse> => {
  const { ssid, ID_UsuarioAtica } = useAuthStore.getState();
  const sesion = useAuthStore.getState().sesion;

  const body: ApiRequest<ApiParams> = {
    Params: {
      Accion:             'ObtenerOrdenesDistribucion',
      SSID:               ssid!,
      ID_Usuario:         ID_UsuarioAtica!,
      ID_EmpresaSucursal: sesion?.ID_EmpresaSucursal,
      Status:             estatusToNumber(filtros.estatus),
      Mes:                filtros.mes?.id,
      Anio:               Number(filtros.anio),
    },
  };

  const response = await httpClient.post<ApiWrapper<DistribucionListResponse>>(
    ENDPOINTS.api,
    body,
  );

  const result = response.data.d;

  if (!isSuccessResponse(result)) {
    throw new ApiBusinessError((result as any).Message);
  }

  return result;
};