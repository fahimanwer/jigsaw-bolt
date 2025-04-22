import React, { useRef, useState } from 'react';
import { Animated, StyleSheet, Image, Platform } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';

interface PuzzlePieceProps {
  piece: {
    id: number;
    correctX: number;
    correctY: number;
    initialX: number;
    initialY: number;
    width: number;
    height: number;
  };
  puzzleImage: string;
  isCompleted: boolean;
  onSnap: () => void;
  onMove: () => void;
  onMoveEnd: () => void;
  scale: number;
}

export const PuzzlePiece = ({
  piece,
  puzzleImage,
  isCompleted,
  onSnap,
  onMove,
  onMoveEnd,
  scale
}: PuzzlePieceProps) => {
  const [isDragged, setIsDragged] = useState(false);
  const position = useRef(new Animated.ValueXY({
    x: piece.initialX,
    y: piece.initialY
  })).current;

  // The threshold distance for piece snapping
  const snapThreshold = 20;

  const translateX = position.x;
  const translateY = position.y;

  // Handler for drag gesture
  const onGestureEvent = (event: any) => {
    if (isCompleted) return;

    const { translationX, translationY } = event.nativeEvent;
    
    position.setValue({
      x: piece.initialX + translationX,
      y: piece.initialY + translationY
    });

    if (!isDragged) {
      setIsDragged(true);
      onMove();
    }
  };

  // Handler for when the drag is completed
  const onHandlerStateChange = (event: any) => {
    if (isCompleted) return;

    if (event.nativeEvent.state === 5) { // END state
      const currentX = piece.initialX + event.nativeEvent.translationX;
      const currentY = piece.initialY + event.nativeEvent.translationY;
      
      // Check if piece is close to correct position
      const distance = Math.sqrt(
        Math.pow(currentX - piece.correctX, 2) + 
        Math.pow(currentY - piece.correctY, 2)
      );
      
      if (distance < snapThreshold * scale) {
        // Snap to correct position
        Animated.spring(position, {
          toValue: { x: piece.correctX, y: piece.correctY },
          useNativeDriver: Platform.OS !== 'web',
          friction: 5
        }).start(() => {
          piece.initialX = piece.correctX;
          piece.initialY = piece.correctY;
          onSnap();
        });
      } else {
        // Update the initial position for the next drag
        piece.initialX = currentX;
        piece.initialY = currentY;
      }
      
      setIsDragged(false);
      onMoveEnd();
    }
  };

  // Initialize position at correct spot if already completed
  React.useEffect(() => {
    if (isCompleted) {
      position.setValue({
        x: piece.correctX,
        y: piece.correctY
      });
    }
  }, [isCompleted]);

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
      enabled={!isCompleted}
    >
      <Animated.View
        style={[
          styles.piece,
          {
            transform: [
              { translateX },
              { translateY },
              { scale: isDragged ? 1.05 : 1 }
            ],
            width: piece.width,
            height: piece.height,
            opacity: isDragged ? 0.8 : 1,
            zIndex: isDragged ? 100 : isCompleted ? 1 : 10,
          }
        ]}
      >
        <Image
          source={{ uri: puzzleImage }}
          style={[
            styles.pieceImage,
            {
              width: piece.width * scale,
              height: piece.height * scale,
              transform: [
                { translateX: -piece.correctX },
                { translateY: -piece.correctY }
              ]
            }
          ]}
          resizeMode="cover"
        />
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  piece: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#fff',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  pieceImage: {
    position: 'absolute',
  }
});