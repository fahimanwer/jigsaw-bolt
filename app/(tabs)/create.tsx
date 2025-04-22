import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  TextInput, 
  ScrollView, 
  Alert, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { useRouter } from 'expo-router';
import { usePuzzles } from '@/lib/puzzles/usePuzzles';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, Upload, X } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DifficultySelector } from '@/components/puzzles/DifficultySelector';

export default function CreateScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { createPuzzle } = usePuzzles();
  const [image, setImage] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [pieceCount, setPieceCount] = useState<number>(36);
  const [loading, setLoading] = useState(false);

  const takePicture = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission required', 'Camera permission is required to take pictures');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission required', 'Media library permission is required to select images');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const clearImage = () => {
    setImage(null);
  };

  const handleCreate = async () => {
    if (!image) {
      Alert.alert('Image required', 'Please select or take a picture for your puzzle');
      return;
    }

    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter a name for your puzzle');
      return;
    }

    setLoading(true);
    try {
      const puzzleId = await createPuzzle({
        name,
        description,
        category: category || 'Other',
        difficulty,
        pieces: pieceCount,
        imageUri: image,
      });

      if (puzzleId) {
        Alert.alert(
          'Puzzle Created',
          'Your puzzle has been created successfully!',
          [{ text: 'OK', onPress: () => router.replace(`/game/${puzzleId}`) }]
        );
      }
    } catch (error) {
      console.error('Error creating puzzle:', error);
      Alert.alert('Error', 'Failed to create puzzle. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePieceCountChange = (difficultyLevel: string) => {
    setDifficulty(difficultyLevel);
    switch (difficultyLevel) {
      case 'easy':
        setPieceCount(16);
        break;
      case 'medium':
        setPieceCount(36);
        break;
      case 'hard':
        setPieceCount(64);
        break;
      case 'expert':
        setPieceCount(100);
        break;
      default:
        setPieceCount(36);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Create Puzzle</Text>
          </View>

          <View style={styles.imageSection}>
            {image ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: image }} style={styles.selectedImage} />
                <TouchableOpacity
                  style={[styles.clearImageButton, { backgroundColor: colors.error }]}
                  onPress={clearImage}
                >
                  <X size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={[styles.imagePlaceholder, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                <ImageIcon size={48} color={colors.textSecondary} />
                <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
                  Select or take a picture
                </Text>
              </View>
            )}

            <View style={styles.imageButtonsContainer}>
              <TouchableOpacity
                style={[styles.imageButton, { backgroundColor: colors.primary }]}
                onPress={takePicture}
              >
                <Camera size={20} color="#fff" />
                <Text style={styles.imageButtonText}>Camera</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.imageButton, { backgroundColor: colors.secondary }]}
                onPress={pickImage}
              >
                <Upload size={20} color="#fff" />
                <Text style={styles.imageButtonText}>Gallery</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formSection}>
            <View style={[styles.inputContainer, { borderColor: colors.border }]}>
              <Text style={[styles.label, { color: colors.text }]}>Puzzle Name</Text>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Enter a name for your puzzle"
                placeholderTextColor={colors.textSecondary}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={[styles.inputContainer, { borderColor: colors.border }]}>
              <Text style={[styles.label, { color: colors.text }]}>Description (Optional)</Text>
              <TextInput
                style={[styles.textArea, { color: colors.text }]}
                placeholder="Describe your puzzle..."
                placeholderTextColor={colors.textSecondary}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={[styles.inputContainer, { borderColor: colors.border }]}>
              <Text style={[styles.label, { color: colors.text }]}>Category (Optional)</Text>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="e.g., Nature, Animals, Art"
                placeholderTextColor={colors.textSecondary}
                value={category}
                onChangeText={setCategory}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Difficulty ({pieceCount} pieces)</Text>
              <DifficultySelector
                selected={difficulty}
                onChange={handlePieceCountChange}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.createButton,
              { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }
            ]}
            onPress={handleCreate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.createButtonText}>Create Puzzle</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  imageSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  imagePlaceholder: {
    height: 200,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  placeholderText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginTop: 12,
  },
  imageContainer: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
  },
  clearImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
    paddingVertical: 12,
    borderRadius: 12,
  },
  imageButtonText: {
    color: '#fff',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginLeft: 8,
  },
  formSection: {
    paddingHorizontal: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    height: 100,
  },
  createButton: {
    marginHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  createButtonText: {
    color: '#fff',
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
});