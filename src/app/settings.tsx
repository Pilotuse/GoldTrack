import ApiSubscriptionEditor from '@/components/ApiSubscriptionEditor';
import FaceIdIcon from '@/components/FaceIdIcon';
import ProfileFieldEditor, { type FieldConfig } from '@/components/ProfileFieldEditor';
import { useSettings } from '@/context/SettingsContext';
import { authenticateFace, canUseFaceUnlock, isExpoGoFaceBlocked } from '@/utils/faceUnlock';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ROWS = [
  { icon: 'notifications-outline' as const, label: '消息通知' },
  { icon: 'color-palette-outline' as const, label: '显示设置' },
];

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

function displayHost(url: string) {
  if (!url) return '';
  try {
    return new URL(url.includes('://') ? url : `https://${url}`).host;
  } catch {
    return url;
  }
}

const INTERVAL_FIELD = {
  field: 'apiIntervalMs',
  title: '更新间隔',
  placeholder: '单位 ms，例如 1000',
  maxLength: 8,
  keyboardType: 'number-pad',
} satisfies FieldConfig;

const API_EDITORS = {
  gold: {
    title: '黄金API',
    placeholder: 'https://api.example.com',
  },
  comment: {
    title: '评论API',
    placeholder: 'https://api.example.com/comments',
  },
} as const;

export default function Settings() {
  const {
    apiBaseUrl,
    commentApiUrl,
    apiMethod,
    commentApiMethod,
    apiIntervalMs,
    fundsEncrypted,
    faceUnlockEnabled,
    updateApiBaseUrl,
    updateCommentApiUrl,
    updateApiMethod,
    updateCommentApiMethod,
    updateApiInterval,
    updateFundsEncrypted,
    updateFaceUnlock,
  } = useSettings();
  const [editingApi, setEditingApi] = useState<'gold' | 'comment' | null>(null);
  const [editing, setEditing] = useState<FieldConfig | null>(null);
  const ignoreUntil = useRef(0);

  const openEditor = (config: FieldConfig) => {
    if (Date.now() < ignoreUntil.current) return;
    setEditing(config);
  };

  const openApiEditor = (kind: 'gold' | 'comment') => {
    if (Date.now() < ignoreUntil.current) return;
    setEditingApi(kind);
  };

  const closeEditor = () => {
    ignoreUntil.current = Date.now() + 400;
    setEditing(null);
    setEditingApi(null);
  };

  const toggleFaceUnlock = async (on: boolean) => {
    if (!on) {
      updateFaceUnlock(false);
      return;
    }
    if (isExpoGoFaceBlocked()) {
      Alert.alert(
        'Expo Go 不支持面容解锁',
        '这是 Expo Go 的系统限制，重载或重新编译 JS 都无效。请在电脑连接 iPhone 后运行：\n\nnpx expo run:ios --device\n\n用安装好的开发客户端打开项目，即可使用面容解锁。',
      );
      return;
    }
    const available = await canUseFaceUnlock();
    if (!available) {
      Alert.alert('无法使用面容', '请先在系统设置中录入面容 ID。');
      return;
    }
    const result = await authenticateFace();
    if (result === 'ok') updateFaceUnlock(true);
    if (result === 'unavailable') {
      Alert.alert('无法使用面容', '请先在系统设置中录入面容 ID。');
    }
    if (result === 'expo-go') {
      Alert.alert('Expo Go 不支持面容解锁', '请使用开发客户端打开本项目。');
    }
    if (result === 'missing-permission') {
      Alert.alert('需要重新编译', '面容权限未写入安装包。请在电脑运行 npx expo run:ios --device 后再试。');
    }
  };

  return (
    <LinearGradient
      colors={['#EBC688', '#F5F5F7']}
      locations={[0, 0.28]}
      style={styles.gradient}
    >
      <Stack.Screen
        options={{
          title: '设置',
          headerBackTitle: '我的',
        }}
      />
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.card}>
            {ROWS.map((row, index) => (
              <View
                key={row.label}
                style={[styles.row, index === ROWS.length - 1 && styles.rowLast]}
              >
                <Ionicons name={row.icon} size={20} color="#1D1D1F" />
                <Text style={styles.rowLabel}>{row.label}</Text>
                <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>安全</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Ionicons name="lock-closed-outline" size={20} color="#1D1D1F" />
              <Text style={styles.rowLabel}>资金加密</Text>
              <Switch value={fundsEncrypted} onValueChange={updateFundsEncrypted} />
            </View>
            <View style={[styles.row, styles.rowLast]}>
              <FaceIdIcon size={20} color="#1D1D1F" />
              <Text style={styles.rowLabel}>人脸识别解锁</Text>
              <Switch
                value={faceUnlockEnabled}
                onValueChange={(on) => void toggleFaceUnlock(on)}
              />
            </View>
          </View>

          <Text style={styles.hint}>
            资金配置数据仅在本地存储，API仅提供动态变化
          </Text>

          <Text style={styles.sectionTitle}>API 订阅</Text>
          <View style={styles.card}>
            <Pressable
              onPress={() => openApiEditor('gold')}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            >
              <Ionicons name="link-outline" size={20} color="#1D1D1F" />
              <Text style={styles.apiLabel}>黄金API</Text>
              <Text
                style={[styles.rowValue, !apiBaseUrl && styles.rowPlaceholder]}
                numberOfLines={1}
              >
                {displayHost(apiBaseUrl) || '未设置'}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
            </Pressable>
            <Pressable
              onPress={() => openApiEditor('comment')}
              style={({ pressed }) => [
                styles.row,
                apiMethod === 'WS' && styles.rowLast,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.rowIcon}>
                <Ionicons name="chatbubble-ellipses-outline" size={16} color="#1D1D1F" />
              </View>
              <Text style={styles.apiLabel}>评论API</Text>
              <Text
                style={[styles.rowValue, !commentApiUrl && styles.rowPlaceholder]}
                numberOfLines={1}
              >
                {displayHost(commentApiUrl) || '未设置'}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
            </Pressable>
            {apiMethod !== 'WS' ? (
              <Pressable
                onPress={() => openEditor(INTERVAL_FIELD)}
                style={({ pressed }) => [styles.row, styles.rowLast, pressed && styles.pressed]}
              >
                <Ionicons name="timer-outline" size={20} color="#1D1D1F" />
                <Text style={styles.apiLabel}>更新间隔</Text>
                <Text style={styles.rowValue}>{apiIntervalMs} ms</Text>
                <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
              </Pressable>
            ) : null}
          </View>

          <Text style={styles.hint}>
            订阅仅请求对应的产品数据，不负责处理盈亏收益数据。如对照大盘后数据异常，请咨询对应接口提供商
          </Text>

          <View style={[styles.card, styles.aboutCard]}>
            <View style={styles.row}>
              <Ionicons name="information-circle-outline" size={20} color="#1D1D1F" />
              <Text style={styles.rowLabel}>关于我们</Text>
              <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
            </View>
            <View style={[styles.row, styles.rowLast]}>
              <Ionicons name="code-slash-outline" size={20} color="#1D1D1F" />
              <Text style={styles.apiLabel}>版本</Text>
              <Text style={styles.rowValue}>{APP_VERSION}</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      <ApiSubscriptionEditor
        visible={editingApi != null}
        title={editingApi ? API_EDITORS[editingApi].title : ''}
        url={editingApi === 'comment' ? commentApiUrl : apiBaseUrl}
        method={editingApi === 'comment' ? commentApiMethod : apiMethod}
        placeholder={editingApi ? API_EDITORS[editingApi].placeholder : ''}
        onClose={closeEditor}
        onSave={(url, method) => {
          if (editingApi === 'comment') {
            updateCommentApiUrl(url);
            updateCommentApiMethod(method);
            return;
          }
          updateApiBaseUrl(url);
          updateApiMethod(method);
        }}
      />

      <ProfileFieldEditor
        visible={editing != null}
        config={editing}
        value={String(apiIntervalMs)}
        onClose={closeEditor}
        onSave={(next) => {
          const ms = Number(next);
          if (!Number.isFinite(ms) || ms < 1) return;
          updateApiInterval(ms);
        }}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderRadius: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  aboutCard: {
    marginTop: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1D1D1F',
  },
  apiLabel: {
    marginLeft: 12,
    fontSize: 16,
    color: '#1D1D1F',
  },
  rowValue: {
    flex: 1,
    marginLeft: 12,
    textAlign: 'right',
    fontSize: 15,
    color: '#8E8E93',
  },
  rowPlaceholder: {
    color: '#C7C7CC',
  },
  sectionTitle: {
    paddingHorizontal: 12,
    marginTop: 20,
    marginBottom: 8,
    fontSize: 15,
    fontWeight: '600',
    color: '#8E8E93',
  },
  hint: {
    paddingHorizontal: 12,
    marginTop: 8,
    fontSize: 12,
    lineHeight: 18,
    color: '#8E8E93',
  },
  pressed: {
    opacity: 0.72,
  },
});
