/**
 * Input.tsx
 * BrainSort — Componente de entrada de texto reutilizable
 *
 * task_breakdown.md T-FE-057
 *
 * Props:
 *   • placeholder: Texto de placeholder
 *   • value: Valor actual
 *   • onChangeText: Callback de cambio
 *   • secureTextEntry: Para contraseñas
 *   • error: Mensaje de error (si aplica)
 *   • multiline: Para textos largos
 *   • editable: Permitir edición
 *
 * Se usa en: LoginScreen, RegisterScreen, formularios.
 *
 * Referencia: 02-frontend-app.md §1 components/common/Input.tsx
 */

import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { Colors } from '../../styles/colors';
import { Spacing } from '../../styles/spacing';
import { TextVariants } from '../../styles/typography';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface InputProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  error?: string;
  multiline?: boolean;
  numberOfLines?: number;
  editable?: boolean;
  style?: ViewStyle;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?:
    | 'default'
    | 'email-address'
    | 'numeric'
    | 'phone-pad'
    | 'decimal-pad';
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing[4],
  },
  label: {
    ...TextVariants.caption,
    color: Colors.neutral[700],
    marginBottom: Spacing[1],
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: 8,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
    backgroundColor: Colors.neutral[0],
  },
  inputContainerFocused: {
    borderColor: Colors.primary[500],
  },
  inputContainerError: {
    borderColor: Colors.semantic.error,
  },
  input: {
    ...TextVariants.bodyMd,
    color: Colors.neutral[900],
    padding: 0,
    margin: 0,
    minHeight: 40,
  },
  inputPlaceholder: {
    color: Colors.neutral[500],
  },
  errorText: {
    ...TextVariants.caption,
    color: Colors.semantic.error,
    marginTop: Spacing[1],
  },
});

// ─── Componente ───────────────────────────────────────────────────────────────

/**
 * Componente de entrada de texto con soporte para errores y estados.
 *
 * @example
 * <Input
 *   placeholder="Ingresa tu email"
 *   value={email}
 *   onChangeText={setEmail}
 *   keyboardType="email-address"
 *   error={emailError}
 * />
 *
 * @example
 * <Input
 *   placeholder="Contraseña"
 *   value={password}
 *   onChangeText={setPassword}
 *   secureTextEntry
 * />
 */
export const Input: React.FC<InputProps> = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  error,
  multiline = false,
  numberOfLines,
  editable = true,
  style,
  autoCapitalize = 'none',
  keyboardType = 'default',
}) => {
  const [isFocused, setIsFocused] = React.useState(false);

  const inputContainerStyle: ViewStyle | ViewStyle[] = [
    styles.inputContainer,
    isFocused ? styles.inputContainerFocused : {},
    error ? styles.inputContainerError : {},
  ];

  return (
    <View style={[styles.container, style]}>
      <View style={inputContainerStyle}>
        <TextInput
          style={[
            styles.input,
            multiline && { minHeight: numberOfLines ? numberOfLines * 30 : 80 },
          ]}
          placeholder={placeholder}
          placeholderTextColor={styles.inputPlaceholder.color}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          selectionColor={Colors.primary[500]}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};
