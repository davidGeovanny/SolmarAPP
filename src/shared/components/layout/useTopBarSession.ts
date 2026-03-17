import { useState, useCallback, useEffect, useRef } from 'react';
import { getEmpresas, getSucursales } from '@/features/auth/services/companyService';
import useAuthStore from '@/features/auth/store/authStore';
import toast from '@/shared/utils/toast';
import { NetworkError } from '@/shared/services/httpClient';
import type { Empresa, Sucursal } from '@/features/auth/hooks/useCompanySelect';

export const useTopBarSession = () => {
  const sesion    = useAuthStore(s => s.sesion);
  const setSesion = useAuthStore(s => s.setSesion);

  const sesionRef = useRef(sesion);
  useEffect(() => {
    sesionRef.current = sesion;
  }, [sesion]);

  const [empresas,          setEmpresas]          = useState<Empresa[]>([]);
  const [sucursales,        setSucursales]        = useState<Sucursal[]>([]);
  const [empresaSelected,   setEmpresaSelected]   = useState<Empresa | null>(null);
  const [sucursalSelected,  setSucursalSelected]  = useState<Sucursal | null>(null);
  const [loadingEmpresas,   setLoadingEmpresas]   = useState(false);
  const [loadingSucursales, setLoadingSucursales] = useState(false);

  const fetchSucursales = useCallback(async (ID_Empresa: number) => {
    try {
      setLoadingSucursales(true);
      const res = await getSucursales(ID_Empresa);
      const mapped: Sucursal[] = res.Data.map(s => ({
        ID_EmpresaSucursal:    Number(s.ID_EmpresaSucursal),
        ID_Empresa:            Number(s.ID_Empresa),
        NombreEmpresaSucursal: s.NombreEmpresaSucursal,
        ID_Almacen:            Number(s.ID_Almacen),
        NombreAlmacen:         s.NombreAlmacen || 'Sin almacén asignado',
      }));
      setSucursales(mapped);

      // Restaurar selección usando ref — siempre tiene el valor actual
      const currentSesion = sesionRef.current;
      if (currentSesion) {
        const current = mapped.find(
          s => s.ID_EmpresaSucursal === currentSesion.ID_EmpresaSucursal,
        ) ?? null;
        setSucursalSelected(current);
      }
    } catch (err) {
      if (err instanceof NetworkError) {
        toast.error({ title: 'Sin conexión', message: 'No se pudieron cargar las sucursales' });
      }
    } finally {
      setLoadingSucursales(false);
    }
  }, []); // sin dependencias — usa sesionRef internamente

  // ── Cargar empresas ───────────────────────────────────────────────────
  const fetchEmpresas = useCallback(async () => {
    try {
      setLoadingEmpresas(true);
      const res = await getEmpresas();
      const mapped: Empresa[] = res.Data.map(e => ({
        ID_Empresa:  Number(e.ID_Empresa),
        Descripcion: e.NombreEmpresa,
      }));
      setEmpresas(mapped);

      // Restaurar empresa seleccionada y luego cargar sus sucursales
      const currentSesion = sesionRef.current;
      if (currentSesion) {
        const current = mapped.find(e => e.ID_Empresa === currentSesion.ID_Empresa) ?? null;
        setEmpresaSelected(current);
        // Cargar sucursales aquí directamente — no depender del useEffect
        if (current) await fetchSucursales(current.ID_Empresa);
      }
    } catch (err) {
      if (err instanceof NetworkError) {
        toast.error({ title: 'Sin conexión', message: 'No se pudieron cargar las empresas' });
      }
    } finally {
      setLoadingEmpresas(false);
    }
  }, [fetchSucursales]);

  // ── Al cambiar empresa → recargar sucursales ──────────────────────────
  const handleEmpresaChange = useCallback((empresa: Empresa | null) => {
    if (!empresa) return;
    setEmpresaSelected(empresa);
    setSucursales([]);
    setSucursalSelected(null);
    fetchSucursales(empresa.ID_Empresa);
  }, [fetchSucursales]);

  // ── Al cambiar sucursal → actualizar sesion en el store ───────────────
  const handleSucursalChange = useCallback((sucursal: Sucursal | null) => {
    if (!sucursal || !empresaSelected) return;
    setSucursalSelected(sucursal);
    setSesion({
      ID_Empresa:             empresaSelected.ID_Empresa,
      ID_EmpresaSucursal:     sucursal.ID_EmpresaSucursal,
      NombreEmpresaSucursal: sucursal.NombreEmpresaSucursal,
      ID_Almacen:             sucursal.ID_Almacen,
      NombreAlmacen:         sucursal.NombreAlmacen,
    });
    toast.success({ title: 'Sucursal actualizada', message: sucursal.NombreEmpresaSucursal });
  }, [empresaSelected, setSesion]);

  // Cargar al montar — solo fetchEmpresas, que internamente carga sucursales
  useEffect(() => {
    fetchEmpresas();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    empresas,
    sucursales,
    empresaSelected,
    sucursalSelected,
    loadingEmpresas,
    loadingSucursales,
    handleEmpresaChange,
    handleSucursalChange,
    fetchEmpresas,
    refreshSucursales: () => empresaSelected && fetchSucursales(empresaSelected.ID_Empresa),
  };
};