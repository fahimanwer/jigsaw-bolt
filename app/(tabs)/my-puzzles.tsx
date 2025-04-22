import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  RefreshControl, 
  TouchableOpacity,
  Image,
  Dimensions
} from 'react-native';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { useRouter } from 'expo-router';
import { usePuzzles } from '@/lib/puzzles/usePuzzles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { Plus, Clock, CircleCheck as CheckCircle2 } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const cardWidth = width - 48;

type Tab = 'created' | 'inProgress' | 'completed';

export default function MyPuzzlesScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { getUserPuzzles, loading } = usePuzzles();
  const [activeTab, setActiveTab] = useState<Tab>('created');
  const [puzzles, setPuzzles] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPuzzles();
  }, [activeTab]);

  const loadPuzzles = async () => {
    setRefreshing(true);
    try {
      const results = await getUserPuzzles(activeTab);
      setPuzzles(results || getMockPuzzles(activeTab));
    } catch (error) {
      console.error('Error loading puzzles:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getMockPuzzles = (tab: Tab) => {
    if (tab === 'created') return mockCreatedPuzzles;
    if (tab === 'inProgress') return mockInProgressPuzzles;
    return mockCompletedPuzzles;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>My Puzzles</Text>
      </View>

      <View style={[styles.tabContainer, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'created' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }
          ]}
          onPress={() => setActiveTab('created')}
        >
          <Plus size={20} color={activeTab === 'created' ? colors.primary : colors.textSecondary} />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'created' ? colors.primary : colors.textSecondary }
            ]}
          >
            Created
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'inProgress' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }
          ]}
          onPress={() => setActiveTab('inProgress')}
        >
          <Clock size={20} color={activeTab === 'inProgress' ? colors.primary : colors.textSecondary} />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'inProgress' ? colors.primary : colors.textSecondary }
            ]}
          >
            In Progress
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'completed' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }
          ]}
          onPress={() => setActiveTab('completed')}
        >
          <CheckCircle2 size={20} color={activeTab === 'completed' ? colors.primary : colors.textSecondary} />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'completed' ? colors.primary : colors.textSecondary }
            ]}
          >
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <LoadingIndicator />
      ) : (
        <FlatList
          data={puzzles}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={loadPuzzles} />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.puzzleCard, { backgroundColor: colors.cardBg }]}
              onPress={() => router.push(`/game/${item.id}`)}
            >
              <Image source={{ uri: item.thumbnail }} style={styles.puzzleThumbnail} />
              <View style={styles.puzzleInfo}>
                <Text style={[styles.puzzleName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.puzzleStats, { color: colors.textSecondary }]}>
                  {item.pieces} pieces • {item.difficulty}
                </Text>
                {activeTab === 'inProgress' && (
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { 
                          backgroundColor: colors.primary,
                          width: `${item.progress}%` 
                        }
                      ]} 
                    />
                  </View>
                )}
                {activeTab === 'completed' && (
                  <Text style={[styles.completedDate, { color: colors.success }]}>
                    Completed on {item.completedDate}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {activeTab === 'created' 
                  ? "You haven't created any puzzles yet." 
                  : activeTab === 'inProgress' 
                    ? "You don't have any puzzles in progress." 
                    : "You haven't completed any puzzles yet."}
              </Text>
              {activeTab === 'created' && (
                <TouchableOpacity 
                  style={[styles.createButton, { backgroundColor: colors.primary }]}
                  onPress={() => router.push('/create')}
                >
                  <Text style={styles.createButtonText}>Create a Puzzle</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  tabText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginLeft: 6,
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  puzzleCard: {
    flexDirection: 'row',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  puzzleThumbnail: {
    width: 100,
    height: 100,
  },
  puzzleInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  puzzleName: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginBottom: 4,
  },
  puzzleStats: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: {
    height: '100%',
  },
  completedDate: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createButtonText: {
    color: '#fff',
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
});

const mockCreatedPuzzles = [
  {
    id: 1,
    name: 'Mountain Landscape',
    thumbnail: 'https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    difficulty: 'Medium',
    pieces: 64,
  },
  {
    id: 2,
    name: 'Sunset Beach',
    thumbnail: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    difficulty: 'Hard',
    pieces: 100,
  },
];

const mockInProgressPuzzles = [
  {
    id: 3,
    name: 'City Skyline',
    thumbnail: 'https://images.pexels.com/photos/2096700/pexels-photo-2096700.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    difficulty: 'Easy',
    pieces: 36,
    progress: 65,
  },
  {
    id: 4,
    name: 'Tropical Forest',
    thumbnail: 'https://images.pexels.com/photos/959058/pexels-photo-959058.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    difficulty: 'Medium',
    pieces: 64,
    progress: 30,
  },
];

const mockCompletedPuzzles = [
  {
    id: 5,
    name: 'Winter Landscape',
    thumbnail: 'https://images.pexels.com/photos/1552212/pexels-photo-1552212.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    difficulty: 'Hard',
    pieces: 100,
    completedDate: 'May 10, 2023',
  },
  {
    id: 6,
    name: 'Abstract Art',
    thumbnail: 'https://images.pexels.com/photos/1918290/pexels-photo-1918290.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    difficulty: 'Easy',
    pieces: 36,
    completedDate: 'Apr 22, 2023',
  },
];