/**
 * useBackToMenu.ts
 * BrainSort — Navegación de regreso al menú principal (Biblioteca)
 *
 * En pantallas raíz de un tab (Perfil, Progreso, Ruta, Offline) no hay historial
 * de stack; en ese caso navega al tab Biblioteca. En stacks anidados usa goBack().
 */

import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../navigation/MainTabNavigator';

export function useBackToMenu(): () => void {
  const navigation = useNavigation();

  return useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    const tabNavigation =
      navigation.getParent<BottomTabNavigationProp<MainTabParamList>>();

    if (tabNavigation) {
      tabNavigation.navigate('Biblioteca');
    }
  }, [navigation]);
}
