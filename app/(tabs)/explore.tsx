import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator, 
  Dimensions 
} from 'react-native';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { useRouter } from 'expo-router';
import { usePuzzles } from '@/lib/puzzles/usePuzzles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PuzzleCard } from '@/components/puzzles/PuzzleCard';
import { Search, Filter } from 'lucide-react-native';
import { FilterModal } from '@/components/puzzles/FilterModal';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48 - 16) / 2;

export default function ExploreScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { searchPuzzles, getCategoryPuzzles } = usePuzzles();
  const [searchQuery, setSearchQuery] = useState('');
  const [puzzles, setPuzzles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  useEffect(() => {
    loadPuzzles();
  }, [selectedCategory, selectedDifficulty]);

  const loadPuzzles = async () => {
    setLoading(true);
    try {
      let results;
      if (selectedCategory === 'all') {
        results = await searchPuzzles('', { difficulty: selectedDifficulty === 'all' ? undefined : selectedDifficulty });
      } else {
        results = await getCategoryPuzzles(selectedCategory, { difficulty: selectedDifficulty === 'all' ? undefined : selectedDifficulty });
      }
      setPuzzles(results || mockPuzzles);
    } catch (error) {
      console.error('Error loading puzzles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const results = await searchPuzzles(searchQuery, {
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        difficulty: selectedDifficulty === 'all' ? undefined : selectedDifficulty,
      });
      setPuzzles(results || []);
    } catch (error) {
      console.error('Error searching puzzles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterApply = (category: string, difficulty: string) => {
    setSelectedCategory(category);
    setSelectedDifficulty(difficulty);
    setFilterVisible(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Explore Puzzles</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchInputContainer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search puzzles..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
        </View>
        <TouchableOpacity 
          style={[styles.filterButton, { backgroundColor: colors.cardBg }]}
          onPress={() => setFilterVisible(true)}
        >
          <Filter size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={puzzles.length > 0 ? puzzles : mockPuzzles}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <PuzzleCard
              puzzle={item}
              width={cardWidth}
              height={cardWidth * 1.2}
              onPress={() => router.push(`/game/${item.id}`)}
              compact
              style={styles.puzzleCard}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No puzzles found. Try a different search.
              </Text>
            </View>
          }
        />
      )}

      <FilterModal
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onApply={handleFilterApply}
        selectedCategory={selectedCategory}
        selectedDifficulty={selectedDifficulty}
      />
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
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  puzzleCard: {
    marginRight: 16,
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
});

const mockPuzzles = [
  {
    id: 1,
    name: 'Mountain Landscape',
    thumbnail: 'https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    difficulty: 'Medium',
    pieces: 64,
    category: 'Nature',
  },
  {
    id: 2,
    name: 'Sunset Beach',
    thumbnail: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    difficulty: 'Hard',
    pieces: 100,
    category: 'Nature',
  },
  {
    id: 3,
    name: 'City Skyline',
    thumbnail: 'https://images.pexels.com/photos/2096700/pexels-photo-2096700.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    difficulty: 'Easy',
    pieces: 36,
    category: 'Urban',
  },
  {
    id: 4,
    name: 'Tropical Forest',
    thumbnail: 'https://images.pexels.com/photos/959058/pexels-photo-959058.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    difficulty: 'Medium',
    pieces: 64,
    category: 'Nature',
  },
  {
    id: 5,
    name: 'Winter Landscape',
    thumbnail: 'https://images.pexels.com/photos/1552212/pexels-photo-1552212.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    difficulty: 'Hard',
    pieces: 100,
    category: 'Nature',
  },
  {
    id: 6,
    name: 'Abstract Art',
    thumbnail: 'https://images.pexels.com/photos/1918290/pexels-photo-1918290.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    difficulty: 'Easy',
    pieces: 36,
    category: 'Art',
  },
];