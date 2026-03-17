//-> Este bloque se encuentra en todas las peticiones
export interface Dispositivo {
  Identificador: string;
  Descripcion:   string;
  Tipo:          number;
  UUID:          string;
}

//-> Estructura mínima que todas las peticiones deben cumplir
export interface ParamsBase {
  Dispositivo?: Dispositivo;
  Accion:       string;
}

//-> Para /auth (no lleva SSDI)
export interface AuthParams extends ParamsBase {
  Usuario:  string;
  Password: string;
}

//-> Para /api (lleva SSID obligatorio)
export interface ApiParams extends ParamsBase {
  SSID: string;
  [key: string]: unknown;
}

//-> Toda petición a /api tiene la forma: { Params: { ... } }
//-> Para Request
export interface ApiRequest<T extends ParamsBase> {
  Params: T;
}

//-> Para Response
//-> El servidor suele devolver la respuesta de forma: { d: { ... } }
//-> NOTA: Success puede llegar como booleano o como string
export interface ApiWrapper<T> {
  d: T;
}

//-> Respuesta base de error
export interface ApiErrorResponse {
  Success: false | 'false';
  Message: string;
}

//-> Login exitoso
export interface LoginSuccessResponse {
  Success:                    true;
  SSID:                       string;
  NombreUsuario:              string;
  ID_UsuarioAtica:            number;
  ID_EmpresaSucursal:         number;
  ID_UsuarioAplicacionMovil:  number;
}

export type LoginResponse = LoginSuccessResponse | ApiErrorResponse;

//-> Helpers para tipado
//-> Devuelve true si la respuesta fue exitosa
export const isSuccessResponse = <T extends { Success: boolean | string }> (
  response: T,
): response is T & { Success: true } =>
  response.Success === true || response.Success === 'true';

//-> Devuelve true si la respuesta fue un error (con mensaje)
export const isErrorResponse = (
  response: unknown,
): response is ApiErrorResponse =>
  typeof response === 'object' &&
  response !== null &&
  'Message' in response &&
  ('Success' in response
    ? (response as ApiErrorResponse).Success === false ||
      (response as ApiErrorResponse).Success === 'false'
    : false
  );

//-> EMPRESAS
export interface EmpresaDTO {
  ID_Empresa:     string;
  NombreEmpresa:  string;
}

export interface EmpresasResponse {
  Count:    number;
  Data:     EmpresaDTO[];
  Success:  true;
}

//-> SUCURSALES
export interface SucursalDTO {
  ID_Empresa:             string;
  ID_EmpresaSucursal:     string;
  NombreEmpresaSucursal:  string;
  ID_Almacen:             string;
  NombreAlmacen:          string;
}

export interface SucursalesResponse {
  Count:    number;
  Data:     SucursalDTO[];
  Success:  true;
}