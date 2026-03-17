// ─── Variante visual ─────────────────────────────────────────────────────────

export type ComboBoxVariant =
  | 'glass'        // default: fondo semitransparente, borde blanco (pantallas auth)
  | 'transparent'; // sin fondo ni borde, texto y lupa blancos (TopBar)

// ─── Dirección del listado ────────────────────────────────────────────────────

export type ComboBoxDirection = 'bottom' | 'top' | 'left' | 'right';

// ─── Modalidad del input ──────────────────────────────────────────────────────

export type ComboBoxMode =
  | 'search'    // Modalidad 1: se puede escribir para filtrar
  | 'select';   // Modalidad 2: no se puede escribir, clic abre/cierra lista

// ─── Configuración de campos ──────────────────────────────────────────────────
// Indica qué propiedades del objeto T se usan para cada rol

export interface ComboBoxFieldConfig<T> {
  /** Propiedad usada como valor único del registro (ej. id) */
  valueKey: keyof T;
  /** Propiedad mostrada como descripción principal en la lista */
  labelKey: keyof T;
  /** Propiedad mostrada como subtítulo en la lista (opcional, cursiva) */
  subtitleKey?: keyof T;
  /**
   * Propiedad mostrada en el input al seleccionar un elemento.
   * Si no se envía, se usa labelKey.
   */
  displayKey?: keyof T;
}

// ─── Props del ComboBox ───────────────────────────────────────────────────────

export interface ComboBoxProps<T> {
  // — Datos —
  data:      T[];
  isLoading: boolean;
  onRefresh?: () => void;

  // — Configuración de campos —
  fieldConfig: ComboBoxFieldConfig<T>;

  // — Valor controlado —
  value:    T | null;
  onChange: (item: T | null) => void;

  // — Apariencia —
  placeholder?:  string;
  mode?:         ComboBoxMode;       // default: 'search'
  direction?:    ComboBoxDirection;  // default: 'bottom'
  /** \u00cdcono derecho del input. Acepta un componente React (SVG o Image) */
  icon?: React.ReactNode;
  /** Si true, muestra X para limpiar cuando hay valor seleccionado */
  clearable?: boolean;               // default: true
  /** Si true, el registro seleccionado no aparece en la lista */
  excludeSelected?: boolean;         // default: false
  hasError?: boolean;
  /** Variante visual del input. default: 'glass' */
  variant?: ComboBoxVariant;

  // — Debounce —
  debounceMs?: number;               // default: 300
}

// ─── Props internas de la lista ───────────────────────────────────────────────

export interface ComboBoxListProps<T> {
  items:            T[];
  selectedValue:    unknown;
  fieldConfig:      ComboBoxFieldConfig<T>;
  direction:        ComboBoxDirection;
  excludeSelected:  boolean;
  onSelect:         (item: T) => void;
}