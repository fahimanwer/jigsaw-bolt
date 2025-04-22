import React from 'react';
import { Text, StyleProp, TextStyle } from 'react-native';

interface TimerProps {
  seconds: number;
  style?: StyleProp<TextStyle>;
}

export const Timer = ({ seconds, style }: TimerProps) => {
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  };

  return <Text style={style}>{formatTime(seconds)}</Text>;
};