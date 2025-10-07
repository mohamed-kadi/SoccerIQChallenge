# Sports IQ Challenge

Sports IQ Challenge is a fast-paced trivia game that lets sports fans test their knowledge across multiple difficulty levels. Players race against the clock, chase high scores, and unlock achievements while the app tracks performance stats locally.

## Features
- Multiple difficulty levels sourced from the Open Trivia Database (sports category).
- Timed questions with streak tracking, high-score table, and achievement system.
- Responsive UI with light/dark themes and user-selectable sound effects.
- Local persistence for scores, stats, theme, and mute preference using `localStorage`.
- Offline-friendly build powered by Vite and React 19.

## Tech Stack
- **Framework:** React 19, Vite 6
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS CDN (class-based dark mode enabled)
- **API:** [Open Trivia Database](https://opentdb.com/) (category 21 – Sports)
- **State & Storage:** React hooks and browser `localStorage`

## Getting Started

### Prerequisites
- Node.js 18+ (Node 20+ recommended to avoid engine warnings)
- npm 9+

### Installation
```bash
npm install
```

### Run in Development
```bash
npm run dev
```
The dev server URL will be printed in the terminal (usually `http://localhost:5173`). Open it in your browser and start answering questions.

### Build for Production
```bash
npm run build
```
The optimized bundle is emitted to `dist/`.

### Preview Production Build
```bash
npm run preview
```

## Project Structure
```
sports-iq-challenge/
├── App.tsx
├── components/
├── constants/
├── services/
├── types/
├── index.html
├── index.tsx
└── vite.config.ts
```

Learn more about the architecture and module responsibilities in [`docs/TECHNICAL_DOCUMENTATION.md`](docs/TECHNICAL_DOCUMENTATION.md).

## Configuration
- The app fetches live questions directly from Open Trivia Database; no API key is required.
- User preferences (theme, mute setting) and stats are persisted in browser storage.
- Tailwind is configured via CDN in `index.html` with `darkMode: 'class'`, so toggling the `dark` class on `html` controls the theme.

## Contributing
1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes and ensure `npm run build` succeeds.
3. Commit using conventional messages where possible.
4. Open a pull request against `main`.

## License
This project is proprietary. Contact the repository owner for licensing inquiries.
