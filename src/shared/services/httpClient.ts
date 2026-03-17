import axios, {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import { BASE_URL, SERVER_MESSAGES } from '../constants/endpoints';
import type { ApiWrapper, ApiErrorResponse, Dispositivo } from '../types/api';

export class ApiBusinessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiBusinessError';
  }
}

export class SessionExpiredError extends Error {
  constructor() {
    super('La sesión ha expirado. Por favor inicie sesión nuevamente.');
    this.name = 'SessionExpiredError';
  }
}

export class NetworkError extends Error {
  constructor() {
    super('No se pudo conectar con el servidor. Verifica tu conexión.');
    this.name = 'NetworkError';
  }
}

export class UnexpectedResponseError extends Error {
  constructor() {
    super('El servidor respondió en un formato inesperado.');
    this.name = 'UnexpectedResponseError';
  }
}

const getDispositivo = (): Dispositivo => ({
  Identificador: 'SOLAPP',
  Descripcion: 'APP de SOLMAR',
  Tipo: 3,
  UUID: '8FC07990-66E2-4796-9A33-C9E83EF405E5', //-> Reemplazar con UUID real del dispositivo
});

const httpClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

let onSessionExpired: (() => void) | null = null;

export const registerSessionExpiredHandler = (handler: () => void) => {
  onSessionExpired = handler;
};

httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (config.data && typeof config.data === 'object' && 'Params' in config.data) {
      config.data = {
        ...config.data,
        Params: {
          ...config.data.Params,
          Dispositivo: getDispositivo(),
        }
      };
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

httpClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const data = response.data;

    //-> El servidor responde de la siguiente forma: { d: { ... } }
    //   Si no responde de esa forma, es que ocurrió un error no manejado
    if (!data || typeof data !== 'object' || !('d' in data)) {
      throw new UnexpectedResponseError();
    }

    const inner = (data as ApiWrapper<unknown>).d;

    //-> Detectar si el SSID tiene los permisos necesarios (si es válido)
    if (
      inner &&
      typeof inner === 'object' &&
      'Message' in inner &&
      (inner as ApiErrorResponse).Message === SERVER_MESSAGES.permissionDenied
    ) {
      onSessionExpired?.();
      throw new SessionExpiredError();
    }

    return response;
  },
  (error: AxiosError) => {
    //-> Sin respuesta por parte del servidor (puede ser timeout, sin conexión, URL no válida, etc.)
    if (!error.response) {
      throw new NetworkError();
    }

    //-> Error HTTP (4xx, 5xx)
    const contentType = error.response.headers?.['content-type'] ?? '';
    if (contentType.includes('text/html')) {
      throw new UnexpectedResponseError();
    }

    throw error;
  }
);

export default httpClient;