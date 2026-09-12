import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Colors } from '../../styles/colors';
import { MaterialIcons } from '@expo/vector-icons';

interface CompletionOverlayProps {
  visible: boolean;
  onRestart: () => void;
  onNext: () => void;
  onViewCode: () => void;
  onClose: () => void; // Added onClose prop
}

/**
 * T-FE-072: Overlay de "¡Algoritmo completado!" (HU-07)
 */
export const CompletionOverlay: React.FC<CompletionOverlayProps> = ({
  visible,
  onRestart,
  onNext,
  onViewCode,
  onClose,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

      // HU-07: Auto-desaparece a los 2 segundos (ajustado por usuario)
      timer = setTimeout(() => {
        onClose(); 
      }, 2000);
    } else {
      fadeAnim.setValue(0);
    }
    return () => clearTimeout(timer);
  }, [visible, fadeAnim, onClose]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <MaterialIcons name="check-circle" size={60} color={Colors.primary[600]} />
        </View>
        <Text style={styles.title}>¡Simulación Completada!</Text>
        <Text style={styles.subtitle}>Has dominado los pasos de este algoritmo.</Text>
        
        <View style={styles.buttonGroup}>
          <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={onRestart}>
            <MaterialIcons name="replay" size={20} color={Colors.neutral[0]} />
            <Text style={styles.buttonText}>Reiniciar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.button} onPress={onNext}>
            <MaterialIcons name="skip-next" size={20} color={Colors.neutral[900]} />
            <Text style={styles.buttonText}>Siguiente</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.textButton} onPress={onViewCode}>
          <Text style={styles.textButtonLabel}>Ver Código Completo</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  card: {
    width: '85%',
    backgroundColor: Colors.neutral[0],
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    color: Colors.neutral[900],
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: Colors.neutral[500],
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3A3A3C',
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 5,
  },
  primaryButton: {
    backgroundColor: Colors.primary[500],
  },
  buttonText: {
    color: Colors.neutral[0],
    fontWeight: '600',
    marginLeft: 8,
  },
  textButton: {
    padding: 10,
  },
  textButtonLabel: {
    color: Colors.primary[600],
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
