import React, { useEffect } from 'react';
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
import Paginador from '@/shared/components/ui/Paginador';
import EntregaDirectaListItem from '../components/EntregaDirectaListItem';
import { useEntregaDirecta } from '../hooks/useEntregaDirecta';
import { usePdfReporte } from '@/shared/hooks/usePdfReporte';
import { TIPO_REPORTE } from '@/shared/services/reporteService';
import { FOLIO_OPCIONES_ENTREGA_DIRECTA } from '../types';
import type { EntregaDirectaItem } from '../types';

type StackParams = {
  EntregaDirecta:        undefined;
  EntregaDirectaDetalle: { item: EntregaDirectaItem };
  EntregaDirectaForm:    { item: EntregaDirectaItem };
};

const EntregaDirectaScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<StackParams>>();
  const {
    items, isLoading, filtros,
    currentPage, totalPages,
    goToPage, nextPage, prevPage,
    handleEstatusChange, handleAnioChange, handleMesChange,
    handleFolioTipoChange, handleFolioValorChange, aplicarFiltros,
  } = useEntregaDirecta();

  const { descargarPdf, isLoading: loadingPdf } = usePdfReporte();
  const esRecibidas = filtros.estatus === 'Recibidas';

  useEffect(() => {
    aplicarFiltros();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleItemPress = (item: EntregaDirectaItem) => {
    if (isLoading) return;
    if (filtros.estatus === 'Recibidas') {
      navigation.navigate('EntregaDirectaDetalle', { item });
    } else {
      navigation.navigate('EntregaDirectaForm', { item });
    }
  };

  const handlePdf = (item: EntregaDirectaItem) => {
    descargarPdf(
      {
        TipoReporte:                TIPO_REPORTE.ENTREGA_DIRECTA,
        ID_RecepcionEntregaDirecta: Number(item.ID_RecepcionEntregaDirecta),
      },
      `recepcion_ed_${item.FolioRecepcionEntregaDirecta}`,
    );
  };

  const handleExportar = () => {
    descargarPdf(
      {
        TipoReporte: TIPO_REPORTE.LISTADO_ENTREGAS_DIRECTAS,
        Anio:        Number(filtros.anio),
        Mes:         filtros.mes?.id,
        Status:      filtros.estatus === 'Recibidas' ? 1 : 0,
      },
      `listado_ed_${filtros.anio}_${filtros.mes?.id}`,
    );
  };

  return (
    <View style={styles.root}>

      <View>
        <ScreenHeader title="Entrega Directa" />
        <ListadoFiltros
          anio={filtros.anio}
          mes={filtros.mes}
          estatus={filtros.estatus}
          folioTipo={filtros.folioTipo}
          folioValor={filtros.folioValor}
          folioOpciones={FOLIO_OPCIONES_ENTREGA_DIRECTA}
          switchConfig={{ labelIzquierda: 'Pendientes', labelDerecha: 'Recibidas' }}
          tipoReporte={TIPO_REPORTE.LISTADO_ENTREGAS_DIRECTAS}
          onEstatusChange={handleEstatusChange}
          onAnioChange={handleAnioChange}
          onMesChange={handleMesChange}
          onFolioTipoChange={handleFolioTipoChange}
          onFolioValorChange={handleFolioValorChange}
          onAplicar={aplicarFiltros}
          onExportar={handleExportar}
        />
      </View>

      <View style={styles.listContainer}>
        <FlashList
          data={items}
          keyExtractor={item => esRecibidas
            ? item.ID_RecepcionEntregaDirecta || item.ID_OrdenCompra
            : item.ID_OrdenCompra
          }
          renderItem={({ item, index }) => (
            <EntregaDirectaListItem
              item={item}
              index={index}
              estatus={filtros.estatus}
              onPress={handleItemPress}
              onPdf={handlePdf}
            />
          )}
          ListHeaderComponent={() => (
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, { flex: 1.4 }]}>
                {esRecibidas ? 'Folios' : 'F. O. Compra'}
              </Text>
              <Text style={[styles.headerCell, { flex: 0.9 }]}>Fecha</Text>
              {!esRecibidas && (
                <Text style={[styles.headerCell, { flex: 1.2 }]}>Proveedor</Text>
              )}
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
    backgroundColor:   '#FFFFFF',
    borderBottomWidth: 2,
    borderBottomColor: '#E2E8F0',
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
    backgroundColor:   '#FFFFFF',
    borderRadius:      12,
    paddingVertical:   24,
    paddingHorizontal: 32,
    alignItems:        'center',
    gap:               12,
    elevation:         8,
  },
  pdfLoaderText: {
    fontSize:   14,
    color:      '#1E293B',
    fontWeight: '500',
  },
});

export default EntregaDirectaScreen;