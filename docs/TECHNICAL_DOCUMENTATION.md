# Sports IQ Challenge – Technical Documentation

## 1. High-Level Architecture
- **Runtime:** Client-side React SPA bootstrapped by Vite.
- **Entry Point:** `index.tsx` renders `<App />` into the `#root` element defined in `index.html`.
- **State Management:** Local component state via React hooks (`useState`, `useEffect`).
- **Persistence Layer:** Browser `localStorage` accessed through helper functions in `services/storageService.ts`.
- **Data Source:** Open Trivia Database REST API (sports category) consumed by `services/geminiService.ts`.
- **Styling:** Tailwind CSS CDN with class-based dark mode (`dark` class on `html`).
- **Audio:** Web Audio API abstractions in `services/soundService.ts`.

## 2. Application Flow
1. **App Initialization (`App.tsx`):**
   - Load persisted theme and sound preferences.
   - Render the start screen by default.
   - Apply the `dark` class to `document.documentElement` when required.
2. **Starting a Game:**
   - `startQuiz` triggers `fetchTriviaQuestions`, sets loading state, and preps question list.
   - On success, transition to the `active` game state; on failure, show error on start screen.
3. **Answering Questions:**
   - `QuestionCard` calls `onAnswer` with the selected option and elapsed time.
   - `handleAnswer` calculates score bonuses, updates streaks, plays feedback audio, and advances to next question.
4. **Game Completion:**
   - `endGame` aggregates final stats, persists them via `saveStats`, checks achievements, and switches to the score screen.
   - High score logic and achievement unlocking handled in `storageService.ts` and `App.tsx`.
5. **Other Screens:**
   - **ScoreScreen:** Displays final score, achievements, and replay option.
   - **HighScoresScreen / StatsScreen:** Read data from `localStorage` and render summaries.

## 3. Key Modules
### 3.1 Components
- `StartScreen`: Entry UI with difficulty selection and navigation to stats/high scores.
- `QuestionCard`: Handles timer display, answer buttons, and user interactions.
- `ScoreScreen`: Shows results, achievements, and restart call-to-action.
- `Loader`: Displayed during trivia fetch.
- `ThemeToggler`: Toggles between light/dark themes, coordinating with App state.
- `SoundToggler`: Mirrors mute state and calls `toggleMute`.
- `HighScoresScreen` & `StatsScreen`: Read-only views backed by `storageService`.

### 3.2 Services
- `services/geminiService.ts`:
  - Despite legacy naming, it targets Open Trivia DB (category 21).
  - Encodes difficulty, decodes Base64 payloads, shuffles answers.
  - Centralized error handling with user-friendly messages.
- `services/storageService.ts`:
  - CRUD helpers for scores, stats, theme, sound mute flag, and achievements.
  - Provides default fallbacks and catch-all error logging.
- `services/soundService.ts`:
  - Wraps Web Audio API, preloads base64-encoded WAV samples, and synthesizes click feedback.
  - Exposes `initAudioOnInteraction`, `playSound`, `toggleMute`, `isMuted`, and `setMuted`.

## 4. Data Persistence
- **High Scores:** Stored per difficulty under keys `sportsTriviaHighScores_<Difficulty>`.
- **Stats:** Aggregate counters (games played, total score, fastest answer, etc.) in `sportsTriviaStats`.
- **Theme & Sound:** Stored as `sportsTriviaTheme` and `sportsTriviaSoundMuted`.
- **Achievements:** Persisted array of unlocked IDs in `sportsTriviaAchievements`.

## 5. Theming and Styling
- Tailwind CDN is configured in `index.html` with `darkMode: 'class'`.
- UI components rely on Tailwind utility classes with `dark:` prefixes.
- `App.tsx` saves the theme preference and synchronizes it with `document.documentElement`.

## 6. Audio System
- Audio context is lazily created to comply with browser interaction policies.
- Sound assets (`correct`, `incorrect`) are embedded as base64 WAVs; `click` is generated procedurally.
- Mute state is persisted; unmuting triggers `initAudioOnInteraction` to ensure context readiness.
- Defensive coding guards against unsupported browsers and suspended contexts.

## 7. Build & Tooling
- **Vite Config (`vite.config.ts`):**
  - Enables React plugin and exposes `@` alias to repository root.
  - Defines `process.env` keys for compatibility with legacy usage.
- **Scripts (`package.json`):**
  - `npm run dev`: Vite dev server.
  - `npm run build`: Production build.
  - `npm run preview`: Preview of built assets.
- TypeScript strictness is controlled through `tsconfig.json`.

## 8. Environment & Deployment Notes
- Requires Node.js ≥ 18; Node 20 removes warnings from dependencies.
- The trivia API is public; no API keys are needed, but consider rate-limiting for production usage.
- Deployment targets (Netlify, Vercel, GitHub Pages, etc.) can serve the Vite-generated `dist` folder.

## 9. Testing & Quality
- No automated tests ship with the project; manual QA is recommended after feature changes.
- Suggested future additions:
  - Component/unit tests with Vitest or Jest.
  - Integration tests to verify game flow and persistence.

## 10. Extensibility Guidelines
- For additional question categories or APIs, update `fetchTriviaQuestions`.
- To add new achievements, modify the `ACHIEVEMENTS` array in `constants`.
- For more sound cues, extend `SampleSoundName` and embed new samples in `soundService`.
- Maintain consistent state updates in `App.tsx` to avoid race conditions with delayed timers.

This documentation should help new contributors understand the system and safely extend it.
