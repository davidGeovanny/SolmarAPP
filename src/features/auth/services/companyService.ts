import httpClient from '@/shared/services/httpClient';
import useAuthStore from '@/features/auth/store/authStore';
import { ENDPOINTS } from '@/shared/constants/endpoints';
import { isSuccessResponse } from '@/shared/types/api';
import { ApiBusinessError } from '@/shared/services/httpClient';
import type {
  ApiParams,
  ApiRequest,
  ApiWrapper,
  EmpresasResponse,
  SucursalesResponse,
} from '@/shared/types/api';

// El bloque Dispositivo lo inyecta automáticamente el interceptor de httpClient.

export const getEmpresas = async (): Promise<EmpresasResponse> => {
  const { ssid, ID_UsuarioAtica } = useAuthStore.getState();

  const body: ApiRequest<ApiParams> = {
    Params: {
      Accion:     'ObtenerEmpresas',
      SSID:       ssid!,
      ID_Usuario: ID_UsuarioAtica!,
    },
  };

  const response = await httpClient.post<ApiWrapper<EmpresasResponse>>(
    ENDPOINTS.api,
    body,
  );

  const result = response.data.d;

  if (!isSuccessResponse(result)) {
    throw new ApiBusinessError((result as any).Message);
  }

  return result;
};

export const getSucursales = async (idEmpresa: number): Promise<SucursalesResponse> => {
  const { ssid, ID_UsuarioAtica } = useAuthStore.getState();

  const body: ApiRequest<ApiParams> = {
    Params: {
      Accion:     'ObtenerEmpresasSucursales',
      SSID:       ssid!,
      ID_Usuario: ID_UsuarioAtica!,
      ID_Empresa: idEmpresa,
    },
  };

  const response = await httpClient.post<ApiWrapper<SucursalesResponse>>(
    ENDPOINTS.api,
    body,
  );

  const result = response.data.d;

  if (!isSuccessResponse(result)) {
    throw new ApiBusinessError((result as any).Message);
  }

  return result;
};