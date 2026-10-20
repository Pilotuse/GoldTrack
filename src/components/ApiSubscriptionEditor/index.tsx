import { useKeyboardOffset } from '@/hooks/useKeyboardOffset';
import type { ApiMethod } from '@/context/SettingsContext';
import { useEffect, useState } from 'react';
import {
  Animated,
  Keyboard,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const METHODS: ApiMethod[] = ['GET', 'POST', 'WS'];

type ApiSubscriptionEditorProps = {
  visible: boolean;
  title: string;
  url: string;
  method: ApiMethod;
  placeholder: string;
  onClose: () => void;
  onSave: (url: string, method: ApiMethod) => void;
};

export default function ApiSubscriptionEditor({
  visible,
  title,
  url,
  method,
  placeholder,
  onClose,
  onSave,
}: ApiSubscriptionEditorProps) {
  const insets = useSafeAreaInsets();
  const [text, setText] = useState(url);
  const [picked, setPicked] = useState<ApiMethod>(method);
  const restPad = Math.max(insets.bottom, 20);
  const keyboardOffset = useKeyboardOffset(visible, restPad);

  useEffect(() => {
    if (visible) {
      setText(url);
      setPicked(method);
    }
  }, [visible, url, method]);

  const close = () => {
    Keyboard.dismiss();
    onClose();
  };

  const save = () => {
    onSave(text.trim(), picked);
    close();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
        <Animated.View
          style={[
            styles.sheet,
            {
              paddingBottom: restPad,
              transform: [{ translateY: Animated.multiply(keyboardOffset, -1) }],
            },
          ]}
        >
          <View style={styles.sheetExtend} />
          <View style={styles.handle} />
          <Text style={styles.title}>修改{title}</Text>

          <Text style={styles.label}>地址</Text>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={placeholder}
            placeholderTextColor="#C7C7CC"
            maxLength={200}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus={visible}
            editable={visible}
            style={styles.input}
          />

          <Text style={styles.label}>请求方法</Text>
          <View style={styles.options}>
            {METHODS.map((option) => {
              const active = picked === option;
              return (
                <Pressable
                  key={option}
                  onPress={() => setPicked(option)}
                  style={[styles.option, active && styles.optionOn]}
                >
                  <Text style={[styles.optionText, active && styles.optionTextOn]}>
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={save}
            style={({ pressed }) => [styles.saveBtn, pressed && styles.pressed]}
          >
            <Text style={styles.saveText}>保存</Text>
          </Pressable>
          <Pressable onPress={close} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>取消</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
  },
  sheet: {
    backgroundColor: '#F5F5F7',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 10,
    overflow: 'visible',
  },
  sheetExtend: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '100%',
    height: 400,
    backgroundColor: '#F5F5F7',
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D1D6',
    marginBottom: 14,
  },
  title: {
    marginBottom: 16,
    fontSize: 18,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  label: {
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
  },
  input: {
    height: 46,
    marginBottom: 16,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    fontSize: 16,
    color: '#1D1D1F',
  },
  options: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  option: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  optionOn: {
    backgroundColor: '#1D1D1F',
    borderColor: '#1D1D1F',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  optionTextOn: {
    color: '#FFFFFF',
  },
  saveBtn: {
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1D1D1F',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cancelBtn: {
    height: 44,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8E8E93',
  },
  pressed: {
    opacity: 0.72,
  },
});
