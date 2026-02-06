# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
# Development
npm start                    # Start dev server at localhost:3000
npm test                     # Run tests in watch mode
npm run test:coverage        # Generate coverage report
npm run test:ci             # Run tests once with coverage (for CI)
npm run build               # Production build to /build directory

# Single test file
npm test -- AnalysisScreen.test.tsx
npm test -- --testNamePattern="theme generation"
```

## Architecture Overview

### AI Integration Flow

This application uses **Azure AI Foundry (Midas API)** with three models in sequence:

1. **Claude Sonnet-4** (`claudeService.ts`) - Vision analysis of uploaded images
   - Analyzes image composition, lighting, and mood
   - Uses OpenAI Vision API format: `image_url` with base64 data URLs
   - Returns: description, lighting type, mood per image

2. **GPT-4o** (`gptService.ts`) - Theme generation
   - Takes Claude's image summaries as input
   - Generates 4 distinct editing themes in JSON format
   - Returns: theme objects with mood, lighting, background, editing_style

3. **Gemini 2.5 Pro** (`geminiService.ts`) - Streaming preview (optional)
   - Provides real-time streaming analysis feedback
   - Uses Server-Sent Events (SSE) for progressive text display

All services use the **same unified endpoint**: `https://midas.ai.bosch.com/ss1/api/v2/llm/completions`

### API Request Format

All three services use OpenAI-compatible format:
```typescript
{
  model: "Claude-Sonnet-4" | "GPT 4o" | "Gemini-2.5-pro",
  messages: [...],
  max_tokens: number,
  temperature: number,
  stream?: boolean  // Only for Gemini
}
```

**Vision support**: Use `image_url` field with base64 data URLs (format: `data:image/jpeg;base64,{base64Data}`)

### State Management Architecture

**Global State**: React Context pattern via `AppContext` and `StudioContext`
- `AppContext` - User-facing flow state (7 screens)
- `StudioContext` - Studio dashboard state (job management)

**Session Persistence**: `useLocalStorage` hook auto-saves `SessionData` to localStorage
- Key: `aiPhotoThemes_session`
- Enables page refresh without losing progress
- Cleared on `resetSession()`

**Access Pattern**:
```typescript
import { useSession } from '@/hooks/useSession';

const { sessionData, updateSession, navigateTo } = useSession();
```

### Screen Flow

User Journey (7 screens):
```
landing → upload → analysis → theme-preview → confirmation → processing → delivery
```

Studio Mode (separate):
```
landing (studio login) → studio-dashboard
```

Navigation is controlled via `AppContext.navigateTo(screen)` which updates `currentScreen` state.

### Service Layer

**Three-tier separation**:
1. **Azure Services** (`services/azure/`) - Direct API communication
2. **Business Services** (`services/`) - Orchestration layer
   - `themeService.ts` - Orchestrates Claude → GPT workflow
   - `imageService.ts` - Image processing (compression, validation, base64)
   - `orderService.ts` - Order state management
3. **Components** - UI layer, calls business services

**Mock Mode**: Set `REACT_APP_USE_MOCK_API=true` for development without Azure
- Mock data in `src/__mocks__/mockData.ts`
- All services check `USE_MOCK_API` flag and return mock responses

### TypeScript Path Aliases

Configured in `tsconfig.json`:
```typescript
import { Theme } from '@/types';              // src/types
import { analyzeImage } from '@/services/azure/claudeService';  // src/services/...
import { useSession } from '@/hooks/useSession';  // src/hooks/...
```

## Environment Configuration

Copy `.env.example` to `.env.local` and configure:

**Midas API (Bosch Internal)**:
```env
REACT_APP_AZURE_ENDPOINT=https://midas.ai.bosch.com
REACT_APP_AZURE_API_KEY=            # Optional - may not require auth
REACT_APP_CLAUDE_DEPLOYMENT=Claude-Sonnet-4
REACT_APP_GPT_DEPLOYMENT=GPT 4o
REACT_APP_GEMINI_DEPLOYMENT=Gemini-2.5-pro
```

**Feature Flags**:
```env
REACT_APP_USE_MOCK_API=false        # Enable mock mode for development
REACT_APP_ENABLE_STREAMING=true     # Enable Gemini streaming
```

**Monitoring**:
```env
REACT_APP_SENTRY_DSN=your-dsn       # Sentry error tracking
REACT_APP_SENTRY_ENV=development
```

## Key Implementation Patterns

### Error Handling

All API calls are wrapped with Sentry:
```typescript
import { captureError, addBreadcrumb } from '@/utils/sentry';

try {
  addBreadcrumb('Starting operation', 'category', { metadata });
  // ... operation
} catch (error) {
  captureError(error as Error, { context: 'value' });
  throw error;
}
```

### Image Processing

Images are compressed before upload (see `imageService.ts`):
- Max width: 1920px (maintains aspect ratio)
- Quality: 0.8 (JPEG compression)
- Max size: 10MB (validated before processing)
- Output: Pure base64 string (no data URL prefix for internal use)

### Analytics

Track user actions via `analytics.ts`:
```typescript
import { analytics } from '@/utils/analytics';

analytics.uploadCompleted(jobId, imageCount);
analytics.themeSelected(themeId);
analytics.analysisCompleted(jobId, duration);
```

## Testing Strategy

**Coverage Target**: 70% (enforced in `package.json`)

**Test Structure**:
- Unit tests: `src/**/__tests__/*.test.ts(x)`
- Test utilities: `src/utils/test-utils.tsx` (custom render with providers)

**Running specific tests**:
```bash
npm test -- ComponentName        # Run tests matching pattern
npm test -- --coverage           # Show coverage
npm test -- --verbose           # Detailed output
```

## Styling with Tailwind

**Custom Theme** (`tailwind.config.js`):
- Primary: Violet/purple palette (50-900)
- Dark mode base: Slate 950 with gradient backgrounds
- Custom animations: `pulse-slow` (3s pulse)
- Extended scales: `scale-101`, `scale-102` for subtle hover effects

**Common Pattern**:
```jsx
<div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl">
```

## Scripts Directory

Contains Python verification scripts:
- `test-vision-support.py` - Verify Midas API vision support
- `test-vision-detailed.py` - Detailed model testing
- Results stored in `scripts/*-results.json`

**These are reference only** - not part of the React build process.

## Production Metrics

From product requirements:
- **Time to preview**: ≤ 60 seconds (from upload to theme display)
- **Theme acceptance rate**: ≥ 60% (users select a theme)
- **Cost per image**: ≤ ₹6 (API cost target)
- **Error rate**: < 1% (tracked via Sentry)
- **Test coverage**: > 70% (enforced by Jest)

## Common Gotchas

1. **CRA Path Aliases**: `@/` imports require `baseUrl: "src"` in `tsconfig.json` AND `NODE_PATH=src` for Jest
2. **Midas API Response**: API wraps responses in `{ data: {...} }` - services handle unwrapping
3. **Vision Format**: Use `image_url.url` field with full data URL, NOT `source.data` format
4. **Model Names**: Exact strings required - `"Claude-Sonnet-4"`, `"GPT 4o"` (with space), `"Gemini-2.5-pro"` (with dash)
5. **Mock Mode**: Must reload app after changing `REACT_APP_USE_MOCK_API` (env vars are build-time)
6. **Session Persistence**: `sessionData` survives page refresh but NOT across browser tabs

## Adding New Features

1. **New Screen**:
   - Add screen type to `types/index.ts` Screen union
   - Create component in `src/components/`
   - Add route in `App.tsx` AppContent component

2. **New API Call**:
   - Add service in `services/azure/` for direct API
   - Add orchestration in `services/` for business logic
   - Add mock data to `__mocks__/mockData.ts`
   - Check `USE_MOCK_API` flag in service

3. **New Context/State**:
   - Extend `SessionData` type in `types/index.ts`
   - Update `initialSessionData` in `contexts/AppContext.tsx`
   - Access via `useSession()` hook

## PhotoBook Studio Component

**Location**: `src/components/photobook-studio/`

A fully-featured photobook editor component built with **react-konva** and **Zustand**, following enterprise-standard organization patterns.

### Architecture

**State Management**: Zustand store (`services/photobook-studio/studioStore.ts`)
- Single store with 40+ actions for complete CRUD operations
- History/undo-redo with 50-snapshot limit
- Photo and element management with percentage-based positioning

**Services Layer**: Business logic separated into services
- `studioStore.ts` - Zustand state management
- `photobookGenerator.ts` - Layout generation and page creation
- `exportService.ts` - Export utilities (JSON, images)

**Canvas Rendering**: react-konva with 3-layer architecture
1. **Background Layer** - Page background (no interactions)
2. **Content Layer** - Photos, text, shapes, stickers with transformers
3. **UI Layer** - Selection box, overlays

**Key Components**:
- `PhotobookStudioScreen.tsx` - Root component with mode switching
- `SelectionMode.tsx` - Photo upload and management
- `EditMode.tsx` - Main editing interface
- `PageCanvas.tsx` - Konva Stage with element rendering
- `EditMode/canvas/` - Element renderers (Photo, Text, Shape, Sticker)
- `EditMode/toolbars/` - Element-specific toolbars (v2.0)

### Important Patterns

**Element Rendering**:
- All elements use percentage-based positioning (0-100% of page dimensions)
- Convert to pixels in renderer: `x = (element.x / 100) * pageDimensions.width`
- Convert back on update: `x = (pixelX / pageDimensions.width) * 100`

**Text Editing Fix** (CRITICAL):
- TextEditor uses React portal with DOM textarea
- MUST render OUTSIDE Konva Stage (as sibling, not child)
- Konva reconciliation error if portal is child of Konva components
- Pattern: PageCanvas manages `editingTextId` state, renders TextEditor after `</Stage>`

**Drag and Drop**:
- Photos drag from SourcePhotosPanel to PageCanvas
- Drag handlers on outer `<div>`, NOT on Konva Stage
- Convert drop coordinates: `stageX = (clientX - rect.left) / scale`

**Multi-select**:
- Cmd/Ctrl+Click adds to selection
- Single click replaces selection
- ElementTransformer handles multiple selected elements

### Usage

```typescript
import { PhotobookStudioScreen } from '@/components/photobook-studio';
import type { StudioPhotoBook } from '@/types';

<PhotobookStudioScreen
  initialPhotos={[]}
  onSave={(photoBook: StudioPhotoBook) => console.log('Saved:', photoBook)}
  onCancel={() => console.log('Cancelled')}
  maxPhotos={100}
  features={{
    enableShapes: true,
    enableStickers: true,
    enableTextFormatting: true,
    enableCustomLayouts: true,
  }}
/>
```

### Type System

All types are in `src/types/index.ts` with `Studio` prefix:
- `StudioPhoto` - Individual photo with quality tracking
- `StudioPhotoBook` - Complete photobook structure
- `StudioPage` - Individual page with elements
- `StudioPageElement` - Union type for photo/text/shape/sticker elements
- `StudioPhotoBookConfig` - Configuration options

### Keyboard Shortcuts

- `Cmd/Ctrl + Z` - Undo
- `Cmd/Ctrl + Shift + Z` - Redo
- `Delete` / `Backspace` - Delete selected elements
- `Arrow Keys` - Nudge selected (1% per press, 10% with Shift)
- `Double Click Text` - Edit text content
- `Cmd/Ctrl + Click` - Multi-select

### TypeScript Configuration

The photobook editor requires relaxed TypeScript settings due to Konva type complexity:
- `"strict": false` in `tsconfig.json`
- `// @ts-nocheck` in some canvas files
- React Hooks MUST be called before any conditional returns

### Common Issues

1. **"parentInstance.add is not a function"** - React portal rendered as child of Konva component. Fix: Move portal outside Stage.
2. **Hooks rules violation** - usePhotoBookStore called after early return. Fix: Move all hooks to top of component.
3. **Type errors** - Always use Studio-prefixed types (StudioPhoto, StudioPhotoBook, etc.) from `@/types`.

### Store API

Access via `usePhotoBookStore()` hook:

```typescript
import { usePhotoBookStore } from '@/hooks/usePhotoBookStore';

const {
  // Photo Management
  photos, addPhotos, deletePhoto,

  // Page Management
  pages, addPage, removePage,
  selectedPageId, selectPage,
  updatePageLayout, updatePageBackground,

  // Element Management
  addElement, updateElement, deleteElements,
  duplicateElement, reorderElement,
  selectedElementIds, selectElements, clearSelection,

  // Clipboard
  clipboard, copyElement, pasteElement,

  // History
  undo, redo, canUndo, canRedo, saveSnapshot
} = usePhotoBookStore();
```

### Documentation

Comprehensive docs in `docs/photobook-studio/`:
- `README.md` - Architecture overview and features
- `FINAL_SUMMARY.md` - Executive summary and achievements
- `QUICKSTART.md` - Step-by-step testing guide
- `PHASE4_COMPLETE.md` - Canvas implementation details
- `PHASE5_COMPLETE.md` - Advanced features (v2.0)
- `V2_IMPLEMENTATION.md` - v2.0 feature documentation
- `V2_INTEGRATION_STATUS.md` - Current integration status

### Enterprise Organization

The component follows enterprise-standard patterns:
- **Components**: `src/components/photobook-studio/` - All React components
- **Services**: `src/services/photobook-studio/` - Business logic and state
- **Utilities**: `src/utils/photobook-studio/` - Helper functions
- **Hooks**: `src/hooks/` - Shared hooks (usePhotoBookStore, useDragAndDrop)
- **Types**: `src/types/` - All TypeScript types with Studio prefix
- **Docs**: `docs/photobook-studio/` - Comprehensive documentation
