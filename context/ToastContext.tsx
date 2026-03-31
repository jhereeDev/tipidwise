import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { Animated, Text, View, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from './ThemeContext';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  show: (type: ToastType, title: string, message?: string, duration?: number) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  show: () => {},
  success: () => {},
  error: () => {},
  warning: () => {},
  info: () => {},
});

let nextId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((type: ToastType, title: string, message?: string, duration = 3500) => {
    const id = ++nextId;
    setToasts((prev) => [...prev, { id, type, title, message, duration }]);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{
      show,
      success: (t, m) => show('success', t, m),
      error: (t, m) => show('error', t, m),
      warning: (t, m) => show('warning', t, m),
      info: (t, m) => show('info', t, m),
    }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

// --- Toast UI ---

const TOAST_CONFIG: Record<ToastType, { icon: string; bg: string; accent: string }> = {
  success: { icon: '✓', bg: '#ECFDF5', accent: '#10B981' },
  error: { icon: '✕', bg: '#FEF2F2', accent: '#EF4444' },
  warning: { icon: '!', bg: '#FFFBEB', accent: '#F59E0B' },
  info: { icon: 'i', bg: '#EFF6FF', accent: '#3B82F6' },
};

const TOAST_CONFIG_DARK: Record<ToastType, { bg: string; accent: string }> = {
  success: { bg: '#064E3B', accent: '#34D399' },
  error: { bg: '#7F1D1D', accent: '#FCA5A5' },
  warning: { bg: '#78350F', accent: '#FCD34D' },
  info: { bg: '#1E3A5F', accent: '#93C5FD' },
};

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        top: insets.top + 8,
        left: 16,
        right: 16,
        zIndex: 9999,
        elevation: 9999,
      }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </View>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const theme = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  const config = TOAST_CONFIG[toast.type];
  const darkConfig = TOAST_CONFIG_DARK[toast.type];
  const bg = theme.isDark ? darkConfig.bg : config.bg;
  const accent = theme.isDark ? darkConfig.accent : config.accent;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -20, duration: 200, useNativeDriver: true }),
      ]).start(() => onDismiss());
    }, toast.duration ?? 3500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }], marginBottom: 8 }}>
      <TouchableOpacity
        onPress={onDismiss}
        activeOpacity={0.9}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: bg,
          borderRadius: 12,
          padding: 14,
          gap: 12,
          borderLeftWidth: 4,
          borderLeftColor: accent,
          ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8 },
            android: { elevation: 6 },
          }),
        }}
      >
        <View style={{
          width: 28, height: 28, borderRadius: 14,
          backgroundColor: accent,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>{config.icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 14, fontWeight: '600', color: theme.isDark ? '#F1F5F9' : '#111827',
            marginBottom: toast.message ? 2 : 0,
          }}>
            {toast.title}
          </Text>
          {toast.message && (
            <Text style={{ fontSize: 12, color: theme.isDark ? '#94A3B8' : '#6B7280' }} numberOfLines={2}>
              {toast.message}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
