// export const BASE_URL = 'https://qaservicios.erp.mx/ServicesApplications.asmx';
export const BASE_URL = 'https://servicioserp.solmar.com/ServicesApplications.asmx';

export const ENDPOINTS = {
  auth:   `${BASE_URL}/auth`,
  api:    `${BASE_URL}/api`,
  report: `${BASE_URL}/Report`,
} as const;

// Mensajes de error del servidor que tienen tratamiento especial
export const SERVER_MESSAGES = {
  permissionDenied: 'Permisos denegados',
} as const;