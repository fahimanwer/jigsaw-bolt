import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Dimensions,
  Animated,
  Alert,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { usePuzzles } from '@/lib/puzzles/usePuzzles';
import { StatusBar } from 'expo-status-bar';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PuzzlePiece } from '@/components/game/PuzzlePiece';
import { Timer } from '@/components/game/Timer';
import { GameHeader } from '@/components/game/GameHeader';
import { GameControls } from '@/components/game/GameControls';
import { CompletionModal } from '@/components/game/CompletionModal';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

export default function GameScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getPuzzle, updatePuzzleProgress, completePuzzle } = usePuzzles();
  const insets = useSafeAreaInsets();
  
  const [puzzle, setPuzzle] = useState<any>(null);
  const [pieces, setPieces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [completedPieces, setCompletedPieces] = useState<Set<number>>(new Set());
  const [isComplete, setIsComplete] = useState(false);
  const [timer, setTimer] = useState(0);
  const [moves, setMoves] = useState(0);
  const [scale, setScale] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const boardPosition = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  useEffect(() => {
    loadPuzzle();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [id]);

  useEffect(() => {
    if (puzzle && !isComplete) {
      startTimer();
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [puzzle, isComplete]);

  useEffect(() => {
    if (pieces.length > 0 && completedPieces.size === pieces.length) {
      handlePuzzleComplete();
    }
  }, [completedPieces, pieces]);

  const loadPuzzle = async () => {
    try {
      const puzzleData = await getPuzzle(id);
      setPuzzle(puzzleData || mockPuzzle);
      
      // Generate pieces based on difficulty
      const pieceCount = puzzleData?.pieces || mockPuzzle.pieces;
      const generatedPieces = generatePuzzlePieces(pieceCount);
      setPieces(generatedPieces);
      
      // Load saved progress if any
      if (puzzleData?.progress) {
        const savedCompletedPieces = new Set(puzzleData.progress.completedPieces || []);
        setCompletedPieces(savedCompletedPieces);
        setTimer(puzzleData.progress.time || 0);
        setMoves(puzzleData.progress.moves || 0);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading puzzle:', error);
      Alert.alert('Error', 'Failed to load puzzle');
      router.back();
    }
  };

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        const newTime = prev + 1;
        // Save progress every 30 seconds
        if (newTime % 30 === 0) {
          saveProgress(newTime);
        }
        return newTime;
      });
    }, 1000);
  };

  const saveProgress = async (currentTime = timer) => {
    if (!puzzle || isComplete) return;
    
    try {
      await updatePuzzleProgress(puzzle.id, {
        completedPieces: Array.from(completedPieces),
        time: currentTime,
        moves,
      });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const handlePuzzleComplete = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setIsComplete(true);
    
    // Trigger haptic feedback if available
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    try {
      await completePuzzle(puzzle.id, {
        time: timer,
        moves,
      });
      
      // Show completion modal after a short delay
      setTimeout(() => {
        setShowCompletionModal(true);
      }, 1000);
    } catch (error) {
      console.error('Error completing puzzle:', error);
    }
  };

  const handlePieceSnap = (pieceId: number) => {
    setCompletedPieces(prev => {
      const newSet = new Set(prev);
      newSet.add(pieceId);
      return newSet;
    });
    
    setMoves(prev => prev + 1);
    
    // Trigger haptic feedback if available
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handlePieceMove = () => {
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handlePieceMoveEnd = () => {
    setIsDragging(false);
  };

  const handleBoardMove = (event: any) => {
    if (isDragging) return;
    
    boardPosition.setValue({
      x: boardPosition.x._value + event.nativeEvent.translationX,
      y: boardPosition.y._value + event.nativeEvent.translationY,
    });
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleReset = () => {
    boardPosition.setValue({ x: 0, y: 0 });
    setScale(1);
  };

  // Function to generate mock puzzle pieces for UI development
  const generatePuzzlePieces = (count: number) => {
    const gridSize = Math.ceil(Math.sqrt(count));
    const boardWidth = width * 1.5;
    const boardHeight = height * 1.5;
    const pieceWidth = boardWidth / gridSize;
    const pieceHeight = boardHeight / gridSize;
    
    const pieces = [];
    for (let i = 0; i < count; i++) {
      // Calculate correct position
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;
      const correctX = col * pieceWidth;
      const correctY = row * pieceHeight;
      
      // Calculate random initial position
      const randomX = Math.random() * (boardWidth - pieceWidth);
      const randomY = Math.random() * (boardHeight - pieceHeight);
      
      pieces.push({
        id: i,
        correctX,
        correctY,
        initialX: randomX,
        initialY: randomY,
        width: pieceWidth,
        height: pieceHeight,
      });
    }
    
    return pieces;
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading puzzle...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      
      <GameHeader
        puzzle={puzzle}
        onBack={() => {
          saveProgress();
          router.back();
        }}
        showControls={showControls}
        setShowControls={setShowControls}
        completedPieces={completedPieces.size}
        totalPieces={pieces.length}
      />
      
      {showControls && (
        <View 
          style={[
            styles.statsContainer, 
            { backgroundColor: colors.cardBg, top: insets.top + 80 }
          ]}
        >
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Time</Text>
            <Timer seconds={timer} style={[styles.statValue, { color: colors.text }]} />
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Moves</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{moves}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Completed</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {completedPieces.size}/{pieces.length}
            </Text>
          </View>
        </View>
      )}
      
      <PanGestureHandler
        onGestureEvent={handleBoardMove}
        enabled={!isDragging}
      >
        <Animated.View 
          style={[
            styles.puzzleBoard,
            {
              transform: [
                { translateX: boardPosition.x },
                { translateY: boardPosition.y },
                { scale }
              ]
            }
          ]}
        >
          {pieces.map(piece => (
            <PuzzlePiece
              key={piece.id}
              piece={piece}
              puzzleImage={puzzle.thumbnail}
              isCompleted={completedPieces.has(piece.id)}
              onSnap={() => handlePieceSnap(piece.id)}
              onMove={handlePieceMove}
              onMoveEnd={handlePieceMoveEnd}
              scale={scale}
            />
          ))}
          
          {isComplete && (
            <View style={styles.completedOverlay}>
              <Image
                source={{ uri: puzzle.thumbnail }}
                style={styles.completedImage}
                resizeMode="cover"
              />
            </View>
          )}
        </Animated.View>
      </PanGestureHandler>
      
      {showControls && (
        <GameControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onReset={handleReset}
          insets={insets}
        />
      )}
      
      <CompletionModal
        visible={showCompletionModal}
        puzzle={puzzle}
        time={timer}
        moves={moves}
        onClose={() => {
          setShowCompletionModal(false);
          router.replace('/my-puzzles?tab=completed');
        }}
        onPlayAgain={() => {
          setShowCompletionModal(false);
          router.replace('/explore');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginTop: 16,
  },
  statsContainer: {
    position: 'absolute',
    left: 24,
    right: 24,
    flexDirection: 'row',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    zIndex: 10,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  puzzleBoard: {
    position: 'absolute',
    width: width * 1.5,
    height: height * 1.5,
    top: -height * 0.25,
    left: -width * 0.25,
  },
  completedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  completedImage: {
    width: '80%',
    height: '80%',
    borderRadius: 16,
  },
});

// Mock puzzle data for UI development
const mockPuzzle = {
  id: '1',
  name: 'Mountain Landscape',
  thumbnail: 'https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  difficulty: 'Medium',
  pieces: 36,
  category: 'Nature',
};