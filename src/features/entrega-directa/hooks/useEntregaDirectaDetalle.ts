import { useState, useCallback } from 'react';
import { getEntregaDirectaDetalle } from '../services/entregaDirectaDetalleService';
import { ApiBusinessError, NetworkError } from '@/shared/services/httpClient';
import toast from '@/shared/utils/toast';
import type { EntregaDirectaDetalle } from '../types';

export const useEntregaDirectaDetalle = (idOrdenCompra: number) => {
  const [detalle,   setDetalle]   = useState<EntregaDirectaDetalle | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getEntregaDirectaDetalle(idOrdenCompra);
      setDetalle(res.Data[0] ?? null);
    } catch (err) {
      if (err instanceof ApiBusinessError) toast.error({ title: 'Error', message: err.message });
      else if (err instanceof NetworkError) toast.error({ title: 'Sin conexión', message: 'Verifica tu conexión e intenta de nuevo' });
    } finally {
      setIsLoading(false);
    }
  }, [idOrdenCompra]);

  return { detalle, isLoading, cargar };
};