const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const ENTRIES_FILE = path.join(DATA_DIR, 'entries.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const PROMPTS_FILE = path.join(DATA_DIR, 'prompts.json');
const CUSTOM_INSTRUCTIONS_FILE = path.join(DATA_DIR, 'custom-instructions.json');

class StorageService {
  constructor() {
    this.initStorage();
  }

  async initStorage() {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });

      // Initialize entries file if it doesn't exist
      try {
        await fs.access(ENTRIES_FILE);
      } catch {
        await fs.writeFile(ENTRIES_FILE, JSON.stringify([], null, 2));
      }

      // Initialize settings file if it doesn't exist
      try {
        await fs.access(SETTINGS_FILE);
      } catch {
        const defaultSettings = {
          writingStyle: 'natural',
          questionFrequency: 'always',
          autoEnhance: false,
          theme: 'aurora-purple',
          darkMode: true
        };
        await fs.writeFile(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2));
      }

      // Initialize custom instructions file if it doesn't exist
      try {
        await fs.access(CUSTOM_INSTRUCTIONS_FILE);
      } catch {
        const defaultCustomInstructions = {
          customInstructions: '',
          customInstructionsPrefix: "Here are the user's custom writing instructions:\n\n"
        };
        await fs.writeFile(CUSTOM_INSTRUCTIONS_FILE, JSON.stringify(defaultCustomInstructions, null, 2));
      }
    } catch (error) {
      console.error('Error initializing storage:', error);
    }
  }

  async getAllEntries() {
    try {
      const data = await fs.readFile(ENTRIES_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading entries:', error);
      return [];
    }
  }

  async getEntryById(id) {
    const entries = await this.getAllEntries();
    return entries.find(entry => entry.id === id);
  }

  async getEntriesByDateRange(startDate, endDate) {
    const entries = await this.getAllEntries();
    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= new Date(startDate) && entryDate <= new Date(endDate);
    });
  }

  async getEntryByDate(date) {
    const entries = await this.getAllEntries();
    return entries.find(entry => entry.date === date);
  }

  async createEntry(entry) {
    const entries = await this.getAllEntries();
    const newEntry = {
      id: this.generateId(),
      title: entry.title || '',
      content: entry.content,
      rawContent: entry.rawContent || entry.content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      date: entry.date || new Date().toISOString().split('T')[0],
      displayTitle: entry.title || this.formatDate(new Date())
    };
    entries.push(newEntry);
    await this.saveEntries(entries);
    return newEntry;
  }

  async updateEntry(id, updates) {
    const entries = await this.getAllEntries();
    const index = entries.findIndex(entry => entry.id === id);

    if (index === -1) {
      throw new Error('Entry not found');
    }

    entries[index] = {
      ...entries[index],
      ...updates,
      updatedAt: new Date().toISOString(),
      displayTitle: updates.title || entries[index].title || this.formatDate(new Date(entries[index].createdAt))
    };

    await this.saveEntries(entries);
    return entries[index];
  }

  async deleteEntry(id) {
    const entries = await this.getAllEntries();
    const filteredEntries = entries.filter(entry => entry.id !== id);

    if (entries.length === filteredEntries.length) {
      throw new Error('Entry not found');
    }

    await this.saveEntries(filteredEntries);
    return { success: true };
  }

  async saveEntries(entries) {
    // Sort entries by date (most recent first)
    entries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    await fs.writeFile(ENTRIES_FILE, JSON.stringify(entries, null, 2));
  }

  async getSettings() {
    try {
      const data = await fs.readFile(SETTINGS_FILE, 'utf8');
      const settings = JSON.parse(data);

      // Get customInstructions from custom-instructions.json
      const customInstructionsConfig = await this.getCustomInstructions();
      settings.customInstructions = customInstructionsConfig.customInstructions || '';

      return settings;
    } catch (error) {
      console.error('Error reading settings:', error);
      return {};
    }
  }

  async updateSettings(settings) {
    const currentSettings = await this.getSettings();

    // If customInstructions is being updated, save to custom-instructions.json
    if (settings.customInstructions !== undefined) {
      await this.updateCustomInstructions({ customInstructions: settings.customInstructions });
      delete settings.customInstructions; // Remove from settings object
    }

    const updatedSettings = { ...currentSettings, ...settings };
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(updatedSettings, null, 2));

    // Add back customInstructions for return value
    const customInstructionsConfig = await this.getCustomInstructions();
    updatedSettings.customInstructions = customInstructionsConfig.customInstructions || '';

    return updatedSettings;
  }

  async getPrompts() {
    try {
      const data = await fs.readFile(PROMPTS_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading prompts:', error);
      return {};
    }
  }

  async updatePrompts(updates) {
    const currentPrompts = await this.getPrompts();
    const updatedPrompts = { ...currentPrompts, ...updates };
    await fs.writeFile(PROMPTS_FILE, JSON.stringify(updatedPrompts, null, 2));

    // Reload prompts in gemini service (if needed in future)
    return updatedPrompts;
  }

  async getCustomInstructions() {
    try {
      const data = await fs.readFile(CUSTOM_INSTRUCTIONS_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading custom instructions:', error);
      return { customInstructions: '', customInstructionsPrefix: "Here are the user's custom writing instructions:\n\n" };
    }
  }

  async updateCustomInstructions(updates) {
    const currentConfig = await this.getCustomInstructions();
    const updatedConfig = { ...currentConfig, ...updates };
    await fs.writeFile(CUSTOM_INSTRUCTIONS_FILE, JSON.stringify(updatedConfig, null, 2));

    // Note: Gemini service will need to reload custom instructions on next request
    return updatedConfig;
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  formatDate(date) {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  async searchEntries(query) {
    const entries = await this.getAllEntries();
    const lowerQuery = query.toLowerCase();
    return entries.filter(entry =>
      entry.title.toLowerCase().includes(lowerQuery) ||
      entry.content.toLowerCase().includes(lowerQuery)
    );
  }
}

module.exports = new StorageService();
