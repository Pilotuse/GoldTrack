import Avatar from '@/components/Avatar';
import ProfileFieldEditor, { type FieldConfig } from '@/components/ProfileFieldEditor';
import { useProfile } from '@/context/ProfileContext';
import { presentAvatarPicker } from '@/utils/pickAvatar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FIELDS: FieldConfig[] = [
  { field: 'nickname', title: '昵称', placeholder: '输入昵称', maxLength: 12 },
  { field: 'gender', title: '性别', placeholder: '选择性别', maxLength: 2, options: ['男', '女'] },
  { field: 'city', title: '所在地', placeholder: '输入城市', maxLength: 12 },
];

export default function Account() {
  const { profile, updateProfile, updateAvatar } = useProfile();
  const [editing, setEditing] = useState<FieldConfig | null>(null);
  const ignoreUntil = useRef(0);

  const openField = (config: FieldConfig) => {
    if (Date.now() < ignoreUntil.current) return;
    setEditing(config);
  };

  const closeField = () => {
    ignoreUntil.current = Date.now() + 400;
    setEditing(null);
  };

  const changeAvatar = () => {
    presentAvatarPicker({
      hasPhoto: Boolean(profile.avatarUri),
      onPicked: updateAvatar,
      onReset: () => updateAvatar(null),
    });
  };

  const profileRows = [
    { icon: 'text-outline' as const, config: FIELDS[0], value: profile.nickname },
  ];
  const archiveRows = [
    { icon: 'male-female-outline' as const, config: FIELDS[1], value: profile.gender },
    { icon: 'location-outline' as const, config: FIELDS[2], value: profile.city },
  ];

  return (
    <LinearGradient
      colors={['#EBC688', '#F5F5F7']}
      locations={[0, 0.28]}
      style={styles.gradient}
    >
      <Stack.Screen
        options={{
          title: '个人资料',
          headerBackTitle: '我的',
        }}
      />
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Pressable onPress={changeAvatar} style={styles.hero}>
            <Avatar
              uri={profile.avatarUri}
              initial={profile.avatarInitial}
              size={72}
              fontSize={28}
            />
            <Text style={styles.nickname}>{profile.nickname}</Text>
            <Text style={styles.userId}>ID {profile.userId}</Text>
          </Pressable>

          <Text style={styles.sectionTitle}>资料</Text>
          <View style={styles.card}>
            <Pressable
              onPress={changeAvatar}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            >
              <Ionicons name="person-outline" size={20} color="#1D1D1F" />
              <Text style={styles.rowLabel}>头像</Text>
              <Avatar
                uri={profile.avatarUri}
                initial={profile.avatarInitial}
                size={28}
                fontSize={12}
                style={styles.miniAvatar}
              />
              <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
            </Pressable>
            {profileRows.map((row, index) => (
              <Pressable
                key={row.config.field}
                onPress={() => openField(row.config)}
                style={({ pressed }) => [
                  styles.row,
                  index === profileRows.length - 1 && styles.rowLast,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons name={row.icon} size={20} color="#1D1D1F" />
                <Text style={styles.rowLabel}>{row.config.title}</Text>
                <Text style={styles.rowValue}>{row.value}</Text>
                <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionTitle}>档案</Text>
          <View style={styles.card}>
            {archiveRows.map((row) => (
              <Pressable
                key={row.config.field}
                onPress={() => openField(row.config)}
                style={({ pressed }) => [styles.row, pressed && styles.pressed]}
              >
                <Ionicons name={row.icon} size={20} color="#1D1D1F" />
                <Text style={styles.rowLabel}>{row.config.title}</Text>
                <Text style={styles.rowValue} numberOfLines={1}>
                  {row.value}
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
              </Pressable>
            ))}
            <View style={[styles.row, styles.rowLast]}>
              <Ionicons name="calendar-outline" size={20} color="#1D1D1F" />
              <Text style={styles.rowLabel}>注册时间</Text>
              <Text style={styles.rowValue}>{profile.joinedAt}</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      <ProfileFieldEditor
        visible={editing != null}
        config={editing}
        value={editing ? profile[editing.field] : ''}
        onClose={closeField}
        onSave={(next) => {
          if (!editing) return;
          updateProfile(editing.field, next);
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
    paddingTop: 8,
    paddingBottom: 32,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 18,
  },
  nickname: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  userId: {
    marginTop: 4,
    fontSize: 13,
    color: '#8E8E93',
  },
  sectionTitle: {
    paddingHorizontal: 12,
    marginTop: 16,
    marginBottom: 8,
    fontSize: 15,
    fontWeight: '600',
    color: '#8E8E93',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderRadius: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowLabel: {
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
  miniAvatar: {
    marginLeft: 'auto',
    marginRight: 6,
  },
  pressed: {
    opacity: 0.72,
  },
});
