import { StyleSheet } from 'react-native';

const GLASS_BG     = 'rgba(255, 255, 255, 0.15)';
const GLASS_BORDER = 'rgba(255, 255, 255, 0.35)';
const ERROR_COLOR  = '#FF6B6B';
const RADIUS       = 28;

// Lista
const LIST_BG       = '#FFFFFF';
const LIST_RADIUS   = 12;
const LIST_MAX_H    = 220;
const SELECTED_BG   = 'rgba(26, 115, 232, 0.08)';
const PRESSED_BG    = 'rgba(0, 0, 0, 0.06)';
const SUBTITLE_COLOR = '#6B7280';

export const comboBoxStyles = StyleSheet.create({
  // ── Wrapper externo ────────────────────────────────────────────────────
  wrapper: {
    position: 'relative',
    flex:     1,  // se estira al ancho del contenedor padre
  },

  // ── Input (reutiliza estética de GlassInput) ───────────────────────────
  inputContainer: {
    flexDirection:   'row',
    alignItems:      'center',
    borderRadius:    RADIUS,
    borderWidth:     1,
    borderColor:     GLASS_BORDER,
    backgroundColor: GLASS_BG,
    overflow:        'hidden',
    height:          52,
    paddingHorizontal: 20,
  },
  inputContainerError: {
    borderColor: ERROR_COLOR,
  },
  inputContainerDisabled: {
    opacity: 0.5,
  },
  textInput: {
    flex:     1,
    color:    '#FFFFFF',
    fontSize: 15,
    height:   '100%',
    padding:  0,
  },
  textInputReadonly: {
    // En modo 'select' el texto no se edita visualmente
    color: '#FFFFFF',
  },
  iconButton: {
    marginLeft: 8,
    padding:    2,
  },

  // ── Variante transparent (TopBar) ─────────────────────────────────────
  // Sin fondo ni borde — el combo se mimetiza con el color del TopBar
  inputContainerTransparent: {
    backgroundColor: 'transparent',
    borderWidth:     0,
    height:          22,
    paddingHorizontal: 0,
    overflow:        'visible',
  },
  textInputTransparent: {
    fontSize:   13,
    fontWeight: '600',
  },
  iconButtonTransparent: {
    marginLeft: 4,
    padding:    0,
  },

  // ── Lista desplegable ──────────────────────────────────────────────────
  listWrapper: {
    position:       'absolute',
    left:           0,
    right:          0,
    backgroundColor: LIST_BG,
    borderRadius:   LIST_RADIUS,
    maxHeight:      LIST_MAX_H,
    shadowColor:    '#000',
    shadowOffset:   { width: 0, height: 4 },
    shadowOpacity:  0.15,
    shadowRadius:   8,
    elevation:      8,
    zIndex:         999,
    overflow:       'hidden',
  },
  listWrapperBottom: {
    top: 58, // altura del input + gap
  },
  listWrapperTop: {
    bottom: 58,
  },
  listWrapperRight: {
    left:  '105%',
    top:   0,
    right: undefined,
    width: 220,
  },
  listWrapperLeft: {
    right: '105%',
    top:   0,
    left:  undefined,
    width: 220,
  },

  // ── \u00cdtems de la lista ──────────────────────────────────────────────────
  item: {
    paddingVertical:   12,
    paddingHorizontal: 16,
  },
  itemPressed: {
    backgroundColor: PRESSED_BG,
  },
  itemSelected: {
    backgroundColor: SELECTED_BG,
  },
  itemLabel: {
    fontSize:   14,
    fontWeight: '500',
    color:      '#111827',
  },
  itemLabelSelected: {
    color:      '#1A73E8',
    fontWeight: '600',
  },
  itemSubtitle: {
    fontSize:    12,
    fontStyle:   'italic',
    color:       SUBTITLE_COLOR,
    marginTop:   2,
  },

  // ── Empty / loading ────────────────────────────────────────────────────
  emptyContainer: {
    paddingVertical:   20,
    alignItems:        'center',
  },
  emptyText: {
    fontSize: 13,
    color:    SUBTITLE_COLOR,
  },
});