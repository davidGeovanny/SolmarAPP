import { useState, useCallback } from 'react';
import { getRecepcionDetalle } from '../services/recepcionDetalleService';
import { ApiBusinessError, NetworkError } from '@/shared/services/httpClient';
import toast from '@/shared/utils/toast';
import type { RecepcionDetalle } from '../types';

export const useRecepcionDetalle = (idOrdenDistribucion: number) => {
  const [detalle,   setDetalle]   = useState<RecepcionDetalle | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getRecepcionDetalle(idOrdenDistribucion);
      setDetalle(res.Data[0] ?? null);
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

  return { detalle, isLoading, cargar };
};