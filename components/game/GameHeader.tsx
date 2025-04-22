import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Platform 
} from 'react-native';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';

interface GameHeaderProps {
  puzzle: {
    name: string;
    pieces: number;
    difficulty: string;
  };
  onBack: () => void;
  showControls: boolean;
  setShowControls: (show: boolean) => void;
  completedPieces: number;
  totalPieces: number;
}

export const GameHeader = ({ 
  puzzle, 
  onBack, 
  showControls, 
  setShowControls,
  completedPieces,
  totalPieces
}: GameHeaderProps) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View 
      style={[
        styles.container, 
        { 
          paddingTop: Math.max(insets.top, 16), 
          backgroundColor: 'rgba(0,0,0,0.7)' 
        }
      ]}
    >
      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={onBack}
        >
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>{puzzle.name}</Text>
          <Text style={styles.subtitle}>
            {puzzle.difficulty} • {puzzle.pieces} pieces • {completedPieces}/{totalPieces} completed
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.controlButton} 
          onPress={() => setShowControls(!showControls)}
        >
          {showControls ? (
            <EyeOff size={24} color="#fff" />
          ) : (
            <Eye size={24} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 16,
    paddingHorizontal: 16,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    marginBottom: 2,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});