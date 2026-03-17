import React, { createContext, useContext, useState, useCallback } from 'react';

interface ComboOpenContextValue {
  activeComboId:  string | null;
  isAnyComboOpen: boolean;
  requestOpen:    (id: string) => void;
  notifyClose:    (id: string) => void;
}

const ComboOpenContext = createContext<ComboOpenContextValue>({
  activeComboId:  null,
  isAnyComboOpen: false,
  requestOpen:    () => {},
  notifyClose:    () => {},
});

export const ComboOpenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeComboId, setActiveComboId] = useState<string | null>(null);

  // Abre este combo y cierra cualquier otro automáticamente
  const requestOpen = useCallback((id: string) => {
    setActiveComboId(id);
  }, []);

  // Solo limpia si este combo era el activo
  const notifyClose = useCallback((id: string) => {
    setActiveComboId(prev => prev === id ? null : prev);
  }, []);

  return (
    <ComboOpenContext.Provider value={{
      activeComboId,
      isAnyComboOpen: activeComboId !== null,
      requestOpen,
      notifyClose,
    }}>
      {children}
    </ComboOpenContext.Provider>
  );
};

export const useComboOpen = () => useContext(ComboOpenContext);