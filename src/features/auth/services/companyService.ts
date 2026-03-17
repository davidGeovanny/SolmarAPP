import httpClient from '@/shared/services/httpClient';
import useAuthStore from '../store/authStore';
import { ENDPOINTS } from '@/shared/constants/endpoints';
import type {
  ApiParams,
  ApiRequest,
  ApiWrapper,
  EmpresasResponse,
  SucursalesResponse
} from '@/shared/types/api';

export const getEmpresas = async (): Promise<EmpresasResponse> => {
  const { ssid, ID_UsuarioAtica } = useAuthStore.getState();

  const body: ApiRequest<ApiParams> = {
    Params: {
      Accion:     'ObtenerEmpresas',
      SSID:       ssid!,
      ID_Usuario: ID_UsuarioAtica
    },
  };

  const response = await httpClient.post<ApiWrapper<EmpresasResponse>>(
    ENDPOINTS.api,
    body,
  );

  return response.data.d;
}

export const getSucursales = async (ID_Empresa: number): Promise<SucursalesResponse> => {
  const { ssid, ID_UsuarioAtica } = useAuthStore.getState();

  const body: ApiRequest<ApiParams> = {
    Params: {
      Accion:     'ObtenerEmpresasSucursales',
      SSID:       ssid!,
      ID_Usuario: ID_UsuarioAtica,
      ID_Empresa,
    },
  };

  const response = await httpClient.post<ApiWrapper<SucursalesResponse>>(
    ENDPOINTS.api,
    body,
  );

  return response.data.d;
};