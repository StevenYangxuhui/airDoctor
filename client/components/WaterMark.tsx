import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

interface WaterMarkProps {
  /** 是否启用水印，默认 true */
  enabled?: boolean;
}

const WaterMark: React.FC<WaterMarkProps> = ({ enabled = true }) => {
  if (!enabled) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.watermark}>
        <Image
          source={require('@/assets/watermark.png')}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  watermark: {
    opacity: 0.15,
    width: 150,
    height: 150,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default WaterMark;
