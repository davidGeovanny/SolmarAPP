import React, { createContext, useContext, useState, useRef, useCallback } from 'react';

// ── Estado del portal de dropdown ─────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface DropdownPortalState {
  top:             number;
  left:            number;
  width:           number;
  estimatedHeight: number;
  items:           unknown[];
  selectedValue:   unknown;
  fieldConfig:     unknown; // ComboBoxFieldConfig<any> at runtime
  excludeSelected: boolean;
  onSelect:        (item: unknown) => void;
  comboId:         string;
}

interface ComboOpenContextValue {
  activeComboId:     string | null;
  isAnyComboOpen:    boolean;
  requestOpen:       (id: string) => void;
  notifyClose:       (id: string) => void;
  dropdownPortal:    DropdownPortalState | null;
  openDropdown:      (state: DropdownPortalState) => void;
  closeDropdown:     () => void;
  updatePortalItems: (items: unknown[], selectedValue: unknown) => void;
}

const ComboOpenContext = createContext<ComboOpenContextValue>({
  activeComboId:     null,
  isAnyComboOpen:    false,
  requestOpen:       () => {},
  notifyClose:       () => {},
  dropdownPortal:    null,
  openDropdown:      () => {},
  closeDropdown:     () => {},
  updatePortalItems: () => {},
});

export const ComboOpenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeComboId,  setActiveComboId]  = useState<string | null>(null);
  const [dropdownPortal, setDropdownPortal] = useState<DropdownPortalState | null>(null);

  // Ref para acceder al comboId del portal activo sin closures obsoletos
  const portalRef = useRef<DropdownPortalState | null>(null);

  // Abre este combo y cierra cualquier otro automáticamente
  const requestOpen = useCallback((id: string) => {
    setActiveComboId(id);
  }, []);

  // Solo limpia si este combo era el activo
  const notifyClose = useCallback((id: string) => {
    setActiveComboId(prev => prev === id ? null : prev);
  }, []);

  // Abre el portal de dropdown (para combos con useModal=true)
  const openDropdown = useCallback((state: DropdownPortalState) => {
    portalRef.current = state;
    setDropdownPortal(state);
    setActiveComboId(state.comboId);
  }, []);

  // Cierra el portal y limpia el combo activo
  const closeDropdown = useCallback(() => {
    const portal = portalRef.current;
    portalRef.current = null;
    setDropdownPortal(null);
    if (portal) {
      setActiveComboId(prev => prev === portal.comboId ? null : prev);
    }
  }, []);

  // Actualiza solo los items del portal sin re-medir posición (para modo search)
  const updatePortalItems = useCallback((items: unknown[], selectedValue: unknown) => {
    setDropdownPortal(prev => prev ? { ...prev, items, selectedValue } : prev);
  }, []);

  return (
    <ComboOpenContext.Provider value={{
      activeComboId,
      isAnyComboOpen: activeComboId !== null,
      requestOpen,
      notifyClose,
      dropdownPortal,
      openDropdown,
      closeDropdown,
      updatePortalItems,
    }}>
      {children}
    </ComboOpenContext.Provider>
  );
};

export const useComboOpen = () => useContext(ComboOpenContext);