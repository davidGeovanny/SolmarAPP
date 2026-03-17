import httpClient from '@/shared/services/httpClient';
import { ENDPOINTS } from '@/shared/constants/endpoints';
import { isSuccessResponse } from '@/shared/types/api';
import { ApiBusinessError } from '@/shared/services/httpClient';
import type {
  ApiWrapper,
  ApiRequest,
  AuthParams,
  LoginResponse,
  LoginSuccessResponse,
} from '@/shared/types/api';

export interface LoginCredentials {
  username: string;
  password: string;
}

const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginSuccessResponse> => {
    const body: ApiRequest<AuthParams> = {
      Params: {
        Accion:   'Login',
        Usuario:  credentials.username,
        Password: credentials.password,
      },
    };

    const response = await httpClient.post<ApiWrapper<LoginResponse>>(
      ENDPOINTS.auth,
      body,
    );

    const result = response.data.d;

    if (!isSuccessResponse(result)) {
      throw new ApiBusinessError(result.Message);
    }

    return result as LoginSuccessResponse;
  }
};

export default authService;