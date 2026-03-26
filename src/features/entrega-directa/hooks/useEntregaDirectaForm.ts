import { useState, useCallback, useMemo } from 'react';
import { getEntregaDirectaProductos } from '../services/entregaDirectaFormService';
import { ApiBusinessError, NetworkError } from '@/shared/services/httpClient';
import toast from '@/shared/utils/toast';
import type { EntregaDirectaProductoForm } from '../types';

export type FiltroCampo = 'CodigoProducto' | 'NombreProducto';

export interface FiltroCampoOption {
  id:     FiltroCampo;
  nombre: string;
}

export const FILTRO_CAMPO_OPCIONES: FiltroCampoOption[] = [
  { id: 'CodigoProducto', nombre: 'Código' },
  { id: 'NombreProducto', nombre: 'Nombre' },
];

const PAGE_SIZE = 20;

// Formatea número a moneda: 1234.5 → "$1,234.50"
export const formatMoneda = (val: string): string => {
  const n = parseFloat(val);
  if (isNaN(n)) return '$0.00';
  return n.toLocaleString('es-MX', {
    style:                 'currency',
    currency:              'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
};

export const useEntregaDirectaForm = (idOrdenCompra: number) => {
  const [allProductos,   setAllProductos]   = useState<EntregaDirectaProductoForm[]>([]);
  const [isLoading,      setIsLoading]      = useState(false);
  const [filtroCampo,    setFiltroCampo]    = useState<FiltroCampoOption>(FILTRO_CAMPO_OPCIONES[0]);
  const [filtroTexto,    setFiltroTexto]    = useState('');
  const [soloPendientes, setSoloPendientes] = useState(false);
  const [currentPage,    setCurrentPage]    = useState(1);

  // ── Cargar productos ───────────────────────────────────────────────────
  const cargarProductos = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getEntregaDirectaProductos(idOrdenCompra);
      const mapped: EntregaDirectaProductoForm[] = res.Data.map(p => ({
        ...p,
        CantidadRecibir: '',
        Observaciones:   '',
      }));
      setAllProductos(mapped);
      setCurrentPage(1);
    } catch (err) {
      if (err instanceof ApiBusinessError) toast.error({ title: 'Error', message: err.message });
      else if (err instanceof NetworkError) toast.error({ title: 'Sin conexión', message: 'Verifica tu conexión e intenta de nuevo' });
    } finally {
      setIsLoading(false);
    }
  }, [idOrdenCompra]);

  // ── Actualizar producto ────────────────────────────────────────────────
  const updateProducto = useCallback((
    idProducto: string,
    changes: Partial<Pick<EntregaDirectaProductoForm, 'CantidadRecibir' | 'Observaciones' | 'CostoUnitario'>>,
  ) => {
    setAllProductos(prev => prev.map(p => {
      if (p.ID_Producto !== idProducto) return p;
      const updated = { ...p, ...changes };
      // Validar CostoUnitario >= 0
      if (changes.CostoUnitario !== undefined) {
        const val = parseFloat(changes.CostoUnitario);
        if (!isNaN(val) && val < 0) updated.CostoUnitario = '0';
      }
      return updated;
    }));
  }, []);

  // ── Confirmar 100% de un producto ─────────────────────────────────────
  const confirmarProducto = useCallback((idProducto: string) => {
    setAllProductos(prev => prev.map(p =>
      p.ID_Producto === idProducto
        ? { ...p, CantidadRecibir: p.CantidadASurtir, Observaciones: 'Recibido Completamente' }
        : p,
    ));
  }, []);

  // ── Filtrado ───────────────────────────────────────────────────────────
  const filteredProductos = useMemo(() => {
    let result = allProductos;
    const texto = filtroTexto.trim().toLowerCase();
    if (texto) {
      result = result.filter(p =>
        String(p[filtroCampo.id]).toLowerCase().includes(texto),
      );
    }
    if (soloPendientes) {
      result = result.filter(p => {
        const recibir = parseFloat(p.CantidadRecibir) || 0;
        const surtir  = parseFloat(p.CantidadASurtir) || 0;
        return recibir < surtir;
      });
    }
    return result;
  }, [allProductos, filtroTexto, filtroCampo, soloPendientes]);

  // ── Paginado ──────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredProductos.length / PAGE_SIZE));
  const productos  = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredProductos.slice(start, start + PAGE_SIZE);
  }, [filteredProductos, currentPage]);

  const goToPage = useCallback((p: number) => setCurrentPage(Math.max(1, Math.min(p, totalPages))), [totalPages]);
  const nextPage = useCallback(() => setCurrentPage(p => Math.min(p + 1, totalPages)), [totalPages]);
  const prevPage = useCallback(() => setCurrentPage(p => Math.max(p - 1, 1)), []);

  const hayProductosCapturados = useMemo(
    () => allProductos.some(p => parseFloat(p.CantidadRecibir) > 0),
    [allProductos],
  );

  return {
    productos, allProductos, isLoading,
    filtroCampo, filtroTexto, soloPendientes,
    hayProductosCapturados,
    currentPage, totalPages,
    cargarProductos, updateProducto, confirmarProducto,
    handleFiltroCampoChange: (v: FiltroCampoOption | null) => setFiltroCampo(v ?? FILTRO_CAMPO_OPCIONES[0]),
    handleFiltroTextoChange: (v: string) => setFiltroTexto(v),
    setSoloPendientes,
    goToPage, nextPage, prevPage,
  };
};