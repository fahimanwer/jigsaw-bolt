import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  StyleProp, 
  ViewStyle 
} from 'react-native';
import { useTheme } from '@/lib/theme/ThemeProvider';

interface PuzzleCardProps {
  puzzle: {
    id: string | number;
    name: string;
    thumbnail: string;
    difficulty: string;
    pieces: number;
    completionRate?: number;
    progress?: number;
  };
  width: number;
  height: number;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  featured?: boolean;
  compact?: boolean;
}

export const PuzzleCard = ({ 
  puzzle, 
  width, 
  height, 
  onPress, 
  style, 
  featured = false,
  compact = false
}: PuzzleCardProps) => {
  const { colors } = useTheme();

  const difficultyColor = getDifficultyColor(puzzle.difficulty, colors);

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { width, height, backgroundColor: colors.cardBg }, 
        style
      ]}
      onPress={onPress}
    >
      <Image 
        source={{ uri: puzzle.thumbnail }} 
        style={featured ? styles.featuredImage : styles.image} 
      />

      <View style={styles.contentContainer}>
        <Text 
          style={[
            styles.name, 
            { color: colors.text },
            compact && styles.compactName
          ]}
          numberOfLines={1}
        >
          {puzzle.name}
        </Text>

        <View style={styles.detailsContainer}>
          <View 
            style={[
              styles.difficultyBadge, 
              { backgroundColor: difficultyColor }
            ]}
          >
            <Text style={styles.difficultyText}>{puzzle.difficulty}</Text>
          </View>

          <Text style={[styles.piecesText, { color: colors.textSecondary }]}>
            {puzzle.pieces} pieces
          </Text>
        </View>

        {featured && puzzle.completionRate !== undefined && (
          <View style={styles.completionContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    backgroundColor: colors.primary,
                    width: `${puzzle.completionRate}%` 
                  }
                ]} 
              />
            </View>
            <Text style={[styles.completionText, { color: colors.textSecondary }]}>
              {puzzle.completionRate}% completed by users
            </Text>
          </View>
        )}

        {puzzle.progress !== undefined && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    backgroundColor: colors.primary,
                    width: `${puzzle.progress}%` 
                  }
                ]} 
              />
            </View>
            <Text style={[styles.progressText, { color: colors.textSecondary }]}>
              {Math.round(puzzle.progress)}% completed
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const getDifficultyColor = (difficulty: string, colors: any) => {
  switch (difficulty.toLowerCase()) {
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

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 16,
  },
  image: {
    width: '100%',
    height: '60%',
  },
  featuredImage: {
    width: '100%',
    height: '50%',
  },
  contentContainer: {
    padding: 12,
    flex: 1,
  },
  name: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    marginBottom: 8,
  },
  compactName: {
    fontSize: 14,
    marginBottom: 4,
  },
  detailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  difficultyText: {
    color: '#fff',
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  piecesText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  completionContainer: {
    marginTop: 'auto',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  completionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  progressText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
});