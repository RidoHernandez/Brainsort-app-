/**
 * LeaderboardScreen.tsx
 * BrainSort — Pantalla de ranking global
 *
 * task_breakdown.md T-FE-100
 *
 * Implementa:
 *   - Muestra top N del leaderboard
 *   - Paginación con query params (limit, offset)
 *   - Muestra posición, nombre, puntos, nivel
 *   - Llama useProgress().leaderboard
 *
 * Referencia: 02-frontend-app.md §1 screens/gamification/LeaderboardScreen.tsx
 *            hooks/useProgress.ts
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useProgress } from '../../hooks/useProgress';
import { SafeAreaWrapper } from '../../components/layout/SafeAreaWrapper';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/common/Button';
import { LeaderboardRow } from '../../components/gamification/LeaderboardRow';
import {
  DarkSurfaces,
  DarkText,
  Accent,
  Semantic,
  Primary,
} from '../../styles/colors';
import { FontWeights, TextVariants } from '../../styles/typography';
import { Spacing, SpacingAlias, BorderRadius } from '../../styles/spacing';

// ─── Componente ───────────────────────────────────────────────────────────────

/**
 * Pantalla de ranking global.
 *
 * @example
 * <LeaderboardScreen />
 */
export const LeaderboardScreen: React.FC = () => {
  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);

  const {
    leaderboard,
    isLoadingLeaderboard,
    refetchLeaderboard,
  } = useProgress();

  const handleLoadMore = () => {
    setOffset((prev) => prev + limit);
    refetchLeaderboard();
  };

  if (isLoadingLeaderboard && !leaderboard) {
    return (
      <SafeAreaWrapper>
        <View style={styles.center}>
          <ActivityIndicator color={Accent[500]} size="large" />
        </View>
      </SafeAreaWrapper>
    );
  }

  if (!leaderboard) {
    return (
      <SafeAreaWrapper>
        <Header title="Ranking" showBackButton />
        <View style={styles.center}>
          <Text style={styles.errorText}>Error cargando ranking</Text>
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <Header title="Ranking Global" showBackButton />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Top 3 Podium */}
        {leaderboard.ranking && leaderboard.ranking.length >= 3 && (
          <View style={styles.podiumContainer}>
            {/* 2nd Place */}
            <View style={[styles.podiumItem, styles.podiumSecond]}>
              <View style={styles.podiumRank}>
                <Text style={styles.podiumRankNumber}>2</Text>
              </View>
              <Text style={styles.podiumName}>
                {leaderboard.ranking[1]?.nombre}
              </Text>
              <Text style={styles.podiumPoints}>
                {leaderboard.ranking[1]?.puntosTotales} XP
              </Text>
              <Text style={styles.podiumLevel}>
                Nivel {leaderboard.ranking[1]?.nivelActual}
              </Text>
            </View>

            {/* 1st Place */}
            <View style={[styles.podiumItem, styles.podiumFirst]}>
              <View style={[styles.podiumRank, styles.podiumRankFirst]}>
                <Text style={styles.podiumRankNumber}>1</Text>
              </View>
              <Text style={styles.podiumName}>
                {leaderboard.ranking[0]?.nombre}
              </Text>
              <Text style={styles.podiumPoints}>
                {leaderboard.ranking[0]?.puntosTotales} XP
              </Text>
              <Text style={styles.podiumLevel}>
                Nivel {leaderboard.ranking[0]?.nivelActual}
              </Text>
            </View>

            {/* 3rd Place */}
            <View style={[styles.podiumItem, styles.podiumThird]}>
              <View style={styles.podiumRank}>
                <Text style={styles.podiumRankNumber}>3</Text>
              </View>
              <Text style={styles.podiumName}>
                {leaderboard.ranking[2]?.nombre}
              </Text>
              <Text style={styles.podiumPoints}>
                {leaderboard.ranking[2]?.puntosTotales} XP
              </Text>
              <Text style={styles.podiumLevel}>
                Nivel {leaderboard.ranking[2]?.nivelActual}
              </Text>
            </View>
          </View>
        )}

        {/* Full List */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Top {leaderboard.ranking?.length || 0} (Total: {leaderboard.total})
          </Text>
          <FlatList
            data={leaderboard.ranking}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled={false}
            renderItem={({ item, index }) => (
              <LeaderboardRow
                posicion={item.posicion ?? index + 1}
                nombre={item.nombre}
                puntos={item.puntosTotales}
                nivel={item.nivelActual}
              />
            )}
          />
        </View>

        <Button
          title="Cargar Más"
          onPress={handleLoadMore}
          variant="secondary"
          disabled={offset >= (leaderboard.total || 0)}
        />
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
    paddingBottom: Spacing[8],
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
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: Spacing[6],
    paddingHorizontal: Spacing[2],
  },
  podiumItem: {
    alignItems: 'center',
    width: '30%',
    backgroundColor: DarkSurfaces.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing[3],
  },
  podiumFirst: {
    backgroundColor: Semantic.success,
    paddingBottom: Spacing[5],
  },
  podiumSecond: {
    backgroundColor: Accent[500],
    paddingBottom: Spacing[3],
  },
  podiumThird: {
    backgroundColor: Primary[500],
    paddingBottom: Spacing[2],
  },
  podiumRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: DarkSurfaces.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing[2],
  },
  podiumRankFirst: {
    backgroundColor: Semantic.successLight,
  },
  podiumRankNumber: {
    ...TextVariants.labelMd,
    color: DarkText.primary,
    fontWeight: FontWeights.bold,
  },
  podiumName: {
    ...TextVariants.bodySm,
    color: DarkText.primary,
    textAlign: 'center',
    marginBottom: Spacing[1],
  },
  podiumPoints: {
    ...TextVariants.labelMd,
    color: DarkText.primary,
    fontWeight: FontWeights.semiBold,
  },
  podiumLevel: {
    ...TextVariants.caption,
    color: DarkText.muted,
  },
  card: {
    backgroundColor: DarkSurfaces.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing[4],
    marginBottom: Spacing[4],
  },
  cardTitle: {
    ...TextVariants.h4,
    color: DarkText.secondary,
    marginBottom: Spacing[3],
  },
});
