import Toast from 'react-native-toast-message';

interface ShowOptions {
  title:      string;
  message?:   string;
  position?:  'top' | 'bottom';
  duration?:  number; //-> Sustituye el valor por defecto de la configuración
}

const nextId = (() => {
  let counter = 0;
  return () => ++counter;
})();

const show = (type: 'success' | 'error' | 'warning' | 'info') =>
  ({ title, message, position = 'top', duration }: ShowOptions) =>
    Toast.show({
      type,
      text1:        title,
      text2:        message,
      position,
      autoHide:     false,
      // topOffset:    56, //-> Se ajustará dinámicamente en App.tsx según el safe area y la altura del TopBar
      bottomOffset: 32,
      props:        { duration, toastId: nextId() },
    });

const toast = {
  success:  show('success'),
  error:    show('error'),
  warning:  show('warning'),
  info:     show('info'),
  hide:     () => Toast.hide(),
};

export default toast;