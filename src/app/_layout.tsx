import AppLock from '@/components/AppLock';
import { HoldingsProvider } from '@/context/HoldingsContext';
import { ProfileProvider } from '@/context/ProfileContext';
import { SettingsProvider } from '@/context/SettingsContext';
import { Stack } from 'expo-router';

export default function _layout() {
  return (
    <SettingsProvider>
    <ProfileProvider>
    <HoldingsProvider>
      <AppLock />
      <Stack
        screenOptions={{
          title: '',
          headerTitleAlign: 'center',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false, freezeOnBlur: false }} />
        <Stack.Screen
          name="product/[id]"
          options={{
            title: '产品详情',
            headerBackTitle: '探索',
            headerShadowVisible: false,
            headerStyle: { backgroundColor: '#EBC688' },
            headerTintColor: '#1D1D1F',
          }}
        />
        <Stack.Screen
          name="holdings/[type]"
          options={{
            title: '持仓',
            headerBackTitle: '我的',
            headerShadowVisible: false,
            headerStyle: { backgroundColor: '#EBC688' },
            headerTintColor: '#1D1D1F',
            freezeOnBlur: false,
          }}
        />
        <Stack.Screen
          name="account"
          options={{
            title: '个人资料',
            headerBackTitle: '我的',
            headerShadowVisible: false,
            headerStyle: { backgroundColor: '#EBC688' },
            headerTintColor: '#1D1D1F',
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            title: '设置',
            headerBackTitle: '我的',
            headerShadowVisible: false,
            headerStyle: { backgroundColor: '#EBC688' },
            headerTintColor: '#1D1D1F',
          }}
        />
        <Stack.Screen
          name="asset-config/[type]"
          options={{
            title: '配置资产',
            headerBackTitle: '持仓',
            headerShadowVisible: false,
            headerStyle: { backgroundColor: '#EBC688' },
            headerTintColor: '#1D1D1F',
          }}
        />
      </Stack>
    </HoldingsProvider>
    </ProfileProvider>
    </SettingsProvider>
  );
}
