import { useState, useCallback, useMemo, useRef } from 'react';
import { getEntregasDirectas } from '../services/entregaDirectaService';
import { ApiBusinessError, NetworkError } from '@/shared/services/httpClient';
import toast from '@/shared/utils/toast';
import { MESES } from '@/features/recepcion-distribucion/types';
import { FOLIO_OPCIONES_ENTREGA_DIRECTA } from '../types';
import type { EntregaDirectaItem, EntregaDirectaFiltros } from '../types';
import type { DistribucionEstatus } from '@/features/recepcion-distribucion/types';

const PAGE_SIZE   = 20;
const currentDate = new Date();

const defaultFiltros = (): EntregaDirectaFiltros => ({
  estatus:    'Pendientes',
  anio:       String(currentDate.getFullYear()),
  mes:        MESES[currentDate.getMonth()],
  folioTipo:  FOLIO_OPCIONES_ENTREGA_DIRECTA[0],
  folioValor: '',
});

export const useEntregaDirecta = () => {
  const [allItems,    setAllItems]    = useState<EntregaDirectaItem[]>([]);
  const [isLoading,   setIsLoading]   = useState(false);
  const [filtros,     setFiltros]     = useState<EntregaDirectaFiltros>(defaultFiltros);
  const [currentPage, setCurrentPage] = useState(1);

  const switchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Buscar ────────────────────────────────────────────────────────────
  const buscar = useCallback(async (f: EntregaDirectaFiltros) => {
    if (!f.anio || !f.mes) {
      toast.warning({ title: 'Filtros requeridos', message: 'Selecciona año y mes para buscar' });
      return;
    }
    try {
      setIsLoading(true);
      const res = await getEntregasDirectas(f);
      setAllItems(res.Data ?? []);
      setCurrentPage(1);
    } catch (err) {
      if (err instanceof ApiBusinessError) toast.error({ title: 'Error', message: err.message });
      else if (err instanceof NetworkError) toast.error({ title: 'Sin conexión', message: 'Verifica tu conexión e intenta de nuevo' });
      setAllItems([]);
      setCurrentPage(1);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Filtrado local ────────────────────────────────────────────────────
  const filteredItems = useMemo(() => {
    const valor = filtros.folioValor.trim().toLowerCase();
    if (!valor || !filtros.folioTipo) return allItems;
    return allItems.filter(item => {
      const campo = filtros.folioTipo!.id === 'FolioOrdenCompra'
        ? item.FolioOrdenCompra
        : item.FolioRecepcionEntregaDirecta;
      return campo.toLowerCase().includes(valor);
    });
  }, [allItems, filtros.folioValor, filtros.folioTipo]);

  // ── Paginado ──────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const items = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, currentPage]);

  const goToPage  = useCallback((p: number) => setCurrentPage(Math.max(1, Math.min(p, totalPages))), [totalPages]);
  const nextPage  = useCallback(() => setCurrentPage(p => Math.min(p + 1, totalPages)), [totalPages]);
  const prevPage  = useCallback(() => setCurrentPage(p => Math.max(p - 1, 1)), []);

  // ── Cambio de estatus con debounce ────────────────────────────────────
  const handleEstatusChange = useCallback((estatus: DistribucionEstatus) => {
    const nuevos: EntregaDirectaFiltros = {
      ...filtros,
      estatus,
      folioTipo: estatus === 'Pendientes' ? FOLIO_OPCIONES_ENTREGA_DIRECTA[0] : filtros.folioTipo,
    };
    setFiltros(nuevos);
    if (switchDebounceRef.current) clearTimeout(switchDebounceRef.current);
    switchDebounceRef.current = setTimeout(() => buscar(nuevos), 400);
  }, [filtros, buscar]);

  // ── Handlers de filtros ───────────────────────────────────────────────
  const handleAnioChange       = useCallback((anio: string) => setFiltros(f => ({ ...f, anio })), []);
  const handleMesChange        = useCallback((mes: { id: number; nombre: string } | null) => setFiltros(f => ({ ...f, mes })), []);
  const handleFolioTipoChange  = useCallback((folioTipo: { id: string; nombre: string } | null) => setFiltros(f => ({ ...f, folioTipo })), []);
  const handleFolioValorChange = useCallback((folioValor: string) => setFiltros(f => ({ ...f, folioValor })), []);
  const aplicarFiltros         = useCallback(() => buscar(filtros), [filtros, buscar]);

  return {
    items, isLoading, filtros,
    currentPage, totalPages,
    goToPage, nextPage, prevPage,
    handleEstatusChange, handleAnioChange, handleMesChange,
    handleFolioTipoChange, handleFolioValorChange, aplicarFiltros,
  };
};