import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react-native';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { EdgeInsets } from 'react-native-safe-area-context';

interface GameControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  insets: EdgeInsets;
}

export const GameControls = ({ 
  onZoomIn, 
  onZoomOut, 
  onReset, 
  insets 
}: GameControlsProps) => {
  const { colors } = useTheme();

  return (
    <View 
      style={[
        styles.container, 
        { bottom: insets.bottom + 24, backgroundColor: colors.cardBg }
      ]}
    >
      <TouchableOpacity style={styles.button} onPress={onZoomOut}>
        <ZoomOut size={24} color={colors.text} />
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.button, styles.middleButton]} onPress={onReset}>
        <Maximize size={24} color={colors.text} />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={onZoomIn}>
        <ZoomIn size={24} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 40,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  middleButton: {
    marginHorizontal: 8,
  },
});