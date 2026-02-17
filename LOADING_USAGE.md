# Loading Usage Map

This document lists files that reference loading states or loading UI, based on a scan for `loading`, `isLoading`, or `Loading`.

## Styles

- src/styles/globals.css
- src/features/life-wheel/LifeWheel.module.css
- src/features/dream-board/DreamBoardPage.module.css
- src/features/dream-board/components/CosmicDreamExperience/CosmicDreamExperience.module.css
- src/features/dream-board/components/Board/Board.module.css
- src/features/dream-board/components/Board/DreamBoardContainer/DreamBoardContainer.module.css
- src/features/dream-board/components/Board/Milestones/Milestones.module.css
- src/shared/components/layout/Header/HeaderActions.module.css
- src/shared/components/layout/PreFooter/PreFooter.module.css
- src/shared/components/layout/Gallery/Gallery.module.css
- src/shared/components/layout/Community/Community.module.css
- src/shared/components/layout/Partners/Partners.module.css
- src/shared/components/layout/Testimonies/Testimonies.module.css
- src/shared/components/i18n/LanguageSelector/LanguageSelector.module.css
- src/shared/components/widgets/AffirmationWidget/AffirmationWidget.module.css
- src/shared/components/widgets/HabitsWidget/HabitsWidget.module.css
- src/shared/components/widgets/LifeWheelWidget/LifeWheelWidget.module.css
- src/shared/components/theme/ThemeSelector/ThemeSelector.module.css
- src/shared/components/layout/Footer/Footer.module.css
- src/shared/components/widgets/GoalsWidget/GoalsWidget.module.css

## Core / Types / i18n

- src/core/i18n/index.ts
- src/types/theme.ts
- src/features/life-wheel/types/index.ts
- src/features/dream-board/types.ts

## Hooks / Contexts / Utils

- src/shared/hooks/useGoals.ts
- src/shared/hooks/useTranslation.ts
- src/shared/hooks/useUserPreferences.ts
- src/shared/hooks/useAffirmations.ts
- src/shared/hooks/useHabits.ts
- src/shared/hooks/useTheme.ts
- src/shared/hooks/useAuth.ts
- src/shared/hooks/utils/useLoadingState.ts
- src/shared/hooks/utils/useImagePreloader.ts
- src/shared/contexts/AuthContext.tsx
- src/shared/contexts/ThemeContext.tsx
- src/utils/helpers/toast.ts

## Pages / Features

- src/features/life-wheel/LifeWheelPage.tsx
- src/features/life-wheel/EnhancedLifeWheelPage.tsx
- src/features/life-wheel/LifeWheel.tsx
- src/features/life-wheel/EnhancedLifeWheel.tsx
- src/features/dashboard/Dashboard.tsx
- src/features/auth/AuthDebugger.tsx
- src/features/auth/PublicRoute.tsx
- src/features/auth/ProtectedRoute.tsx
- src/features/auth/pages/Login.tsx
- src/features/auth/pages/SignUp.tsx
- src/features/auth/pages/ForgotPassword.tsx
- src/features/auth/pages/ResetPassword.tsx
- src/features/dream-board/DreamBoardPage.tsx
- src/features/dream-board/components/CosmicDreamExperience/CosmicDreamExperience.tsx
- src/features/dream-board/components/QuickVision/QuickVision.tsx
- src/features/dream-board/components/DreamBoardModal/DreamBoardModal.tsx
- src/features/dream-board/components/DreamChallenge/DreamChallenge.tsx
- src/features/dream-board/components/DreamChallenge/DreamChallengeContainer.tsx
- src/features/dream-board/components/DreamChallenge/README.md
- src/features/dream-board/components/DreamProgress/DreamProgress.tsx
- src/features/dream-board/components/DreamCategories/DreamCategories.tsx
- src/features/dream-board/components/MilestonesPopup/MilestonesPopup.tsx
- src/features/dream-board/components/Board/Board.tsx
- src/features/dream-board/components/Board/DreamBoardContainer/DreamBoardContainer.tsx
- src/features/dream-board/components/Board/Milestones/Milestones.tsx
- src/features/dream-board/hooks/useDreamProgress.ts
- src/features/dream-board/hooks/useDreamChallenges.ts
- src/features/dream-board/hooks/useDreamWeather.ts

## Shared Components

- src/shared/components/layout/WeBetterApp.tsx
- src/shared/components/layout/Hero/Hero.tsx
- src/shared/components/layout/Hero/HeroErrorFallback.tsx
- src/shared/components/layout/Hero/FloatingImage/FloatingImage.tsx
- src/shared/components/layout/Hero/DashboardPreview/DashboardPreview.tsx
- src/shared/components/layout/Features/Features.tsx
- src/shared/components/layout/Features/Featured/Featured.tsx
- src/shared/components/layout/Highlights/Highlights.tsx
- src/shared/components/layout/Showcase/Showcase.tsx
- src/shared/components/layout/Showcase/index.tsx
- src/shared/components/layout/Gallery/Gallery.tsx
- src/shared/components/layout/Gallery/GalleryErrorFallback.tsx
- src/shared/components/layout/Gallery/index.tsx
- src/shared/components/layout/Community/Community.tsx
- src/shared/components/layout/Community/index.tsx
- src/shared/components/layout/Partners/Partners.tsx
- src/shared/components/layout/Partners/index.tsx
- src/shared/components/layout/PreFooter/PreFooter.tsx
- src/shared/components/layout/Testimonies/Testimonies.tsx
- src/shared/components/layout/Testimonies/index.tsx
- src/shared/components/layout/Tools/Tools.tsx
- src/shared/components/layout/Tools/index.tsx
- src/shared/components/layout/Footer/Footer.tsx
- src/shared/components/layout/Header/HeaderActions.tsx
- src/shared/components/layout/DashboardGrid/DashboardGrid.tsx
- src/shared/components/widgets/HabitsWidget/HabitsWidget.tsx
- src/shared/components/widgets/CutoutWidget/CutoutWidget.tsx
- src/shared/components/widgets/RadialLifeChartWidget/RadialLifeChartWidget.tsx
- src/shared/components/widgets/AffirmationWidget/AffirmationWidget.tsx
- src/shared/components/widgets/LifeWheelWidget/LifeWheelWidget.tsx
- src/shared/components/widgets/CardsWidget/CardsWidget.tsx
- src/shared/components/widgets/QuoteWidget/QuoteWidget.tsx
- src/shared/components/widgets/GoalsWidget/GoalsWidget.tsx
- src/shared/components/common/Portal/Portal.tsx
- src/shared/components/user/ProfileSettings/ProfileSettings.tsx
- src/shared/components/theme/ThemeSelector/ThemeSelector.tsx
- src/shared/components/theme/ThemeSettings.tsx

## Tests

- src/shared/components/layout/PreFooter/**tests**/PreFooter.test.tsx
- src/shared/components/layout/Gallery/**tests**/Gallery.test.tsx
- src/shared/components/layout/Community/**tests**/Community.test.tsx
- src/shared/components/layout/Partners/**tests**/Partners.test.tsx
- src/shared/components/layout/Testimonies/**tests**/Testimonies.test.tsx
- src/shared/components/layout/Tools/**tests**/Tools.test.tsx
- src/shared/components/layout/Showcase/**tests**/Showcase.test.tsx
- src/shared/components/layout/Footer/**tests**/Footer.test.tsx
- src/shared/components/layout/Features/**tests**/Features.test.tsx
- src/shared/components/layout/Highlights/**tests**/Highlights.test.tsx
- src/shared/components/layout/Hero/**tests**/Hero.test.tsx

## By Type

### Text-Only Loading Messages

- src/features/auth/PublicRoute.tsx
- src/features/auth/ProtectedRoute.tsx
- src/features/auth/pages/Login.tsx
- src/features/auth/pages/SignUp.tsx
- src/features/auth/pages/ForgotPassword.tsx
- src/features/auth/pages/ResetPassword.tsx
- src/shared/components/layout/WeBetterApp.tsx
- src/shared/components/layout/PreFooter/PreFooter.tsx
- src/shared/components/layout/Partners/Partners.tsx
- src/shared/components/layout/Community/Community.tsx
- src/shared/components/layout/Gallery/Gallery.tsx
- src/shared/components/widgets/GoalsWidget/GoalsWidget.tsx
- src/shared/components/widgets/HabitsWidget/HabitsWidget.tsx
- src/shared/components/widgets/CardsWidget/CardsWidget.tsx
- src/shared/components/user/ProfileSettings/ProfileSettings.tsx

### Suspense Fallbacks (Text)

- src/shared/components/layout/Partners/index.tsx
- src/shared/components/layout/Community/index.tsx
- src/shared/components/layout/Testimonies/index.tsx
- src/shared/components/layout/Showcase/index.tsx
- src/shared/components/layout/Tools/index.tsx
- src/shared/components/layout/Gallery/index.tsx

### Skeleton Loaders

- src/shared/components/layout/Features/FeaturesSkeleton.tsx
- src/shared/components/layout/Hero/HeroSkeleton.tsx
- src/shared/components/layout/Highlights/HighlightsSkeleton.tsx
- src/shared/components/layout/Showcase/ShowcaseSkeleton.tsx
- src/shared/components/layout/Gallery/GallerySkeleton.tsx
- src/shared/components/layout/Community/CommunitySkeleton.tsx
- src/shared/components/layout/Partners/PartnersSkeleton.tsx
- src/shared/components/layout/Testimonies/TestimoniesSkeleton.tsx
- src/shared/components/layout/Tools/ToolsSkeleton.tsx
- src/shared/components/widgets/QuoteWidget/QuoteWidget.tsx

### Spinners / Loading Overlays

- src/features/life-wheel/EnhancedLifeWheelPage.tsx
- src/features/life-wheel/EnhancedLifeWheel.tsx
- src/features/life-wheel/LifeWheel.tsx
- src/features/dream-board/DreamBoardPage.tsx
- src/features/dream-board/components/CosmicDreamExperience/CosmicDreamExperience.tsx
- src/features/dream-board/components/Board/Board.tsx
- src/features/dream-board/components/Board/DreamBoardContainer/DreamBoardContainer.tsx
- src/shared/components/widgets/LifeWheelWidget/LifeWheelWidget.tsx

### Loading State Management (Hooks / Context)

- src/shared/hooks/utils/useLoadingState.ts
- src/shared/hooks/utils/useImagePreloader.ts
- src/shared/hooks/useTheme.ts
- src/shared/hooks/useAuth.ts
- src/shared/hooks/useUserPreferences.ts
- src/shared/hooks/useHabits.ts
- src/shared/hooks/useGoals.ts
- src/shared/hooks/useAffirmations.ts
- src/shared/hooks/useTranslation.ts
- src/shared/contexts/AuthContext.tsx
- src/shared/contexts/ThemeContext.tsx

### Translated Loading Copy

- src/core/i18n/index.ts

### Loading-Related Types

- src/types/theme.ts
- src/features/life-wheel/types/index.ts
- src/features/dream-board/types.ts

### Loading Styles (CSS)

- src/styles/globals.css
- src/features/life-wheel/LifeWheel.module.css
- src/features/dream-board/DreamBoardPage.module.css
- src/features/dream-board/components/CosmicDreamExperience/CosmicDreamExperience.module.css
- src/features/dream-board/components/Board/Board.module.css
- src/features/dream-board/components/Board/DreamBoardContainer/DreamBoardContainer.module.css
- src/features/dream-board/components/Board/Milestones/Milestones.module.css
- src/shared/components/layout/Header/HeaderActions.module.css
- src/shared/components/layout/PreFooter/PreFooter.module.css
- src/shared/components/layout/Gallery/Gallery.module.css
- src/shared/components/layout/Community/Community.module.css
- src/shared/components/layout/Partners/Partners.module.css
- src/shared/components/layout/Testimonies/Testimonies.module.css
- src/shared/components/i18n/LanguageSelector/LanguageSelector.module.css
- src/shared/components/widgets/AffirmationWidget/AffirmationWidget.module.css
- src/shared/components/widgets/HabitsWidget/HabitsWidget.module.css
- src/shared/components/widgets/LifeWheelWidget/LifeWheelWidget.module.css
- src/shared/components/theme/ThemeSelector/ThemeSelector.module.css
- src/shared/components/layout/Footer/Footer.module.css
- src/shared/components/widgets/GoalsWidget/GoalsWidget.module.css

### Tests Touching Loading

- src/shared/components/layout/PreFooter/**tests**/PreFooter.test.tsx
- src/shared/components/layout/Gallery/**tests**/Gallery.test.tsx
- src/shared/components/layout/Community/**tests**/Community.test.tsx
- src/shared/components/layout/Partners/**tests**/Partners.test.tsx
- src/shared/components/layout/Testimonies/**tests**/Testimonies.test.tsx
- src/shared/components/layout/Tools/**tests**/Tools.test.tsx
- src/shared/components/layout/Showcase/**tests**/Showcase.test.tsx
- src/shared/components/layout/Footer/**tests**/Footer.test.tsx
- src/shared/components/layout/Features/**tests**/Features.test.tsx
- src/shared/components/layout/Highlights/**tests**/Highlights.test.tsx
- src/shared/components/layout/Hero/**tests**/Hero.test.tsx

## Standardization Task List

- [ ] Define the official loading patterns (skeleton vs spinner/overlay vs text-only) and document when to use each.
- [ ] Create a shared `LoadingState` component with variants (`skeleton`, `spinner`, `text`, `overlay`) and configurable message/size.
- [ ] Consolidate loading copy into i18n (add generic keys and replace hardcoded strings).
- [ ] Normalize loading state naming across hooks/components (`isLoading`, `isFetching`, `isSaving`, `isSubmitting`).
- [ ] Update Suspense fallbacks to use `LoadingState` instead of inline text.
- [ ] Migrate layout sections (Hero, Features, Highlights, Showcase, Gallery, Community, Partners, Testimonies, Tools, PreFooter, Footer).
- [ ] Migrate widgets (Habits, Goals, Affirmation, Quote, LifeWheel, Cards) to shared loading patterns.
- [ ] Migrate auth flows (Login, SignUp, Reset/Forgot Password, Protected/Public routes).
- [ ] Add/adjust loading tests to reflect the standardized components.

## Recommended Usage by Area

### Skeleton (primary for content sections)

- Hero, Features, Highlights, Showcase, Gallery, Community, Partners, Testimonies, Tools, PreFooter, Footer
- QuoteWidget (feed-style content)
- DashboardGrid (featured content)

### Spinner + Text (inline, non-blocking)

- Auth forms (Login, SignUp, Forgot/Reset Password) button submit states
- ProfileSettings save/cancel actions
- GoalsWidget / HabitsWidget / AffirmationWidget local fetches
- LifeWheelWidget local load

### Overlay (blocking operations)

- DreamBoardPage save/sync operations
- CosmicDreamExperience long-running loads
- DreamBoard modal create/update workflows

### Text-Only (short-lived fallback)

- Suspense fallbacks in `src/shared/components/layout/*/index.tsx`
- ProtectedRoute/PublicRoute interim loading states
