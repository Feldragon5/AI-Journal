# ✨ Cosmic Journal - AI-Powered Journaling App

A beautiful, AI-enhanced journaling application with a cosmic theme. Write your thoughts and let AI help you reflect deeper with contextual questions and coherence enhancement.

## 🌟 Features

### Core Features
- **Smart Journal Editor**: Write freely with a clean, distraction-free interface
- **AI Question Generation**: As you write, AI suggests thoughtful questions to help you reflect deeper
- **AI Coherence Enhancement**: Polish your entries while maintaining your authentic voice
- **Calendar View**: Browse your entries by date with a visual calendar
- **Custom AI Instructions**: Personalize how the AI assists you
- **Search**: Full-text search across all your entries
- **Statistics**: Track your journaling habits with stats and streaks
- **Export & Backup**: Export your journal as JSON or text files

### Design Features
- **5 Cosmic Themes**:
  - Nebula Purple (default)
  - Starlight Blue
  - Galaxy Gold
  - Aurora Green
  - Cosmic Rose
- **Light/Dark Mode**: Toggle between light and dark modes
- **Animated Starfield**: Beautiful cosmic background with twinkling stars
- **Responsive Design**: Works on desktop, tablet, and mobile

### Technical Features
- **Auto-save**: Entries automatically save every 30 seconds
- **Keyboard Shortcuts**:
  - `Ctrl/Cmd + S`: Save entry
  - `Ctrl/Cmd + E`: Enhance with AI
  - `Ctrl/Cmd + N`: New entry
  - `Ctrl/Cmd + /`: Open search
- **Local Storage**: All data stored locally in JSON files
- **Privacy-First**: AI only processes when you explicitly request it

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. **Navigate to the project directory**:
   ```bash
   cd "AI Journal Webapp"
   ```

2. **Install dependencies** (already done):
   ```bash
   npm install
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

4. **Open your browser**:
   Navigate to `http://localhost:3000`

That's it! The app is now running locally on your machine.

## 📖 How to Use

### Writing Your First Entry

1. **Start Writing**: Click in the text area and start writing your thoughts
2. **Add a Title** (optional): Give your entry a title, or leave it blank to use the date
3. **Watch for AI Questions**: After you stop typing for a few seconds, AI will suggest reflection questions
4. **Click Questions**: Click on any question to add it to your entry
5. **Save Your Entry**: Click "Save Entry" or press `Ctrl/Cmd + S`

### Using AI Enhancement

1. Write your entry
2. Click "Enhance with AI" button
3. AI will rewrite your entry to be more coherent while keeping your voice and meaning
4. Review and save

### Browsing Entries

- **Sidebar**: Recent entries appear in the left sidebar. Click any entry to load it.
- **Calendar**: Navigate to the Calendar page to browse entries by date
- **Search**: Click the search icon or press `Ctrl/Cmd + /` to search all entries

### Customizing AI Behavior

1. Go to Settings page
2. Add custom instructions for the AI (e.g., "Always maintain a poetic style")
3. Choose your preferred writing style
4. Adjust question frequency
5. Toggle auto-enhance on save
6. Save settings

### Changing Themes

1. Go to Settings page
2. Click on any of the 5 cosmic themes
3. Use the moon/sun icon in the nav bar to toggle dark/light mode

### Exporting Your Journal

1. Go to Settings page
2. Click "Export as JSON" for a backup file
3. Or click "Export as Text" for a readable text file

## 🛠️ Project Structure

```
AI Journal Webapp/
├── server/
│   ├── routes/
│   │   ├── entries.js       # Entry CRUD endpoints
│   │   └── ai.js            # AI processing endpoints
│   ├── services/
│   │   ├── gemini-service.js    # Gemini AI integration
│   │   └── storage-service.js   # Local JSON storage
│   ├── data/
│   │   ├── entries.json     # Your journal entries (auto-created)
│   │   └── settings.json    # App settings (auto-created)
│   └── server.js            # Express server
├── public/
│   ├── css/
│   │   ├── styles.css       # Main styles
│   │   └── themes.css       # Theme definitions
│   ├── js/
│   │   ├── api-client.js    # API wrapper
│   │   ├── app.js           # Main app controller
│   │   ├── editor.js        # Editor with AI integration
│   │   ├── calendar.js      # Calendar view
│   │   ├── settings.js      # Settings page
│   │   └── theme-manager.js # Theme switching
│   ├── index.html           # Main journal page
│   ├── calendar.html        # Calendar view
│   └── settings.html        # Settings page
├── .env                     # Environment variables (API key)
├── package.json
├── CLAUDE.md                # Project plan and documentation
└── README.md                # This file
```

## 🔐 Privacy & Security

- **Your API Key**: Stored in `.env` file (never committed to git)
- **Your Data**: Stored locally in `server/data/` directory
- **AI Processing**: Only happens when you explicitly request it
- **No Tracking**: No analytics or tracking of any kind

## 🔮 Future Enhancements (Phase 2 & 3)

### Phase 2: Firebase Deployment
- Deploy to Firebase hosting (free tier)
- Migrate storage to Firestore
- Still single-user but accessible from anywhere

### Phase 3: AWS with Multi-User Support
- User authentication
- Multi-user support
- Email reminders
- Social features
- Mobile app

## 📝 Tips for Best Experience

1. **Write regularly**: Build a daily journaling habit
2. **Use AI questions**: They help you dig deeper into your thoughts
3. **Experiment with themes**: Find the one that feels most calming to you
4. **Export regularly**: Back up your journal periodically
5. **Customize AI**: Add personal instructions to make AI more helpful for your style
6. **Try keyboard shortcuts**: They speed up your workflow

## 🐛 Troubleshooting

### Server won't start
- Make sure port 3000 is not in use
- Check that all dependencies are installed: `npm install`

### AI features not working
- Verify your Gemini API key in `.env` file
- Check your internet connection (AI requires internet)

### Entries not saving
- Check that `server/data/` directory exists
- Verify file permissions

## 📄 License

This project is for personal use. Feel free to modify and customize for your own needs.

## 🙏 Acknowledgments

- Built with Node.js and Express
- AI powered by Google Gemini 2.0 Flash
- Cosmic theme inspired by the beauty of space

---

**Enjoy your journaling journey through the cosmos!** ✨🌌
