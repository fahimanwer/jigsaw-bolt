import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  FlatList, 
  Dimensions, 
  RefreshControl,
  Platform,
  Alert
} from 'react-native';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth/AuthProvider';
import { PuzzleCard } from '@/components/puzzles/PuzzleCard';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { usePuzzles } from '@/lib/puzzles/usePuzzles';
import { Search, Trophy, ChevronRight, CircleAlert as AlertCircle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const cardWidth = width * 0.7;

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { getFeaturedPuzzles, getRecentPuzzles, loading, error } = usePuzzles();
  const [featuredPuzzles, setFeaturedPuzzles] = useState<any[]>([]);
  const [recentPuzzles, setRecentPuzzles] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setFetchError(null);
      
      // Load data with error handling
      let featuredError = false;
      let recentError = false;
      
      const featured = await getFeaturedPuzzles().catch(err => {
        console.error('Error loading featured puzzles:', err);
        featuredError = true;
        return [];
      });
      
      const recent = await getRecentPuzzles().catch(err => {
        console.error('Error loading recent puzzles:', err);
        recentError = true;
        return [];
      });
      
      setFeaturedPuzzles(featured || []);
      setRecentPuzzles(recent || []);
      
      // Set appropriate error message
      if (featuredError && recentError) {
        setFetchError('Failed to load puzzles. Please check your connection and try again.');
      } else if (featuredError) {
        setFetchError('Failed to load featured puzzles.');
      } else if (recentError) {
        setFetchError('Failed to load recent puzzles.');
      }
    } catch (error) {
      console.error('Error loading puzzles:', error);
      setFetchError('An unexpected error occurred. Please try again later.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (loading && !refreshing) {
    return <LoadingIndicator />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {fetchError && (
          <View style={[styles.errorContainer, { backgroundColor: colors.error || '#ffdddd' }]}>
            <AlertCircle size={20} color={colors.text} />
            <Text style={[styles.errorText, { color: colors.text }]}>
              {fetchError}
            </Text>
            <TouchableOpacity 
              style={[styles.retryButton, { backgroundColor: colors.primary }]}
              onPress={onRefresh}
            >
              <Text style={[styles.retryText, { color: '#fff' }]}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              Hello, {user?.username || 'Puzzler'}
            </Text>
            <Text style={[styles.title, { color: colors.text }]}>
              Discover Puzzles
            </Text>
          </View>
          <TouchableOpacity 
            style={[styles.searchButton, { backgroundColor: colors.cardBg }]}
            onPress={() => router.push('/explore')}
          >
            <Search size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Featured Puzzles
            </Text>
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={() => router.push('/explore')}
            >
              <Text style={[styles.seeAllText, { color: colors.primary }]}>
                See All
              </Text>
              <ChevronRight size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={featuredPuzzles.length > 0 ? featuredPuzzles : mockFeaturedPuzzles}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredList}
            snapToInterval={cardWidth + 16}
            decelerationRate="fast"
            renderItem={({ item }) => (
              <PuzzleCard 
                puzzle={item}
                width={cardWidth}
                height={200}
                onPress={() => router.push(`/game/${item.id}`)}
                featured
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No featured puzzles available
                </Text>
              </View>
            }
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Leaderboard
            </Text>
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={() => router.push('/profile?tab=leaderboard')}
            >
              <Text style={[styles.seeAllText, { color: colors.primary }]}>
                See All
              </Text>
              <ChevronRight size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={[styles.leaderboardCard, { backgroundColor: colors.cardBg }]}>
            <View style={styles.leaderboardHeader}>
              <Trophy size={24} color={colors.accent} />
              <Text style={[styles.leaderboardTitle, { color: colors.text }]}>
                Top Puzzlers
              </Text>
            </View>
            {mockLeaderboard.map((entry, index) => (
              <View key={entry.id} style={styles.leaderboardItem}>
                <View style={styles.leaderboardRank}>
                  <Text style={[
                    styles.rankText, 
                    { 
                      color: index < 3 ? '#fff' : colors.text,
                      backgroundColor: index < 3 ? leaderColors[index] : 'transparent'
                    }
                  ]}>
                    {index + 1}
                  </Text>
                </View>
                <Image source={{ uri: entry.avatar }} style={styles.userAvatar} />
                <Text style={[styles.username, { color: colors.text }]}>
                  {entry.username}
                </Text>
                <Text style={[styles.score, { color: colors.textSecondary }]}>
                  {entry.score} pts
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.section, styles.lastSection]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Recently Added
            </Text>
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={() => router.push('/explore')}
            >
              <Text style={[styles.seeAllText, { color: colors.primary }]}>
                See All
              </Text>
              <ChevronRight size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.recentGrid}>
            {(recentPuzzles.length > 0 ? recentPuzzles : mockRecentPuzzles).slice(0, 4).map((puzzle) => (
              <TouchableOpacity 
                key={puzzle.id}
                style={[
                  styles.recentPuzzleItem, 
                  { backgroundColor: colors.cardBg }
                ]}
                onPress={() => router.push(`/game/${puzzle.id}`)}
              >
                <Image
                  source={{ uri: puzzle.thumbnail }}
                  style={styles.recentPuzzleImage}
                />
                <View style={styles.recentPuzzleInfo}>
                  <Text 
                    style={[styles.recentPuzzleName, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {puzzle.name}
                  </Text>
                  <Text 
                    style={[styles.recentPuzzlePieces, { color: colors.textSecondary }]}
                  >
                    {puzzle.pieces} pieces
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    margin: 16,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: {
    flex: 1,
    marginLeft: 8,
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  retryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 8,
  },
  retryText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginTop: 24,
  },
  lastSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  featuredList: {
    paddingHorizontal: 24,
  },
  emptyContainer: {
    width: cardWidth,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  emptyText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
  leaderboardCard: {
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 16,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  leaderboardTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginLeft: 8,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  leaderboardRank: {
    width: 32,
    alignItems: 'center',
  },
  rankText: {
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    overflow: 'hidden',
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  username: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  score: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  recentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  recentPuzzleItem: {
    width: '48%',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  recentPuzzleImage: {
    width: '100%',
    height: 100,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  recentPuzzleInfo: {
    padding: 12,
  },
  recentPuzzleName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  recentPuzzlePieces: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
});

// Mock data for UI development
const mockFeaturedPuzzles = [
  {
    id: 1,
    name: 'Mountain Landscape',
    thumbnail: 'https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    difficulty: 'Medium',
    pieces: 64,
    completionRate: 75,
  },
  {
    id: 2,
    name: 'Sunset Beach',
    thumbnail: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    difficulty: 'Hard',
    pieces: 100,
    completionRate: 60,
  },
  {
    id: 3,
    name: 'City Skyline',
    thumbnail: 'https://images.pexels.com/photos/2096700/pexels-photo-2096700.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    difficulty: 'Easy',
    pieces: 36,
    completionRate: 90,
  },
];

const mockRecentPuzzles = [
  {
    id: 4,
    name: 'Tropical Forest',
    thumbnail: 'https://images.pexels.com/photos/959058/pexels-photo-959058.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    difficulty: 'Medium',
    pieces: 64,
  },
  {
    id: 5,
    name: 'Winter Landscape',
    thumbnail: 'https://images.pexels.com/photos/1552212/pexels-photo-1552212.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    difficulty: 'Hard',
    pieces: 100,
  },
  {
    id: 6,
    name: 'Abstract Art',
    thumbnail: 'https://images.pexels.com/photos/1918290/pexels-photo-1918290.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    difficulty: 'Easy',
    pieces: 36,
  },
  {
    id: 7,
    name: 'Flower Garden',
    thumbnail: 'https://images.pexels.com/photos/1073078/pexels-photo-1073078.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    difficulty: 'Medium',
    pieces: 64,
  },
];

const mockLeaderboard = [
  {
    id: 1,
    username: 'PuzzleMaster',
    avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=120',
    score: 12500,
  },
  {
    id: 2,
    username: 'JigsawKing',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=120',
    score: 10800,
  },
  {
    id: 3,
    username: 'PieceCollector',
    avatar: 'https://images.pexels.com/photos/712513/pexels-photo-712513.jpeg?auto=compress&cs=tinysrgb&w=120',
    score: 9200,
  },
  {
    id: 4,
    username: 'PuzzleQueen',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=120',
    score: 8700,
  },
];

const leaderColors = ['#FFD700', '#C0C0C0', '#CD7F32'];