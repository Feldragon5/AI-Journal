// Theme Manager - Handles theme switching and persistence

class ThemeManager {
  constructor() {
    this.currentTheme = localStorage.getItem('theme') || 'aurora-purple';
    this.isDarkMode = localStorage.getItem('darkMode') !== 'false'; // default to dark
    this.init();
  }

  init() {
    this.applyTheme();
    this.setupEventListeners();
  }

  applyTheme() {
    const body = document.body;

    // Remove all theme classes
    body.classList.remove(
      'theme-aurora-purple',
      'theme-aurora-green',
      'theme-aurora-blue',
      'theme-aurora-rose',
      'theme-aurora-gold',
      'theme-aurora-teal',
      'dark-mode',
      'light-mode'
    );

    // Apply current theme and mode
    body.classList.add(`theme-${this.currentTheme}`);
    body.classList.add(this.isDarkMode ? 'dark-mode' : 'light-mode');

    // Update toggle button icon
    const toggleBtn = document.getElementById('themeToggle');
    if (toggleBtn) {
      const icon = toggleBtn.querySelector('.icon');
      if (icon) {
        icon.textContent = this.isDarkMode ? '🌙' : '☀️';
      }
    }
  }

  setupEventListeners() {
    const toggleBtn = document.getElementById('themeToggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggleMode());
    }

    // Listen for theme changes from settings page
    window.addEventListener('themeChanged', (e) => {
      if (e.detail.theme) {
        this.currentTheme = e.detail.theme;
        this.applyTheme();
      }
    });
  }

  toggleMode() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', this.isDarkMode);
    this.applyTheme();
  }

  setTheme(themeName) {
    this.currentTheme = themeName;
    localStorage.setItem('theme', themeName);
    this.applyTheme();
  }

  getTheme() {
    return {
      theme: this.currentTheme,
      darkMode: this.isDarkMode
    };
  }
}

// Initialize theme manager
const themeManager = new ThemeManager();
