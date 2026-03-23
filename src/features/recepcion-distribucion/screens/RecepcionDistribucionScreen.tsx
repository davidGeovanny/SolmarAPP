import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ScreenHeader from '@/shared/components/layout/ScreenHeader';
import ListadoFiltros from '@/shared/components/ui/ListadoFiltros';
import { FOLIO_OPCIONES } from '../types';
import DistribucionListItem from '../components/DistribucionListItem';
import { useRecepcionDistribucion } from '../hooks/useRecepcionDistribucion';
import { usePdfReporte, } from '@/shared/hooks/usePdfReporte';
import { TIPO_REPORTE } from '@/shared/services/reporteService';
import Paginador from '@/shared/components/ui/Paginador';
import type { DistribucionItem } from '../types';

type StackParams = {
  RecepcionDistribucion:        undefined;
  RecepcionDistribucionDetalle: { item: DistribucionItem };
  RecepcionDistribucionForm:    { item: DistribucionItem };
};

const RecepcionDistribucionScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<StackParams>>();
  const {
    items,
    isLoading,
    filtros,
    handleEstatusChange,
    handleAnioChange,
    handleMesChange,
    handleFolioTipoChange,
    handleFolioValorChange,
    aplicarFiltros,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
  } = useRecepcionDistribucion();

  const esRecibidas  = filtros.estatus === 'Recibidas';
  const isLoadingRef = useRef(isLoading);
  useEffect(() => { isLoadingRef.current = isLoading; }, [isLoading]);

  const { descargarPdf, isLoading: loadingPdf } = usePdfReporte();

  useEffect(() => {
    aplicarFiltros();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleItemPress = (item: DistribucionItem) => {
    if (isLoading) return;
    if (filtros.estatus === 'Recibidas') {
      navigation.navigate('RecepcionDistribucionDetalle', { item });
    } else {
      navigation.navigate('RecepcionDistribucionForm', { item });
    }
  };

  const handlePdf = (item: DistribucionItem) => {
    descargarPdf(
      {
        TipoReporte:               TIPO_REPORTE.ORDEN_DISTRIBUCION,
        ID_RecepcionDistribucion:  Number(item.ID_RecepcionDistribucion),
        ID_RecepcionEntregaDirecta: 0,
        ID_EntregaCentroCosto:      0,
        ID_ConsignacionDirecta:     0,
      },
      `recepcion_${item.FolioRecepcion}`,
    );
  };

  const handleExportar = () => {
    descargarPdf(
      {
        TipoReporte: TIPO_REPORTE.LISTADO_ORDENES_DISTRIBUCION,
        Anio:        Number(filtros.anio),
        Mes:         filtros.mes?.id,
        Status:      filtros.estatus === 'Recibidas' ? 1 : 0,
      },
      `listado_distribucion_${filtros.anio}_${filtros.mes?.id}`,
    );
  };

  return (
    <View style={styles.root}>

      {/* Zona de filtros — zIndex alto para que el listado del combo flote sobre el grid */}
      <View>
        <ScreenHeader title="Recepción de Distribución" />
        <ListadoFiltros
          anio={filtros.anio}
          mes={filtros.mes}
          estatus={filtros.estatus}
          folioTipo={filtros.folioTipo}
          folioValor={filtros.folioValor}
          folioOpciones={FOLIO_OPCIONES}
          switchConfig={{ labelIzquierda: 'Pendientes', labelDerecha: 'Recibidas' }}
          tipoReporte={TIPO_REPORTE.LISTADO_ORDENES_DISTRIBUCION}
          onEstatusChange={handleEstatusChange}
          onAnioChange={handleAnioChange}
          onMesChange={handleMesChange}
          onFolioTipoChange={handleFolioTipoChange}
          onFolioValorChange={handleFolioValorChange}
          onAplicar={aplicarFiltros}
          onExportar={handleExportar}
        />
      </View>

      {/* Lista con RefreshControl nativo — siempre presente para pull-to-refresh */}
      <View style={styles.listContainer}>
        <FlashList
          data={items}
          keyExtractor={item => esRecibidas ? item.ID_RecepcionDistribucion : item.ID_OrdenDistribucion}
          renderItem={({ item, index }) => (
            <DistribucionListItem
              item={item}
              index={index}
              estatus={filtros.estatus}
              onPress={handleItemPress}
              onPdf={handlePdf}
            />
          )}
          ListHeaderComponent={() => (
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, { flex: 1.6 }]}>
                {esRecibidas ? 'Folios' : 'F. Distribución'}
              </Text>
              <Text style={[styles.headerCell, { flex: 0.7 }]}>Fecha</Text>
              {esRecibidas && <View style={{ width: 26 }} />}
              <View style={{ width: 20 }} />
            </View>
          )}
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.centered}>
                <Text style={styles.emptyText}>Sin resultados</Text>
              </View>
            ) : null
          }
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={aplicarFiltros}
              colors={['#1C57B5']}
              tintColor="#1C57B5"
            />
          }
        />

        {isLoading && (
          <View style={styles.loadingOverlay} pointerEvents="box-only" />
        )}

        <Paginador
          currentPage={currentPage}
          totalPages={totalPages}
          onPrev={prevPage}
          onNext={nextPage}
          onGoToPage={goToPage}
        />
      </View>

      {/* Overlay bloqueante durante descarga de PDF */}
      {loadingPdf && (
        <View style={styles.pdfOverlay} pointerEvents="box-only">
          <View style={styles.pdfLoaderBox}>
            <ActivityIndicator size="large" color="#1C57B5" />
            <Text style={styles.pdfLoaderText}>Generando PDF...</Text>
          </View>
        </View>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex:            1,
    backgroundColor: '#F8FAFC',
  },
  tableHeader: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: 16,
    paddingVertical:   10,
    borderBottomWidth: 2,
    borderBottomColor: '#E2E8F0',
    backgroundColor:   '#FFFFFF',
    gap:               8,
  },
  headerCell: {
    fontSize:      12,
    fontWeight:    '500',
    color:         '#94A3B8',
    letterSpacing: 0.2,
  },
  listContainer: {
    flex: 1,
  },
  centered: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    paddingTop:     60,
  },
  emptyText: {
    fontSize: 15,
    color:    '#94A3B8',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(248,250,252,0.5)',
  },
  pdfOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems:      'center',
    justifyContent:  'center',
  },
  pdfLoaderBox: {
    backgroundColor: '#FFFFFF',
    borderRadius:    12,
    paddingVertical:   24,
    paddingHorizontal: 32,
    alignItems:      'center',
    gap:             12,
    elevation:       8,
  },
  pdfLoaderText: {
    fontSize:   14,
    color:      '#1E293B',
    fontWeight: '500',
  },
});

export default RecepcionDistribucionScreen;