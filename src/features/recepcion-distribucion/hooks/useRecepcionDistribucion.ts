import { useState, useCallback, useRef } from 'react';
import { getDistribuciones } from '../services/distribucionService';
import { ApiBusinessError, NetworkError } from '@/shared/services/httpClient';
import toast from '@/shared/utils/toast';
import type {
  DistribucionItem,
  DistribucionFiltros,
  DistribucionEstatus,
  FolioTipoOption,
} from '../types';
import { MESES, FOLIO_OPCIONES } from '../types';

const currentDate = new Date();

const defaultFiltros = (): DistribucionFiltros => ({
  estatus:    'Pendientes',
  anio:       String(currentDate.getFullYear()),
  mes:        MESES[currentDate.getMonth()],
  folioTipo:  FOLIO_OPCIONES[0],
  folioValor: '',
});

export const useRecepcionDistribucion = () => {
  // Todos los registros que vienen del servidor
  const [allItems,  setAllItems]  = useState<DistribucionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filtros,   setFiltros]   = useState<DistribucionFiltros>(defaultFiltros);

  // Ref para debounce del switch
  const switchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Buscar al servidor ─────────────────────────────────────────────────
  const buscar = useCallback(async (filtrosActuales: DistribucionFiltros) => {
    if (!filtrosActuales.anio || !filtrosActuales.mes) {
      toast.warning({ title: 'Filtros requeridos', message: 'Selecciona año y mes para buscar' });
      return;
    }
    try {
      setIsLoading(true);
      console.log({ filtrosActuales });
      const res = await getDistribuciones(filtrosActuales);
      setAllItems(res.Data ?? []);
    } catch (err) {
      console.log({err});
      if (err instanceof ApiBusinessError) {
        toast.error({ title: 'Error', message: err.message });
      } else if (err instanceof NetworkError) {
        toast.error({ title: 'Sin conexión', message: 'Verifica tu conexión e intenta de nuevo' });
      }
      setAllItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Filtrado local por folio ───────────────────────────────────────────
  // Filtra allItems según folioTipo y folioValor sin llamar al servidor
  const items = (() => {
    const valor = filtros.folioValor.trim().toLowerCase();
    if (!valor || !filtros.folioTipo) return allItems;

    return allItems.filter(item => {
      const campo = filtros.folioTipo!.id === 'Folio'
        ? item.Folio
        : item.FolioRecepcion;
      return campo.toLowerCase().includes(valor);
    });
  })();

  // ── Cambio de estatus — con debounce ──────────────────────────────────
  const handleEstatusChange = useCallback((estatus: DistribucionEstatus) => {
    const nuevos: DistribucionFiltros = {
      ...filtros,
      estatus,
      // Al volver a Pendientes, forzar folioTipo a FolioDistribucion
      folioTipo: estatus === 'Pendientes' ? FOLIO_OPCIONES[0] : filtros.folioTipo,
    };
    setFiltros(nuevos);

    // Debounce de 400ms para evitar llamadas rápidas consecutivas
    if (switchDebounceRef.current) clearTimeout(switchDebounceRef.current);
    switchDebounceRef.current = setTimeout(() => {
      buscar(nuevos);
    }, 400);
  }, [filtros, buscar]);

  // ── Cambios de filtros locales ─────────────────────────────────────────
  const handleAnioChange = useCallback((anio: string) => {
    setFiltros(f => ({ ...f, anio }));
  }, []);

  const handleMesChange = useCallback((mes: { id: number; nombre: string } | null) => {
    setFiltros(f => ({ ...f, mes }));
  }, []);

  const handleFolioTipoChange = useCallback((folioTipo: FolioTipoOption | null) => {
    setFiltros(f => ({ ...f, folioTipo }));
  }, []);

  const handleFolioValorChange = useCallback((folioValor: string) => {
    setFiltros(f => ({ ...f, folioValor }));
  }, []);

  // ── Aplicar — llama al servidor ────────────────────────────────────────
  const aplicarFiltros = useCallback(() => {
    buscar(filtros);
  }, [filtros, buscar]);

  return {
    items,           // registros ya filtrados localmente
    isLoading,
    filtros,
    handleEstatusChange,
    handleAnioChange,
    handleMesChange,
    handleFolioTipoChange,
    handleFolioValorChange,
    aplicarFiltros,
  };
};