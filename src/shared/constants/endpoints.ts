// export const BASE_URL = 'https://qaservicios.atica.mx/ServicesApplications.asmx';
export const BASE_URL = 'https://servicioserp.solmar.com/ServicesApplications.asmx';

export const ENDPOINTS = {
  auth: `${ BASE_URL }/auth`,
  api: `${ BASE_URL }/api`,
} as const;

//-> Mensajes de error que tienen que coincidir exactamente para ser detectados
export const SERVER_MESSAGES = {
  permissionDenied: 'Permisos denegados',
} as const;