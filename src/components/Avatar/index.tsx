import { Image } from 'expo-image';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

type AvatarProps = {
  uri?: string | null;
  initial: string;
  size: number;
  fontSize?: number;
  style?: StyleProp<ViewStyle>;
};

export default function Avatar({ uri, initial, size, fontSize, style }: AvatarProps) {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#D4B06A',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {uri ? (
        <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : (
        <Text style={[styles.initial, { fontSize: fontSize ?? Math.round(size * 0.4) }]}>
          {initial}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  initial: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
