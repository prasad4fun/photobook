# AI Photo Themes - Professional Photo Editing Platform

A world-class React + TypeScript application that uses Azure AI Foundry to analyze photos and suggest intelligent editing themes.

## 🎯 Features

- **AI-Powered Analysis**: Claude Sonnet-4 analyzes image composition, lighting, and mood
- **Smart Theme Generation**: GPT-4o generates 4 custom editing themes based on your photos
- **Real-time Streaming**: Gemini 2.5 Pro provides live analysis feedback
- **Professional UI**: Beautiful dark-themed interface with animations and transitions
- **Studio Dashboard**: Separate interface for studio professionals to manage orders
- **Error Monitoring**: Sentry integration for production error tracking
- **Analytics**: Track user journeys and key metrics
- **Persistent Sessions**: Resume your work after page refresh

## 🏗️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS with custom theme
- **Icons**: Lucide React
- **AI**: Azure AI Foundry (Claude, GPT-4o, Gemini)
- **Error Monitoring**: Sentry
- **Testing**: Jest + React Testing Library
- **Build Tool**: Create React App

## 📁 Project Structure

```
AI Photo Themes/
├── public/                  # Static assets
├── src/
│   ├── components/          # React components (7 screens + dashboard)
│   ├── contexts/            # React Context providers
│   ├── hooks/               # Custom React hooks
│   ├── services/            # API and business logic
│   │   ├── azure/          # Azure AI integrations
│   │   ├── imageService.ts
│   │   ├── themeService.ts
│   │   └── orderService.ts
│   ├── types/               # TypeScript definitions
│   ├── utils/               # Utilities (constants, analytics, sentry)
│   ├── App.tsx             # Main app component
│   └── index.tsx           # Entry point
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── .env.local              # Environment variables (not in repo)
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Azure AI Foundry account with deployments for:
  - Claude Sonnet-4
  - GPT-4o
  - Gemini 2.5 Pro

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**

   Copy `.env.example` to `.env.local` and fill in your Azure credentials:
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local`:
   ```env
   REACT_APP_AZURE_ENDPOINT=https://your-endpoint.azure.com
   REACT_APP_AZURE_API_KEY=your-api-key
   REACT_APP_CLAUDE_DEPLOYMENT=claude-sonnet-4
   REACT_APP_GPT_DEPLOYMENT=gpt-4o
   REACT_APP_GEMINI_DEPLOYMENT=gemini-2.5-pro
   ```

3. **Development with Mock Data (No Azure required):**

   To develop without Azure AI, set:
   ```env
   REACT_APP_USE_MOCK_API=true
   ```

   This uses realistic mock responses for all AI operations.

### Development

```bash
# Start development server
npm start

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build for production
npm run build
```

The app will open at [http://localhost:3000](http://localhost:3000)

## 📋 Next Steps

### Phase 1: Component Migration (REQUIRED)

The existing components in `/components` need to be moved to `/src/components` and converted to TypeScript:

**Components to convert:**
- `AnalysisScreen.jsx` → `src/components/AnalysisScreen.tsx`
- `ConfirmationScreen.jsx` → `src/components/ConfirmationScreen.tsx`
- `DeliveryScreen.jsx` → `src/components/DeliveryScreen.tsx`
- `LandingScreen.jsx` → `src/components/LandingScreen.tsx`
- `ProcessingScreen.jsx` → `src/components/ProcessingScreen.tsx`
- `ThemePreviewScreen.tsx` → `src/components/ThemePreviewScreen.tsx`
- `UploadScreen.jsx` → `src/components/UploadScreen.tsx`

**Also convert:**
- `App.jsx` → `src/App.tsx` (use AppProvider and TypeScript types)

### Phase 2: Create StudioDashboard Component

Create `src/components/StudioDashboard.tsx` with:
- Job list table with filters
- Job detail view
- Theme override capability
- Approval/rejection workflow
- Export functionality

### Phase 3: Add Tests

Create test files for components and services:
- `src/components/__tests__/`
- `src/services/__tests__/`
- `src/hooks/__tests__/`

### Phase 4: Setup Sentry

1. Create a Sentry account at [sentry.io](https://sentry.io)
2. Add your DSN to `.env.local`:
   ```env
   REACT_APP_SENTRY_DSN=your-sentry-dsn
   ```

## 🎨 Development Tips

### Using Mock Data

Set `REACT_APP_USE_MOCK_API=true` in `.env.local` to develop without Azure AI:
- Faster development
- No API costs
- Predictable responses
- No network dependency

### Component Props

All components now use TypeScript interfaces. Check `/src/types/index.ts` for:
- `ImageUpload`
- `ImageSummary`
- `Theme`
- `OrderDetails`
- `SessionData`

### State Management

Use the `useSession()` hook to access global state:
```typescript
import { useSession } from '@/hooks/useSession';

function MyComponent() {
  const { sessionData, updateSession, navigateTo } = useSession();
  // ...
}
```

### Path Aliases

The project uses TypeScript path aliases:
```typescript
import { Theme } from '@/types';
import { generateThemes } from '@/services/themeService';
import { useSession } from '@/hooks/useSession';
```

## 🔧 Configuration Files

### TypeScript (`tsconfig.json`)
- Strict mode enabled
- Path aliases configured (@/, @/components, etc.)
- ES2020 target with modern features

### Tailwind (`tailwind.config.js`)
- Custom violet/fuchsia/slate color palette
- Extended animations and scales
- Purge configured for optimal bundle size

### Environment Variables
- `REACT_APP_*` prefix required (CRA convention)
- Never commit `.env.local` (contains secrets)
- `.env.example` is the template

## 📊 Success Metrics

From product spec:
- **Time to preview**: ≤ 60 seconds
- **Theme acceptance rate**: ≥ 60%
- **Cost per image**: ≤ ₹6
- **Error rate**: < 1%
- **Test coverage**: > 70%

## 🐛 Troubleshooting

### TypeScript Errors

If you see "No inputs were found" error:
```bash
# Make sure src/ folder exists and contains .ts/.tsx files
# Then restart your editor
```

### Missing Dependencies

```bash
npm install
```

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill
```

### Build Errors

```bash
# Clear cache and rebuild
rm -rf node_modules build
npm install
npm run build
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Add tests
4. Ensure `npm test` passes
5. Create a pull request

## 📄 License

Proprietary - All rights reserved

## 🔗 Resources

- [Azure AI Foundry Documentation](https://learn.microsoft.com/en-us/azure/ai-services/)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Sentry Documentation](https://docs.sentry.io/platforms/javascript/guides/react/)

---

Built with ❤️ using Azure AI Foundry
