import React, { createContext, useContext } from 'react';

interface DrawerContextValue {
  openDrawer:   () => void;
  closeDrawer:  () => void;
  toggleDrawer: () => void;
}

const DrawerContext = createContext<DrawerContextValue>({
  openDrawer:   () => {},
  closeDrawer:  () => {},
  toggleDrawer: () => {},
});

export const useDrawer = () => useContext(DrawerContext);

interface DrawerProviderProps {
  children: React.ReactNode;
  onOpen:   () => void;
  onClose:  () => void;
  onToggle: () => void;
}

export const DrawerProvider: React.FC<DrawerProviderProps> = ({
  children,
  onOpen,
  onClose,
  onToggle,
}) => (
  <DrawerContext.Provider value={{ openDrawer: onOpen, closeDrawer: onClose, toggleDrawer: onToggle }}>
    {children}
  </DrawerContext.Provider>
);