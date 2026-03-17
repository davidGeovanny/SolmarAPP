import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerSessionExpiredHandler } from '@/shared/services/httpClient';
import type { LoginSuccessResponse } from '@/shared/types/api';

export interface SesionCompleta {
  ID_Empresa:             number;
  ID_EmpresaSucursal:     number;
  NombreEmpresaSucursal:  string;
  ID_Almacen:             number;
  NombreAlmacen:          string;
}

interface AuthState {
  //-> 1. Credenciales de sesión
  ssid:               string | null;
  nombreUsuario:      string | null;
  ID_UsuarioAtica:    number | null;

  //-> 2. Datos de empresa, sucursal y almacén
  sesion: SesionCompleta | null;

  //-> Estado de autenticación
  isCredentialed:  boolean; //-> indica si el usuario ha pasado la etapa de credenciales (login exitoso)
  isAuthenticated: boolean; //-> indica si el usuario ha completado todo el proceso de autenticación (login + selección de empresa/sucursal)

  //-> Acciones
  setCredentials:     (data: LoginSuccessResponse) => void;
  setSesion:          (data: SesionCompleta) => void;
  clearSession:       () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ssid:             null,
      nombreUsuario:    null,
      ID_UsuarioAtica:  null,
      sesion:           null,
      isCredentialed:   false,
      isAuthenticated:  false,

      setCredentials: (data: LoginSuccessResponse) =>
        set({
          ssid:             data.SSID,
          nombreUsuario:    data.NombreUsuario,
          ID_UsuarioAtica:  data.ID_UsuarioAtica,
          isCredentialed:   true,
          isAuthenticated:  false,
        }),

      setSesion: (data: SesionCompleta) =>
        set({
          sesion:           data,
          isAuthenticated:  true,
        }),

      clearSession: () =>
        set({
          ssid:             null,
          nombreUsuario:    null,
          ID_UsuarioAtica:  null,
          sesion:           null,
          isCredentialed:   false,
          isAuthenticated:  false,
        }),
    }),
    {
      name:     'auth-storage',
      storage:  createJSONStorage(() => AsyncStorage),

      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isCredentialed = !!state.ssid;
          state.isAuthenticated = !!state.ssid && !!state.sesion;
        }
      }
    },
  ),
);

registerSessionExpiredHandler(() => {
  useAuthStore.getState().clearSession();
});

export default useAuthStore;