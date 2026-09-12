/**
 * LibraryScreen.tsx
 * BrainSort — Dashboard principal de biblioteca.
 */

import React, { useCallback, useMemo, useState } from 'react';
import {
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Svg, { Circle, G, Path, Polyline } from 'react-native-svg';
import { useLibrary } from '../../hooks/useLibrary';
import { useProgress } from '../../hooks/useProgress';
import { AlgorithmCard } from '../../components/algorithm/AlgorithmCard';
import { Spinner } from '../../components/common/Spinner';
import { AlgoritmoEnBiblioteca } from '../../services/library.service';
import { Accent, DarkText, Semantic } from '../../styles/colors';
import { BorderRadius, Spacing } from '../../styles/spacing';
import { FontFamilies, FontSizes, FontWeights } from '../../styles/typography';
import { LibraryStackParamList } from '../../navigation/LibraryStackNavigator';
import type { MainTabParamList } from '../../navigation/MainTabNavigator';
import { useThemeContext } from '../../context/ThemeContext';

type Props = NativeStackScreenProps<LibraryStackParamList, 'Library'>;
type MainTabNav = BottomTabNavigationProp<MainTabParamList>;
type NavIconName = 'book' | 'route' | 'progress' | 'offline' | 'profile';
type SidebarNavItem = {
  icon: NavIconName;
  label: string;
  tab: keyof MainTabParamList;
  accessibilityLabel: string;
};
type StatIconName = 'library' | 'check' | 'exercise' | 'streak';
type FilterIconName = 'all' | 'sort' | 'search' | 'list';

const CATEGORY_LABELS: Record<string, string> = {
  Ordenamiento: 'Ordenamiento',
  Busqueda: 'Búsqueda',
  EstructurasLineales: 'Estructuras lineales',
  EstructurasArboles: 'Estructuras de árboles',
};

const CATEGORY_ICONS: Record<string, string> = {
  Ordenamiento: 'sort',
  Busqueda: 'search',
  EstructurasLineales: 'list',
  EstructurasArboles: 'list',
};

const PREFERRED_ORDER: Record<string, number> = {
  'Bubble Sort': 1,
  'Insertion Sort': 2,
  'Selection Sort': 3,
  'Linked List': 4,
  Queue: 5,
  Stack: 6,
  'Segment Tree': 7,
};

export default function LibraryScreen({ navigation }: Props) {
  const tabNavigation = useNavigation<MainTabNav>();
  const {
    categorias,
    totalAlgoritmos,
    isLoading,
    isError,
    filteredAlgoritmos,
  } = useLibrary();
  const { progreso, isLoadingProgreso } = useProgress();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;
  const numColumns = width >= 1180 ? 3 : width >= 720 ? 2 : 1;

  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [searchText, setSearchText] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const completedSimulations = progreso?.simulacionesCompletadas;
  const correctExercises = progreso?.ejerciciosCorrectos;
  const totalExercises = progreso?.ejerciciosTotales;
  const completionPercent =
    totalExercises && totalExercises > 0
      ? Math.round(((correctExercises ?? 0) / totalExercises) * 100)
      : totalAlgoritmos && totalAlgoritmos > 0 && completedSimulations !== undefined
        ? Math.min(100, Math.round((completedSimulations / totalAlgoritmos) * 100))
        : 0;
  const metricSimulations = isLoadingProgreso ? '...' : String(completedSimulations ?? 0);
  const metricExercises = isLoadingProgreso
    ? '...'
    : `${correctExercises ?? 0}/${totalExercises ?? 0}`;
  const metricStreak = isLoadingProgreso ? '...' : `${progreso?.rachaDias ?? 0} días`;

  const handleCardPress = useCallback(
    (algo: AlgoritmoEnBiblioteca) => {
      navigation.navigate('AlgorithmDetail', { algoritmoId: algo.id });
    },
    [navigation],
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  }, []);

  const displayedAlgoritmos = useMemo(() => {
    const needle = searchText.trim().toLowerCase();
    return filteredAlgoritmos(selectedCategory)
      .filter((algo) => {
        if (!needle) return true;
        return [
          algo.nombre,
          algo.descripcion,
          algo.categoria,
          ...(algo.tags ?? []),
        ]
          .join(' ')
          .toLowerCase()
          .includes(needle);
      })
      .sort(
        (a, b) =>
          (PREFERRED_ORDER[a.nombre] ?? 99) - (PREFERRED_ORDER[b.nombre] ?? 99) ||
          a.nombre.localeCompare(b.nombre),
      );
  }, [filteredAlgoritmos, searchText, selectedCategory]);

  const filterItems = useMemo(
    () => [
      { value: undefined, label: 'Todos', icon: 'all' },
      ...(categorias ?? []).map((cat) => ({
        value: cat,
        label: CATEGORY_LABELS[cat] ?? cat,
        icon: CATEGORY_ICONS[cat] ?? 'all',
      })),
    ],
    [categorias],
  );

  if (isLoading && !isRefreshing) {
    return (
      <View style={[styles.screen, styles.center]}>
        <Spinner size="large" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.screen, styles.errorState]}>
        <Text style={styles.errorIcon}>⌁</Text>
        <Text style={styles.errorTitle}>Sin conexión</Text>
        <Text style={styles.errorText}>
          No se pudo cargar la biblioteca. Verifica el backend y vuelve a intentar.
        </Text>
        <TouchableOpacity style={styles.primaryButton} onPress={handleRefresh}>
          <Text style={styles.primaryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {isDesktop && (
        <DesktopSidebar
          activeTab="Biblioteca"
          onNavigate={(tab) => tabNavigation.navigate(tab)}
          completionPercent={completionPercent}
          progressCount={
            totalExercises && totalExercises > 0
              ? `${correctExercises ?? 0} / ${totalExercises} ejercicios`
              : completedSimulations !== undefined
                ? `${completedSimulations} simulaciones`
                : 'Sin progreso'
          }
          streakDays={progreso?.rachaDias}
        />
      )}

      <ScrollView
        style={styles.main}
        contentContainerStyle={[styles.mainContent, !isDesktop && styles.mainContentMobile]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Accent[500]}
            colors={[Accent[500]]}
          />
        }
      >
        <View style={[styles.header, !isDesktop && styles.headerMobile]}>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>Biblioteca</Text>
            <Text style={styles.subtitle}>
              Explora algoritmos y estructuras de datos. Aprende, practica y domina.
            </Text>
          </View>

          <View style={[styles.headerActions, !isDesktop && styles.headerActionsMobile]}>
            <View style={[styles.searchBox, !isDesktop && styles.searchBoxMobile]}>
              <View style={styles.searchIcon}>
                <SearchIcon color="#AEBBC4" size={18} />
              </View>
              <TextInput
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Buscar algoritmo o estructura..."
                placeholderTextColor="#9AA9B6"
                style={styles.searchInput}
                autoCapitalize="none"
                accessibilityLabel="Buscar algoritmo o estructura"
              />
            </View>
            <TouchableOpacity
              style={[styles.routeButton, !isDesktop && styles.routeButtonMobile]}
              activeOpacity={0.86}
              onPress={() => tabNavigation.navigate('Ruta')}
              accessibilityRole="button"
              accessibilityLabel="Continuar ruta de aprendizaje"
            >
              <Text style={styles.routeButtonText}>Continuar ruta</Text>
              <Text style={styles.routeArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <StatCard icon="library" label="Algoritmos disponibles" value={`${totalAlgoritmos ?? 0}`} tone="neutral" />
          <StatCard
            icon="check"
            label="Simulaciones completadas"
            value={metricSimulations}
            tone="success"
          />
          <StatCard
            icon="exercise"
            label="Ejercicios correctos"
            value={metricExercises}
            tone="warning"
          />
          <StatCard
            icon="streak"
            label="Racha actual"
            value={metricStreak}
            tone="info"
          />
        </View>

        <View style={[styles.filterRow, !isDesktop && styles.filterRowMobile]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContent}
          >
            {filterItems.map((item) => {
              const active = selectedCategory === item.value;
              const allActive = item.value === undefined && selectedCategory === undefined;
              return (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.filterChip, (active || allActive) && styles.filterChipActive]}
                  onPress={() => setSelectedCategory(item.value)}
                  activeOpacity={0.78}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: active || allActive }}
                >
                  <FilterIcon
                    name={item.icon as FilterIconName}
                    active={active || allActive}
                  />
                  <Text style={[styles.filterText, (active || allActive) && styles.filterTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {isDesktop && (
            <TouchableOpacity style={styles.moreFilters} activeOpacity={0.78}>
              <FilterIcon name="list" active={false} />
              <Text style={styles.moreFiltersText}>Más filtros</Text>
            </TouchableOpacity>
          )}
        </View>

        {displayedAlgoritmos.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>⌕</Text>
            <Text style={styles.emptyTitle}>No se encontraron algoritmos</Text>
            <Text style={styles.emptyText}>
              Prueba con otra búsqueda o cambia el filtro de categoría.
            </Text>
          </View>
        ) : (
          <View style={styles.cardGrid}>
            {displayedAlgoritmos.map((algo) => {
              const algoProg = progreso?.algoritmosProgreso?.find(
                (p) => p.algoritmoId === algo.id,
              );
              return (
                <View
                  key={algo.id}
                  style={[
                    styles.cardColumn,
                    { width: `${100 / numColumns}%` as any },
                  ]}
                >
                  <AlgorithmCard
                    algoritmo={algo}
                    onPress={handleCardPress}
                    progreso={algoProg}
                  />
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: StatIconName;
  label: string;
  value: string;
  tone: 'neutral' | 'success' | 'warning' | 'info';
}) {
  const iconColor =
    tone === 'success'
      ? '#6CFF35'
      : tone === 'warning'
        ? '#F0CB25'
        : tone === 'info'
          ? '#F5A623'
          : '#DCE6EE';

  return (
    <View style={styles.statCard}>
      <View style={styles.statIcon}>
        <DashboardStatIcon name={icon} color={iconColor} size={28} />
      </View>
      <View style={styles.statCopy}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>
      <View style={styles.statStatusIcon}>
        <DashboardStatIcon name={icon} color={iconColor} size={22} />
      </View>
    </View>
  );
}

function DashboardStatIcon({
  name,
  color,
  size,
}: {
  name: StatIconName;
  color: string;
  size: number;
}) {
  if (name === 'streak') {
    return <Text style={[styles.streakEmoji, { fontSize: size, lineHeight: size + 4 }]}>🔥</Text>;
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {name === 'library' && (
        <>
          <Path
            d="M12 4 4.5 7.7 12 11.4l7.5-3.7L12 4Z"
            stroke={color}
            strokeWidth={1.7}
            strokeLinejoin="round"
          />
          <Path
            d="M4.5 12.1 12 15.8l7.5-3.7M4.5 16.4 12 20l7.5-3.6"
            stroke={color}
            strokeWidth={1.7}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
      {name === 'check' && (
        <>
          <Circle cx={12} cy={12} r={8.5} stroke={color} strokeWidth={1.8} />
          <Path
            d="M7.8 12.3 10.7 15.1 16.3 8.9"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
      {name === 'exercise' && (
        <>
          <Circle cx={12} cy={12} r={8.5} stroke={color} strokeWidth={1.8} />
          <Path d="M12 6.7v5.6h5.1" stroke={color} strokeWidth={2} strokeLinecap="round" />
        </>
      )}
    </Svg>
  );
}

const SIDEBAR_NAV_ITEMS: SidebarNavItem[] = [
  { icon: 'book', label: 'Biblioteca', tab: 'Biblioteca', accessibilityLabel: 'Biblioteca de algoritmos' },
  { icon: 'route', label: 'Ruta', tab: 'Ruta', accessibilityLabel: 'Mi ruta de aprendizaje' },
  { icon: 'progress', label: 'Progreso', tab: 'Progreso', accessibilityLabel: 'Mi progreso' },
  { icon: 'offline', label: 'Offline', tab: 'Offline', accessibilityLabel: 'Módulos sin conexión' },
  { icon: 'profile', label: 'Perfil', tab: 'Perfil', accessibilityLabel: 'Mi perfil' },
];

interface DesktopSidebarProps {
  activeTab: keyof MainTabParamList;
  onNavigate: (tab: keyof MainTabParamList) => void;
  completionPercent: number;
  progressCount: string;
  streakDays?: number;
}

function DesktopSidebar({
  activeTab,
  onNavigate,
  completionPercent,
  progressCount,
  streakDays,
}: DesktopSidebarProps) {
  const { mode, toggleTheme } = useThemeContext();
  return (
    <View style={styles.sidebar}>
      <View style={styles.brand}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>B</Text>
        </View>
        <Text style={styles.brandText}>BrainSort</Text>
      </View>

      <View style={styles.sideNav}>
        {SIDEBAR_NAV_ITEMS.map(({ icon, label, tab, accessibilityLabel }) => {
          const active = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.sideItem, active && styles.sideItemActive]}
              onPress={() => onNavigate(tab)}
              activeOpacity={0.82}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={accessibilityLabel}
            >
              <SidebarIcon name={icon} active={active} />
              <Text style={[styles.sideLabel, active && styles.sideTextActive]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.sidebarBottom}>
        <View style={styles.progressPanel}>
          <Text style={styles.progressTitle}>Tu progreso general</Text>
          <ProgressRing percent={completionPercent} />
          <Text style={styles.progressCount}>{progressCount}</Text>
        </View>
        <View style={styles.streakPanel}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <View>
            <Text style={styles.streakLabel}>Racha actual</Text>
            <Text style={styles.streakValue}>{streakDays ?? 0} días</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.themePanel}
          onPress={toggleTheme}
          activeOpacity={0.82}
          accessibilityRole="button"
          accessibilityLabel="Configurar tema oscuro"
        >
          <Text style={styles.themeIcon}>☾</Text>
          <Text style={styles.themeText}>Tema oscuro</Text>
          <View style={[styles.toggle, mode === 'dark' ? styles.toggleOn : styles.toggleOff]}>
            <View style={styles.toggleKnob} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function SearchIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={10.8} cy={10.8} r={6.2} stroke={color} strokeWidth={2} />
      <Path d="M15.4 15.4 20 20" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function FilterIcon({ name, active }: { name: FilterIconName; active: boolean }) {
  const color = active ? Accent[500] : '#D7E2E8';

  if (name === 'search') {
    return (
      <View style={styles.filterIconBox}>
        <SearchIcon color={color} size={17} />
      </View>
    );
  }

  return (
    <View style={styles.filterIconBox}>
      <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
        {name === 'all' && (
          <>
            <Circle cx={7} cy={7} r={2.1} stroke={color} strokeWidth={1.9} />
            <Circle cx={17} cy={7} r={2.1} stroke={color} strokeWidth={1.9} />
            <Circle cx={7} cy={17} r={2.1} stroke={color} strokeWidth={1.9} />
            <Circle cx={17} cy={17} r={2.1} stroke={color} strokeWidth={1.9} />
          </>
        )}
        {name === 'sort' && (
          <>
            <Path d="M8 5v14M8 19l-3-3M8 19l3-3" stroke={color} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M16 19V5M16 5l-3 3M16 5l3 3" stroke={color} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}
        {name === 'list' && (
          <>
            <Path d="M9 7h10M9 12h10M9 17h10" stroke={color} strokeWidth={1.9} strokeLinecap="round" />
            <Circle cx={5} cy={7} r={1.2} fill={color} />
            <Circle cx={5} cy={12} r={1.2} fill={color} />
            <Circle cx={5} cy={17} r={1.2} fill={color} />
          </>
        )}
      </Svg>
    </View>
  );
}

function ProgressRing({ percent }: { percent: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const normalized = Math.max(0, Math.min(100, percent));
  const strokeDashoffset = circumference * (1 - normalized / 100);

  return (
    <View style={styles.progressRingWrap}>
      <Svg width={132} height={132} viewBox="0 0 132 132" fill="none">
        <Circle
          cx={66}
          cy={66}
          r={radius}
          stroke="rgba(126,157,183,0.18)"
          strokeWidth={10}
          fill="none"
        />
        {normalized > 0 && (
          <G rotation="-90" origin="66,66">
            <Circle
              cx={66}
              cy={66}
              r={radius}
              stroke="#9EFF4E"
              strokeWidth={10}
              strokeLinecap="round"
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              fill="none"
            />
          </G>
        )}
      </Svg>
      <View style={styles.progressRingCenter}>
        <Text style={styles.progressPercent}>{normalized}%</Text>
        <Text style={styles.progressCaption}>completado</Text>
      </View>
    </View>
  );
}

function SidebarIcon({ name, active }: { name: NavIconName; active: boolean }) {
  const color = active ? '#22DDE8' : '#C8D2DA';
  const glow = active ? 'rgba(34, 221, 232, 0.18)' : 'transparent';

  return (
    <View style={[styles.sideIconBox, active && styles.sideIconBoxActive]}>
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        {active && <Circle cx={12} cy={12} r={11} fill={glow} />}
        {name === 'book' && (
          <>
            <Path
              d="M5 5.5C5 4.7 5.7 4 6.5 4H10c1.1 0 2 .9 2 2v13c0-1.1-.9-2-2-2H6.5C5.7 17 5 16.3 5 15.5v-10Z"
              stroke={color}
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M19 5.5C19 4.7 18.3 4 17.5 4H14c-1.1 0-2 .9-2 2v13c0-1.1.9-2 2-2h3.5c.8 0 1.5-.7 1.5-1.5v-10Z"
              stroke={color}
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}
        {name === 'route' && (
          <>
            <Circle cx={6.5} cy={6.5} r={2.1} stroke={color} strokeWidth={1.8} />
            <Circle cx={17.5} cy={17.5} r={2.1} stroke={color} strokeWidth={1.8} />
            <Path
              d="M8.6 6.5h3.8c2.3 0 3.6 1.1 3.6 3 0 2-1.3 3-3.6 3H11c-2.2 0-3.4 1-3.4 3v2"
              stroke={color}
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}
        {name === 'progress' && (
          <Polyline
            points="4,16 8.5,11.5 12,14.5 19,7.5"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {name === 'offline' && (
          <>
            <Path
              d="M7.3 17.5h9.3a4 4 0 0 0 .3-8 5.6 5.6 0 0 0-10.7 1.7A3.2 3.2 0 0 0 7.3 17.5Z"
              stroke={color}
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path d="M8 8.5 16 16.5" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
          </>
        )}
        {name === 'profile' && (
          <>
            <Circle cx={12} cy={8.2} r={3.2} stroke={color} strokeWidth={1.8} />
            <Path
              d="M5.8 19.5c.8-3.1 3.1-4.9 6.2-4.9s5.4 1.8 6.2 4.9"
              stroke={color}
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#020811',
  },
  main: {
    flex: 1,
  },
  mainContent: {
    paddingHorizontal: Spacing[10],
    paddingTop: Spacing[5],
    paddingBottom: Spacing[5],
    gap: Spacing[2],
  },
  mainContentMobile: {
    paddingHorizontal: Spacing[5],
    paddingBottom: 104,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing[6],
  },
  headerMobile: {
    flexDirection: 'column',
    gap: Spacing[4],
  },
  titleBlock: {
    flexShrink: 1,
  },
  title: {
    fontFamily: FontFamilies.bold,
    fontWeight: FontWeights.bold,
    fontSize: 32,
    lineHeight: 36,
    color: DarkText.primary,
  },
  subtitle: {
    marginTop: Spacing[2],
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.lg,
    lineHeight: 22,
    color: '#9AA9B6',
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing[3],
    alignItems: 'center',
  },
  headerActionsMobile: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  searchBox: {
    minWidth: 320,
    maxWidth: 360,
    height: 44,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(125, 154, 177, 0.28)',
    backgroundColor: 'rgba(11, 24, 38, 0.82)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    gap: Spacing[2],
  },
  searchBoxMobile: {
    width: '100%',
    minWidth: 0,
    maxWidth: '100%' as any,
  },
  searchIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInput: {
    flex: 1,
    color: DarkText.primary,
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.md,
    height: 42,
    paddingVertical: 0,
  },
  routeButton: {
    height: 44,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing[6],
    borderWidth: 1,
    borderColor: 'rgba(35, 127, 255, 0.45)',
    backgroundColor: '#237FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[3],
    minWidth: 190,
  },
  routeButtonMobile: {
    width: '100%',
    minWidth: 0,
  },
  routeButtonText: {
    color: '#FFFFFF',
    fontFamily: FontFamilies.bold,
    fontWeight: FontWeights.bold,
    fontSize: FontSizes.lg,
  },
  routeArrow: {
    color: '#FFFFFF',
    fontSize: 26,
    lineHeight: 28,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[4],
    marginTop: Spacing[1],
    marginBottom: Spacing[4],
  },
  statCard: {
    flex: 1,
    minWidth: 230,
    minHeight: 76,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(126, 157, 183, 0.16)',
    backgroundColor: 'rgba(12, 25, 40, 0.82)',
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[4],
    ...Platform.select({
      web: {
        boxShadow:
          '0 10px 28px rgba(0,0,0,0.18), inset 0 0 22px rgba(255,255,255,0.018)',
      } as any,
    }),
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(28, 58, 77, 0.55)',
  },
  statCopy: {
    flex: 1,
  },
  statLabel: {
    color: '#AEB9C2',
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.md,
  },
  statValue: {
    marginTop: Spacing[1],
    color: DarkText.primary,
    fontFamily: FontFamilies.bold,
    fontWeight: FontWeights.bold,
    fontSize: 22,
  },
  statStatusIcon: {
    opacity: 0.95,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing[4],
    marginBottom: Spacing[1],
  },
  filterRowMobile: {
    alignItems: 'stretch',
  },
  filtersContent: {
    gap: Spacing[3],
    paddingRight: Spacing[2],
  },
  filterIconBox: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChip: {
    height: 46,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(126, 157, 183, 0.24)',
    backgroundColor: 'rgba(11, 24, 38, 0.78)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    paddingHorizontal: Spacing[5],
  },
  filterChipActive: {
    borderColor: '#00CDD6',
    backgroundColor: 'rgba(0, 205, 214, 0.18)',
  },
  filterIcon: {
    color: '#E8F0F5',
    fontFamily: FontFamilies.bold,
    fontSize: FontSizes.md,
  },
  filterText: {
    color: '#E8F0F5',
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.md,
  },
  filterTextActive: {
    color: Accent[500],
  },
  moreFilters: {
    height: 46,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(126, 157, 183, 0.24)',
    backgroundColor: 'rgba(11, 24, 38, 0.78)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    justifyContent: 'center',
    paddingHorizontal: Spacing[5],
  },
  moreFiltersText: {
    color: '#E8F0F5',
    fontFamily: FontFamilies.semiBold,
    fontSize: FontSizes.md,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing[2],
    rowGap: Spacing[4],
  },
  cardColumn: {
    paddingHorizontal: Spacing[2],
  },
  sidebar: {
    width: 258,
    borderRightWidth: 1,
    borderRightColor: 'rgba(117, 154, 181, 0.22)',
    backgroundColor: 'rgba(5, 18, 31, 0.98)',
    paddingHorizontal: Spacing[6],
    paddingTop: Spacing[8],
    paddingBottom: Spacing[5],
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    marginBottom: Spacing[10],
  },
  logo: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#23CBD8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontFamily: FontFamilies.extraBold,
    fontWeight: FontWeights.extraBold,
    fontSize: 28,
  },
  brandText: {
    color: '#FFFFFF',
    fontFamily: FontFamilies.bold,
    fontWeight: FontWeights.bold,
    fontSize: 24,
  },
  sideNav: {
    gap: Spacing[4],
  },
  sideItem: {
    height: 50,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  sideItemActive: {
    borderWidth: 1,
    borderColor: '#03C7D5',
    backgroundColor: 'rgba(0, 218, 222, 0.13)',
  },
  sideIconBox: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideIconBoxActive: {
    backgroundColor: 'rgba(34, 221, 232, 0.1)',
  },
  sideLabel: {
    color: '#C8D2DA',
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.lg,
  },
  sideTextActive: {
    color: '#FFFFFF',
  },
  sidebarBottom: {
    marginTop: 'auto' as any,
    gap: Spacing[4],
  },
  progressPanel: {
    height: 230,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(126, 157, 183, 0.2)',
    backgroundColor: 'rgba(11, 25, 40, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing[4],
  },
  progressTitle: {
    color: '#A9B7C2',
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.sm,
    marginBottom: Spacing[4],
  },
  progressRingWrap: {
    width: 132,
    height: 132,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[3],
  },
  progressRingCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPercent: {
    color: '#FFFFFF',
    fontFamily: FontFamilies.bold,
    fontWeight: FontWeights.bold,
    fontSize: 29,
  },
  progressCaption: {
    color: '#C5D0D9',
    fontFamily: FontFamilies.medium,
    fontSize: FontSizes.sm,
  },
  progressCount: {
    color: '#DBE6ED',
    fontFamily: FontFamilies.bold,
    fontWeight: FontWeights.bold,
    fontSize: FontSizes.md,
  },
  streakPanel: {
    minHeight: 70,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(126, 157, 183, 0.2)',
    backgroundColor: 'rgba(11, 25, 40, 0.72)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingHorizontal: Spacing[5],
  },
  streakEmoji: {
    fontSize: 22,
    lineHeight: 26,
  },
  streakLabel: {
    color: '#AEBBC4',
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.sm,
  },
  streakValue: {
    color: '#F5A623',
    fontFamily: FontFamilies.bold,
    fontWeight: FontWeights.bold,
    fontSize: FontSizes.lg,
  },
  themePanel: {
    minHeight: 70,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(126, 157, 183, 0.2)',
    backgroundColor: 'rgba(11, 25, 40, 0.72)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingHorizontal: Spacing[5],
  },
  themeIcon: {
    color: '#DCE6EE',
    fontSize: 22,
  },
  themeText: {
    flex: 1,
    color: '#DCE6EE',
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.md,
  },
  toggle: {
    width: 38,
    height: 22,
    borderRadius: BorderRadius.full,
    padding: 3,
  },
  toggleOn: {
    backgroundColor: '#12CCE0',
    alignItems: 'flex-end',
  },
  toggleOff: {
    backgroundColor: '#7A8C9E',
    alignItems: 'flex-start',
  },
  toggleKnob: {
    width: 16,
    height: 16,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
  },
  errorState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing[8],
  },
  errorIcon: {
    fontSize: 48,
    color: Accent[500],
  },
  errorTitle: {
    color: Semantic.error,
    fontFamily: FontFamilies.bold,
    fontSize: 24,
    marginTop: Spacing[4],
  },
  errorText: {
    color: DarkText.secondary,
    textAlign: 'center',
    marginTop: Spacing[2],
    marginBottom: Spacing[5],
  },
  primaryButton: {
    backgroundColor: Accent[500],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[3],
  },
  primaryButtonText: {
    color: '#001018',
    fontFamily: FontFamilies.bold,
  },
  emptyState: {
    borderWidth: 1,
    borderColor: 'rgba(126, 157, 183, 0.22)',
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(11, 24, 38, 0.64)',
    padding: Spacing[10],
    alignItems: 'center',
  },
  emptyIcon: {
    color: Accent[500],
    fontSize: 42,
  },
  emptyTitle: {
    color: DarkText.primary,
    fontFamily: FontFamilies.bold,
    fontSize: 22,
    marginTop: Spacing[3],
  },
  emptyText: {
    color: DarkText.secondary,
    marginTop: Spacing[2],
    textAlign: 'center',
  },
});
