/**
 * RegisterScreen.tsx
 * BrainSort — Pantalla de registro de usuario
 *
 * task_breakdown.md T-FE-094
 *
 * Implementa:
 *   - Campos: nombre, correo, contraseña (mín 8 chars)
 *   - Selector de rol: Estudiante | Profesor | Autodidacta
 *   - Validación en cliente
 *   - Llama useAuth().register() → POST /api/auth/register
 *   - Estado de carga + manejo de error
 *   - Link hacia LoginScreen
 *
 * Referencia: architecture-auth.spec.md §2.2
 *             task_breakdown.md T-BE-039 (RegisterDTO backend)
 */

import React, { useState, useCallback } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useAuth } from '../../hooks/useAuth';
import {
  DarkSurfaces,
  DarkText,
  Primary,
  Accent,
  Semantic,
  SimulationColors,
} from '../../styles/colors';
import { BorderRadius, BorderWidths, Spacing, SpacingAlias } from '../../styles/spacing';
import {
  FontFamilies,
  FontSizes,
  FontWeights,
  TextVariants,
} from '../../styles/typography';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;
type Rol = 'Estudiante' | 'Profesor' | 'Autodidacta';

// ─── Constantes ───────────────────────────────────────────────────────────────

const ROLES: { value: Rol; label: string; icon: string; description: string }[] = [
  {
    value: 'Estudiante',
    label: 'Estudiante',
    icon: '📚',
    description: 'Aprendo en clases o por mi cuenta',
  },
  {
    value: 'Profesor',
    label: 'Profesor',
    icon: '🎓',
    description: 'Enseño o facilito el aprendizaje',
  },
  {
    value: 'Autodidacta',
    label: 'Autodidacta',
    icon: '⚡',
    description: 'Aprendo a mi ritmo sin estructura',
  },
];

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: DarkSurfaces.background,
  },
  scroll: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SpacingAlias.screenPaddingX,
    paddingVertical: Spacing[10],
  },

  headerContainer: {
    marginBottom: Spacing[6],
  },
  title: {
    ...TextVariants.h2,
    color: DarkText.primary,
    marginBottom: Spacing[1],
  },
  subtitle: {
    ...TextVariants.bodyMd,
    color: DarkText.secondary,
  },

  // Fields
  fieldContainer: { marginBottom: Spacing[4] },
  label: {
    fontFamily: FontFamilies.medium,
    fontWeight: FontWeights.medium,
    fontSize: FontSizes.sm,
    color: DarkText.secondary,
    marginBottom: Spacing[2],
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: DarkSurfaces.surfaceElevated,
    borderWidth: BorderWidths.thin,
    borderColor: DarkSurfaces.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: SpacingAlias.inputPaddingX,
    paddingVertical: SpacingAlias.inputPaddingY,
    fontSize: FontSizes.md,
    fontFamily: FontFamilies.regular,
    color: DarkText.primary,
    minHeight: 48,
  },
  inputFocused: { borderColor: Accent[500] },
  inputError: { borderColor: Semantic.error },

  // Rol selector
  rolLabel: {
    fontFamily: FontFamilies.medium,
    fontWeight: FontWeights.medium,
    fontSize: FontSizes.sm,
    color: DarkText.secondary,
    marginBottom: Spacing[2],
    letterSpacing: 0.2,
  },
  rolGrid: { gap: Spacing[2] },
  rolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    padding: Spacing[3],
    borderRadius: BorderRadius.md,
    borderWidth: BorderWidths.thin,
    borderColor: DarkSurfaces.border,
    backgroundColor: DarkSurfaces.surface,
  },
  rolCardActive: {
    borderColor: Accent[500],
    backgroundColor: 'rgba(0, 212, 255, 0.08)',
  },
  rolIcon: { fontSize: 24, width: 32, textAlign: 'center' },
  rolInfo: { flex: 1 },
  rolName: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.md,
    color: DarkText.primary,
  },
  rolNameActive: { color: Accent[500] },
  rolDescription: {
    ...TextVariants.bodySm,
    color: DarkText.muted,
    marginTop: 2,
  },
  rolCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: DarkSurfaces.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rolCheckActive: {
    borderColor: Accent[500],
    backgroundColor: Accent[500],
  },
  rolCheckDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },

  // Error
  errorBanner: {
    backgroundColor: 'rgba(208, 2, 27, 0.12)',
    borderWidth: BorderWidths.thin,
    borderColor: Semantic.error,
    borderRadius: BorderRadius.md,
    padding: Spacing[3],
    marginBottom: Spacing[4],
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[2],
  },
  errorIcon: { fontSize: 16 },
  errorText: {
    ...TextVariants.bodySm,
    color: Semantic.error,
    flex: 1,
  },

  // Submit
  submitButton: {
    backgroundColor: Primary[500],
    borderRadius: BorderRadius.lg,
    paddingVertical: SpacingAlias.buttonPaddingY,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing[4],
    minHeight: 50,
  },
  submitButtonDisabled: { opacity: 0.55 },
  submitButtonText: {
    fontFamily: FontFamilies.bold,
    fontWeight: FontWeights.bold,
    fontSize: FontSizes.lg,
    color: '#FFFFFF',
  },

  // Footer
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing[6],
    gap: Spacing[1],
  },
  footerText: { ...TextVariants.bodyMd, color: DarkText.muted },
  footerLink: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.md,
    color: Accent[500],
  },
});

// ─── Componente ───────────────────────────────────────────────────────────────

export default function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();

  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [rol, setRol] = useState<Rol>('Estudiante');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // ─── Validación ───────────────────────────────────────────────────────────

  const validate = (): string | null => {
    if (!nombre.trim()) return 'El nombre es requerido.';
    if (nombre.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres.';
    if (!correo.trim()) return 'El correo es requerido.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return 'Correo no válido.';
    if (!contrasena) return 'La contraseña es requerida.';
    if (contrasena.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
    return null;
  };

  // ─── Submit ───────────────────────────────────────────────────────────────

  const handleRegister = useCallback(async () => {
    setErrorMessage(null);
    const validationError = validate();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsLoading(true);
    try {
      await register(nombre.trim(), correo.trim().toLowerCase(), rol, contrasena);
      // Si exitoso → AuthContext.isAuthenticated = true → AppNavigator navega a Main
    } catch (err: any) {
      setErrorMessage(
        err?.message ?? 'Error al crear la cuenta. Intenta nuevamente.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [nombre, correo, contrasena, rol, register]);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={styles.outer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Crea tu cuenta</Text>
          <Text style={styles.subtitle}>
            Es gratis. Empieza a aprender algoritmos hoy.
          </Text>
        </View>

        {/* Error banner */}
        {errorMessage && (
          <View style={styles.errorBanner} accessibilityRole="alert">
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* Campo nombre */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Nombre completo</Text>
          <TextInput
            style={[
              styles.input,
              focusedField === 'nombre' && styles.inputFocused,
            ]}
            value={nombre}
            onChangeText={setNombre}
            onFocus={() => setFocusedField('nombre')}
            onBlur={() => setFocusedField(null)}
            placeholder="Tu nombre"
            placeholderTextColor={DarkText.muted}
            autoCapitalize="words"
            textContentType="name"
            returnKeyType="next"
            editable={!isLoading}
            accessibilityLabel="Nombre completo"
            testID="input-nombre"
          />
        </View>

        {/* Campo correo */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            style={[
              styles.input,
              focusedField === 'correo' && styles.inputFocused,
            ]}
            value={correo}
            onChangeText={setCorreo}
            onFocus={() => setFocusedField('correo')}
            onBlur={() => setFocusedField(null)}
            placeholder="tu@correo.com"
            placeholderTextColor={DarkText.muted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="emailAddress"
            returnKeyType="next"
            editable={!isLoading}
            accessibilityLabel="Correo electrónico"
            testID="input-correo"
          />
        </View>

        {/* Campo contraseña */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={[
              styles.input,
              focusedField === 'contrasena' && styles.inputFocused,
            ]}
            value={contrasena}
            onChangeText={setContrasena}
            onFocus={() => setFocusedField('contrasena')}
            onBlur={() => setFocusedField(null)}
            placeholder="Mínimo 8 caracteres"
            placeholderTextColor={DarkText.muted}
            secureTextEntry
            textContentType="newPassword"
            returnKeyType="done"
            editable={!isLoading}
            accessibilityLabel="Contraseña"
            testID="input-contrasena"
          />
        </View>

        {/* Selector de rol */}
        <View style={styles.fieldContainer}>
          <Text style={styles.rolLabel}>¿Cómo describes tu perfil?</Text>
          <View style={styles.rolGrid}>
            {ROLES.map((r) => {
              const isActive = rol === r.value;
              return (
                <TouchableOpacity
                  key={r.value}
                  style={[styles.rolCard, isActive && styles.rolCardActive]}
                  onPress={() => setRol(r.value)}
                  activeOpacity={0.8}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isActive }}
                  accessibilityLabel={`Rol: ${r.label}`}
                  testID={`rol-${r.value}`}
                  disabled={isLoading}
                >
                  <Text style={styles.rolIcon}>{r.icon}</Text>
                  <View style={styles.rolInfo}>
                    <Text style={[styles.rolName, isActive && styles.rolNameActive]}>
                      {r.label}
                    </Text>
                    <Text style={styles.rolDescription}>{r.description}</Text>
                  </View>
                  <View style={[styles.rolCheck, isActive && styles.rolCheckActive]}>
                    {isActive && <View style={styles.rolCheckDot} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Botón submit */}
        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleRegister}
          disabled={isLoading}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Crear cuenta"
          testID="btn-register"
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>Crear Cuenta</Text>
          )}
        </TouchableOpacity>

        {/* Link a Login */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>¿Ya tienes cuenta?</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            accessibilityRole="link"
            accessibilityLabel="Iniciar sesión"
            testID="link-login"
          >
            <Text style={styles.footerLink}>Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
