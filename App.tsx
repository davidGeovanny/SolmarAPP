import React, { use } from 'react';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { toastConfig } from './src/shared/components/ui/Toast';
import RootNavigator from './src/app/navigation/RootNavigator';

const AppContent = () => {
  const insets = useSafeAreaInsets();

  return (
    <>
      <RootNavigator />

      {/* Es importante que el Toast sea el último componente */}
      <Toast
        config={ toastConfig }
        topOffset={insets.top + 88} // 88 es la altura del TopBar + margen
        bottomOffset={32}
      />
    </>
  );
}

const App = () => (
  <SafeAreaProvider>
    <AppContent />
  </SafeAreaProvider>
);

export default App;