import { useEffect, useRef } from 'react';
import { Animated, Easing, Keyboard, Platform } from 'react-native';

function keyboardEasing(name?: string) {
  switch (name) {
    case 'easeIn':
      return Easing.in(Easing.ease);
    case 'easeOut':
      return Easing.out(Easing.ease);
    case 'linear':
      return Easing.linear;
    case 'keyboard':
      return Easing.bezier(0.17, 0.59, 0.4, 0.77);
    default:
      return Easing.inOut(Easing.ease);
  }
}

/** Animated lift (px). 0 when hidden; keyboard height minus `rest` when shown. */
export function useKeyboardOffset(active: boolean, rest = 0) {
  const lift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) return;

    lift.setValue(0);

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const animate = (toValue: number, event: { duration?: number; easing?: string }) => {
      const duration = event.duration ?? 250;
      if (duration <= 0) {
        lift.setValue(toValue);
        return;
      }
      Animated.timing(lift, {
        toValue,
        duration,
        easing: keyboardEasing(event.easing),
        useNativeDriver: true,
      }).start();
    };

    const show = Keyboard.addListener(showEvent, (event) => {
      animate(Math.max(0, event.endCoordinates.height - rest), event);
    });
    const hide = Keyboard.addListener(hideEvent, (event) => {
      animate(0, event);
    });

    return () => {
      show.remove();
      hide.remove();
    };
  }, [active, lift, rest]);

  return lift;
}
