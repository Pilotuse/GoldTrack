import * as ImagePicker from 'expo-image-picker';
import { ActionSheetIOS, Alert, Platform } from 'react-native';

const CROP = {
  mediaTypes: ['images'] as ImagePicker.MediaType[],
  allowsEditing: true,
  aspect: [1, 1] as [number, number],
  quality: 0.85,
};

async function ensureLibraryPermission() {
  const current = await ImagePicker.getMediaLibraryPermissionsAsync();
  const granted = current.granted || current.accessPrivileges === 'limited';
  if (granted) return true;
  const next = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return next.granted || next.accessPrivileges === 'limited';
}

async function ensureCameraPermission() {
  const current = await ImagePicker.getCameraPermissionsAsync();
  if (current.granted) return true;
  const next = await ImagePicker.requestCameraPermissionsAsync();
  return next.granted;
}

async function launchLibrary(): Promise<string | null> {
  const ok = await ensureLibraryPermission();
  if (!ok) {
    Alert.alert('无法访问相册', '请在系统设置中允许访问照片。');
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync(CROP);
  if (result.canceled) return null;
  return result.assets[0]?.uri ?? null;
}

async function launchCamera(): Promise<string | null> {
  const ok = await ensureCameraPermission();
  if (!ok) {
    Alert.alert('无法使用相机', '请在系统设置中允许使用相机。');
    return null;
  }
  const result = await ImagePicker.launchCameraAsync(CROP);
  if (result.canceled) return null;
  return result.assets[0]?.uri ?? null;
}

export function presentAvatarPicker(options: {
  hasPhoto: boolean;
  onPicked: (uri: string) => void;
  onReset?: () => void;
}) {
  const pickFromLibrary = async () => {
    const uri = await launchLibrary();
    if (uri) options.onPicked(uri);
  };
  const pickFromCamera = async () => {
    const uri = await launchCamera();
    if (uri) options.onPicked(uri);
  };

  if (Platform.OS === 'ios') {
    const items = ['从相册选择', '拍照'];
    if (options.hasPhoto) items.push('恢复默认');
    items.push('取消');

    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: items,
        cancelButtonIndex: items.length - 1,
        destructiveButtonIndex: options.hasPhoto ? 2 : undefined,
      },
      (index) => {
        if (index === 0) void pickFromLibrary();
        if (index === 1) void pickFromCamera();
        if (options.hasPhoto && index === 2) options.onReset?.();
      },
    );
    return;
  }

  Alert.alert('更换头像', undefined, [
    { text: '从相册选择', onPress: () => void pickFromLibrary() },
    { text: '拍照', onPress: () => void pickFromCamera() },
    ...(options.hasPhoto
      ? [{ text: '恢复默认', style: 'destructive' as const, onPress: options.onReset }]
      : []),
    { text: '取消', style: 'cancel' as const },
  ]);
}
