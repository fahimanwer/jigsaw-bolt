# React Native Expo Jigsaw Puzzle App - Development Plan

**Project Goal:** Create a React Native Expo Jigsaw Puzzle App with Supabase Integration.

**Current Status:**
*   ✅ Basic Expo project structure is in place.
*   ✅ Dependencies are installed (`npm install`).
*   ✅ App runs locally (`npx expo start`).
*   ✅ Basic navigation using Expo Router seems to be set up (`app/(auth)`, `app/(tabs)` structure implied).
*   ✅ A basic Login screen (`app/(auth)/login.tsx`) exists with email/password fields.
*   ✅ A non-functional "Skip" button has been added to the Login screen, navigating to `/(tabs)`.
*   ⏳ Basic Theme (`useTheme`) and Auth (`useAuth`) providers exist but likely need full implementation/integration.
*   ❌ No Supabase integration is present yet.
*   ❌ No core puzzle mechanics or UI exist yet.

---

**Step-by-Step Development Plan:**

**Phase 1: Foundation & Authentication**

*   ✅ **Project Setup:** Initialize React Native Expo project.
*   ✅ **Basic Navigation:** Set up initial routing (e.g., Auth stack, Main Tabs stack using Expo Router).
*   ⏳ **Supabase Setup:**
    *   [ ] Create Supabase project.
    *   [ ] Configure Supabase environment variables in the Expo app.
    *   [ ] Initialize Supabase client (`lib/supabase/client.ts`).
*   ⏳ **Authentication System:**
    *   [ ] **Email/Password Auth:**
        *   [ ] Integrate `signInWithPassword`, `signUp`, `signOut` functions in `lib/auth/AuthProvider.tsx` using Supabase client.
        *   [ ] Connect Login screen (`app/(auth)/login.tsx`) to `signIn`.
        *   [ ] Create and connect `Register` screen (`app/(auth)/register.tsx`) to `signUp`.
        *   [ ] Create and connect `Reset Password` screen (`app/(auth)/reset-password.tsx`) functionality.
        *   [ ] Implement proper loading states and error handling (`FormError` component seems to exist).
    *   [ ] **Social Providers:**
        *   [ ] Configure Google Auth in Supabase and Expo app.
        *   [ ] Implement Google Sign-In flow (`SocialSignIn` component might be a starting point).
        *   [ ] Configure Apple Auth.
        *   [ ] Implement Apple Sign-In flow.
        *   [ ] Configure Facebook Auth.
        *   [ ] Implement Facebook Sign-In flow.
    *   [ ] **User Profile System:**
        *   [ ] Design `profiles` table schema in Supabase (user ID, username, avatar URL, preferences, stats).
        *   [ ] Implement logic to create a profile entry on user sign-up.
        *   [ ] Create a Profile screen (`app/(tabs)/profile.tsx`).
        *   [ ] Allow users to view/edit their profile (username).
        *   [ ] Implement avatar selection/upload (using Expo ImagePicker and Supabase Storage).
        *   [ ] Store user stats (e.g., puzzles completed, best times) - *Defer until puzzle mechanics are done*.
        *   [ ] Store user preferences (e.g., theme, difficulty) - *Defer until relevant features are done*.

**Phase 2: Core Puzzle Mechanics**

*   [ ] **Puzzle Data Structure:**
    *   [ ] Design `puzzles` table schema in Supabase (puzzle ID, image URL, difficulty, dimensions).
    *   [ ] Design `puzzle_sessions` table schema (session ID, puzzle ID, user ID, state, progress, start/end time).
*   [ ] **Image Processing & Piece Generation:**
    *   [ ] Choose an image source (e.g., pre-defined list stored in Supabase Storage, allow user uploads).
    *   [ ] Implement client-side logic to fetch an image.
    *   [ ] Implement logic to slice the image into jigsaw pieces based on difficulty/dimensions. This might involve calculating coordinates for each piece.
    *   [ ] Store piece information (original position, current position, rotation, isLocked).
*   [ ] **Puzzle Screen:**
    *   [ ] Create the main puzzle game screen (`app/(tabs)/game/[puzzleId].tsx` or similar).
    *   [ ] Display puzzle pieces randomly arranged.
    *   [ ] Display the puzzle board/target area.
*   [ ] **Game Mechanics:**
    *   [ ] **Drag and Drop:** Implement using `react-native-gesture-handler` and `react-native-reanimated` to allow users to drag pieces.
    *   [ ] **Piece Snapping:** Implement logic to detect when a piece is close to its correct position or adjacent correct pieces and snap it into place.
    *   [ ] **Grid Alignment:** Ensure pieces align correctly when snapped.
    *   [ ] **Zoom Functionality:** Implement pinch-to-zoom using gesture handler/reanimated to allow detailed viewing.
    *   [ ] **Haptic Feedback:** Use `expo-haptics` for feedback on piece pickup, drop, and snapping.
    *   [ ] **Audio Feedback:** Use `expo-av` for subtle sounds on interactions (optional).
    *   [ ] **Scoring System:** Implement a timer and move counter. Calculate score upon completion.
*   [ ] **Puzzle State Management:**
    *   [ ] Store the current state of the puzzle pieces (positions, locked status) in the component's state.
    *   [ ] **Real-time Progress (Initial):** Implement logic to save the puzzle state periodically or on significant events (e.g., piece lock) to Supabase (`puzzle_sessions` table).
    *   [ ] Implement logic to load a puzzle state from Supabase if resuming a game.

**Phase 3: UI/UX Refinements**

*   [ ] **Home/Puzzle Selection Screen:**
    *   [ ] Create a screen (`app/(tabs)/index.tsx`?) to display available puzzles fetched from Supabase.
    *   [ ] Allow users to select a puzzle and difficulty.
*   [ ] **Responsive Layouts:** Ensure UI adapts to different screen sizes and orientations.
*   [ ] **Theming:**
    *   [ ] Fully implement dark/light theme switching using the `ThemeProvider`.
    *   [ ] Ensure all components respect the current theme.
*   [ ] **Navigation:** Refine navigation flow, ensuring it's intuitive (using React Native Navigation or Expo Router conventions).
*   [ ] **Accessibility:**
    *   [ ] Add `accessibilityLabel` and `accessibilityHint` props where appropriate.
    *   [ ] Test with screen readers (VoiceOver/TalkBack).
*   [ ] **Loading States:** Implement loading indicators during data fetching (e.g., loading puzzles, signing in, saving progress).
*   [ ] **Error Boundaries:** Implement React Error Boundaries to catch rendering errors gracefully.

**Phase 4: Performance & Advanced Features**

*   [ ] **Performance Optimization:**
    *   [ ] **Image Caching:** Implement caching for puzzle images to reduce loading times (Expo's `Image` component might handle some caching).
    *   [ ] **Piece Rendering:** Optimize the rendering of many puzzle pieces (e.g., using `FlatList` or virtualization techniques if needed, though direct rendering might be okay initially).
    *   [ ] **Memory Management:** Profile and address any memory leaks, especially with large images/puzzles.
*   [ ] **Offline Functionality:**
    *   [ ] Store basic puzzle data/definitions locally (e.g., AsyncStorage).
    *   [ ] Allow solving puzzles offline.
    *   [ ] Implement logic to sync progress back to Supabase when online.
*   [ ] **Real-time Collaboration (Optional/Advanced):**
    *   [ ] Utilize Supabase Realtime subscriptions to show progress of other users solving the same puzzle session concurrently (if this feature is desired).

**Phase 5: Testing & Documentation**

*   [ ] **Testing:**
    *   [ ] Write unit tests for utility functions and potentially core logic (e.g., piece generation).
    *   [ ] Write integration tests for authentication flow.
    *   [ ] Write end-to-end tests for core puzzle gameplay using a framework like Detox or Maestro (optional but recommended).
*   [ ] **Documentation:**
    *   [ ] Add inline comments explaining complex code sections.
    *   [ ] Create a `README.md` with setup instructions.
    *   [ ] Create an API integration guide (how the app interacts with Supabase).
    *   [ ] Create basic User Documentation explaining how to play.

**Phase 6: Finalization & Guidelines Compliance**

*   [ ] **Code Quality:** Ensure adherence to React Native best practices and TypeScript typing. Maintain modular architecture.
*   [ ] **Error Logging:** Integrate an error logging service (e.g., Sentry).
*   [ ] **Analytics:** Add basic analytics tracking (e.g., screen views, puzzle starts/completions) using a service like PostHog or Expo's built-in analytics.
*   [ ] **GDPR Compliance:** Ensure user data handling complies with GDPR (relevant for Supabase data storage, user consent).
*   [ ] **Final Accessibility Review:** Conduct a final check for accessibility issues.

---

**Timeline (Estimate):**

*   **Week 1-2:** Phase 1 (Foundation, Supabase Setup, Basic Email/Pass Auth, Profile Table).
*   **Week 3-5:** Phase 2 (Core Puzzle Mechanics - Image Loading, Piece Gen, Basic Drag/Drop, Snapping, Game Screen Layout).
*   **Week 6-7:** Phase 2 Continued (Zoom, Haptics, Scoring) & Phase 3 Start (Home Screen, Basic Theming).
*   **Week 8-9:** Phase 1 Continued (Social Auth, Profile Screen/Editing) & Phase 3 (Responsive Layouts, Navigation Refinement).
*   **Week 10-11:** Phase 2 Continued (Puzzle State Saving/Loading to Supabase) & Phase 4 Start (Basic Performance Checks, Image Caching).
*   **Week 12-13:** Phase 3 Continued (Accessibility, Loading/Error States) & Phase 4 (Offline Mode basic implementation).
*   **Week 14-15:** Phase 5 (Testing, Documentation).
*   **Week 16:** Phase 6 (Final Polish, Logging, Analytics, Compliance Checks).

---

**Next Immediate Steps:**

1.  Set up the Supabase project and configure the client in the Expo app (`lib/supabase/client.ts`).
2.  Integrate Supabase email/password authentication into the existing `AuthProvider` and connect the Login/Register screens.
