import { useState, useCallback, useEffect } from 'react';
import { getEmpresas, getSucursales } from '../services/companyService';
import useAuthStore from '../store/authStore';
import toast from '@/shared/utils/toast';
import { ApiBusinessError, NetworkError } from '@/shared/services/httpClient';

// Tipos temporales — reemplazar con los de tu API
export interface Empresa {
  ID_Empresa:   number;
  Descripcion:  string;
}

export interface Sucursal {
  ID_EmpresaSucursal:     number;
  ID_Empresa:             number;
  NombreEmpresaSucursal:  string;
  ID_Almacen:             number;
  NombreAlmacen:          string;
}

export const useCompanySelect = () => {
  const setSesion = useAuthStore(store => store.setSesion);

  const [empresas,        setEmpresas]          = useState<Empresa[]>([]);
  const [sucursales,      setSucursales]        = useState<Sucursal[]>([]);
  const [empresaSelected, setEmpresaSelected]   = useState<Empresa | null>(null);
  const [sucursalSelected,setSucursalSelected]  = useState<Sucursal | null>(null);
  const [loadingEmpresas,  setLoadingEmpresas]  = useState(false);
  const [loadingSucursales,setLoadingSucursales]= useState(false);
  const [isSubmitting,    setIsSubmitting]      = useState(false);

  //-> Cargar empresas
  const fetchEmpresas = useCallback(async () => {
    try {
      setLoadingEmpresas(true);
      setEmpresaSelected(null);
      setSucursalSelected(null);
      setSucursales([]);

      const resp = await getEmpresas();
      setEmpresas(
        resp.Data.map(e => ({
          ID_Empresa:   Number(e.ID_Empresa),
          Descripcion:  e.NombreEmpresa,
        })),
      );
    } catch (err) {
      if (err instanceof ApiBusinessError) {
        toast.error({ title: 'Error', message: err.message });
      } else if (err instanceof NetworkError) {
        toast.error({ title: 'Sin Conexión', message: 'Verifica tu conexión a internet' });
      } else {
        toast.error({ title: 'Error', message: 'No se pudieron cargar las empresas' });
      }
    } finally {
      setLoadingEmpresas(false);
    }
  }, []);

  //-> Cargar sucursales
  const fetchSucursales = useCallback(async (ID_Empresa: number) => {
    try {
      setLoadingSucursales(true);
      setSucursalSelected(null);

      const resp = await getSucursales(ID_Empresa);
      setSucursales(
        resp.Data.map(s => ({
          ID_EmpresaSucursal:     Number(s.ID_EmpresaSucursal),
          ID_Empresa:             Number(s.ID_Empresa),
          NombreEmpresaSucursal:  s.NombreEmpresaSucursal,
          ID_Almacen:             Number(s.ID_Almacen),
          NombreAlmacen:          s.NombreAlmacen || 'Sin almacén asignado',
        })),
      );
    } catch (err) {
      if (err instanceof ApiBusinessError) {
        toast.error({ title: 'Error', message: err.message });
      } else if (err instanceof NetworkError) {
        toast.error({ title: 'Sin Conexión', message: 'Verifica tu conexión a internet' });
      } else {
        toast.error({ title: 'Error', message: 'No se pudieron cargar las sucursales' });
      }
    } finally {
      setLoadingSucursales(false);
    }
  }, []);

  //-> Refresh de sucursales
  const refreshSucursales = useCallback(() => {
    if (empresaSelected) fetchSucursales(empresaSelected.ID_Empresa);
  }, [empresaSelected, fetchSucursales]);

  //-> Al cambiar la empresa, recargar sucursales
  const handleEmpresaChange = useCallback((empresa: Empresa | null) => {
    setEmpresaSelected(empresa);
    setSucursales([]);
    setSucursalSelected(null);

    if (empresa) fetchSucursales(empresa.ID_Empresa);
  }, [fetchSucursales]);

  //-> Cargar empresas al montar el hook
  useEffect(() => {
    fetchEmpresas();
  }, [fetchEmpresas]);

  const onSubmit = useCallback(async (onSuccess: () => void) => {
    if (!empresaSelected || !sucursalSelected) return;
    try {
      setIsSubmitting(true);
      setSesion({
        ID_Empresa:             empresaSelected.ID_Empresa,
        ID_EmpresaSucursal:     sucursalSelected.ID_EmpresaSucursal,
        NombreEmpresaSucursal:  sucursalSelected.NombreEmpresaSucursal,
        ID_Almacen:             sucursalSelected.ID_Almacen,
        NombreAlmacen:          sucursalSelected.NombreAlmacen,
      });
      onSuccess();
    } finally {
      setIsSubmitting(false);
    }
  }, [empresaSelected, sucursalSelected, setSesion]);

  const canSubmit = !!empresaSelected && !!sucursalSelected;

  return {
    empresas,
    sucursales,

    empresaSelected,
    sucursalSelected,
    setEmpresaSelected: handleEmpresaChange,
    setSucursalSelected,

    loadingEmpresas,
    loadingSucursales,
    isSubmitting,

    canSubmit,
    fetchEmpresas,
    fetchSucursales,
    refreshSucursales,
    onSubmit,
  };
};