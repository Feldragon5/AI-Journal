// Settings Page Controller

class Settings {
  constructor() {
    this.settings = {};
    this.entries = [];

    // AI Settings elements
    this.customInstructionsInput = document.getElementById('customInstructions');
    this.writingStyleSelect = document.getElementById('writingStyle');
    this.questionFrequencySelect = document.getElementById('questionFrequency');
    this.autoEnhanceCheckbox = document.getElementById('autoEnhance');
    this.saveAiSettingsBtn = document.getElementById('saveAiSettings');

    // Theme elements
    this.darkModeToggle = document.getElementById('darkModeToggle');
    this.themeOptions = document.querySelectorAll('.theme-option');

    // Stats elements
    this.totalEntriesEl = document.getElementById('totalEntries');
    this.totalWordsEl = document.getElementById('totalWords');
    this.currentStreakEl = document.getElementById('currentStreak');
    this.avgWordsPerEntryEl = document.getElementById('avgWordsPerEntry');

    // Export buttons
    this.exportJsonBtn = document.getElementById('exportJson');
    this.exportTextBtn = document.getElementById('exportText');

    this.init();
  }

  async init() {
    await this.loadSettings();
    await this.loadEntries();
    this.setupEventListeners();
    this.updateStats();
    this.updateThemeSelection();
    this.updateDarkModeToggle();
  }

  setupEventListeners() {
    // Done button (replace Save)
    this.saveAiSettingsBtn.addEventListener('click', () => this.doneSettings());

    // Autosave on change
    this.customInstructionsInput.addEventListener('input', () => this.autoSaveSettings());
    this.writingStyleSelect.addEventListener('change', () => this.autoSaveSettings());
    this.questionFrequencySelect.addEventListener('change', () => this.autoSaveSettings());
    this.autoEnhanceCheckbox.addEventListener('change', () => this.autoSaveSettings());

    // Dark mode toggle
    this.darkModeToggle.addEventListener('change', () => {
      themeManager.toggleMode();
    });

    // Theme selection
    this.themeOptions.forEach(option => {
      option.addEventListener('click', () => {
        const theme = option.dataset.theme;
        this.selectTheme(theme);
      });
    });

    // Export buttons
    this.exportJsonBtn.addEventListener('click', () => this.exportAsJson());
    this.exportTextBtn.addEventListener('click', () => this.exportAsText());
  }

  async loadSettings() {
    try {
      this.settings = await API.getSettings();

      // Populate form
      this.customInstructionsInput.value = this.settings.customInstructions || '';
      this.writingStyleSelect.value = this.settings.writingStyle || 'natural';
      this.questionFrequencySelect.value = this.settings.questionFrequency || 'always';
      this.autoEnhanceCheckbox.checked = this.settings.autoEnhance || false;
    } catch (error) {
      console.error('Error loading settings:', error);
      showToast('Failed to load settings', 'error');
    }
  }

  async autoSaveSettings() {
    try {
      const updatedSettings = {
        customInstructions: this.customInstructionsInput.value.trim(),
        writingStyle: this.writingStyleSelect.value,
        questionFrequency: this.questionFrequencySelect.value,
        autoEnhance: this.autoEnhanceCheckbox.checked
      };

      await API.updateSettings(updatedSettings);
      this.settings = updatedSettings;
    } catch (error) {
      console.error('Error autosaving settings:', error);
    }
  }

  async doneSettings() {
    await this.autoSaveSettings();
    window.location.href = '/';
  }

  updateDarkModeToggle() {
    const isDark = themeManager.getTheme().darkMode;
    this.darkModeToggle.checked = isDark;
  }

  updateThemeSelection() {
    const currentTheme = themeManager.getTheme().theme;

    this.themeOptions.forEach(option => {
      if (option.dataset.theme === currentTheme) {
        option.classList.add('active');
      } else {
        option.classList.remove('active');
      }
    });
  }

  selectTheme(themeName) {
    themeManager.setTheme(themeName);
    this.updateThemeSelection();

    // Dispatch event for other pages
    window.dispatchEvent(new CustomEvent('themeChanged', {
      detail: { theme: themeName }
    }));

    showToast(`Theme changed to ${this.formatThemeName(themeName)}`, 'success');
  }

  formatThemeName(themeName) {
    return themeName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  async loadEntries() {
    try {
      this.entries = await API.getAllEntries();
    } catch (error) {
      console.error('Error loading entries:', error);
    }
  }

  updateStats() {
    if (this.entries.length === 0) {
      return;
    }

    // Total entries
    this.totalEntriesEl.textContent = this.entries.length;

    // Total words
    const totalWords = this.entries.reduce((sum, entry) => {
      const words = entry.content.trim().split(/\s+/).length;
      return sum + words;
    }, 0);
    this.totalWordsEl.textContent = totalWords.toLocaleString();

    // Average words per entry
    const avgWords = Math.round(totalWords / this.entries.length);
    this.avgWordsPerEntryEl.textContent = avgWords;

    // Calculate streak
    const streak = this.calculateStreak();
    this.currentStreakEl.textContent = streak;
  }

  calculateStreak() {
    if (this.entries.length === 0) return 0;

    // Sort entries by date
    const sortedEntries = [...this.entries].sort((a, b) =>
      new Date(b.date) - new Date(a.date)
    );

    // Get unique dates
    const uniqueDates = [...new Set(sortedEntries.map(e => e.date))].sort().reverse();

    if (uniqueDates.length === 0) return 0;

    // Check if today or yesterday has an entry
    const today = new Date();
    const todayStr = this.formatDateKey(today);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = this.formatDateKey(yesterday);

    if (uniqueDates[0] !== todayStr && uniqueDates[0] !== yesterdayStr) {
      return 0; // Streak is broken
    }

    // Count consecutive days
    let streak = 1;
    let currentDate = new Date(uniqueDates[0]);

    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(currentDate);
      prevDate.setDate(prevDate.getDate() - 1);
      const prevDateStr = this.formatDateKey(prevDate);

      if (uniqueDates[i] === prevDateStr) {
        streak++;
        currentDate = new Date(uniqueDates[i]);
      } else {
        break;
      }
    }

    return streak;
  }

  formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async exportAsJson() {
    try {
      const data = {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        entries: this.entries,
        settings: this.settings
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aurora-journal-backup-${this.formatDateKey(new Date())}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('Exported successfully!', 'success');
    } catch (error) {
      console.error('Export error:', error);
      showToast('Export failed', 'error');
    }
  }

  async exportAsText() {
    try {
      let text = '='.repeat(60) + '\n';
      text += 'AURORA JOURNAL EXPORT\n';
      text += '='.repeat(60) + '\n\n';

      this.entries.forEach(entry => {
        // Use the journal date (entry.date)
        const date = new Date(entry.date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        // Include modified timestamp if available
        let timestamp = '';
        if (entry.updatedAt && entry.updatedAt !== entry.createdAt) {
          const modified = new Date(entry.updatedAt).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
          timestamp = ` (Modified: ${modified})`;
        }

        text += '-'.repeat(60) + '\n';
        text += `${entry.title || 'Untitled Entry'}\n`;
        text += `${date}${timestamp}\n`;
        text += '-'.repeat(60) + '\n\n';
        text += entry.content + '\n\n\n';
      });

      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aurora-journal-export-${this.formatDateKey(new Date())}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('Exported successfully!', 'success');
    } catch (error) {
      console.error('Export error:', error);
      showToast('Export failed', 'error');
    }
  }
}

// Initialize settings page
window.settingsApp = null;
document.addEventListener('DOMContentLoaded', () => {
  window.settingsApp = new Settings();
});
