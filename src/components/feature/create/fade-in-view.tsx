import { useEffect, useRef, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

type Props = {
  ready: boolean;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function FadeInView({ ready, children, style }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (ready) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();
    } else {
      opacity.setValue(0);
    }
  }, [ready, opacity]);

  return (
    <View style={[styles.wrapper, style]}>
      <Animated.View style={[styles.fill, { opacity }]}>{children}</Animated.View>
      {!ready ? (
        <View style={styles.loading} pointerEvents="none">
          <ActivityIndicator color="#315FEA" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { backgroundColor: '#FFFFFF' },
  fill: { flex: 1 },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    paddingTop: 24,
  },
});