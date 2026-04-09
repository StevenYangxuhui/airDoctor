'use client';

import { useEffect, type ReactNode } from 'react';
import { useColorScheme, Platform, StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '@/contexts/AuthContext';
import { HeroUINativeProvider } from '@/heroui';

type ThemeMode = 'light' | 'dark' | 'system';
const DEFAULT_THEME: ThemeMode = 'system';

function ColorSchemeUpdater({ children }: { children: ReactNode }) {
  const colorScheme = useColorScheme();
  
  useEffect(() => {
    const theme =
      DEFAULT_THEME === 'system'
        ? (colorScheme as 'light' | 'dark' || 'light')
        : DEFAULT_THEME;

    // Update status bar style based on theme
    StatusBar.setBarStyle(theme === 'dark' ? 'light-content' : 'dark-content');
  }, [colorScheme]);

  return <>{children}</>;
}

function Provider({ children }: { children: ReactNode }) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ColorSchemeUpdater>
        <AuthProvider>
          <HeroUINativeProvider>
            {children}
          </HeroUINativeProvider>
        </AuthProvider>
      </ColorSchemeUpdater>
    </GestureHandlerRootView>
  );
}

export default Provider;
