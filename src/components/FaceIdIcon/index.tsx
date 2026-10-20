import Svg, { Circle, Path } from 'react-native-svg';

type FaceIdIconProps = {
  size?: number;
  color?: string;
};

export default function FaceIdIcon({ size = 20, color = '#1D1D1F' }: FaceIdIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M8 3.25H6.25A3 3 0 0 0 3.25 6.25V8"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Path
        d="M16 3.25h1.75a3 3 0 0 1 3 3V8"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Path
        d="M8 20.75H6.25a3 3 0 0 1-3-3V16"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Path
        d="M16 20.75h1.75a3 3 0 0 0 3-3V16"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Circle cx="9.2" cy="10.4" r="1.05" fill={color} />
      <Circle cx="14.8" cy="10.4" r="1.05" fill={color} />
      <Path
        d="M12 9.2v3.1c0 .55-.35 1-.95 1"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Path
        d="M9.15 16.15c.8.75 1.75 1.15 2.85 1.15s2.05-.4 2.85-1.15"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}
