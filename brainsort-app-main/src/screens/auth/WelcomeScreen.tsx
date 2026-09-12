/**
 * WelcomeScreen.tsx
 * BrainSort — Pantalla de bienvenida
 *
 * task_breakdown.md T-FE-092
 *
 * Primera pantalla del flujo de autenticación.
 * Branding + CTA hacia Login o Register.
 *
 * Referencia: library-simulation.spec.md, architecture-auth.spec.md
 */

import React from 'react';
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { DarkSurfaces, DarkText, Primary, Accent, Neutral } from '../../styles/colors';
import { BorderRadius, Spacing, SpacingAlias } from '../../styles/spacing';
import {
  FontFamilies,
  FontSizes,
  FontWeights,
  TextVariants,
} from '../../styles/typography';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DarkSurfaces.background,
  },

  // Hero section
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SpacingAlias.screenPaddingX,
  },

  // Logo / branding
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: BorderRadius.xl,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderWidth: 1.5,
    borderColor: Accent[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[6],
  },
  logoEmoji: {
    fontSize: 48,
  },

  headline: {
    ...TextVariants.h1,
    color: DarkText.primary,
    textAlign: 'center',
    marginBottom: Spacing[2],
  },
  headlineAccent: {
    color: Accent[500],
  },
  tagline: {
    ...TextVariants.bodyLg,
    color: DarkText.secondary,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: Spacing[10],
    maxWidth: 320,
  },

  // Feature bullets
  featureList: {
    width: '100%',
    maxWidth: 340,
    gap: Spacing[3],
    marginBottom: Spacing[10],
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  featureIcon: {
    fontSize: 20,
    width: 32,
    textAlign: 'center',
  },
  featureText: {
    ...TextVariants.bodyMd,
    color: DarkText.secondary,
    flex: 1,
  },

  // CTA section
  ctaContainer: {
    width: '100%',
    paddingHorizontal: SpacingAlias.screenPaddingX,
    paddingBottom: Platform.OS === 'ios' ? Spacing[10] : Spacing[8],
    gap: Spacing[3],
  },

  primaryButton: {
    backgroundColor: Primary[500],
    borderRadius: BorderRadius.lg,
    paddingVertical: SpacingAlias.buttonPaddingY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontFamily: FontFamilies.bold,
    fontWeight: FontWeights.bold,
    fontSize: FontSizes.lg,
    color: '#FFFFFF',
  },

  secondaryButton: {
    borderRadius: BorderRadius.lg,
    paddingVertical: SpacingAlias.buttonPaddingY,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: DarkSurfaces.border,
  },
  secondaryButtonText: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.lg,
    color: DarkText.secondary,
  },

  // Footer text
  footerText: {
    ...TextVariants.bodySm,
    color: DarkText.muted,
    textAlign: 'center',
    marginTop: Spacing[2],
  },
});

// ─── Componente ───────────────────────────────────────────────────────────────

const FEATURES = [
  { icon: '⇅', text: 'Visualiza algoritmos de ordenamiento paso a paso' },
  { icon: '🧠', text: 'Aprende con ejercicios de predicción interactivos' },
  { icon: '🏆', text: 'Sube de nivel y desbloquea insignias' },
  { icon: '📴', text: 'Estudia sin conexión desde tu celular' },
];

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      {/* Hero */}
      <View style={styles.hero}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>⇅</Text>
        </View>

        {/* Headline */}
        <Text style={styles.headline}>
          Brain<Text style={styles.headlineAccent}>Sort</Text>
        </Text>
        <Text style={styles.tagline}>
          Domina los algoritmos con visualizaciones interactivas y aprende a
          tu ritmo.
        </Text>

        {/* Feature bullets */}
        <View style={styles.featureList}>
          {FEATURES.map(({ icon, text }) => (
            <View key={text} style={styles.featureItem}>
              <Text style={styles.featureIcon}>{icon}</Text>
              <Text style={styles.featureText}>{text}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* CTAs */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Iniciar sesión"
          testID="btn-go-login"
        >
          <Text style={styles.primaryButtonText}>Iniciar Sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Register')}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Crear cuenta"
          testID="btn-go-register"
        >
          <Text style={styles.secondaryButtonText}>Crear Cuenta</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Al continuar, aceptas nuestros términos de uso.
        </Text>
      </View>
    </View>
  );
}
