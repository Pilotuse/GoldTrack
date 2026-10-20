import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { StyleSheet, TextInput } from 'react-native';

export default function GlassSearchInput({ placeholder, value, onChangeText }) {
  return (
    // 使用 BlurView 实现背景的高斯模糊效果
    <BlurView intensity={60} tint="light" style={styles.container}>
      <Ionicons name="search-outline" size={20} color="#888" style={styles.icon} />
      
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#888"
        value={value}
        onChangeText={onChangeText}
        style={styles.input}
      />

      {value ? (
        <Ionicons name="close-circle" size={20} color="#888" style={styles.clearIcon} />
      ) : null}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.45)', // 半透明白色背景
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.8)',     // 细腻的亮色边框，增强玻璃质感
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#333',
    fontSize: 15,
    // 移除 TextInput 默认的边框
    borderWidth: 0,
  },
  icon: {
    marginRight: 8,
  },
  clearIcon: {
    marginLeft: 8,
  },
});