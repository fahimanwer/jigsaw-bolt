import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  Image 
} from 'react-native';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { Trophy, Timer, ArrowRight } from 'lucide-react-native';
import { Timer as TimerComponent } from './Timer';

interface CompletionModalProps {
  visible: boolean;
  puzzle: any;
  time: number;
  moves: number;
  onClose: () => void;
  onPlayAgain: () => void;
}

export const CompletionModal = ({ 
  visible, 
  puzzle, 
  time, 
  moves, 
  onClose, 
  onPlayAgain 
}: CompletionModalProps) => {
  const { colors } = useTheme();

  // Calculate score based on time and moves
  const calculateScore = () => {
    const basePoints = 1000;
    const timeDeduction = Math.min(time, 300) * 1; // Deduct 1 point per second, max 300
    const movesDeduction = Math.min(moves, 200) * 2; // Deduct 2 points per move, max 200
    
    const score = Math.max(basePoints - timeDeduction - movesDeduction, 100);
    return Math.floor(score);
  };

  const score = calculateScore();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.confetti}>
            {/* Confetti animation would go here */}
          </View>
          
          <View style={styles.trophyContainer}>
            <Trophy size={60} color={colors.accent} />
          </View>
          
          <Text style={[styles.congratsText, { color: colors.text }]}>
            Puzzle Completed!
          </Text>
          
          <Text style={[styles.puzzleName, { color: colors.text }]}>
            {puzzle?.name || 'Puzzle'}
          </Text>
          
          <Image 
            source={{ uri: puzzle?.thumbnail }} 
            style={styles.puzzleImage} 
          />
          
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: colors.cardBg }]}>
              <View style={styles.statHeader}>
                <Timer size={18} color={colors.primary} />
                <Text style={[styles.statTitle, { color: colors.text }]}>
                  Time
                </Text>
              </View>
              <TimerComponent 
                seconds={time} 
                style={[styles.statValue, { color: colors.primary }]} 
              />
            </View>
            
            <View style={[styles.statCard, { backgroundColor: colors.cardBg }]}>
              <View style={styles.statHeader}>
                <ArrowRight size={18} color={colors.secondary} />
                <Text style={[styles.statTitle, { color: colors.text }]}>
                  Moves
                </Text>
              </View>
              <Text style={[styles.statValue, { color: colors.secondary }]}>
                {moves}
              </Text>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: colors.cardBg }]}>
              <View style={styles.statHeader}>
                <Trophy size={18} color={colors.accent} />
                <Text style={[styles.statTitle, { color: colors.text }]}>
                  Score
                </Text>
              </View>
              <Text style={[styles.statValue, { color: colors.accent }]}>
                {score}
              </Text>
            </View>
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Finish</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.secondary }]}
              onPress={onPlayAgain}
            >
              <Text style={styles.buttonText}>Play Another</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  confetti: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  trophyContainer: {
    marginBottom: 16,
  },
  congratsText: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  puzzleName: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  puzzleImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    width: '100%',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '31%',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginLeft: 4,
  },
  statValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  button: {
    width: '48%',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
});