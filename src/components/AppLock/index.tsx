import FaceIdIcon from '@/components/FaceIdIcon';
import { useSettings } from '@/context/SettingsContext';
import { authenticateFace } from '@/utils/faceUnlock';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AppLock() {
  const { faceUnlockEnabled, locked, unlockByFace } = useSettings();
  const [error, setError] = useState('');
  const prompting = useRef(false);
  const visible = faceUnlockEnabled && locked;

  useEffect(() => {
    if (!locked) setError('');
  }, [locked]);

  useEffect(() => {
    if (!visible || prompting.current) return;

    const timer = setTimeout(() => {
      if (prompting.current) return;
      prompting.current = true;
      void authenticateFace().then((result) => {
        prompting.current = false;
        if (result === 'ok') unlockByFace();
        if (result === 'failed') setError('面容识别失败，请再试一次');
        if (result === 'unavailable') setError('面容不可用，请检查系统设置');
        if (result === 'expo-go') setError('Expo Go 不支持面容，请用开发客户端打开');
      });
    }, 450);

    return () => clearTimeout(timer);
  }, [visible, unlockByFace]);

  const retryFace = () => {
    if (prompting.current) return;
    prompting.current = true;
    setError('');
    void authenticateFace().then((result) => {
      prompting.current = false;
      if (result === 'ok') unlockByFace();
      if (result === 'failed') setError('面容识别失败，请再试一次');
      if (result === 'unavailable') setError('面容不可用，请检查系统设置');
      if (result === 'expo-go') setError('Expo Go 不支持面容，请用开发客户端打开');
    });
  };

  return (
    <Modal visible={visible} animationType="fade" statusBarTranslucent>
      <LinearGradient colors={['#EBC688', '#F5F5F7']} locations={[0, 0.28]} style={styles.gradient}>
        <SafeAreaView style={styles.safe}>
          <FaceIdIcon size={56} color="#1D1D1F" />
          <Text style={styles.title}>面容解锁</Text>
          <Text style={styles.hint}>验证面容后继续使用</Text>
          {error ? <Text style={styles.error}>{error}</Text> : <Text style={styles.errorSlot}> </Text>}
          <Pressable
            onPress={retryFace}
            style={({ pressed }) => [styles.faceBtn, pressed && styles.pressed]}
          >
            <Text style={styles.faceText}>使用面容解锁</Text>
          </Pressable>
        </SafeAreaView>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  title: {
    marginTop: 20,
    fontSize: 22,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  hint: {
    marginTop: 8,
    fontSize: 14,
    color: '#8E8E93',
  },
  error: {
    marginTop: 16,
    fontSize: 13,
    color: '#E11D48',
  },
  errorSlot: {
    marginTop: 16,
    fontSize: 13,
  },
  faceBtn: {
    marginTop: 20,
    height: 46,
    paddingHorizontal: 22,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1D1D1F',
  },
  faceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  pressed: {
    opacity: 0.72,
  },
});
