import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

interface WaterMarkProps {
  /** 水印文字，默认显示"云用药" */
  text?: string;
  /** 是否启用水印，默认 true */
  enabled?: boolean;
}

const WaterMark: React.FC<WaterMarkProps> = ({ 
  text = '云用药', 
  enabled = true 
}) => {
  if (!enabled) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.watermark}>
        <Text style={styles.text}>{text}</Text>
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
    transform: [{ rotate: '-30deg' }],
    opacity: 0.08,
  },
  text: {
    fontSize: 48,
    fontWeight: '700',
    color: '#0D9488',
  },
});

export default WaterMark;
