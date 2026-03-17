import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ConsignacionDirectaForm = () => (
  <View style={styles.container}>
    <Text style={styles.text}>ConsignacionDirecta — Formulario</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F7FA' },
  text:      { fontSize: 18, color: '#374151', fontWeight: '500' },
});

export default ConsignacionDirectaForm;