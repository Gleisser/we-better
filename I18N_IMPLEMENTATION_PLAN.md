# Multi-Language Support Implementation Plan

**Languages:** English (en) & Brazilian Portuguese (pt-BR)

## 📋 Project Overview

This document tracks the implementation of internationalization (i18n) support for the We Better frontend application. The goal is to support English and Brazilian Portuguese languages with a scalable foundation for future language additions.

---

## 🚀 Phase 1: Setup and Foundation

### 1.1 Choose i18n Library ✅

**Decision:** Using `react-i18next` - the most popular and robust solution for React applications.

**Dependencies to add:**

```json
{
  "react-i18next": "^13.5.0",
  "i18next": "^23.7.0",
  "i18next-browser-languagedetector": "^7.2.0",
  "i18next-http-backend": "^2.4.0"
}
```

### 1.2 Project Structure

- [x] Create locales directory structure
- [x] Set up translation file organization
- [x] Create i18n core configuration files

**Target Structure:**

```
frontend/we-better/src/
├── locales/
│   ├── en/
│   │   ├── common.json
│   │   ├── auth.json
│   │   ├── dashboard.json
│   │   ├── dreamBoard.json
│   │   ├── lifeWheel.json
│   │   ├── affirmations.json
│   │   └── errors.json
│   └── pt-BR/
│       ├── common.json
│       ├── auth.json
│       ├── dashboard.json
│       ├── dreamBoard.json
│       ├── lifeWheel.json
│       ├── affirmations.json
│       └── errors.json
├── core/
│   └── i18n/
│       ├── index.ts
│       ├── resources.ts
│       └── config.ts
```

---

## ⚙️ Phase 2: Core i18n Configuration

### 2.1 i18n Configuration Files

- [x] Create `src/core/i18n/index.ts` - Main i18n setup
- [ ] Create `src/core/i18n/resources.ts` - Resource loading
- [ ] Create `src/core/i18n/config.ts` - Configuration options
- [x] Integrate i18n into main.tsx

**Configuration Features:**

- [x] Fallback language (English)
- [x] Browser language detection
- [x] Local storage persistence
- [x] Development debugging
- [x] JSON file loading

---

## 📝 Phase 3: Text Content Analysis

### 3.1 Identified Translation Areas

- [x] **Authentication Pages** - Login, SignUp, Password Reset, Email Verification
- [x] **Dashboard & Navigation** - Welcome messages, Menu items, Widget titles
- [x] **Dream Board** - Content controls, Forms, Milestone management
- [x] **Life Wheel** - Categories, Instructions, Tour guide, Progress
- [x] **Affirmations Widget** - Categories, Buttons, Modals, Confirmations
- [x] **Error Messages** - Validation errors, API errors, General errors
- [x] **Common UI Elements** - Buttons, Labels, Placeholders, Loading states

### 3.2 Text Extraction Progress

- [ ] Extract all hardcoded strings from authentication components
- [ ] Extract all hardcoded strings from dashboard components
- [ ] Extract all hardcoded strings from feature components
- [ ] Extract all hardcoded strings from shared components
- [ ] Categorize strings by namespace/feature

---

## 🌐 Phase 4: Translation Files Structure

### 4.1 English Translation Files (en/)

- [x] `common.json` - Greetings, actions, navigation, general UI
- [x] `auth.json` - Login, signup, password reset, email verification
- [ ] `dashboard.json` - Dashboard-specific content
- [ ] `dreamBoard.json` - Dream board features and content
- [ ] `lifeWheel.json` - Life wheel assessment and categories
- [ ] `affirmations.json` - Affirmation categories and content
- [x] `errors.json` - Error messages and validations

### 4.2 Portuguese Translation Files (pt-BR/)

- [x] `common.json` - Brazilian Portuguese translations
- [x] `auth.json` - Authentication translations
- [ ] `dashboard.json` - Dashboard translations
- [ ] `dreamBoard.json` - Dream board translations
- [ ] `lifeWheel.json` - Life wheel translations
- [ ] `affirmations.json` - Affirmation translations
- [x] `errors.json` - Error message translations

### 4.3 Sample Translation Structure

```json
// locales/en/common.json
{
  "greetings": {
    "goodMorning": "Good Morning",
    "goodAfternoon": "Good Afternoon",
    "goodEvening": "Good Evening",
    "howAreYou": "how are you?"
  },
  "actions": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "create": "Create",
    "loading": "Loading...",
    "tryAgain": "Try Again"
  },
  "navigation": {
    "dashboard": "Dashboard",
    "dreamBoard": "Dream Board",
    "lifeWheel": "Life Wheel",
    "affirmations": "Affirmations"
  }
}
```

---

## 🔧 Phase 5: Implementation Strategy

### 5.1 Custom Hooks

- [x] Create `useTranslation` hook wrapper
- [x] Add language switching functionality
- [x] Implement current language detection

### 5.2 Core Components

- [x] Create `LanguageSwitcher` component
- [x] Add language selector to header/settings
- [x] Implement language persistence

### 5.3 Migration Utilities

- [ ] Create translation helper functions
- [ ] Set up component migration patterns
- [ ] Document translation best practices

---

## 🔄 Phase 6: Component Migration Strategy

### 6.1 Authentication Components

- [ ] Migrate `Login.tsx`
  - [ ] Form labels and placeholders
  - [ ] Button text and loading states
  - [ ] Error messages
  - [ ] Quote section content
- [ ] Migrate `SignUp.tsx`
  - [ ] Form fields and validation
  - [ ] Success/error messages
  - [ ] Email confirmation flow
- [ ] Migrate `ForgotPassword.tsx`
- [ ] Migrate `ResetPassword.tsx`

### 6.2 Layout Components

- [x] Migrate `WeBetterApp.tsx`
  - [x] Dynamic greeting system
  - [x] Time-based messages
  - [x] Fallback messages
- [ ] Migrate `Sidebar.tsx`
- [x] Migrate `HeaderActions.tsx`
  - [x] Theme toggle aria-label
  - [x] Notifications aria-label
  - [x] ProfileMenu component
  - [x] NotificationsPopup component
- [ ] Migrate navigation components

### 6.3 Feature Components

- [ ] Migrate Dream Board components
  - [ ] Content controls
  - [ ] Milestone popups
  - [ ] Upload/edit interfaces
- [ ] Migrate Life Wheel components
  - [ ] Category labels
  - [ ] Assessment instructions
  - [ ] Progress indicators
- [ ] Migrate Affirmation Widget
  - [ ] Category configuration
  - [ ] Modal content
  - [ ] Button states

### 6.4 Form Components

- [ ] Update form validation messages
- [ ] Translate placeholder text
- [ ] Localize error handling
- [ ] Update success notifications

---

## 📅 Phase 7: Implementation Timeline

### Week 1: Foundation Setup

**Goal:** Complete i18n infrastructure setup

- [ ] Install and configure i18n dependencies
- [ ] Set up directory structure
- [ ] Create initial translation files
- [ ] Implement language switcher component
- [ ] Test basic language switching

### Week 2: Core Components Migration

**Goal:** Migrate essential user-facing components

- [ ] Complete authentication pages migration
- [ ] Update main layout components
- [ ] Implement dynamic greeting system
- [ ] Add basic error message translations
- [ ] Test auth flow in both languages

### Week 3: Feature Components Migration

**Goal:** Migrate main application features

- [ ] Complete Dream Board component migration
- [ ] Update Life Wheel assessment translations
- [ ] Migrate Affirmations widget content
- [ ] Handle form validation translations
- [ ] Test feature functionality in both languages

### Week 4: Polish & Quality Assurance

**Goal:** Complete translation coverage and testing

- [ ] Finalize all Portuguese translations
- [ ] Comprehensive language switching testing
- [ ] Handle edge cases and special characters
- [ ] Performance optimization
- [ ] Documentation and deployment preparation

---

## 🇧🇷 Phase 8: Portuguese Translations

### 8.1 Translation Guidelines

- [ ] Maintain consistent tone and style
- [ ] Use formal vs informal address appropriately
- [ ] Handle gender-specific translations
- [ ] Consider regional Brazilian preferences
- [ ] Validate translations with native speakers

### 8.2 Key Translation Categories

- [ ] **Greetings & Time-based Messages**
  - Good Morning → Bom Dia
  - Good Afternoon → Boa Tarde
  - Good Evening → Boa Noite
- [ ] **Action Words**
  - Save → Salvar
  - Cancel → Cancelar
  - Delete → Excluir
- [ ] **Form Labels**
  - Email → E-mail
  - Password → Senha
  - Full Name → Nome Completo
- [ ] **Navigation**
  - Dashboard → Painel
  - Dream Board → Quadro dos Sonhos
  - Life Wheel → Roda da Vida

### 8.3 Cultural Adaptations

- [ ] Adapt motivational messages for Brazilian culture
- [ ] Consider Brazilian date/time formats
- [ ] Adjust color and design references if needed
- [ ] Review aspirational content for cultural relevance

---

## 🌍 Phase 9: Localization Considerations

### 9.1 Date & Time Localization

- [ ] Implement Brazilian date format (DD/MM/YYYY)
- [ ] Handle time format preferences
- [ ] Use `date-fns` with Portuguese locale
- [ ] Test date displays across components

### 9.2 Number & Currency Formatting

- [ ] Handle decimal separators (, vs .)
- [ ] Implement currency formatting (BRL vs USD)
- [ ] Localize percentage displays
- [ ] Test numeric inputs and displays

### 9.3 Advanced Features

- [ ] Implement pluralization rules for Portuguese
- [ ] Handle gender-specific content
- [ ] Support right-to-left text if needed
- [ ] Consider accessibility in multiple languages

### 9.4 SEO & Meta Data

- [ ] Add language meta tags to HTML
- [ ] Update page titles for each language
- [ ] Consider URL localization strategy
- [ ] Handle language-specific meta descriptions

---

## 🧪 Phase 10: Testing Strategy

### 10.1 Manual Testing Checklist

- [ ] Test all components in English
- [ ] Test all components in Portuguese
- [ ] Verify language switching functionality
- [ ] Check text overflow and layout issues
- [ ] Validate special characters and accents
- [ ] Test on different screen sizes
- [ ] Verify accessibility in both languages

### 10.2 Automated Testing

- [ ] Unit tests for translation functions
- [ ] Integration tests for language switching
- [ ] Component tests with mock translations
- [ ] E2E tests covering user flows in both languages
- [ ] Visual regression tests for layout consistency

### 10.3 Performance Testing

- [ ] Measure translation loading times
- [ ] Test language switching performance
- [ ] Optimize bundle size with translation files
- [ ] Test offline translation functionality

---

## 📚 Resources & References

### Development Resources

- [React i18next Documentation](https://react.i18next.com/)
- [i18next Documentation](https://www.i18next.com/)
- [Brazilian Portuguese Style Guide](https://www.gov.br/governodigital/pt-br/acessibilidade-digital/manual-de-redacao-web)

### Translation Tools

- [ ] Set up translation management workflow
- [ ] Consider tools like Crowdin or Lokalise for future scaling
- [ ] Establish review process for translations
- [ ] Create glossary for consistent terminology

---

## ✅ Progress Tracking

### Completion Status

- [x] **Phase 1**: Setup and Foundation (100%)
- [x] **Phase 2**: Core i18n Configuration (75%)
- [x] **Phase 3**: Text Content Analysis (100%)
- [x] **Phase 4**: Translation Files Structure (60%)
- [x] **Phase 5**: Implementation Strategy (80%)
- [ ] **Phase 6**: Component Migration (0%)
- [ ] **Phase 7**: Timeline Execution (0%)
- [x] **Phase 8**: Portuguese Translations (60%)
- [ ] **Phase 9**: Localization Features (0%)
- [ ] **Phase 10**: Testing & QA (0%)

### Key Milestones

- [x] 🏗️ Infrastructure Setup Complete
- [ ] 🔧 Core Components Migrated
- [ ] 🌟 Feature Components Migrated
- [ ] 🇧🇷 Portuguese Translations Complete
- [ ] ✅ Testing & QA Complete
- [ ] 🚀 Production Deployment Ready

---

## 📝 Notes & Decisions

### Technical Decisions Log

- **Library Choice**: react-i18next selected for robust React integration
- **File Structure**: Namespace-based organization for better maintainability
- **Language Detection**: Browser + localStorage for best UX
- **Fallback Strategy**: English as universal fallback

### Outstanding Questions

- [ ] Should we implement URL-based language routing?
- [ ] Do we need server-side rendering considerations?
- [ ] Should we support language-specific themes/styling?
- [ ] How to handle user preference persistence across devices?

---

_Last Updated: [Date]_
_Status: Planning Phase_
_Next Review: [Date]_
