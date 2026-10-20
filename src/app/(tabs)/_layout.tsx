import { Colors } from '@/constants/base';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (

    <NativeTabs
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}
      tintColor="#1678FF"
      // blurEffect="systemMaterial"
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>走势</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{
            default: 'bubbles.and.sparkles',
            selected: 'bubbles.and.sparkles'
          }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="expore">
        <NativeTabs.Trigger.Label>探索</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'app.shadow', selected: 'app.shadow' }}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="user">
        <NativeTabs.Trigger.Label>我的</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'person', selected: 'person.fill' }}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
