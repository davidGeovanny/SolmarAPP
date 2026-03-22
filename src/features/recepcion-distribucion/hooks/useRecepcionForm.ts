import { useState, useCallback, useMemo, useRef } from 'react';
import { getProductosDistribucion } from '../services/distribucionFormService';
import { ApiBusinessError, NetworkError } from '@/shared/services/httpClient';
import toast from '@/shared/utils/toast';
import type { ProductoDistribucion } from '../types';

const PAGE_SIZE = 20;

export type FiltroCampo = 'CodigoProducto' | 'NombreProducto';

export interface FiltroCampoOption {
  id:     FiltroCampo;
  nombre: string;
}

export const FILTRO_CAMPO_OPCIONES: FiltroCampoOption[] = [
  { id: 'CodigoProducto',  nombre: 'Código' },
  { id: 'NombreProducto',  nombre: 'Nombre' },
];

export const useRecepcionForm = (idOrdenDistribucion: number) => {
  const [allProductos,   setAllProductos]   = useState<ProductoDistribucion[]>([]);
  const [isLoading,      setIsLoading]      = useState(false);
  const [filtroCampo,    setFiltroCampo]    = useState<FiltroCampoOption>(FILTRO_CAMPO_OPCIONES[0]);
  const [filtroTexto,    setFiltroTexto]    = useState('');
  const [soloPendientes, setSoloPendientes] = useState(true);
  const [currentPage,    setCurrentPage]    = useState(1);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Cargar productos ───────────────────────────────────────────────────
  const cargarProductos = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getProductosDistribucion(idOrdenDistribucion);
      // Agregar campos locales CantidadRecibir y Observaciones
      const mapped: ProductoDistribucion[] = res.Data.map(p => ({
        ...p,
        CantidadRecibir: '',
        Observaciones:   '',
      }));
      setAllProductos(mapped);
      setCurrentPage(1);
    } catch (err) {
      if (err instanceof ApiBusinessError) {
        toast.error({ title: 'Error', message: err.message });
      } else if (err instanceof NetworkError) {
        toast.error({ title: 'Sin conexión', message: 'Verifica tu conexión e intenta de nuevo' });
      }
    } finally {
      setIsLoading(false);
    }
  }, [idOrdenDistribucion]);

  // ── Actualizar cantidad/observaciones de un producto ───────────────────
  const updateProducto = useCallback((
    idProducto: string,
    changes: Partial<Pick<ProductoDistribucion, 'CantidadRecibir' | 'Observaciones'>>,
  ) => {
    setAllProductos(prev =>
      prev.map(p => p.ID_Producto === idProducto ? { ...p, ...changes } : p),
    );
  }, []);

  // ── Confirmar 100% de un producto ─────────────────────────────────────
  const confirmarProducto = useCallback((idProducto: string) => {
    setAllProductos(prev =>
      prev.map(p =>
        p.ID_Producto === idProducto
          ? { ...p, CantidadRecibir: p.CantidadASurtir, Observaciones: 'Recibido Completamente' }
          : p,
      ),
    );
  }, []);

  // ── Filtros ────────────────────────────────────────────────────────────
  const handleFiltroCampoChange = useCallback((campo: FiltroCampoOption | null) => {
    setFiltroCampo(campo ?? FILTRO_CAMPO_OPCIONES[0]);
  }, []);

  const handleFiltroTextoChange = useCallback((texto: string) => {
    setFiltroTexto(texto);
  }, []);

  // ── Productos filtrados ────────────────────────────────────────────────
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

  // ── Paginado ──────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredProductos.length / PAGE_SIZE));

  const productos = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredProductos.slice(start, start + PAGE_SIZE);
  }, [filteredProductos, currentPage]);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    setCurrentPage(p => Math.min(p + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage(p => Math.max(p - 1, 1));
  }, []);

  // ── Hay algún producto con cantidad capturada ──────────────────────────
  const hayProductosCapturados = useMemo(
    () => allProductos.some(p => parseFloat(p.CantidadRecibir) > 0),
    [allProductos],
  );

  return {
    productos,
    allProductos,
    isLoading,
    filtroCampo,
    filtroTexto,
    soloPendientes,
    hayProductosCapturados,
    cargarProductos,
    updateProducto,
    confirmarProducto,
    handleFiltroCampoChange,
    handleFiltroTextoChange,
    setSoloPendientes,
    // Paginado
    currentPage,
    totalPages,
    totalItems: filteredProductos.length,
    goToPage,
    nextPage,
    prevPage,
  };
};