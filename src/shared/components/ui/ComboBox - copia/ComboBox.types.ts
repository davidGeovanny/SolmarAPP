export type ComboBoxDirection = 'bottom' | 'top' | 'left' | 'right';
export type ComboBoxMode =
  | 'search'    //-> Modalidad 1: Se puede escribir para filtrar resultados
  | 'select'    //-> Modalidad 2: Solo se puede seleccionar de la lista, no se puede escribir

export type ComboBoxVariant =
  | 'glass'        //-> default: fondo semitransparente blanco (pantallas de auth)
  | 'transparent'  //-> sin fondo ni borde (TopBar sobre color sólido)

export interface ComboBoxFieldConfig<T> {
  valueKey:     keyof T; //-> Valor único del elemento
  labelKey:     keyof T; //-> Propiedad que indica la descripción del elemento
  subtitleKey?: keyof T; //-> Propiedad que indica la descripción secundaria (subtítulo) del elemento
  //-> Propiedad que se coloca en el input al seleccionar el elemento. Si no se especifica, se usará el labelKey
  displayKey?: keyof T;
}

export interface ComboBoxProps<T> {
  data:       T[];
  isLoading:  boolean;
  onRefresh?: () => void;

  fieldConfig: ComboBoxFieldConfig<T>;

  value:    T | null;
  onChange: (item: T | null) => void;

  placeholder?: string;
  mode?:        ComboBoxMode;       //-> default: 'search'
  direction?:   ComboBoxDirection;  //-> default: 'bottom'

  //-> Ícono derecho del input
  icon?: React.ReactNode;

  //-> Si es true, se muestra una X para limpiar la selección (si hay elemento seleccionado)
  clearable?: boolean; //-> default: true

  //-> Si es true, se excluye el elemento seleccionado de la lista de opciones
  excludeSelected?: boolean; //-> default: false

  variant?: ComboBoxVariant; //-> default: 'glass'
  /**
   * Si true, la lista se renderiza en un Modal independiente.
   * Necesario cuando el combo está dentro de un contenedor con bounds limitados (ej. TopBar).
   */
  useModal?: boolean;

  hasError?: boolean;
  debounceMs?: number; //-> default: 300
}

export interface ComboBoxListProps<T> {
  items:            T[];
  selectedValue:    unknown;
  fieldConfig:      ComboBoxFieldConfig<T>;
  direction:        ComboBoxDirection;
  excludeSelected:  boolean;
  onSelect:         (item: T) => void;
  inModal?:         boolean;
}