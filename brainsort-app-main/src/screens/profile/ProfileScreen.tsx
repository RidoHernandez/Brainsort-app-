/**
 * ProfileScreen.tsx
 * BrainSort — Pantalla de perfil del usuario
 *
 * task_breakdown.md T-FE-102
 *
 * Implementa:
 *   - Muestra información del usuario (nombre, correo, rol)
 *   - Permite editar nombre (PATCH /api/users/me)
 *   - Muestra tier, barra de XP y nivel (gamification-xp-progression.spec.md)
 *   - Muestra racha de días y estadísticas (simulaciones, ejercicios, ranking)
 *   - Lista de insignias desbloqueadas
 *   - Enlace a SettingsScreen
 *   - Botón de logout
 *   - Datos mock para DEV cuando no hay backend
 *
 * Referencia: 02-frontend-app.md §1 screens/profile/ProfileScreen.tsx
 *            gamification-xp-progression.spec.md §8
 *            04-contratos-api.md §6
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthContext } from '../../context/AuthContext';
import { useAuth } from '../../hooks/useAuth';
import { useProgress } from '../../hooks/useProgress';
import { apiClient } from '../../services/api';
import { SafeAreaWrapper } from '../../components/layout/SafeAreaWrapper';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/common/Button';
import { PointsBanner } from '../../components/gamification/PointsBanner';
import { StreakCounter } from '../../components/gamification/StreakCounter';
import { BadgeCard } from '../../components/gamification/BadgeCard';
import { XpProgressBar } from '../../components/gamification/XpProgressBar';
import { TierBadge } from '../../components/gamification/TierBadge';
import { ProfileStatsCard } from '../../components/gamification/ProfileStatsCard';
import {
  DarkSurfaces,
  DarkText,
  Accent,
  Semantic,
} from '../../styles/colors';
import { FontFamilies, FontSizes, FontWeights, TextVariants } from '../../styles/typography';
import { Spacing, SpacingAlias, BorderRadius } from '../../styles/spacing';
import {
  calcularProgresoNivel,
  obtenerTier,
} from '../../utils/xp.utils';
import type { ProfileStackParamList } from '../../navigation/ProfileStackNavigator';
import type { UsuarioProgreso } from '../../services/progress.service';

// ─── Tipos de Navegación ──────────────────────────────────────────────────────

type ProfileNavProp = NativeStackNavigationProp<ProfileStackParamList, 'Profile'>;

// ─── Componente ───────────────────────────────────────────────────────────────

/**
 * Pantalla de perfil del usuario con datos de progreso y gamificación.
 *
 * @example
 * <ProfileScreen />
 */
export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileNavProp>();
  const { usuario, isLoading: isLoadingAuth } = useAuthContext();
  const { logout } = useAuth();
  const { progreso, isLoadingProgreso } = useProgress();

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(usuario?.nombre || '');
  const [isSaving, setIsSaving] = useState(false);
  const [localName, setLocalName] = useState<string | null>(null);

  // Usar datos reales de la API
  const datosProgreso = progreso;
  const nombreMostrado = localName ?? usuario?.nombre ?? '';

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!editedName.trim()) return;
    setIsSaving(true);
    try {
      await apiClient.patch('/users/me', { nombre: editedName });
      setLocalName(editedName);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedName(nombreMostrado);
    setIsEditing(false);
  };

  const handleEditPress = () => {
    setEditedName(nombreMostrado);
    setIsEditing(true);
  };

  // ─── Carga inicial ─────────────────────────────────────────────────────────

  if (isLoadingAuth) {
    return (
      <SafeAreaWrapper>
        <Header title="Mi Perfil" showBackButton />
        <View style={styles.center}>
          <ActivityIndicator color={Accent[500]} size="large" />
        </View>
      </SafeAreaWrapper>
    );
  }

  if (!usuario) {
    return (
      <SafeAreaWrapper>
        <Header title="Perfil" showBackButton />
        <View style={styles.center}>
          <Text style={styles.errorText}>Error cargando perfil</Text>
        </View>
      </SafeAreaWrapper>
    );
  }

  // ─── Calcular datos de progreso ────────────────────────────────────────────

  const progresoNivel = datosProgreso
    ? calcularProgresoNivel(datosProgreso.puntosTotales, datosProgreso.nivelActual)
    : null;
  const tier = datosProgreso ? obtenerTier(datosProgreso.nivelActual) : null;

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <SafeAreaWrapper>
      <Header title="Mi Perfil" showBackButton />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>

        {/* ── Avatar + Nombre ── */}
        <View style={styles.heroSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {nombreMostrado ? nombreMostrado.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
            {/* Tier badge superpuesto */}
            {tier && (
              <View style={styles.tierOverlay}>
                <Text style={styles.tierIconOverlay}>{tier.icono}</Text>
              </View>
            )}
          </View>

          {isEditing ? (
            <View style={styles.editNameContainer}>
              <TextInput
                style={styles.nameInput}
                value={editedName}
                onChangeText={setEditedName}
                autoFocus
                maxLength={50}
                placeholder="Tu nombre"
                placeholderTextColor={DarkText.disabled}
              />
              <View style={styles.editNameButtons}>
                <Button
                  title="Cancelar"
                  onPress={handleCancel}
                  variant="ghost"
                  style={styles.editBtnSm}
                />
                <Button
                  title="Guardar"
                  onPress={handleSave}
                  disabled={!editedName.trim() || isSaving}
                  loading={isSaving}
                  style={styles.editBtnSm}
                />
              </View>
            </View>
          ) : (
            <TouchableOpacity onPress={handleEditPress} style={styles.nameRow}>
              <Text style={styles.displayName}>{nombreMostrado}</Text>
              <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.correo}>{usuario.correo}</Text>
          <View style={styles.rolBadge}>
            <Text style={styles.rolText}>{usuario.rol}</Text>
          </View>
        </View>

        {/* ── Nivel, Tier y XP ── */}
        {datosProgreso && progresoNivel && tier ? (
          <View style={styles.card}>
            {/* Fila: Nivel + Puntos + Tier */}
            <View style={styles.levelRow}>
              <View style={styles.levelInfo}>
                <Text style={styles.levelNumber}>Nivel {datosProgreso.nivelActual}</Text>
                <Text style={styles.levelXP}>
                  {datosProgreso.puntosTotales.toLocaleString('es-MX')} XP totales
                </Text>
              </View>
              <TierBadge tier={tier} size="sm" />
            </View>

            {/* Barra de XP */}
            <XpProgressBar
              progresoNivel={progresoNivel}
              nivelActual={datosProgreso.nivelActual}
            />
          </View>
        ) : isLoadingProgreso ? (
          <View style={[styles.card, styles.center, { paddingVertical: Spacing[6] }]}>
            <ActivityIndicator color={Accent[500]} size="small" />
            <Text style={[styles.errorText, { marginTop: Spacing[2] }]}>
              Cargando progreso…
            </Text>
          </View>
        ) : null}

        {/* ── Racha de Días ── */}
        {datosProgreso && (
          <StreakCounter racha={datosProgreso.rachaDias} />
        )}

        {/* ── Estadísticas ── */}
        {datosProgreso && (
          <ProfileStatsCard
            simulacionesCompletadas={datosProgreso.simulacionesCompletadas}
            ejerciciosCorrectos={datosProgreso.ejerciciosCorrectos}
            ejerciciosTotales={datosProgreso.ejerciciosTotales}
            posicionRanking={datosProgreso.posicionRanking}
            puntosTotales={datosProgreso.puntosTotales}
          />
        )}

        {/* ── Insignias ── */}
        {datosProgreso && datosProgreso.insignias.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Insignias ({datosProgreso.insignias.length})
            </Text>
            {datosProgreso.insignias.map((insignia, idx) => (
              <BadgeCard
                key={`${insignia.nombre}-${idx}`}
                nombre={insignia.nombre}
                imagen={insignia.imagen}
                fechaObtencion={insignia.fechaObtencion}
              />
            ))}
          </View>
        )}

        {/* ── Cuenta ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Cuenta</Text>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>ID de usuario</Text>
            <Text style={styles.fieldValue} numberOfLines={1} ellipsizeMode="middle">
              {usuario.id}
            </Text>
          </View>
        </View>

        {/* ── Acciones ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Opciones</Text>

          <TouchableOpacity
            style={styles.settingsRow}
            onPress={() => navigation.navigate('Settings')}
            accessibilityLabel="Ir a configuración"
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
            <Text style={styles.settingsLabel}>Configuración</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <Button
            title="Cerrar Sesión"
            onPress={logout}
            style={styles.logoutButton}
          />
        </View>

      </ScrollView>
    </SafeAreaWrapper>
  );
};

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: SpacingAlias.screenPaddingX,
    paddingBottom: Spacing[10],
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...TextVariants.bodyMd,
    color: DarkText.muted,
  },

  // ── Hero ──
  heroSection: {
    alignItems: 'center',
    marginBottom: Spacing[6],
    paddingTop: Spacing[4],
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing[4],
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Accent[700],
    borderWidth: 3,
    borderColor: Accent[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: FontSizes['4xl'],
    color: DarkText.primary,
    fontWeight: FontWeights.bold,
    fontFamily: FontFamilies.bold,
  },
  tierOverlay: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: DarkSurfaces.surfaceElevated,
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Accent[500],
  },
  tierIconOverlay: {
    fontSize: 20,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    marginBottom: Spacing[1],
  },
  displayName: {
    ...TextVariants.h2,
    color: DarkText.primary,
    fontWeight: FontWeights.bold,
  },
  editIcon: {
    fontSize: FontSizes.md,
  },
  editNameContainer: {
    width: '100%',
    marginBottom: Spacing[2],
  },
  nameInput: {
    backgroundColor: DarkSurfaces.surfaceElevated,
    borderWidth: 1,
    borderColor: Accent[500],
    borderRadius: BorderRadius.md,
    padding: Spacing[3],
    color: DarkText.primary,
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.xl,
    textAlign: 'center',
    marginBottom: Spacing[2],
  },
  editNameButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing[3],
  },
  editBtnSm: {
    flex: 1,
  },
  correo: {
    ...TextVariants.bodyMd,
    color: DarkText.muted,
    marginBottom: Spacing[2],
  },
  rolBadge: {
    backgroundColor: DarkSurfaces.surfaceElevated,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[1],
    borderWidth: 1,
    borderColor: DarkSurfaces.border,
  },
  rolText: {
    ...TextVariants.labelSm,
    color: DarkText.secondary,
    fontWeight: FontWeights.medium,
  },

  // ── Nivel / XP ──
  card: {
    backgroundColor: DarkSurfaces.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing[5],
    marginBottom: Spacing[4],
  },
  cardTitle: {
    ...TextVariants.h4,
    color: DarkText.secondary,
    marginBottom: Spacing[4],
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing[2],
  },
  levelInfo: {
    flex: 1,
  },
  levelNumber: {
    ...TextVariants.h3,
    color: DarkText.primary,
    fontWeight: FontWeights.bold,
  },
  levelXP: {
    ...TextVariants.bodySm,
    color: DarkText.muted,
    marginTop: Spacing[1],
  },

  // ── Campo ──
  fieldRow: {
    marginBottom: Spacing[2],
  },
  fieldLabel: {
    ...TextVariants.bodySm,
    color: DarkText.muted,
    marginBottom: Spacing[1],
  },
  fieldValue: {
    ...TextVariants.bodyMd,
    color: DarkText.primary,
  },

  // ── Acciones ──
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: DarkSurfaces.border,
    marginBottom: Spacing[4],
  },
  settingsIcon: {
    fontSize: FontSizes.lg,
    marginRight: Spacing[3],
  },
  settingsLabel: {
    ...TextVariants.bodyMd,
    color: DarkText.primary,
    flex: 1,
  },
  chevron: {
    ...TextVariants.h3,
    color: DarkText.muted,
  },
  logoutButton: {
    backgroundColor: Semantic.error,
  },

  // ── DEV Banner ──
  devBanner: {
    backgroundColor: 'rgba(245,166,35,0.1)',
    borderWidth: 1,
    borderColor: '#F5A623',
    borderRadius: BorderRadius.md,
    padding: Spacing[3],
    alignItems: 'center',
    marginBottom: Spacing[4],
  },
  devText: {
    fontSize: FontSizes.xs,
    color: '#F5A623',
    fontFamily: FontFamilies.medium,
  },
});
