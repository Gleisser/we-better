# We Better - Mobile Architecture Plan

## 1. Executive Summary

The goal of this document is to define the technology stack and architectural foundation for the "We Better" mobile application. The app must target both **iOS and Android**, deliver a **premium user experience** with high-quality animations, and be designed from day one to support an **offline-first** strategy, even if full offline features are released in a later phase. The core features will include **Dreams, Goals, and Habits**. The mobile application will live in a **separate repository** from the web application, though it will consume the same underlying backend APIs (Supabase).

**Recommendation:** **React Native (using Expo).**
While Native development offers the highest ceiling for performance, the cost and time of maintaining two separate codebases (Swift and Kotlin) is high. Flutter is excellent for animations but introduces a completely new language (Dart) and ecosystem. React Native (specifically with Expo) allows the team to leverage existing React/TypeScript knowledge. Modern React Native, combined with libraries like `react-native-reanimated` and `@shopify/react-native-skia`, is more than capable of delivering the "premium" feel We Better requires. Furthermore, the React Native ecosystem has robust, battle-tested solutions for offline-first architectures (like WatermelonDB or PowerSync).

---

## 2. Technology Comparison

### A. Native (Swift/iOS & Kotlin/Android)

- **Quality & Premium Feel:** Highest possible quality. Access to native animation APIs (CoreAnimation, Jetpack Compose).
- **Offline Support:** Excellent native tools (CoreData/SwiftData, Room), but requires implementing the sync logic twice.
- **Architecture:** Two completely separate codebases, teams, and CI/CD pipelines.
- **Verdict:** Unnecessary overhead for the current phase, though it guarantees the highest performance.

### B. Flutter (Dart)

- **Quality & Premium Feel:** Exceptional at drawing complex, 60/120fps UIs and animations since it uses its own rendering engine (Impeller/Skia). Feels very premium.
- **Offline Support:** Good support (Hive, Isar, Drift), but sync logic with a Supabase backend requires careful manual implementation or third-party bridges.
- **Architecture:** Single codebase. Fast development.
- **Verdict:** A strong contender, but forces the team to learn Dart and step away from the rich React ecosystem currently utilized in the web app.

### C. React Native (Expo) - Recommended

- **Quality & Premium Feel:** Historically had performance bottlenecks, but the New Architecture (Fabric/JSI) and tools like `react-native-reanimated` and `react-native-skia` allow for 60/120fps complex animations and 3D interactions (via `@react-three/fiber`, which is used in the web app).
- **Offline Support:** Leading local-first databases exist in this ecosystem (WatermelonDB, PowerSync, RxDB) that pair exceptionally well with React and Supabase.
- **Architecture:** Single codebase. Can reuse TypeScript types, API definitions, and general architectural patterns from the web app, even in a separate repository.

---

## 3. Recommended Tech Stack

| Component                  | Technology                          | Rationale                                                                                                                                                               |
| :------------------------- | :---------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Framework**              | Expo (React Native)                 | Provides a managed workflow, seamless OTA updates, and simplifies native module management via Expo Modules.                                                            |
| **Language**               | TypeScript                          | Strong typing, consistent with the web app, prevents runtime errors.                                                                                                    |
| **State Management**       | Zustand                             | Lightweight, unopinionated, and fast. Perfect for UI state that doesn't belong in the database.                                                                         |
| **Data Fetching (Online)** | TanStack React Query                | For features that are strictly online or caching API responses before offline sync is fully implemented.                                                                |
| **Offline-First Database** | PowerSync / WatermelonDB            | **Crucial requirement.** These databases write to a local SQLite instance first (instant UI updates) and sync in the background with Supabase via a replication engine. |
| **Animations**             | React Native Reanimated & Skia      | Reanimated moves animation logic to the UI thread (preventing JS thread blocks). Skia allows for high-performance 2D/UI rendering.                                      |
| **Styling**                | NativeWind (Tailwind) or StyleSheet | NativeWind allows reusing Tailwind concepts from the web app, maintaining visual consistency.                                                                           |
| **Navigation**             | Expo Router                         | File-based routing, excellent deep linking support, and feels very native.                                                                                              |

---

## 4. Architectural Considerations

### 4.1. The "Offline-First" Strategy (Day One Design)

Even if offline capabilities are a "Phase 2" feature, the app must be architected so the data layer doesn't need to be rewritten.

**The Local-First Pattern:**

1. **Reads:** The UI _only_ reads from the local database (SQLite/WatermelonDB/PowerSync). It never waits for a network request to render core data (Dreams, Goals, Habits).
2. **Writes:** User actions (e.g., checking off a Habit) write instantly to the local database. The UI updates immediately (Optimistic UI by default).
3. **Sync:** A background worker or replication engine listens for local changes and pushes them to Supabase, and vice versa.

_If we don't build this data layer from day one, we will have to replace every `fetch()` or `supabase.from().select()` call in the app later._

### 4.2. Achieving the "Premium Feel"

The "We Better" brand demands a premium experience. In React Native, this means:

- **Zero JS-thread Animation:** No using React `useState` for continuous animations. Use `react-native-reanimated` shared values.
- **Micro-interactions:** Use haptic feedback (`expo-haptics`) on habit completion, goal setting, and navigation.
- **Smooth Transitions:** Utilize Expo Router's shared element transitions to make navigating between a "Dream" and its "Goals" feel seamless.
- **3D/Lottie:** Since the web uses Three.js and Lottie, leverage `lottie-react-native` for high-quality vector animations (e.g., celebration confetti when a habit is completed) and `@react-three/fiber` for React Native if 3D elements are required.

### 4.3. Separate Repository Strategy

While the repo is separate, we should maintain parity with the web app:

- **Schema Sharing:** Use a tool like `openapi-typescript` or Supabase CLI to generate TypeScript types from the database schema so both repos share the exact same data contracts.
- **Decoupled Logic:** Keep business logic (e.g., habit streak calculation algorithms) in pure TypeScript functions that could theoretically be copied or moved to a shared package later if desired.

---

## 5. Core Feature Mapping

### 1. Dreams (Vision & Long-term)

- **UI Focus:** Highly visual, image-heavy, possibly utilizing Skia for dynamic, dreamy background gradients or Framer-like interactions.
- **Data:** Stored locally. Images should be cached locally (using `expo-image` or `react-native-fast-image` equivalents in Expo) so dreams are visible offline.

### 2. Goals (Milestones & Tracking)

- **UI Focus:** Progress bars, charts, and hierarchical lists (Dreams -> Goals).
- **Data:** Relational data stored in the local SQLite database. Progress calculation should be computed efficiently using SQL queries on the local DB rather than JS-side array mapping to keep the UI snappy.

### 3. Habits (Daily Execution)

- **UI Focus:** Fast, satisfying interactions. Swipe-to-complete, haptic feedback, and celebration animations (Lottie).
- **Data:** High write frequency. The offline-first architecture shines here. If a user completes a habit on the subway with no signal, it writes locally and syncs to Supabase once they reconnect.

---

## 6. Next Steps

1. Initialize the new repository using `npx create-expo-app@latest -e with-router`.
2. Setup the chosen offline-first database (Evaluate WatermelonDB vs PowerSync for Supabase integration).
3. Establish the base UI components, typography, and animation primitives (Reanimated).
4. Begin implementing the core data models: Dreams, Goals, and Habits.
