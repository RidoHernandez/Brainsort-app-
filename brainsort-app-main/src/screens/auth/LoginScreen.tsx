/**
 * LoginScreen.tsx
 * BrainSort — Pantalla de inicio de sesión
 *
 * task_breakdown.md T-FE-093
 *
 * Implementa:
 *   - Campos: correo + contraseña
 *   - Validación básica en cliente antes de llamar API
 *   - Llama useAuth().login() — conecta con POST /api/auth/login
 *   - Estado de carga visual durante el request
 *   - Mensaje de error tipado desde AuthError
 *   - Link hacia RegisterScreen
 *
 * Referencia: architecture-auth.spec.md §2.1, §3.1
 */

import React, { useState, useCallback } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
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
} from '../../styles/colors';
import { BorderRadius, BorderWidths, Spacing, SpacingAlias } from '../../styles/spacing';
import {
  FontFamilies,
  FontSizes,
  FontWeights,
  TextVariants,
} from '../../styles/typography';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: DarkSurfaces.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SpacingAlias.screenPaddingX,
    paddingVertical: Spacing[10],
  },

  // Header
  headerContainer: {
    marginBottom: Spacing[8],
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

  // Form
  fieldContainer: {
    marginBottom: Spacing[4],
  },
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
  inputFocused: {
    borderColor: Accent[500],
  },
  inputError: {
    borderColor: Semantic.error,
  },

  // Error banner
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

  // Submit button
  submitButton: {
    backgroundColor: Primary[500],
    borderRadius: BorderRadius.lg,
    paddingVertical: SpacingAlias.buttonPaddingY,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing[2],
    minHeight: 50,
  },
  submitButtonDisabled: {
    opacity: 0.55,
  },
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
  footerText: {
    ...TextVariants.bodyMd,
    color: DarkText.muted,
  },
  footerLink: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.md,
    color: Accent[500],
  },
});

// ─── Componente ───────────────────────────────────────────────────────────────

export default function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();

  // Estado local del formulario
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // ─── Validación básica en cliente ────────────────────────────────────────

  const validate = (): string | null => {
    if (!correo.trim()) return 'El correo es requerido.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo))
      return 'Correo no válido.';
    if (!contrasena) return 'La contraseña es requerida.';
    if (contrasena.length < 8)
      return 'La contraseña debe tener al menos 8 caracteres.';
    return null;
  };

  // ─── Submit ───────────────────────────────────────────────────────────────

  const handleLogin = useCallback(async () => {
    setErrorMessage(null);
    const validationError = validate();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsLoading(true);
    try {
      await login(correo.trim().toLowerCase(), contrasena);
      // Si login es exitoso → AuthContext.isAuthenticated = true
      // → AppNavigator detect automáticamente y cambia a MainTabNavigator
    } catch (err: any) {
      setErrorMessage(
        err?.message ?? 'Error al iniciar sesión. Intenta nuevamente.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [correo, contrasena, login]);

  const hasFieldError = (field: 'correo' | 'contrasena') => {
    if (!errorMessage) return false;
    if (field === 'correo') return errorMessage.toLowerCase().includes('correo');
    if (field === 'contrasena') return errorMessage.toLowerCase().includes('contraseña');
    return false;
  };

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
          <Text style={styles.title}>Bienvenido de vuelta</Text>
          <Text style={styles.subtitle}>
            Ingresa tu correo y contraseña para continuar.
          </Text>
        </View>

        {/* Error banner */}
        {errorMessage && (
          <View style={styles.errorBanner} accessibilityRole="alert">
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* Campo correo */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            style={[
              styles.input,
              focusedField === 'correo' && styles.inputFocused,
              hasFieldError('correo') && styles.inputError,
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
              hasFieldError('contrasena') && styles.inputError,
            ]}
            value={contrasena}
            onChangeText={setContrasena}
            onFocus={() => setFocusedField('contrasena')}
            onBlur={() => setFocusedField(null)}
            placeholder="Mínimo 8 caracteres"
            placeholderTextColor={DarkText.muted}
            secureTextEntry
            textContentType="password"
            returnKeyType="done"
            onSubmitEditing={handleLogin}
            editable={!isLoading}
            accessibilityLabel="Contraseña"
            testID="input-contrasena"
          />
        </View>

        {/* Botón submit */}
        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Iniciar sesión"
          testID="btn-login"
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>Iniciar Sesión</Text>
          )}
        </TouchableOpacity>

        {/* Link a Register */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>¿No tienes cuenta?</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            accessibilityRole="link"
            accessibilityLabel="Crear cuenta"
            testID="link-register"
          >
            <Text style={styles.footerLink}>Regístrate</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
