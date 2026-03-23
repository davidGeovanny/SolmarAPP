import { useState, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { getPdfBase64 } from '@/shared/services/reporteService';
import { ApiBusinessError, NetworkError } from '@/shared/services/httpClient';
import toast from '@/shared/utils/toast';
import type { ReporteParams } from '@/shared/services/reporteService';

export const usePdfReporte = () => {
  const [isLoading, setIsLoading] = useState(false);

  const descargarPdf = useCallback(async (
    params:    ReporteParams,
    nombreArchivo: string = 'reporte',
  ) => {
    try {
      setIsLoading(true);

      const base64 = await getPdfBase64(params);
      console.log({ base64 });

      // Guardar en archivo temporal
      const dirs    = ReactNativeBlobUtil.fs.dirs;
      const dirPath = Platform.OS === 'android' ? dirs.CacheDir : dirs.DocumentDir;
      const path    = `${dirPath}/${nombreArchivo}_${Date.now()}.pdf`;

      await ReactNativeBlobUtil.fs.writeFile(path, base64, 'base64');

      // Preguntar si desea abrir el PDF
      Alert.alert(
        'PDF generado',
        '¿Deseas abrir el PDF ahora?',
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Abrir',
            onPress: async () => {
              try {
                if (Platform.OS === 'android') {
                  await ReactNativeBlobUtil.android.actionViewIntent(
                    path,
                    'application/pdf',
                  );
                } else {
                  await ReactNativeBlobUtil.ios.openDocument(path);
                }
              } catch {
                toast.error({
                  title:   'Error al abrir',
                  message: 'No se encontró una aplicación para abrir el PDF',
                });
              }
            },
          },
        ],
      );
    } catch (err) {
      console.log({ err });
      if (err instanceof ApiBusinessError) {
        toast.error({ title: 'Error', message: err.message });
      } else if (err instanceof NetworkError) {
        toast.error({ title: 'Sin conexión', message: 'Verifica tu conexión e intenta de nuevo' });
      } else {
        toast.error({ title: 'Error', message: 'No se pudo generar el PDF' });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { descargarPdf, isLoading };
};