import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  PanResponder,
} from 'react-native';
import Toast from 'react-native-toast-message';
import type { BaseToastProps } from 'react-native-toast-message';

const TOAST_THEMES = {
  success: {
    background: '#F0FDF4',
    border:     '#16A34A',
    progress:   '#22C55E',
    icon:       '✓',
    iconBg:     '#16A34A',
    title:      '#14532D',
    message:    '#166534',
  },
  error: {
    background: '#FEF2F2',
    border:     '#DC2626',
    progress:   '#EF4444',
    icon:       '✕',
    iconBg:     '#DC2626',
    title:      '#7F1D1D',
    message:    '#991B1B',
  },
  warning: {
    background: '#FFFBEB',
    border:     '#D97706',
    progress:   '#F59E0B',
    icon:       '!',
    iconBg:     '#D97706',
    title:      '#78350F',
    message:    '#92400E',
  },
  info: {
    background: '#EFF6FF',
    border:     '#2563EB',
    progress:   '#3B82F6',
    icon:       'i',
    iconBg:     '#2563EB',
    title:      '#1E3A5F',
    message:    '#1D4ED8',
  },
} as const;

type ToastType = keyof typeof TOAST_THEMES;

const DURATIONS: Record<ToastType, number> = {
  success: 3500,
  error:   5000,
  warning: 4000,
  info:    3000,
};

interface ToastCardProps extends BaseToastProps {
  type:   ToastType;
  props?: { duration?: number; toastId?: number };
}

const ToastCard: React.FC<ToastCardProps> = ({ text1, text2, type, props: customProps }) => {
  const theme    = TOAST_THEMES[type];
  const duration = customProps?.duration ?? DURATIONS[type];
  const toastId  = customProps?.toastId ?? 0;

  //-> Timer de auto-cierre
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedAt = useRef(0);
  const elapsed   = useRef(0);
  const isPaused  = useRef(false);

  const scaleAnim    = useRef(new Animated.Value(1)).current;
  const scaleAnimRef = useRef<Animated.CompositeAnimation | null>(null);

  //-> Iniciar timer + animacion
  const start = useCallback((remaining: number) => {
    startedAt.current = Date.now();

    timerRef.current = setTimeout(() => Toast.hide(), remaining);

    scaleAnimRef.current = Animated.timing(scaleAnim, {
      toValue:         0,
      duration:        remaining,
      useNativeDriver: true,
    });
    scaleAnimRef.current.start();
  }, [scaleAnim]);

  //-> Pausar
  const pauseTimer = useCallback(() => {
    if (isPaused.current) return;
    isPaused.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    scaleAnimRef.current?.stop();
    elapsed.current += Date.now() - startedAt.current;
  }, []);

  //-> Reanudar
  const resumeTimer = useCallback(() => {
    if (!isPaused.current) return;
    isPaused.current = false;
    const remaining = duration - elapsed.current;
    if (remaining > 0) start(remaining);
    else Toast.hide();
  }, [duration, start]);

  //-> Montar / nuevo toast
  useEffect(() => {
    elapsed.current  = 0;
    isPaused.current = false;
    scaleAnim.setValue(1); //-> resetear barra al inicio
    start(duration);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      scaleAnimRef.current?.stop();
    };
  }, [duration, toastId, start, scaleAnim]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => pauseTimer(),
      onPanResponderRelease: () => resumeTimer(),
      onPanResponderTerminate: () => resumeTimer(),
    }),
  ).current;

  return (
    <View
      style={[styles.container, { backgroundColor: theme.background, borderLeftColor: theme.border }]}
      {...panResponder.panHandlers}
    >
      {/* Contenido */}
      <View style={styles.body}>
        <View style={[styles.iconContainer, { backgroundColor: theme.iconBg }]}>
          <Text style={styles.iconText}>{theme.icon}</Text>
        </View>

        <View style={styles.textContainer}>
          {text1 ? (
            <Text style={[styles.title, { color: theme.title }]} numberOfLines={2}>
              {text1}
            </Text>
          ) : null}
          {text2 ? (
            <Text style={[styles.message, { color: theme.message }]} numberOfLines={3}>
              {text2}
            </Text>
          ) : null}
        </View>

        <TouchableOpacity
          onPress={() => Toast.hide()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.closeButton}
          activeOpacity={0.6}
        >
          <Text style={[styles.closeIcon, { color: theme.border }]}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Barra de progreso — scaleX desde izquierda */}
      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressBar,
            { backgroundColor: theme.progress, transform: [{ scaleX: scaleAnim }] },
          ]}
        />
      </View>
    </View>
  );
};

export const toastConfig = {
  success: (props: BaseToastProps) => <ToastCard {...props} type="success" />,
  error:   (props: BaseToastProps) => <ToastCard {...props} type="error" />,
  warning: (props: BaseToastProps) => <ToastCard {...props} type="warning" />,
  info:    (props: BaseToastProps) => <ToastCard {...props} type="info" />,
};

const styles = StyleSheet.create({
  container: {
    width:           '90%',
    borderRadius:    12,
    borderLeftWidth: 5,
    overflow:        'hidden',
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 3 },
    shadowOpacity:   0.12,
    shadowRadius:    6,
    elevation:       999,
  },
  body: {
    flexDirection:   'row',
    alignItems:      'center',
    paddingVertical: 12,
    paddingLeft:     14,
    paddingRight:    10,
    gap:             10,
  },
  iconContainer: {
    width:          30,
    height:         30,
    borderRadius:   15,
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
  },
  iconText: {
    color:      '#FFFFFF',
    fontSize:   13,
    fontWeight: '700',
  },
  textContainer: {
    flex: 1,
    gap:  2,
  },
  title: {
    fontSize:   14,
    fontWeight: '600',
    lineHeight: 20,
  },
  message: {
    fontSize:   13,
    fontWeight: '400',
    lineHeight: 18,
    opacity:    0.9,
  },
  closeButton: {
    padding:    4,
    flexShrink: 0,
  },
  closeIcon: {
    fontSize:   12,
    fontWeight: '700',
  },
  progressTrack: {
    height:          3,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  progressBar: {
    height:          '100%',
    width:           '100%',
    transformOrigin: 'left',
  },
});