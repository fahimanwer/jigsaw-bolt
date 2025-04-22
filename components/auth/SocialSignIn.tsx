import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/lib/theme/ThemeProvider';

interface SocialSignInProps {
  title?: string;
}

export const SocialSignIn = ({ title = 'Or sign in with' }: SocialSignInProps) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.separator}>
        <View style={[styles.separatorLine, { backgroundColor: colors.border }]} />
        <Text style={[styles.separatorText, { color: colors.textSecondary }]}>
          {title}
        </Text>
        <View style={[styles.separatorLine, { backgroundColor: colors.border }]} />
      </View>

      <View style={styles.socialButtonsContainer}>
        <TouchableOpacity
          style={[styles.socialButton, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
        >
          <Text style={[styles.socialButtonText, { color: colors.text }]}>Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.socialButton, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
        >
          <Text style={[styles.socialButtonText, { color: colors.text }]}>Apple</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  separatorLine: {
    flex: 1,
    height: 1,
  },
  separatorText: {
    paddingHorizontal: 16,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  socialButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 6,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  socialButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
});