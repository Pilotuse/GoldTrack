import Constants from 'expo-constants';
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

export function isExpoGo() {
  return Constants.appOwnership === 'expo';
}

export function isExpoGoFaceBlocked() {
  return isExpoGo() && Platform.OS === 'ios';
}

export async function canUseFaceUnlock() {
  if (isExpoGoFaceBlocked()) return false;
  try {
    const [hasHardware, enrolled] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
    ]);
    return hasHardware && enrolled;
  } catch {
    return false;
  }
}

export async function authenticateFace() {
  if (isExpoGoFaceBlocked()) return 'expo-go' as const;

  try {
    const available = await canUseFaceUnlock();
    if (!available) return 'unavailable' as const;

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: '使用面容解锁',
      cancelLabel: '取消',
      disableDeviceFallback: true,
    });

    if (result.success) return 'ok' as const;
    if (result.error === 'missing_usage_description') return 'missing-permission' as const;
    if (result.error === 'user_cancel' || result.error === 'system_cancel' || result.error === 'app_cancel') {
      return 'cancel' as const;
    }
    return 'failed' as const;
  } catch {
    return 'failed' as const;
  }
}
