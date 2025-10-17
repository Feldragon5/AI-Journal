# ⭐ Aurora Journal - AI-Powered Journaling App

A beautiful, AI-enhanced journaling application with stunning aurora borealis-inspired themes. Write your thoughts, reflect with AI-powered questions, and watch your entries come to life against animated aurora backgrounds.

## 🎨 What Makes Aurora Journal Special

- **Stunning Aurora Backgrounds**: Pure CSS animated gradients that flow like the northern lights
- **AI-Powered Reflection**: Smart questions that help you dig deeper into your thoughts
- **Single-Page Experience**: Seamless navigation between calendar and editor views
- **Multiple Aurora Themes**: 6 beautiful color palettes, each with light and dark modes
- **Privacy-First**: All data stored locally on your computer
- **No Ads, No Tracking**: Just you and your thoughts

## 🚀 Quick Start

### Prerequisites

You'll need these installed on your computer:
- **Node.js** (version 14 or newer) - [Download here](https://nodejs.org/)
- **Git** (for cloning the repository) - [Download here](https://git-scm.com/)

### Installation Steps

**1. Clone the repository**

Open PowerShell or Command Prompt and run:

```powershell
git clone <repository-url>
cd "AI Journal Webapp"
```

Or if you already have the files, just navigate to the folder:

```powershell
cd "path\to\AI Journal Webapp"
```

**2. Install dependencies**

```powershell
npm install
```

This will download all the required packages (only needs to be done once).

**3. Set up your AI API key** (Optional but recommended)

The app uses Google Gemini AI for enhancement features. To enable AI:

1. Get a free API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a file named `.env` in the project root
3. Add this line to the file:
   ```
   GEMINI_API_KEY=your-api-key-here
   ```

> **Note**: The app works without an API key, but AI features (enhancement and questions) won't be available.

**4. Start the application**

```powershell
npm start
```

You should see:
```
⭐ AI Journal Server running on http://localhost:3000
📝 Ready to capture your thoughts...
```

**5. Open in your browser**

Navigate to: **http://localhost:3000**

That's it! You're ready to start journaling! 🎉

### Stopping the Server

Press `Ctrl + C` in the PowerShell/Command Prompt window where the server is running.

## 📖 How to Use Aurora Journal

### Your First Entry

1. **The app opens to the Calendar view** - your home base
2. **Click any day** to create or view an entry for that date
3. **Write your thoughts** in the editor
4. **Click "Enhance"** to improve your entry with AI (optional)
5. **Answer reflection questions** that appear in the sidebar
6. **Click "Save"** to save and return to the calendar

### Key Features Explained

#### 📅 Calendar View (Home)
- Visual overview of all your journal entries
- Days with entries are highlighted
- Click any day to open the editor
- One entry per day (entries on the same day are merged)

#### ✍️ Editor View
- Clean, distraction-free writing space
- Optional title field (uses date if left empty)
- Word count display
- Auto-save every 30 seconds (for existing entries)
- Modified timestamp shows when entry was last updated

#### ✨ AI Enhancement
When you click "Enhance":
1. AI rewrites your entry for better flow while keeping your voice
2. A sidebar appears with reflection questions
3. Answer questions one at a time by typing and pressing Enter
4. AI integrates your answers seamlessly into your entry
5. Questions slide away as you answer them

#### 🎨 Aurora Themes

**6 Beautiful Color Palettes:**
1. **Aurora Purple** (Default) - Purple, magenta, and pink waves
2. **Aurora Green** - Northern lights green and teal
3. **Aurora Blue** - Ice blue and cyan
4. **Aurora Rose** - Rose pink and coral
5. **Aurora Gold** - Warm gold and amber
6. **Aurora Teal** - Tropical teal and aqua

**Each theme has:**
- Dark mode (default) - Deep space backgrounds with glowing auroras
- Light mode - Soft, subtle aurora hints on bright backgrounds

**To change themes:**
1. Click "Settings" in the navigation
2. Select your theme under "Appearance"
3. Toggle light/dark mode with the moon/sun icon

#### 🔍 Search
- Click the search icon (🔍) or press `Ctrl + /`
- Search across all your entries
- Results show matching entries with previews

#### ⚙️ Settings

**Customize your experience:**
- **AI Instructions**: Tell the AI how to help you (e.g., "Be encouraging" or "Focus on gratitude")
- **Themes**: Switch between 6 aurora color palettes
- **Light/Dark Mode**: Toggle between modes
- **Export**: Download your journal as JSON or text
- **Statistics**: View total entries, words written, and streaks

### Keyboard Shortcuts

- `Ctrl + S` or `Cmd + S` - Save entry
- `Ctrl + E` or `Cmd + E` - Enhance with AI
- `Ctrl + /` or `Cmd + /` - Open search
- Click the logo (⭐ Aurora Journal) - Return to calendar

## 🌟 Features Overview

### Writing & Editing
✅ Clean, distraction-free editor
✅ Optional entry titles
✅ Real-time word count
✅ Auto-save every 30 seconds
✅ One entry per day (auto-merges)
✅ Modified timestamps

### AI Features
✅ **Coherence Enhancement** - Polish your writing while keeping your voice
✅ **Reflection Questions** - AI-generated prompts to help you explore deeper
✅ **Interactive Q&A** - Answer questions and AI weaves them into your entry
✅ **Custom Instructions** - Personalize how AI assists you

### Visual Design
✅ **Aurora Backgrounds** - Flowing, animated gradients (pure CSS)
✅ **6 Aurora Themes** - Each with light and dark modes
✅ **Glassmorphism** - Frosted glass effects on panels
✅ **Glow Effects** - Aurora-colored shadows and highlights
✅ **Smooth Animations** - Elegant transitions throughout

### Organization
✅ **Calendar View** - Browse entries by date
✅ **Search** - Full-text search across all entries
✅ **Statistics** - Track writing habits and streaks
✅ **Export** - JSON and text formats

### Privacy & Control
✅ **Local Storage** - All data stays on your computer
✅ **No Tracking** - Zero analytics or data collection
✅ **Opt-in AI** - AI only processes when you request it
✅ **Offline Capable** - Write without internet (AI requires connection)

## 📁 Where Your Data Lives

All your journal entries are stored locally on your computer:

```
AI Journal Webapp/
└── server/
    └── data/
        ├── entries.json    # Your journal entries
        └── settings.json   # Your app settings
```

**Backup Recommendations:**
- Export your journal regularly (Settings → Export as JSON)
- Keep the entire `AI Journal Webapp` folder backed up
- Use cloud storage to sync the folder across devices

## 🎯 Tips for a Great Journaling Experience

1. **Make it a habit** - Try journaling at the same time each day
2. **Start small** - Even 2-3 sentences is valuable
3. **Use the AI questions** - They help you discover insights you might miss
4. **Experiment with themes** - Find the aurora that inspires you
5. **Don't overthink it** - Write freely, the AI can help polish later
6. **Click the logo to go home** - Quick return to calendar view
7. **Export monthly** - Keep backups of your thoughts

## 🛠️ Project Structure

```
AI Journal Webapp/
├── server/
│   ├── routes/
│   │   ├── entries.js          # Entry CRUD API
│   │   └── ai.js               # AI processing API
│   ├── services/
│   │   ├── gemini-service.js   # Google Gemini AI integration
│   │   └── storage-service.js  # Local JSON storage
│   ├── data/                   # Your data (auto-created)
│   └── server.js               # Express server
├── public/
│   ├── css/
│   │   ├── styles.css          # Main styles + aurora animations
│   │   └── themes.css          # 6 aurora theme color palettes
│   ├── js/
│   │   ├── main.js             # Single-page app controller
│   │   ├── api-client.js       # API wrapper
│   │   ├── settings.js         # Settings page logic
│   │   └── theme-manager.js    # Theme switching
│   ├── home.html               # Main app (calendar + editor)
│   └── settings.html           # Settings page
├── .env                        # API key (you create this)
├── .gitignore                  # Git ignore rules
├── package.json                # Dependencies
├── CLAUDE.md                   # Development notes
└── README.md                   # This file
```

## 🐛 Troubleshooting

### "Port 3000 is already in use"

**Solution 1: Kill the process**
```powershell
# Find what's using port 3000
netstat -ano | findstr ":3000"

# Kill it (replace PID with the number you found)
taskkill /PID <PID> /F
```

**Solution 2: Use a different port**
Edit `server/server.js` and change `PORT = 3000` to another number like `3001`.

### "AI features aren't working"

**Check these:**
1. Do you have a `.env` file with your API key?
2. Is your internet connection working?
3. Is the API key valid? Test it at [Google AI Studio](https://makersuite.google.com/)

### "Entries aren't saving"

**Check:**
1. Is the `server/data/` folder created? (It should create automatically)
2. Run the server with admin privileges if on Windows
3. Check console for error messages (press F12 in browser)

### "Aurora background isn't showing"

**Try:**
1. Hard refresh your browser: `Ctrl + Shift + R` or `Ctrl + F5`
2. Clear browser cache
3. Check if CSS files are loading (F12 → Network tab)

### "Server won't start - Module not found"

**Solution:**
```powershell
# Delete node_modules and reinstall
rm -r node_modules
npm install
```

## 🔮 Future Plans

### Coming Soon
- Additional aurora themes (coral, violet, ocean)
- Theme preview before selecting
- Entry templates and prompts
- Mood tracking
- Voice-to-text journaling

### Phase 2: Cloud Deployment
- Firebase hosting (free tier)
- Sync across devices
- Still single-user

### Phase 3: Social Features
- User authentication
- Optional entry sharing
- Multi-user support

## 🙏 Credits

- **Built with**: Node.js, Express, Vanilla JavaScript
- **AI powered by**: Google Gemini 2.0 Flash
- **Inspired by**: The beauty of the Aurora Borealis
- **Developed by**: Matthew (with assistance from Claude AI)

## 📄 License

Free for personal use. Modify and customize as you wish!

---

**✨ May your journaling journey be as beautiful as the northern lights!** ⭐

**Questions or Issues?** Check the troubleshooting section above or review the code comments.

**Happy Journaling!** 📝💜
