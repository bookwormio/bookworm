# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Bookworm is a social reading app (a "Goodreads-meets-Instagram") built with Expo / React Native + TypeScript. Users track books across shelves, post about reading, follow friends, lend/borrow books, earn badges, and receive book recommendations. It was originally a University of Utah capstone project.

## Commands

Run from the repo root unless noted.

- `npm install` — install app dependencies (also run `npm install` inside `functions/`)
- `npx expo start` — start the Metro dev server; press `i` for the default iOS simulator, `Shift+i` to pick a device
- `npm run ios` / `npm run android` / `npm run web` — start Expo targeting a specific platform
- `npx eslint .` — lint (ESLint + Prettier). There is no configured `lint` npm script.
- `npx tsc --noEmit` — typecheck the app (strict mode is on)

There is **no test suite** configured in this project.

### Firebase Cloud Functions (`functions/`)

- `npm run build` — compile TypeScript (`tsc`) to `functions/lib/`
- `npm run serve` — build + run the local Functions emulator
- `npm run deploy` — `firebase deploy --only functions`
- `npm run logs` — tail deployed function logs

## Architecture

### Routing (Expo Router, file-based)

Routes live under [app/](app/) and map to the filesystem. `app/_layout.tsx` is the root: it wires up `GestureHandlerRootView` → `QueryClientProvider` (React Query) → `AuthenticationProvider` → `ErrorBoundary` → `<Slot />` + a global `Toast`, and installs a global JS error handler.

Route groups (parenthesized folders don't appear in the URL):
- `(auth)/` — SignIn, CreateAccount, MoreInfo (onboarding)
- `(tabs)/` — the authenticated app, with a bottom tab per feature: `(posts)`, `(search)`, `(create)`, `(profile)`

Each tab group is a nested stack. A key convention: **the same destination screen is duplicated per tab** so navigation stays within the active tab's stack — e.g. viewing a book exists as `(posts)/postsbook/[bookID]`, `(search)/searchbook/[bookID]`, and `(profile)/profilebook/[bookID]`. When adding a screen reachable from multiple tabs, expect to add it under each relevant group. Dynamic segments use `[param]` filenames.

### Auth & navigation guarding

[components/auth/context.tsx](components/auth/context.tsx) owns auth. `useAuth()` exposes `signIn`/`createAccount`/`signOut`/`user`/`isLoading`. It subscribes to `FIREBASE_AUTH.onAuthStateChanged` and the internal `useAuthenticatedRoute` hook redirects: signed-out users to `/SignIn`, signed-in users out of the auth group to `/posts`.

### Data layer: `services/`

All backend access is centralized in `services/`, grouped by backend — **components never call Firebase/APIs directly**, they go through these functions (usually wrapped in React Query hooks):

- `firebase-services/` — Firestore + Storage: `UserQueries`, `PostQueries`, `FriendQueries`, `NotificationQueries`, `BookBorrowQueries`, `ChallengesBadgesQueries`, `DataQueries`
- `books-services/BookQueries.tsx` — Google Books API (via `axios`) for book search/metadata
- `recommendation-services/RecommendationQueries.ts` — an **external recommendation API** (`fetch`, base URL from `EXPO_PUBLIC_RECOMMENDATION_API_URL`). This API must be running locally/remotely for recommendation features to work.
- `util/` — pure helpers for shaping query data (e.g. `makePostModelFromDoc`, `caseFoldNormalize` for search normalization)

Data fetching uses **TanStack React Query** (`useQuery`/`useMutation`). Screen-local hooks live in per-tab `hooks/` folders (e.g. `app/(tabs)/(profile)/hooks/useProfileQueries.tsx`); cross-cutting query hooks may live alongside components.

### Firebase

Client SDK is initialized in [firebase.config.js](firebase.config.js), exporting `FIREBASE_AUTH`, `DB` (Firestore), `STORAGE`. Auth uses AsyncStorage persistence. Config comes entirely from `EXPO_PUBLIC_FIREBASE_*` env vars.

Firestore collections (top-level): `user_collection`, `posts`, `relationships` (follow graph), `notifications`, `bookshelf_collection`, `borrowing_collection`, `badge_collection`, `bookmark_collection`.

Cloud Functions ([functions/src/index.ts](functions/src/index.ts)) are Firebase Auth triggers: `createUserDoc` (`onCreate` → seeds `user_collection` doc) and `deleteUserDoc` (`onDelete` → removes it). Project is `bookworm-338ce` (see `.firebaserc`).

### Domain model & shared types

- [enums/Enums.ts](enums/Enums.ts) — canonical domain enums. Book shelves are important: `ServerBookShelfName` (`currently_reading`, `want_to_read`, `finished`, `lending_library`) are the values persisted in Firestore; `borrowing` and `similar_books` are client-only shelves. Display strings live in `BOOKSHELF_DISPLAY_NAMES`. Also defines follow status and notification types. **When shelf/status semantics matter, reference these enums rather than raw strings.**
- [types/index.d.ts](types/index.d.ts) — shared TypeScript models (`PostModel`, `UserModel`, `BookVolumeItem`, etc.)
- [constants/constants.ts](constants/constants.ts) — shared constants incl. brand color `BOOKWORM_ORANGE`

### Components

[components/](components/) is organized by feature (`post/`, `book/`, `booklist/`, `profile/`, `badges/`, `comment/`, `notifications/`, `recommendation/`, `searchbar/`, etc.). React Context providers for cross-screen state live near their feature (e.g. `components/post/PostsContext`, `app/(tabs)/(create)/NewPostContext.tsx`).

## Conventions

- **TypeScript is strict; `@typescript-eslint/no-explicit-any` is an error** — do not introduce `any`. `eqeqeq` is enforced (use `===`), and `no-console` is a warning.
- Prettier runs through ESLint (`prettier/prettier: error`) — formatting violations fail lint.
- Env vars exposed to the client must be prefixed `EXPO_PUBLIC_` (Expo requirement). Secrets/keys are read from `process.env`, never hardcoded.
- New screens follow the per-tab-duplication routing convention described above.
