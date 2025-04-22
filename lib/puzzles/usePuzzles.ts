import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth/AuthProvider';
import * as ImageManipulator from 'expo-image-manipulator';
import { Platform } from 'react-native';

interface PuzzleProgress {
  completedPieces: number[];
  time: number;
  moves: number;
}

interface PuzzleCompletion {
  time: number;
  moves: number;
}

interface PuzzleCreation {
  name: string;
  description?: string;
  category?: string;
  difficulty: string;
  pieces: number;
  imageUri: string;
}

// Maximum number of retry attempts for network operations
const MAX_RETRIES = 3;
// Delay between retries (in milliseconds)
const RETRY_DELAY = 1000;

// Utility function to wait for a specific amount of time
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const usePuzzles = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Retry function for database operations that might fail due to network issues
  const retryOperation = async <T>(operation: () => Promise<T>, retries = MAX_RETRIES): Promise<T> => {
    try {
      return await operation();
    } catch (err) {
      if (retries <= 0) {
        throw err;
      }
      
      // Wait before retry
      await wait(RETRY_DELAY);
      
      // Log retry attempt
      console.log(`Retrying operation, ${retries} attempts left...`);
      
      // Recursive retry
      return retryOperation(operation, retries - 1);
    }
  };

  // Get puzzle by ID
  const getPuzzle = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await retryOperation(() => 
        supabase
          .from('puzzles')
          .select('*, progress:puzzle_progress(*)')
          .eq('id', id)
          .single()
      );

      if (error) {
        throw error;
      }

      // Get user-specific progress
      if (user) {
        const { data: progressData } = await retryOperation(() => 
          supabase
            .from('puzzle_progress')
            .select('*')
            .eq('puzzle_id', id)
            .eq('user_id', user.id)
            .single()
        );

        if (progressData) {
          data.progress = progressData;
        }
      }

      return data;
    } catch (error) {
      console.error('Error fetching puzzle:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to fetch puzzle: ${errorMessage}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Get featured puzzles
  const getFeaturedPuzzles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await retryOperation(() => 
        supabase
          .from('puzzles')
          .select('*')
          .eq('featured', true)
          .order('created_at', { ascending: false })
          .limit(5)
      );

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching featured puzzles:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to fetch featured puzzles: ${errorMessage}`);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get recent puzzles
  const getRecentPuzzles = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if we're in a browser environment and if the fetch API is available
      if (typeof fetch !== 'undefined') {
        console.log('Fetching recent puzzles...');
      }
      
      const { data, error } = await retryOperation(() => 
        supabase
          .from('puzzles')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(8)
      );

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      // Provide detailed error information
      const errorDetails = error instanceof Error ? 
        `${error.name}: ${error.message}` : 
        'Unknown error occurred';
      
      console.error(`Error fetching recent puzzles: ${errorDetails}`);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('Network error: Failed to fetch. Please check your internet connection.');
        setError('Network connection issue. Please check your internet connection and try again.');
      } else {
        setError(`Failed to fetch recent puzzles: ${errorDetails}`);
      }
      
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Search puzzles
  const searchPuzzles = async (query: string, filters?: { category?: string; difficulty?: string }) => {
    try {
      setLoading(true);
      setError(null);
      
      let puzzleQuery = supabase
        .from('puzzles')
        .select('*');

      // Add search query if provided
      if (query) {
        puzzleQuery = puzzleQuery.ilike('name', `%${query}%`);
      }

      // Add filters if provided
      if (filters?.category) {
        puzzleQuery = puzzleQuery.eq('category', filters.category);
      }

      if (filters?.difficulty) {
        puzzleQuery = puzzleQuery.eq('difficulty', filters.difficulty);
      }

      const { data, error } = await retryOperation(() => 
        puzzleQuery.order('created_at', { ascending: false })
      );

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error searching puzzles:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to search puzzles: ${errorMessage}`);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get puzzles by category
  const getCategoryPuzzles = async (category: string, filters?: { difficulty?: string }) => {
    try {
      setLoading(true);
      setError(null);
      
      let puzzleQuery = supabase
        .from('puzzles')
        .select('*')
        .eq('category', category);

      if (filters?.difficulty) {
        puzzleQuery = puzzleQuery.eq('difficulty', filters.difficulty);
      }

      const { data, error } = await retryOperation(() => 
        puzzleQuery.order('created_at', { ascending: false })
      );

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching category puzzles:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to fetch category puzzles: ${errorMessage}`);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get user puzzles
  const getUserPuzzles = async (type: 'created' | 'inProgress' | 'completed') => {
    if (!user) return [];

    try {
      setLoading(true);
      setError(null);
      
      let data;

      switch (type) {
        case 'created':
          const { data: createdData, error: createdError } = await retryOperation(() =>
            supabase
              .from('puzzles')
              .select('*')
              .eq('creator_id', user.id)
              .order('created_at', { ascending: false })
          );

          if (createdError) throw createdError;
          data = createdData;
          break;

        case 'inProgress':
          const { data: inProgressData, error: inProgressError } = await retryOperation(() =>
            supabase
              .from('puzzle_progress')
              .select('*, puzzle:puzzles(*)')
              .eq('user_id', user.id)
              .lt('completed_at', null)
              .order('updated_at', { ascending: false })
          );

          if (inProgressError) throw inProgressError;
          data = inProgressData.map((item: any) => ({
            ...item.puzzle,
            progress: (item.completed_pieces?.length / item.puzzle.pieces) * 100,
          }));
          break;

        case 'completed':
          const { data: completedData, error: completedError } = await retryOperation(() =>
            supabase
              .from('puzzle_progress')
              .select('*, puzzle:puzzles(*)')
              .eq('user_id', user.id)
              .not('completed_at', 'is', null)
              .order('completed_at', { ascending: false })
          );

          if (completedError) throw completedError;
          data = completedData.map((item: any) => ({
            ...item.puzzle,
            completedDate: new Date(item.completed_at).toLocaleDateString(),
          }));
          break;

        default:
          data = [];
      }

      return data;
    } catch (error) {
      console.error(`Error fetching ${type} puzzles:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to fetch ${type} puzzles: ${errorMessage}`);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Update puzzle progress
  const updatePuzzleProgress = async (puzzleId: string, progress: PuzzleProgress) => {
    if (!user) return;

    try {
      setError(null);
      
      const { data, error } = await retryOperation(() =>
        supabase
          .from('puzzle_progress')
          .upsert({
            puzzle_id: puzzleId,
            user_id: user.id,
            completed_pieces: progress.completedPieces,
            time: progress.time,
            moves: progress.moves,
            updated_at: new Date().toISOString(),
          })
          .select()
      );

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error updating puzzle progress:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to update puzzle progress: ${errorMessage}`);
      throw error;
    }
  };

  // Complete puzzle
  const completePuzzle = async (puzzleId: string, completion: PuzzleCompletion) => {
    if (!user) return;

    try {
      setError(null);
      
      // Update puzzle progress with completion info
      const { data, error } = await retryOperation(() =>
        supabase
          .from('puzzle_progress')
          .upsert({
            puzzle_id: puzzleId,
            user_id: user.id,
            time: completion.time,
            moves: completion.moves,
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
      );

      if (error) {
        throw error;
      }

      // Update user stats
      const { data: userData, error: userError } = await retryOperation(() =>
        supabase
          .from('profiles')
          .select('stats')
          .eq('id', user.id)
          .single()
      );

      if (userError) {
        throw userError;
      }

      const currentStats = userData.stats || {
        puzzlesCompleted: 0,
        totalPoints: 0,
      };

      // Calculate points based on completion time and moves
      const points = calculatePoints(completion.time, completion.moves);

      const { error: statsError } = await retryOperation(() =>
        supabase
          .from('profiles')
          .update({
            stats: {
              ...currentStats,
              puzzlesCompleted: (currentStats.puzzlesCompleted || 0) + 1,
              totalPoints: (currentStats.totalPoints || 0) + points,
            },
          })
          .eq('id', user.id)
      );

      if (statsError) {
        throw statsError;
      }

      return data;
    } catch (error) {
      console.error('Error completing puzzle:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to complete puzzle: ${errorMessage}`);
      throw error;
    }
  };

  // Create a new puzzle
  const createPuzzle = async (puzzleData: PuzzleCreation) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Process image
      let processedImageUrl = '';
      if (puzzleData.imageUri) {
        if (Platform.OS === 'web') {
          // For web, handle images differently
          // In a real app, you'd upload to Supabase storage
          processedImageUrl = puzzleData.imageUri;
        } else {
          // Process image for mobile
          const processed = await ImageManipulator.manipulateAsync(
            puzzleData.imageUri,
            [{ resize: { width: 800 } }],
            { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
          );

          // Upload to Supabase storage
          const fileName = `puzzle-${Date.now()}.jpg`;
          const filePath = `${user.id}/${fileName}`;

          const { data: uploadData, error: uploadError } = await retryOperation(() =>
            supabase.storage
              .from('puzzle-images')
              .upload(filePath, {
                uri: processed.uri,
                type: 'image/jpeg',
                name: fileName,
              })
          );

          if (uploadError) {
            throw uploadError;
          }

          const { data: urlData } = await supabase.storage
            .from('puzzle-images')
            .getPublicUrl(filePath);

          processedImageUrl = urlData.publicUrl;
        }
      }

      // Create puzzle record
      const { data, error } = await retryOperation(() =>
        supabase
          .from('puzzles')
          .insert({
            name: puzzleData.name,
            description: puzzleData.description || '',
            category: puzzleData.category || 'Other',
            difficulty: puzzleData.difficulty,
            pieces: puzzleData.pieces,
            creator_id: user.id,
            thumbnail: processedImageUrl,
          })
          .select()
          .single()
      );

      if (error) {
        throw error;
      }

      // Update user stats
      const { data: userData, error: userError } = await retryOperation(() =>
        supabase
          .from('profiles')
          .select('stats')
          .eq('id', user.id)
          .single()
      );

      if (userError) {
        throw userError;
      }

      const currentStats = userData.stats || {
        puzzlesCreated: 0,
      };

      const { error: statsError } = await retryOperation(() =>
        supabase
          .from('profiles')
          .update({
            stats: {
              ...currentStats,
              puzzlesCreated: (currentStats.puzzlesCreated || 0) + 1,
            },
          })
          .eq('id', user.id)
      );

      if (statsError) {
        throw statsError;
      }

      return data.id;
    } catch (error) {
      console.error('Error creating puzzle:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to create puzzle: ${errorMessage}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate points
  const calculatePoints = (time: number, moves: number) => {
    // Base points - higher for faster times and fewer moves
    const timePoints = Math.max(1000 - time, 100);
    const movePoints = Math.max(1000 - moves * 5, 100);
    
    // Combined score
    return Math.floor((timePoints + movePoints) / 2);
  };

  return {
    loading,
    error,
    getPuzzle,
    getFeaturedPuzzles,
    getRecentPuzzles,
    searchPuzzles,
    getCategoryPuzzles,
    getUserPuzzles,
    updatePuzzleProgress,
    completePuzzle,
    createPuzzle,
  };
};