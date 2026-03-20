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

  // const response: ApiWrapper<DistribucionListResponse> = {
  //     "d": {
  //         "Count": 0,
  //         "Data": [
  //             {
  //                 "ID_OrdenDistribucion": "34754",
  //                 "ID_RecepcionDistribucion": "0",
  //                 "Fecha": "18/03/2026 06:00 AM",
  //                 "Folio": "DIST-CED-32106",
  //                 "FolioRecepcion": "0",
  //                 "Status": "1"
  //             },
  //             {
  //                 "ID_OrdenDistribucion": "34753",
  //                 "ID_RecepcionDistribucion": "0",
  //                 "Fecha": "18/03/2026 06:00 AM",
  //                 "Folio": "DIST-CED-32105",
  //                 "FolioRecepcion": "0",
  //                 "Status": "1"
  //             }
  //         ],
  //         "Success": true
  //     }
  // };

  // const result = response.d;

  if (!isSuccessResponse(result)) {
    throw new ApiBusinessError((result as any).Message);
  }

  return result;
};