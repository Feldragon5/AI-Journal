# AI Journal Web App - Project Plan

## Project Overview
A locally-runnable AI-powered journal application with a cosmic/galaxy theme. The app uses Google Gemini 2.5 Flash API to enhance journal entries and generate contextual questions. Built with HTML, CSS, and Node.js, designed to run locally first, with future deployment to Google Firebase (free tier) and eventual migration to AWS for multi-user support.

## Core Technology Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js with Express.js
- **AI Integration**: Google Gemini 2.5 Flash API
- **Storage (Phase 1)**: Local JSON file storage or LocalStorage
- **Storage (Phase 2)**: Firebase Firestore (free tier)
- **Storage (Phase 3)**: AWS (RDS/DynamoDB) with authentication
- **API Key**: AIzaSyBwu0M7Ap7SGR__l7ZWGaNrFlDEQPCdtrE

## Application Architecture

### Frontend Structure
```
/public
  /css
    - styles.css (main stylesheet with cosmic theme)
    - themes.css (light/dark mode + color themes)
  /js
    - app.js (main application logic)
    - editor.js (journal entry editor with AI integration)
    - calendar.js (calendar view for browsing entries)
    - theme-manager.js (theme switching logic)
    - api-client.js (handles API calls to backend)
  /assets
    - /images (cosmic backgrounds, icons)
  - index.html (main application page)
  - calendar.html (calendar view page)
  - settings.html (settings page for AI instructions, themes)
```

### Backend Structure
```
/server
  - server.js (Express server entry point)
  - /routes
    - entries.js (CRUD operations for journal entries)
    - ai.js (AI processing endpoints)
  - /services
    - gemini-service.js (Gemini API integration)
    - storage-service.js (abstraction layer for storage)
  - /data
    - entries.json (local storage file for Phase 1)
  - /middleware
    - error-handler.js
    - validation.js
```

## Core Features Implementation

### 1. Journal Entry Editor (Primary Interface)
**Description**: The main writing interface where users compose journal entries.

**Key Components**:
- Large textarea/contenteditable div for writing
- Real-time character/word count
- Auto-save functionality (saves draft every 30 seconds)
- Optional title field (if empty, displays date when saved)
- Automatic date/time capture on entry creation

**AI Integration**:
- **Coherence Enhancement**: After user finishes writing, they can trigger AI rewriting to make the entry more coherent while preserving their voice and meaning
- **Dynamic Question Generation**: When user pauses typing (2-3 seconds of inactivity), AI generates contextual questions like:
  - "How did that make you feel?"
  - "What details about [mentioned event] stand out to you?"
  - "What were you thinking in that moment?"
- Questions appear in a subtle sidebar or floating panel
- Clicking a question inserts it into the entry or opens a prompt for the user to respond
- Questions are non-intrusive and can be dismissed

**Technical Implementation**:
- Typing detection with debounce/throttle to trigger question generation
- API call to Gemini with context: "Based on this journal entry excerpt: [text], generate 2-3 thoughtful questions to help the writer reflect deeper or add more detail. Return as JSON array."
- Separate API call for coherence rewriting: "Rewrite this journal entry to be more coherent while maintaining the author's voice, tone, and all key details: [text]"

### 2. Date and Time Management
**Data Structure**:
```javascript
{
  id: "unique-id",
  title: "Optional Title",
  content: "Journal entry content...",
  rawContent: "Original content before AI enhancement",
  createdAt: "2025-10-10T14:30:00.000Z",
  updatedAt: "2025-10-10T14:35:00.000Z",
  date: "2025-10-10", // For calendar lookups
  displayTitle: "Title or formatted date"
}
```

**Display Logic**:
- If title exists: Show title as heading
- If no title: Show formatted date (e.g., "Thursday, October 10, 2025")
- Entry list shows most recent entries first
- Calendar view shows entries by date

### 3. Calendar View
**Description**: Visual calendar interface to browse and access journal entries by date.

**Features**:
- Monthly calendar grid view
- Days with entries are highlighted/marked (e.g., with a cosmic star icon)
- Click on a date to view/edit that day's entry
- If no entry exists, clicking opens a new entry for that date
- Navigation between months/years
- Quick jump to "today"

**Technical Implementation**:
- Use vanilla JS or lightweight library for calendar rendering
- Query entries by date range to highlight days
- Responsive design for mobile/tablet/desktop

### 4. Custom AI Instructions (Settings)
**Description**: User-configurable settings for AI behavior.

**Settings Include**:
- **Writing Style**: Formal, casual, poetic, straightforward, etc.
- **Tone Preferences**: Encouraging, neutral, reflective, analytical
- **Custom Instructions**: Freeform text field where user can specify:
  - "Always maintain a poetic style"
  - "Focus on emotional depth"
  - "Keep entries concise"
  - "Emphasize gratitude themes"
- **Question Frequency**: How often AI generates questions (always, sometimes, never)
- **Auto-enhance**: Toggle for automatic coherence enhancement on save

**Technical Implementation**:
- Store settings in local storage or user preferences file
- Prepend custom instructions to all AI API calls
- Example prompt structure: "[User's custom instructions]. Now, [specific task like rewrite or generate questions]. Entry: [text]"

### 5. Theme System
**Light/Dark Mode**:
- Toggle switch in UI (moon/sun icon)
- Persists selection in localStorage
- Smooth transitions between modes

**Color Themes** (Cosmic variants):
- **Nebula Purple** (default): Deep purples, magentas, cosmic blues
- **Starlight Blue**: Blues, teals, silver highlights
- **Galaxy Gold**: Deep space blacks with gold/amber accents
- **Aurora Green**: Dark backgrounds with green/teal northern lights effect
- **Cosmic Rose**: Deep space with rose/pink nebula colors

**Design Elements**:
- Subtle animated star field background (CSS or canvas)
- Gradient overlays mimicking nebulae
- Glowing buttons and borders
- Smooth animations and transitions
- Glassmorphism effects for panels and cards

### 6. Additional Features for Well-Designed App

**Search Functionality**:
- Full-text search across all entries
- Filter by date range
- Tag system (future enhancement)

**Export/Backup**:
- Export all entries as JSON
- Export individual entries as text/markdown/PDF
- Import from backup JSON file

**Statistics Dashboard**:
- Total entries written
- Current streak (days in a row with entries)
- Total words written
- Most productive day/time
- Word cloud of frequently used words

**Keyboard Shortcuts**:
- `Ctrl/Cmd + S`: Save entry
- `Ctrl/Cmd + N`: New entry
- `Ctrl/Cmd + K`: Toggle AI questions
- `Ctrl/Cmd + E`: Enhance with AI
- `Ctrl/Cmd + /`: Open search

**Privacy Features**:
- Optional entry encryption (future)
- No data sent to AI unless explicitly triggered
- Clear indication when AI is processing

## Implementation Phases

### Phase 1: Local Development (Current)
**Goal**: Fully functional app running locally

**Tasks**:
1. Set up Node.js/Express server
2. Implement Gemini API integration service
3. Build journal editor with AI question generation
4. Implement AI coherence enhancement
5. Create local JSON file storage system
6. Build calendar view
7. Implement settings page for custom AI instructions
8. Design and implement cosmic theme system with light/dark modes
9. Add search and export features
10. Implement statistics dashboard
11. Test all features locally

**Storage**: Local JSON files in `/server/data/` directory

### Phase 2: Firebase Deployment (Free Tier)
**Goal**: Deploy to web with Firebase (single user)

**Tasks**:
1. Migrate storage from local files to Firestore
2. Move API key to environment variables/Firebase Functions
3. Implement Firebase Hosting for frontend
4. Set up Firebase Functions for backend API
5. Test deployment and ensure free tier limits are respected

**Note**: Still single-user at this phase. No authentication yet.

### Phase 3: AWS Migration with Multi-User Support (Future)
**Goal**: Full multi-user platform with authentication

**Tasks**:
1. Implement authentication (AWS Cognito or Auth0)
2. Migrate backend to AWS Lambda or EC2
3. Set up database (RDS PostgreSQL or DynamoDB)
4. Implement user-specific data isolation
5. Add email reminder system (AWS SES)
6. Implement sharing/export features
7. Add social features (optional)

## API Integration Details

### Gemini API Endpoints Used
- Model: `gemini-2.5-flash` (fast, cost-effective)
- Base URL: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`

### API Call Structure

**Question Generation**:
```javascript
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=API_KEY
Body: {
  "contents": [{
    "parts": [{
      "text": "[Custom instructions if any]. Based on this journal entry excerpt, generate 2-3 thoughtful, empathetic questions to help the writer reflect deeper or add more detail. Focus on emotions, details, and thoughts. Return only a JSON array of questions. Entry excerpt: [last 200-300 characters of entry]"
    }]
  }],
  "generationConfig": {
    "temperature": 0.7,
    "maxOutputTokens": 200
  }
}
```

**Coherence Enhancement**:
```javascript
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=API_KEY
Body: {
  "contents": [{
    "parts": [{
      "text": "[Custom instructions]. Rewrite this journal entry to be more coherent, well-structured, and polished while maintaining the author's authentic voice, tone, emotional content, and all important details. Do not change the meaning or add information that wasn't there. Entry: [full entry text]"
    }]
  }],
  "generationConfig": {
    "temperature": 0.5,
    "maxOutputTokens": 2048
  }
}
```

## Security Considerations

### Phase 1 (Local):
- API key stored in environment variable (`.env` file)
- `.env` added to `.gitignore`
- Server-side API calls only (never expose key to frontend)

### Phase 2 (Firebase):
- API key in Firebase Functions environment config
- Firestore security rules (even for single user, basic security)

### Phase 3 (AWS Multi-User):
- API keys in AWS Secrets Manager or Parameter Store
- Proper authentication and authorization
- User data isolation in database
- Rate limiting on API endpoints
- Input sanitization and validation

## Design Principles

1. **User Privacy First**: AI processing is opt-in and clearly indicated
2. **Non-Intrusive AI**: Questions appear gently, can be dismissed
3. **Preserve Authenticity**: AI enhances but never changes meaning
4. **Fast and Responsive**: Local-first approach, optimistic UI updates
5. **Beautiful and Calming**: Cosmic theme creates peaceful journaling environment
6. **Accessible**: Keyboard shortcuts, proper contrast ratios, screen reader support
7. **Offline Capable**: Core writing functionality works without internet (Phase 1)

## Key Technical Decisions

1. **Why Vanilla JS?**: Simpler deployment, no build process, faster initial load
2. **Why Express?**: Lightweight, flexible, easy to migrate to serverless later
3. **Why Gemini 2.5 Flash?**: Fast response times (critical for real-time questions), cost-effective, high quality
4. **Why Local-First?**: User owns their data, works offline, no infrastructure needed initially
5. **Why Phased Approach?**: Validate concept locally before investing in cloud infrastructure

## Future Enhancement Ideas (Post-AWS Migration)

- Voice-to-text journaling
- Mood tracking with visualizations
- AI-generated weekly/monthly summaries
- Photo attachments for entries
- Collaborative journaling (shared entries with friends/therapists)
- Mobile app (React Native or Progressive Web App)
- Integration with wearables for mood/activity data
- Prompt library for creative writing
- Markdown support with preview
- AI-powered insights: "You seem stressed lately, here are patterns I noticed..."

## Development Notes

- Start with basic features, iterate based on usage
- Test AI prompts extensively to get the right tone
- Optimize API calls to minimize costs
- Keep UI simple and focused on writing experience
- Regularly back up local data during Phase 1
- Consider rate limiting AI features to control costs
- Monitor token usage for Gemini API calls

## Git Strategy

- Initialize repository before starting development
- Commit frequently with descriptive messages
- Branches for major features:
  - `main` - stable code
  - `feature/editor` - journal editor work
  - `feature/ai-integration` - AI features
  - `feature/calendar` - calendar view
  - `feature/themes` - theme system
  - `firebase-migration` - Firebase deployment work
  - `aws-migration` - AWS migration work

## Success Metrics (Personal Use)

- Daily journaling becomes a habit (track streak)
- AI questions feel helpful, not annoying
- Entry coherence improvement feels authentic
- App loads fast and feels responsive
- Theme creates calming, inspiring environment
- Easy to find and review past entries
- Zero data loss (reliable auto-save and backup)

---

**Project Start Date**: October 10, 2025
**Target Completion Date (Phase 1)**: 2-3 weeks
**Developer**: matthewd045yl
**AI Assistant**: Claude (Sonnet 4.5)
