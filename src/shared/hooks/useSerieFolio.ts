import { useState, useCallback, useEffect } from 'react';
import { getSeries, getSiguienteFolio } from '@/shared/services/serieService';
import { ApiBusinessError, NetworkError } from '@/shared/services/httpClient';
import toast from '@/shared/utils/toast';

export interface SerieOption {
  ID_ConfiguracionSerie: number;
  Serie:                 string;
}

const SERIE_SIN_SERIE: SerieOption = { ID_ConfiguracionSerie: 0, Serie: 'Sin Serie' };

export const useSerieFolio = (codigoOpcion: string) => {
  const [series,        setSeries]        = useState<SerieOption[]>([SERIE_SIN_SERIE]);
  const [serieSelected, setSerieSelected] = useState<SerieOption>(SERIE_SIN_SERIE);
  const [folio,         setFolio]         = useState<string>('');
  const [loadingSeries, setLoadingSeries] = useState(false);
  const [loadingFolio,  setLoadingFolio]  = useState(false);

  const cargarSeries = useCallback(async () => {
    try {
      setLoadingSeries(true);
      const res = await getSeries(codigoOpcion);
      const mapped: SerieOption[] = res.Data.map(s => ({
        ID_ConfiguracionSerie: Number(s.ID_ConfiguracionSerie),
        Serie:                 s.Serie,
      }));
      setSeries([SERIE_SIN_SERIE, ...mapped]);
    } catch (err) {
      if (err instanceof NetworkError) {
        toast.error({ title: 'Sin conexión', message: 'No se pudieron cargar las series' });
      }
    } finally {
      setLoadingSeries(false);
    }
  }, [codigoOpcion]);

  const cargarFolio = useCallback(async (serie: SerieOption) => {
    try {
      setLoadingFolio(true);
      const serieValor = serie.ID_ConfiguracionSerie === 0 ? '' : serie.Serie;
      const f = await getSiguienteFolio(serieValor);
      setFolio(f);
    } catch (err) {
      if (err instanceof ApiBusinessError) {
        toast.error({ title: 'Error', message: err.message });
      }
      setFolio('');
    } finally {
      setLoadingFolio(false);
    }
  }, []);

  const handleSerieChange = useCallback((serie: SerieOption | null) => {
    const nueva = serie ?? SERIE_SIN_SERIE;
    setSerieSelected(nueva);
    cargarFolio(nueva);
  }, [cargarFolio]);

  useEffect(() => {
    cargarSeries();
    cargarFolio(SERIE_SIN_SERIE);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    series,
    serieSelected,
    folio,
    loadingSeries,
    loadingFolio,
    handleSerieChange,
  };
};