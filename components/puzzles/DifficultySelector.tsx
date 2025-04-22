import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/lib/theme/ThemeProvider';

interface DifficultySelectorProps {
  selected: string;
  onChange: (difficulty: string) => void;
  includeAll?: boolean;
}

export const DifficultySelector = ({ 
  selected, 
  onChange, 
  includeAll = false 
}: DifficultySelectorProps) => {
  const { colors } = useTheme();

  const difficulties = includeAll 
    ? [{ value: 'all', label: 'All' }, ...difficultyLevels]
    : difficultyLevels;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return colors.success;
      case 'medium':
        return colors.primary;
      case 'hard':
        return colors.warning;
      case 'expert':
        return colors.error;
      default:
        return colors.primary;
    }
  };

  return (
    <View style={styles.container}>
      {difficulties.map(difficulty => (
        <TouchableOpacity
          key={difficulty.value}
          style={[
            styles.difficultyButton,
            selected === difficulty.value && {
              backgroundColor: 
                difficulty.value === 'all' 
                  ? colors.primary 
                  : getDifficultyColor(difficulty.value),
              borderColor: 
                difficulty.value === 'all' 
                  ? colors.primary 
                  : getDifficultyColor(difficulty.value),
            },
            selected !== difficulty.value && { 
              borderColor: colors.border,
              backgroundColor: colors.cardBg,
            }
          ]}
          onPress={() => onChange(difficulty.value)}
        >
          <Text
            style={[
              styles.difficultyText,
              { color: selected === difficulty.value ? '#fff' : colors.text }
            ]}
          >
            {difficulty.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  difficultyButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  difficultyText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
});

const difficultyLevels = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
  { value: 'expert', label: 'Expert' },
];