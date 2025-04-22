import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { X } from 'lucide-react-native';
import { DifficultySelector } from './DifficultySelector';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (category: string, difficulty: string) => void;
  selectedCategory: string;
  selectedDifficulty: string;
}

export const FilterModal = ({ 
  visible, 
  onClose, 
  onApply, 
  selectedCategory, 
  selectedDifficulty 
}: FilterModalProps) => {
  const { colors } = useTheme();
  const [localCategory, setLocalCategory] = React.useState(selectedCategory);
  const [localDifficulty, setLocalDifficulty] = React.useState(selectedDifficulty);

  // Reset selections when the modal opens
  React.useEffect(() => {
    if (visible) {
      setLocalCategory(selectedCategory);
      setLocalDifficulty(selectedDifficulty);
    }
  }, [visible, selectedCategory, selectedDifficulty]);

  const handleApply = () => {
    onApply(localCategory, localDifficulty);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Filter Puzzles</Text>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.cardBg }]}
              onPress={onClose}
            >
              <X size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.filterSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Category</Text>
              <View style={styles.categoriesGrid}>
                {categories.map(category => (
                  <TouchableOpacity
                    key={category.value}
                    style={[
                      styles.categoryButton,
                      { 
                        backgroundColor: 
                          localCategory === category.value 
                            ? colors.primary 
                            : colors.cardBg 
                      }
                    ]}
                    onPress={() => setLocalCategory(category.value)}
                  >
                    <Text 
                      style={[
                        styles.categoryText, 
                        { 
                          color: 
                            localCategory === category.value 
                              ? '#fff' 
                              : colors.text 
                        }
                      ]}
                    >
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Difficulty</Text>
              <DifficultySelector
                selected={localDifficulty}
                onChange={setLocalDifficulty}
                includeAll
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.clearButton, { borderColor: colors.border }]}
              onPress={() => {
                setLocalCategory('all');
                setLocalDifficulty('all');
              }}
            >
              <Text style={[styles.clearButtonText, { color: colors.text }]}>
                Clear All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.applyButton, { backgroundColor: colors.primary }]}
              onPress={handleApply}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    height: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  modalTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  filterSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  clearButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
  },
  clearButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
  applyButton: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#fff',
  },
});

const categories = [
  { label: 'All', value: 'all' },
  { label: 'Nature', value: 'Nature' },
  { label: 'Animals', value: 'Animals' },
  { label: 'Art', value: 'Art' },
  { label: 'Urban', value: 'Urban' },
  { label: 'People', value: 'People' },
  { label: 'Travel', value: 'Travel' },
  { label: 'Food', value: 'Food' },
  { label: 'Abstract', value: 'Abstract' },
  { label: 'Other', value: 'Other' },
];