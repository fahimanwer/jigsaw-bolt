import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ScrollView,
  Alert,
  Switch
} from 'react-native';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/lib/auth/AuthProvider';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { 
  LogOut, 
  Moon, 
  Camera, 
  Settings, 
  Trophy, 
  User as UserIcon, 
  Bell,
  VolumeX,
  Volume2
} from 'lucide-react-native';

export default function ProfileScreen() {
  const { colors, toggleTheme, isDark } = useTheme();
  const router = useRouter();
  const { user, signOut, updateProfile } = useAuth();
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const [activeTab, setActiveTab] = useState(tab || 'profile');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [hapticFeedbackEnabled, setHapticFeedbackEnabled] = useState(true);

  useEffect(() => {
    if (tab) {
      setActiveTab(tab);
    }
  }, [tab]);

  const handleChangeAvatar = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission required', 'Media library permission is required to select images');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      try {
        await updateProfile({ avatarUrl: result.assets[0].uri });
      } catch (error) {
        console.error('Error updating avatar:', error);
        Alert.alert('Error', 'Failed to update avatar');
      }
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => signOut() }
      ]
    );
  };

  const renderProfileTab = () => (
    <ScrollView>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Image 
            source={{ 
              uri: user?.avatarUrl || 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=120'
            }} 
            style={styles.avatar} 
          />
          <TouchableOpacity 
            style={[styles.changeAvatarButton, { backgroundColor: colors.primary }]}
            onPress={handleChangeAvatar}
          >
            <Camera size={16} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={[styles.username, { color: colors.text }]}>
          {user?.username || 'User'}
        </Text>
        <Text style={[styles.email, { color: colors.textSecondary }]}>
          {user?.email || 'user@example.com'}
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.cardBg }]}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {user?.stats?.puzzlesCreated || 0}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Created
          </Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.cardBg }]}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {user?.stats?.puzzlesCompleted || 0}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Completed
          </Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.cardBg }]}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {user?.stats?.totalPoints || 0}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Points
          </Text>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.cardBg }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Achievements
        </Text>
        <View style={styles.achievementsGrid}>
          {mockAchievements.map(achievement => (
            <View 
              key={achievement.id} 
              style={[
                styles.achievementCard,
                !achievement.unlocked && { opacity: 0.5 }
              ]}
            >
              <View 
                style={[
                  styles.achievementIcon, 
                  { backgroundColor: achievement.unlocked ? colors.accent : colors.border }
                ]}
              >
                <Trophy size={20} color="#fff" />
              </View>
              <Text 
                style={[styles.achievementName, { color: colors.text }]}
                numberOfLines={1}
              >
                {achievement.name}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.signOutButton, { borderColor: colors.error }]}
        onPress={handleSignOut}
      >
        <LogOut size={20} color={colors.error} />
        <Text style={[styles.signOutText, { color: colors.error }]}>
          Sign Out
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderSettingsTab = () => (
    <ScrollView>
      <View style={[styles.settingsSection, { backgroundColor: colors.cardBg }]}>
        <Text style={[styles.settingsSectionTitle, { color: colors.text }]}>
          Appearance
        </Text>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Moon size={20} color={colors.text} />
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Dark Mode
            </Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: '#767577', true: colors.primary }}
            thumbColor="#f4f3f4"
          />
        </View>
      </View>

      <View style={[styles.settingsSection, { backgroundColor: colors.cardBg }]}>
        <Text style={[styles.settingsSectionTitle, { color: colors.text }]}>
          Sound & Feedback
        </Text>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            {soundEnabled ? (
              <Volume2 size={20} color={colors.text} />
            ) : (
              <VolumeX size={20} color={colors.text} />
            )}
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Sound Effects
            </Text>
          </View>
          <Switch
            value={soundEnabled}
            onValueChange={setSoundEnabled}
            trackColor={{ false: '#767577', true: colors.primary }}
            thumbColor="#f4f3f4"
          />
        </View>
      </View>

      <View style={[styles.settingsSection, { backgroundColor: colors.cardBg }]}>
        <Text style={[styles.settingsSectionTitle, { color: colors.text }]}>
          Notifications
        </Text>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Bell size={20} color={colors.text} />
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Enable Notifications
            </Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#767577', true: colors.primary }}
            thumbColor="#f4f3f4"
          />
        </View>
      </View>

      <View style={[styles.settingsSection, { backgroundColor: colors.cardBg }]}>
        <Text style={[styles.settingsSectionTitle, { color: colors.text }]}>
          Account
        </Text>
        <TouchableOpacity style={styles.accountButton}>
          <Text style={[styles.accountButtonText, { color: colors.primary }]}>
            Change Email
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.accountButton}>
          <Text style={[styles.accountButtonText, { color: colors.primary }]}>
            Change Password
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.accountButton, styles.lastAccountButton]}
          onPress={handleSignOut}
        >
          <Text style={[styles.accountButtonText, { color: colors.error }]}>
            Sign Out
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderLeaderboardTab = () => (
    <ScrollView>
      <View style={[styles.leaderboardHeader, { backgroundColor: colors.primary }]}>
        <Trophy size={32} color="#fff" />
        <Text style={styles.leaderboardTitle}>Top Puzzlers</Text>
      </View>

      <View style={styles.leaderboardList}>
        {mockLeaderboard.map((entry, index) => (
          <View 
            key={entry.id}
            style={[
              styles.leaderboardItem,
              { backgroundColor: index < 3 ? `${colors.cardBg}` : 'transparent' }
            ]}
          >
            <View style={styles.rankContainer}>
              <Text 
                style={[
                  styles.rankText, 
                  { 
                    color: index < 3 ? '#fff' : colors.text,
                    backgroundColor: index < 3 ? leaderColors[index] : colors.border
                  }
                ]}
              >
                {index + 1}
              </Text>
            </View>
            <Image source={{ uri: entry.avatar }} style={styles.leaderAvatar} />
            <View style={styles.leaderInfo}>
              <Text style={[styles.leaderName, { color: colors.text }]}>
                {entry.username}
              </Text>
              <Text style={[styles.puzzlesCompleted, { color: colors.textSecondary }]}>
                {entry.puzzlesCompleted} puzzles completed
              </Text>
            </View>
            <Text style={[styles.leaderScore, { color: colors.primary }]}>
              {entry.score} pts
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
      </View>

      <View style={[styles.tabContainer, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'profile' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }
          ]}
          onPress={() => setActiveTab('profile')}
        >
          <UserIcon 
            size={20} 
            color={activeTab === 'profile' ? colors.primary : colors.textSecondary} 
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'profile' ? colors.primary : colors.textSecondary }
            ]}
          >
            Profile
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'leaderboard' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }
          ]}
          onPress={() => setActiveTab('leaderboard')}
        >
          <Trophy 
            size={20} 
            color={activeTab === 'leaderboard' ? colors.primary : colors.textSecondary} 
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'leaderboard' ? colors.primary : colors.textSecondary }
            ]}
          >
            Leaderboard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'settings' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }
          ]}
          onPress={() => setActiveTab('settings')}
        >
          <Settings 
            size={20} 
            color={activeTab === 'settings' ? colors.primary : colors.textSecondary} 
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'settings' ? colors.primary : colors.textSecondary }
            ]}
          >
            Settings
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'profile' && renderProfileTab()}
        {activeTab === 'settings' && renderSettingsTab()}
        {activeTab === 'leaderboard' && renderLeaderboardTab()}
      </View>
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
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
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
  content: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  changeAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  username: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    marginBottom: 4,
  },
  email: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    marginHorizontal: 4,
    borderRadius: 12,
  },
  statValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  section: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    marginBottom: 16,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementCard: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 16,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementName: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    textAlign: 'center',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 24,
    marginBottom: 40,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  signOutText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginLeft: 8,
  },
  settingsSection: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingsSectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginLeft: 12,
  },
  accountButton: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  lastAccountButton: {
    borderBottomWidth: 0,
  },
  accountButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
  leaderboardHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 16,
  },
  leaderboardTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#fff',
    marginTop: 8,
  },
  leaderboardList: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rankText: {
    width: 28,
    height: 28,
    borderRadius: 14,
    textAlign: 'center',
    lineHeight: 28,
    overflow: 'hidden',
    fontFamily: 'Inter-Bold',
  },
  leaderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  leaderInfo: {
    flex: 1,
  },
  leaderName: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    marginBottom: 2,
  },
  puzzlesCompleted: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  leaderScore: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
});

const mockAchievements = [
  { id: 1, name: 'First Puzzle', unlocked: true },
  { id: 2, name: 'Puzzle Master', unlocked: true },
  { id: 3, name: 'Speed Demon', unlocked: false },
  { id: 4, name: 'Creator', unlocked: true },
  { id: 5, name: 'Hard Mode', unlocked: false },
  { id: 6, name: 'Persistent', unlocked: false },
];

const mockLeaderboard = [
  {
    id: 1,
    username: 'PuzzleMaster',
    avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=120',
    score: 12500,
    puzzlesCompleted: 43,
  },
  {
    id: 2,
    username: 'JigsawKing',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=120',
    score: 10800,
    puzzlesCompleted: 37,
  },
  {
    id: 3,
    username: 'PieceCollector',
    avatar: 'https://images.pexels.com/photos/712513/pexels-photo-712513.jpeg?auto=compress&cs=tinysrgb&w=120',
    score: 9200,
    puzzlesCompleted: 31,
  },
  {
    id: 4,
    username: 'PuzzleQueen',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=120',
    score: 8700,
    puzzlesCompleted: 29,
  },
  {
    id: 5,
    username: 'JigsawWizard',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=120',
    score: 7800,
    puzzlesCompleted: 26,
  },
  {
    id: 6,
    username: 'PuzzlePro',
    avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=120',
    score: 7200,
    puzzlesCompleted: 24,
  },
  {
    id: 7,
    username: 'SolverSupreme',
    avatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=120',
    score: 6800,
    puzzlesCompleted: 23,
  },
];

const leaderColors = ['#FFD700', '#C0C0C0', '#CD7F32'];