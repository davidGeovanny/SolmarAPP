import { useState, useCallback, useRef, useMemo } from 'react';
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

const PAGE_SIZE = 20;

const currentDate = new Date();

const defaultFiltros = (): DistribucionFiltros => ({
  estatus:    'Pendientes',
  anio:       String(currentDate.getFullYear()),
  mes:        MESES[currentDate.getMonth()],
  folioTipo:  FOLIO_OPCIONES[0],
  folioValor: '',
});

export const useRecepcionDistribucion = () => {
  const [allItems,     setAllItems]     = useState<DistribucionItem[]>([]);
  const [isLoading,    setIsLoading]    = useState(false);
  const [filtros,      setFiltros]      = useState<DistribucionFiltros>(defaultFiltros);
  const [currentPage,  setCurrentPage]  = useState(1);

  const switchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Buscar al servidor ─────────────────────────────────────────────────
  const buscar = useCallback(async (filtrosActuales: DistribucionFiltros) => {
    if (!filtrosActuales.anio || !filtrosActuales.mes) {
      toast.warning({ title: 'Filtros requeridos', message: 'Selecciona año y mes para buscar' });
      return;
    }
    try {
      setIsLoading(true);
      const res = await getDistribuciones(filtrosActuales);
      setAllItems(res.Data ?? []);
      setCurrentPage(1); // siempre volver a página 1 al cargar nuevos resultados
    } catch (err) {
      if (err instanceof ApiBusinessError) {
        toast.error({ title: 'Error', message: err.message });
      } else if (err instanceof NetworkError) {
        toast.error({ title: 'Sin conexión', message: 'Verifica tu conexión e intenta de nuevo' });
      }
      setAllItems([]);
      setCurrentPage(1);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Filtrado local por folio ───────────────────────────────────────────
  const filteredItems = useMemo(() => {
    const valor = filtros.folioValor.trim().toLowerCase();
    if (!valor || !filtros.folioTipo) return allItems;
    return allItems.filter(item => {
      const campo = filtros.folioTipo!.id === 'Folio'
        ? item.Folio
        : item.FolioRecepcion;
      return campo.toLowerCase().includes(valor);
    });
  }, [allItems, filtros.folioValor, filtros.folioTipo]);

  // ── Paginado local ────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));

  const items = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, currentPage]);

  const goToPage = useCallback((page: number) => {
    const clamped = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(clamped);
  }, [totalPages]);

  const nextPage = useCallback(() => {
    setCurrentPage(p => Math.min(p + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage(p => Math.max(p - 1, 1));
  }, []);

  // ── Cambio de estatus — con debounce ──────────────────────────────────
  const handleEstatusChange = useCallback((estatus: DistribucionEstatus) => {
    const nuevos: DistribucionFiltros = {
      ...filtros,
      estatus,
      folioTipo: estatus === 'Pendientes' ? FOLIO_OPCIONES[0] : filtros.folioTipo,
    };
    setFiltros(nuevos);
    if (switchDebounceRef.current) clearTimeout(switchDebounceRef.current);
    switchDebounceRef.current = setTimeout(() => { buscar(nuevos); }, 400);
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
    items,
    isLoading,
    filtros,
    // Paginado
    currentPage,
    totalPages,
    totalItems: filteredItems.length,
    goToPage,
    nextPage,
    prevPage,
    // Handlers filtros
    handleEstatusChange,
    handleAnioChange,
    handleMesChange,
    handleFolioTipoChange,
    handleFolioValorChange,
    aplicarFiltros,
  };
};