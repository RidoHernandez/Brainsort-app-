/**
 * Toast.tsx
 * BrainSort — Componente de notificación no intrusiva
 *
 * task_breakdown.md T-FE-059
 *
 * Props:
 *   • message: Texto a mostrar
 *   • type: Tipo (success | error | warning | info)
 *   • duration: Duración en ms (defecto: 5000)
 *   • onDismiss: Callback al desaparecer
 *
 * Requisito HU-07: Auto-desaparece a los 5 segundos.
 * Requisito HU-07: Toast de "¡Algoritmo completado!"
 *
 * Referencia: 02-frontend-app.md §1 components/common/Toast.tsx
 *            HU-07: Notificaciones
 */

import React, { useEffect } from 'react';
import {
  Animated,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Dimensions,
} from 'react-native';
import { Colors } from '../../styles/colors';
import { Spacing } from '../../styles/spacing';
import { TextVariants } from '../../styles/typography';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onDismiss?: () => void;
  visible?: boolean;
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const getTypeStyles = (
  type: ToastType,
): { backgroundColor: string; textColor: string } => {
  switch (type) {
    case 'success':
      return { backgroundColor: Colors.semantic.success, textColor: Colors.neutral[0] };
    case 'error':
      return { backgroundColor: Colors.semantic.error, textColor: Colors.neutral[0] };
    case 'warning':
      return { backgroundColor: Colors.semantic.warning, textColor: Colors.neutral[0] };
    case 'info':
    default:
      return { backgroundColor: Colors.primary[500], textColor: Colors.neutral[0] };
  }
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Spacing[6],
    left: Spacing[4],
    right: Spacing[4],
    borderRadius: 8,
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[6],
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 9999,
  },
  text: {
    ...TextVariants.bodyMd,
    flex: 1,
  },
});

// ─── Componente ───────────────────────────────────────────────────────────────

/**
 * Componente de notificación no intrusiva que auto-desaparece.
 * Se usa para feedback de acciones (éxito, error, warning).
 *
 * @example
 * const [toastVisible, setToastVisible] = useState(false);
 *
 * const showToast = () => {
 *   setToastVisible(true);
 * };
 *
 * return (
 *   <>
 *     <Button onPress={showToast} title="Mostrar Toast" />
 *     {toastVisible && (
 *       <Toast
 *         message="¡Acción completada!"
 *         type="success"
 *         visible={toastVisible}
 *         onDismiss={() => setToastVisible(false)}
 *       />
 *     )}
 *   </>
 * );
 */
export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 5000, // 5 segundos (HU-07)
  onDismiss,
  visible = true,
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const typeStyles = getTypeStyles(type);

  useEffect(() => {
    if (!visible) {
      return;
    }

    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Auto-dismiss después de duration
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        onDismiss?.();
      });
    }, duration);

    return () => clearTimeout(timer);
  }, [visible, duration, fadeAnim, onDismiss]);

  if (!visible) {
    return null;
  }

  const containerStyle: ViewStyle = {
    ...styles.container,
    backgroundColor: typeStyles.backgroundColor,
  };

  const textStyle: TextStyle = {
    ...styles.text,
    color: typeStyles.textColor,
  };

  return (
    <Animated.View style={[containerStyle, { opacity: fadeAnim }]}>
      <Text style={textStyle}>{message}</Text>
    </Animated.View>
  );
};
