import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ScreenHeader from '@/shared/components/layout/ScreenHeader';
import DistribucionFiltrosBar from '../components/DistribucionFiltros';
import DistribucionListItem from '../components/DistribucionListItem';
import { useRecepcionDistribucion } from '../hooks/useRecepcionDistribucion';
import type { DistribucionItem } from '../types';

type StackParams = {
  RecepcionDistribucion:     undefined;
  RecepcionDistribucionForm: { item: DistribucionItem };
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
  } = useRecepcionDistribucion();

  const esRecibidas  = filtros.estatus === 'Recibidas';
  const isLoadingRef = useRef(isLoading);
  useEffect(() => { isLoadingRef.current = isLoading; }, [isLoading]);

  useEffect(() => {
    aplicarFiltros();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleItemPress = (item: DistribucionItem) => {
    if (isLoading) return;
    navigation.navigate('RecepcionDistribucionForm', { item });
  };

  const handlePdf = (_item: DistribucionItem) => {
    // TODO: descargar PDF de recepción
  };

  const handleExportar = () => {
    // TODO: exportar listado
  };

  return (
    <View style={styles.root}>

      {/* Zona de filtros — zIndex alto para que el listado del combo flote sobre el grid */}
      <View>
        <ScreenHeader title="Recepción de Distribución" />
        <DistribucionFiltrosBar
          filtros={filtros}
          onEstatusChange={handleEstatusChange}
          onAnioChange={handleAnioChange}
          onMesChange={handleMesChange}
          onFolioTipoChange={handleFolioTipoChange}
          onFolioValorChange={handleFolioValorChange}
          onAplicar={aplicarFiltros}
          onExportar={handleExportar}
        />
      </View>

      {/* Lista con RefreshControl nativo */}
      <View style={styles.listContainer}>
        <FlashList
          data={items}
          ListHeaderComponent={() => (
            <>
            {/* Encabezado de columnas */}
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, { flex: 1.6 }]}>
                {esRecibidas ? 'Folios' : 'F. Distribución'}
              </Text>
              <Text style={[styles.headerCell, { flex: 0.7 }]}>Fecha</Text>
              {esRecibidas && <View style={{ width: 26 }} />}
              <View style={{ width: 20 }} />
            </View>
            </>
          )}
          keyExtractor={item => item.ID_OrdenDistribucion}
          renderItem={({ item, index }) => (
            <DistribucionListItem
              item={item}
              index={index}
              estatus={filtros.estatus}
              onPress={handleItemPress}
              onPdf={handlePdf}
            />
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
      </View>

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
  pullLayer: {
    position: 'absolute',
    top:      0,
    left:     0,
    right:    0,
    // Sin backgroundColor — completamente invisible
  },
});

export default RecepcionDistribucionScreen;